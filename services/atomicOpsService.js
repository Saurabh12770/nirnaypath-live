'use strict';

/**
 * NirnayPath — Atomic Operations & Transaction Service (Phase 11 — Module C)
 * =========================================================================
 * Provides thread-safe, concurrency-safe utilities for mutative updates:
 *  1. Atomic counters (Redis INCRBY with L1 DB fallback)
 *  2. Safe compare-and-swap (CAS) via Redis Lua script
 *  3. Mongoose ACID Transaction Orchestration (with graceful replica set fallback)
 *
 * Prevents race conditions during high concurrent traffic.
 */

const mongoose = require('mongoose');
const { isRedisAvailable, getRedisClient } = require('./redisService');
const logger = require('../utils/logger');

class AtomicOpsService {

    /**
     * Increment an arbitrary Redis-backed counter atomically.
     * Useful for rate limits, concurrent request limits, active users count.
     *
     * @param {string} key
     * @param {number} amount
     * @param {number} [ttlSecs]
     * @returns {Promise<number>} New counter value
     */
    static async incrementCounter(key, amount = 1, ttlSecs = null) {
        if (isRedisAvailable()) {
            try {
                const client = getRedisClient();
                const newVal = await client.incrby(key, amount);
                if (ttlSecs) {
                    await client.expire(key, ttlSecs);
                }
                return newVal;
            } catch (err) {
                logger.warn(`[ATOMIC-OPS] Redis increment counter failed: ${err.message}. Using DB fallback.`);
            }
        }

        // DB / In-memory fallback
        return this._dbFallbackIncrement(key, amount);
    }

    /**
     * Compare-And-Swap (CAS) atomically in Redis using a Lua script.
     * Ensures value is only updated if it matches expected value.
     *
     * @param {string} key
     * @param {string} expectedVal
     * @param {string} newVal
     * @param {number} [ttlSecs]
     * @returns {Promise<boolean>} True if swap succeeded, false otherwise
     */
    static async compareAndSwap(key, expectedVal, newVal, ttlSecs = 60) {
        if (isRedisAvailable()) {
            try {
                const client = getRedisClient();
                // Lua script to atomically compare and set
                const luaScript = `
                    if redis.call('get', KEYS[1]) == ARGV[1] then
                        redis.call('set', KEYS[1], ARGV[2], 'EX', ARGV[3])
                        return 1
                    else
                        return 0
                    end
                `;
                const result = await client.eval(luaScript, 1, key, expectedVal, newVal, String(ttlSecs));
                return result === 1;
            } catch (err) {
                logger.error(`[ATOMIC-OPS] CAS operation failed: ${err.message}`);
                return false;
            }
        }
        return false;
    }

    /**
     * Execute a Mongoose database operation inside an ACID transaction.
     * Gracefully falls back to standard execution if MongoDB replica set is not available (e.g. standalone local Mongo).
     *
     * @param {Function} transactionFn - async fn(session) => result
     * @returns {Promise<*>} Result of transactionFn
     */
    static async withTransaction(transactionFn) {
        const session = await mongoose.startSession();
        try {
            let result;
            await session.withTransaction(async () => {
                result = await transactionFn(session);
            });
            return result;
        } catch (err) {
            // Gracefully detect standalone server that does not support transactions
            if (err.message.includes('replica set') || err.code === 20) {
                logger.warn(`[ATOMIC-OPS] MongoDB transaction aborted: Standalone server detected. Executing sequentially as fallback.`);
                // Fallback: run the operations directly without transaction session
                return await transactionFn(null);
            }
            logger.error(`[ATOMIC-OPS] Transaction failed & aborted: ${err.message}`);
            throw err;
        } finally {
            session.endSession().catch(() => {});
        }
    }

    // ── Internals / Fallbacks ─────────────────────────────────────────────

    static async _dbFallbackIncrement(key, amount) {
        // Fallback schema/model to persist keys in MongoDB when Redis is unavailable
        const FallbackCounter = mongoose.models.FallbackCounter || mongoose.model('FallbackCounter', new mongoose.Schema({
            _id:       { type: String, required: true },
            value:     { type: Number, required: true, default: 0 },
            updatedAt: { type: Date,   default: Date.now, expires: 86400 } // TTL 24h
        }));

        const result = await FallbackCounter.findByIdAndUpdate(
            key,
            { $inc: { value: amount }, $set: { updatedAt: new Date() } },
            { new: true, upsert: true }
        );
        return result.value;
    }
}

module.exports = AtomicOpsService;
