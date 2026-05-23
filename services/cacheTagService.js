'use strict';

/**
 * NirnayPath — Cache Tag Service (Phase 11 — Module B)
 * =====================================================
 * Tag-based cache invalidation.
 * Associates cache keys with semantic tags so an entire domain
 * (e.g. "user:abc123", "leaderboard", "recommendations") can be
 * purged atomically without knowing every individual key.
 *
 * Strategy:
 *  - Redis SADD  tag → [key1, key2, ...]
 *  - On invalidateTag(tag): fetch all keys in tag set → DEL each
 *  - Falls back to in-process Map when Redis unavailable
 */

const { isRedisAvailable, getRedisClient } = require('./redisService');
const CacheLayer = require('./cacheLayer');
const logger = require('../utils/logger');

const TAG_PREFIX  = 'ct:tag:';
const KEY_PREFIX  = 'ct:key:';
const TAG_TTL_S   = 86400; // 24h — tags expire even if never explicitly purged

// In-process fallback: tag → Set<key>
const _localTags = new Map();

class CacheTagService {

    /**
     * Set a cache value with one or more tags.
     *
     * @param {string}   key      Cache key
     * @param {*}        value    Serialisable value
     * @param {number}   ttlSecs  TTL in seconds
     * @param {string[]} tags     Semantic tags (e.g. ['user:abc', 'leaderboard'])
     */
    static async set(key, value, ttlSecs = 300, tags = []) {
        // Write to primary cache
        CacheLayer.setSnapshot(key, value, ttlSecs);

        // Register tag associations
        if (tags.length > 0) {
            await this._registerTags(key, tags);
        }
    }

    /**
     * Get a cached value (delegates to CacheLayer).
     */
    static get(key) {
        return CacheLayer.getSnapshot(key);
    }

    /**
     * Invalidate all cache keys associated with a tag.
     * @param {string} tag
     */
    static async invalidateTag(tag) {
        const keys = await this._getTagKeys(tag);
        if (keys.length === 0) return 0;

        let invalidated = 0;

        if (isRedisAvailable()) {
            try {
                const client = getRedisClient();
                const pipeline = client.pipeline();
                for (const k of keys) {
                    pipeline.del(`${KEY_PREFIX}${k}`);
                }
                pipeline.del(`${TAG_PREFIX}${tag}`);
                await pipeline.exec();
                invalidated = keys.length;
            } catch (err) {
                logger.warn(`[CACHE-TAG] Redis pipeline error: ${err.message}`);
            }
        }

        // Local fallback invalidation
        for (const k of keys) {
            CacheLayer.invalidate(k);
        }

        // Clear local tag set
        _localTags.delete(tag);

        logger.info(`[CACHE-TAG] Invalidated tag="${tag}" — cleared ${keys.length} keys`);
        return keys.length;
    }

    /**
     * Invalidate multiple tags at once.
     */
    static async invalidateTags(tags = []) {
        const results = await Promise.all(tags.map(t => this.invalidateTag(t)));
        return results.reduce((sum, n) => sum + n, 0);
    }

    /**
     * Invalidate a single key by name (also removes from Redis if present).
     */
    static async invalidateKey(key) {
        CacheLayer.invalidate(key);
        if (isRedisAvailable()) {
            try {
                await getRedisClient().del(`${KEY_PREFIX}${key}`);
            } catch (_) {}
        }
    }

    // ── Internals ──────────────────────────────────────────────────────────

    static async _registerTags(key, tags) {
        if (isRedisAvailable()) {
            try {
                const client = getRedisClient();
                const pipeline = client.pipeline();
                for (const tag of tags) {
                    pipeline.sadd(`${TAG_PREFIX}${tag}`, key);
                    pipeline.expire(`${TAG_PREFIX}${tag}`, TAG_TTL_S);
                }
                await pipeline.exec();
                return;
            } catch (err) {
                logger.warn(`[CACHE-TAG] Redis tag registration failed: ${err.message}. Using local fallback.`);
            }
        }

        // Local fallback
        for (const tag of tags) {
            if (!_localTags.has(tag)) _localTags.set(tag, new Set());
            _localTags.get(tag).add(key);
        }
    }

    static async _getTagKeys(tag) {
        if (isRedisAvailable()) {
            try {
                const members = await getRedisClient().smembers(`${TAG_PREFIX}${tag}`);
                return members || [];
            } catch (err) {
                logger.warn(`[CACHE-TAG] Redis tag lookup failed: ${err.message}. Using local fallback.`);
            }
        }

        return _localTags.has(tag) ? Array.from(_localTags.get(tag)) : [];
    }

    /**
     * Diagnostic info for health dashboard.
     */
    static getDiagnostics() {
        return {
            localTagCount: _localTags.size,
            localTagKeys:  Array.from(_localTags.keys()),
            redisAvailable: isRedisAvailable()
        };
    }
}

module.exports = CacheTagService;
