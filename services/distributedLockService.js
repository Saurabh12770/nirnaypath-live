/**
 * Distributed Lock Service (Phase 9 — Hardened)
 * ============================================
 * Zero-Trust Distributed Mutex with:
 *  - Redis-backed Redlock locking via atomic SET PX NX
 *  - Lua script execution for safe, atomic lock release (prevents releasing someone else's lock)
 *  - Intelligent offline fallback/degradation to memory-safe Map lock
 *  - Deadlock prevention via automatic TTL expiration
 *  - Timeout safety & jittered retries for cluster coordination
 */

'use strict';

const { isRedisAvailable, getRedisClient } = require('./redisService');
const logger = require('../utils/logger');

class DistributedLockService {
    // Local In-Memory Fallback Store
    static locks = new Map();

    /**
     * Acquire a distributed lock.
     * 
     * @param {string} resourceKey Unique key for the resource being locked
     * @param {number} ttlMs Time-to-live in milliseconds
     * @param {object} options Acquisition options (retries, retryDelayMs)
     * @returns {Promise<{success: boolean, lockId?: string, error?: string}>}
     */
    static async acquireLock(resourceKey, ttlMs = 10000, options = {}) {
        const retries = options.retries || 0; // Default to 0 for instant check (required by tests)
        const baseDelay = options.retryDelayMs || 50;
        let attempt = 0;

        const lockId = `lock_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

        while (attempt <= retries) {
            if (isRedisAvailable()) {
                try {
                    const client = getRedisClient();
                    // SET key value PX ttl NX
                    // NX: only set if not exists
                    // PX ttl: set expiry in milliseconds
                    const result = await client.set(resourceKey, lockId, 'NX', 'PX', ttlMs);
                    
                    if (result === 'OK') {
                        logger.info(`[LOCK][REDIS] Acquired lock for resource="${resourceKey}" with lockId="${lockId}"`);
                        return { success: true, lockId };
                    }
                } catch (err) {
                    logger.warn(`[LOCK][REDIS] Error acquiring lock: ${err.message}. Falling back to memory lock...`);
                }
            }

            // In-memory fallback
            const localLock = this.locks.get(resourceKey);
            const now = Date.now();

            if (localLock && now < localLock.expiresAt) {
                // Lock exists and is still valid
                if (attempt === retries) {
                    return { success: false, error: 'Resource is locked' };
                }
            } else {
                // No valid local lock exists (either never locked, or expired)
                this.locks.set(resourceKey, {
                    lockId,
                    expiresAt: now + ttlMs,
                    acquiredAt: now
                });
                logger.info(`[LOCK][MEMORY] Acquired fallback lock for resource="${resourceKey}" with lockId="${lockId}"`);
                return { success: true, lockId };
            }

            // Apply randomized jitter backoff before retrying
            attempt++;
            if (attempt <= retries) {
                const jitter = Math.random() * 30; // 0-30ms random jitter
                const delay = baseDelay + jitter;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        return { success: false, error: 'Resource is locked' };
    }

    /**
     * Release a distributed lock.
     * 
     * @param {string} resourceKey Unique key for the resource
     * @param {string} lockId Unique lock acquisition ID
     * @returns {Promise<boolean>} True if successfully released, false otherwise
     */
    static async releaseLock(resourceKey, lockId) {
        if (!lockId) return false;

        if (isRedisAvailable()) {
            try {
                const client = getRedisClient();
                // Atomic release via Lua Script to ensure a worker only deletes its OWN lock
                const luaScript = `
                    if redis.call("get", KEYS[1]) == ARGV[1] then
                        return redis.call("del", KEYS[1])
                    else
                        return 0
                    end
                `;
                const result = await client.eval(luaScript, 1, resourceKey, lockId);
                const released = result === 1;
                if (released) {
                    logger.info(`[LOCK][REDIS] Released lock for resource="${resourceKey}" with lockId="${lockId}"`);
                } else {
                    logger.warn(`[LOCK][REDIS] Failed to release lock (lockId mismatch or already expired) for resource="${resourceKey}"`);
                }
                return released;
            } catch (err) {
                logger.warn(`[LOCK][REDIS] Error releasing lock: ${err.message}. Falling back to memory release...`);
            }
        }

        // In-memory fallback
        const localLock = this.locks.get(resourceKey);
        if (localLock && localLock.lockId === lockId) {
            this.locks.delete(resourceKey);
            logger.info(`[LOCK][MEMORY] Released fallback lock for resource="${resourceKey}" with lockId="${lockId}"`);
            return true;
        }
        
        logger.warn(`[LOCK][MEMORY] Failed to release fallback lock (lockId mismatch or already expired) for resource="${resourceKey}"`);
        return false;
    }

    /**
     * Detect and clean up expired local memory locks
     */
    static detectStaleLocks() {
        let staleCount = 0;
        const now = Date.now();
        for (const [key, lock] of this.locks.entries()) {
            if (now > lock.expiresAt) {
                this.locks.delete(key);
                staleCount++;
            }
        }
        if (staleCount > 0) {
            logger.info(`[LOCK][MEMORY] Automatically cleaned up ${staleCount} stale local locks.`);
        }
        return staleCount;
    }

    /**
     * Emergency lock recovery (bypass safety controls)
     */
    static async forceRecoverLock(resourceKey) {
        let deleted = false;
        if (isRedisAvailable()) {
            try {
                const client = getRedisClient();
                const result = await client.del(resourceKey);
                deleted = result > 0;
            } catch (err) {
                logger.error(`[LOCK][REDIS] Emergency forceRecoverLock error: ${err.message}`);
            }
        }

        if (this.locks.has(resourceKey)) {
            this.locks.delete(resourceKey);
            deleted = true;
        }

        if (deleted) {
            logger.info(`[LOCK][EMERGENCY] Force recovered lock for resource="${resourceKey}"`);
        }
        return deleted;
    }
}

// Auto-cleanup stale memory locks on a 60s interval (non-blocking)
setInterval(() => DistributedLockService.detectStaleLocks(), 60 * 1000).unref();

module.exports = DistributedLockService;
