'use strict';

/**
 * NirnayPath — Redis-Backed Cache Layer (Phase 11 — Module B)
 * ============================================================
 * Upgrades the existing in-process CacheLayer with:
 *  - Redis primary store (when available)
 *  - In-process L1 fallback (always available)
 *  - Stale-while-revalidate (SWR): serve stale data immediately, refresh async
 *  - Cache tagging (delegate to CacheTagService)
 *  - get-or-set pattern for atomic cache-miss filling
 *
 * ARCHITECTURE:
 *   Request → L1 (in-process Map, <1ms)
 *           → L2 (Redis, ~1-5ms)
 *           → Origin (DB / compute, varies)
 *
 * SWR: If L1 hit but entry is in the "stale window" (expired but within
 *      stale_ttl), we return the stale value immediately and queue an
 *      async background refresh. The next request after the refresh gets
 *      the fresh value.
 */

const CacheLayer    = require('./cacheLayer');           // L1
const { isRedisAvailable, getRedisClient } = require('./redisService'); // L2
const logger        = require('../utils/logger');

const REDIS_KEY_PREFIX = 'np:cache:';
const DEFAULT_TTL_S    = parseInt(process.env.CACHE_DEFAULT_TTL_S || '300');
const SWR_WINDOW_S     = parseInt(process.env.CACHE_SWR_WINDOW_S  || '60');  // Extra time to serve stale
const CACHE_VERSION    = process.env.CACHE_VERSION || '1';

// Track keys currently being revalidated to avoid thundering herd
const _revalidating = new Set();

// SWR metadata: key → { freshUntil, staleUntil }
const _swrMeta = new Map();

class RedisCacheLayer {

    /**
     * Get a value.
     * Returns fresh value, or stale value (+ triggers async revalidation), or null.
     *
     * @param {string}   key
     * @param {Function} [fetcher]  Optional: async fn that returns fresh data
     * @returns {*|null}
     */
    static async get(key, fetcher = null) {
        // ── L1: In-process ─────────────────────────────────────────────────
        const l1 = CacheLayer.getSnapshot(key);
        if (l1 !== null) {
            // Check SWR stale window
            const meta = _swrMeta.get(key);
            if (meta && Date.now() > meta.freshUntil && Date.now() <= meta.staleUntil) {
                // Stale but within SWR window — return stale, trigger bg refresh
                this._revalidateAsync(key, fetcher);
                return l1;
            }
            return l1;
        }

        // ── L2: Redis ───────────────────────────────────────────────────────
        if (isRedisAvailable()) {
            try {
                const raw = await getRedisClient().get(`${REDIS_KEY_PREFIX}${CACHE_VERSION}:${key}`);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    // Warm L1
                    CacheLayer.setSnapshot(key, parsed.value, Math.ceil((parsed.expiresAt - Date.now()) / 1000));
                    _swrMeta.set(key, { freshUntil: parsed.expiresAt, staleUntil: parsed.staleUntil });
                    return parsed.value;
                }
            } catch (err) {
                logger.warn(`[REDIS-CACHE] L2 get error: ${err.message}`);
            }
        }

        // ── Cache miss — use fetcher if provided ───────────────────────────
        if (fetcher) {
            return this._fetchAndCache(key, fetcher);
        }

        return null;
    }

    /**
     * Set a value in L1 and L2.
     *
     * @param {string}   key
     * @param {*}        value
     * @param {number}   ttlSecs
     * @param {number}   [swrWindowSecs]  Extra seconds to serve stale (default SWR_WINDOW_S)
     */
    static async set(key, value, ttlSecs = DEFAULT_TTL_S, swrWindowSecs = SWR_WINDOW_S) {
        const now = Date.now();
        const freshUntil = now + ttlSecs * 1000;
        const staleUntil = freshUntil + swrWindowSecs * 1000;

        // L1
        CacheLayer.setSnapshot(key, value, ttlSecs + swrWindowSecs); // L1 keeps value for full SWR window
        _swrMeta.set(key, { freshUntil, staleUntil });

        // L2 Redis
        if (isRedisAvailable()) {
            try {
                const payload = JSON.stringify({ value, expiresAt: freshUntil, staleUntil, version: CACHE_VERSION });
                await getRedisClient().set(
                    `${REDIS_KEY_PREFIX}${CACHE_VERSION}:${key}`,
                    payload,
                    'EX',
                    ttlSecs + swrWindowSecs
                );
            } catch (err) {
                logger.warn(`[REDIS-CACHE] L2 set error: ${err.message}`);
            }
        }
    }

    /**
     * Get-or-set: atomically fetch + cache on miss.
     * Prevents thundering herd via a lightweight in-process lock per key.
     */
    static async getOrSet(key, fetcher, ttlSecs = DEFAULT_TTL_S, swrWindowSecs = SWR_WINDOW_S) {
        const cached = await this.get(key);
        if (cached !== null) return cached;
        return this._fetchAndCache(key, fetcher, ttlSecs, swrWindowSecs);
    }

    /**
     * Invalidate a key from L1 and L2.
     */
    static async invalidate(key) {
        CacheLayer.invalidate(key);
        _swrMeta.delete(key);

        if (isRedisAvailable()) {
            try {
                await getRedisClient().del(`${REDIS_KEY_PREFIX}${CACHE_VERSION}:${key}`);
            } catch (err) {
                logger.warn(`[REDIS-CACHE] L2 invalidate error: ${err.message}`);
            }
        }
    }

    /**
     * Invalidate all keys matching a prefix pattern (Redis SCAN, L1 prefix scan).
     */
    static async invalidatePrefix(prefix) {
        // L1: scan
        let l1Count = 0;
        for (const key of [...CacheLayer._store.keys()]) {
            if (key.startsWith(prefix)) {
                CacheLayer.invalidate(key);
                _swrMeta.delete(key);
                l1Count++;
            }
        }

        // L2 Redis: SCAN + DEL
        let l2Count = 0;
        if (isRedisAvailable()) {
            try {
                const client = getRedisClient();
                const pattern = `${REDIS_KEY_PREFIX}${CACHE_VERSION}:${prefix}*`;
                let cursor = '0';
                do {
                    const [nextCursor, keys] = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
                    cursor = nextCursor;
                    if (keys.length > 0) {
                        await client.del(...keys);
                        l2Count += keys.length;
                    }
                } while (cursor !== '0');
            } catch (err) {
                logger.warn(`[REDIS-CACHE] L2 prefix invalidation error: ${err.message}`);
            }
        }

        logger.info(`[REDIS-CACHE] Prefix invalidation prefix="${prefix}" l1=${l1Count} l2=${l2Count}`);
        return l1Count + l2Count;
    }

    // ── Internals ──────────────────────────────────────────────────────────

    static async _fetchAndCache(key, fetcher, ttlSecs = DEFAULT_TTL_S, swrWindowSecs = SWR_WINDOW_S) {
        if (_revalidating.has(key)) {
            // Another request is already fetching — return null (caller will use stale or wait)
            return null;
        }
        _revalidating.add(key);
        try {
            const fresh = await fetcher();
            if (fresh !== null && fresh !== undefined) {
                await this.set(key, fresh, ttlSecs, swrWindowSecs);
            }
            return fresh;
        } finally {
            _revalidating.delete(key);
        }
    }

    static _revalidateAsync(key, fetcher) {
        if (!fetcher || _revalidating.has(key)) return;
        // Fire-and-forget background refresh
        setImmediate(async () => {
            _revalidating.add(key);
            try {
                const fresh = await fetcher();
                if (fresh !== null && fresh !== undefined) {
                    await this.set(key, fresh);
                }
            } catch (err) {
                logger.warn(`[REDIS-CACHE][SWR] Background revalidation failed for key="${key}": ${err.message}`);
            } finally {
                _revalidating.delete(key);
            }
        });
    }

    /**
     * Diagnostics for /api/health/deep.
     */
    static async getDiagnostics() {
        const l1 = CacheLayer.getDiagnostics();
        let l2 = { status: 'disabled', connected: false };

        if (isRedisAvailable()) {
            try {
                const client = getRedisClient();
                const info   = await client.info('memory');
                const usedMemLine = info.split('\r\n').find(l => l.startsWith('used_memory_human'));
                const usedMem = usedMemLine ? usedMemLine.split(':')[1].trim() : 'UNKNOWN';
                l2 = { status: 'healthy', connected: true, usedMemory: usedMem };
            } catch (err) {
                l2 = { status: 'degraded', connected: true, error: err.message };
            }
        }

        return {
            l1,
            l2,
            swrWindowSecs: SWR_WINDOW_S,
            revalidatingKeys: _revalidating.size,
            swrMetaKeys: _swrMeta.size
        };
    }
}

module.exports = RedisCacheLayer;
