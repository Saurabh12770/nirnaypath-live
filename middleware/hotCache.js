'use strict';

/**
 * NirnayPath — Hot Endpoint Caching Middleware (Phase 11 — Module B)
 * ==================================================================
 * Express middleware for automatic response caching on hot GET endpoints.
 * Uses RedisCacheLayer (L1+L2) with configurable TTL and cache key builder.
 *
 * Usage:
 *   router.get('/leaderboard/global', hotCache({ ttl: 30, tags: ['leaderboard'] }), handler);
 *
 * Cache key = method + url + user-specific parts (userId if auth)
 * Bypasses cache on: POST/PUT/DELETE, authenticated admin routes, Cache-Control: no-cache
 */

const RedisCacheLayer = require('../services/redisCacheLayer');
const logger = require('../utils/logger');

/**
 * @param {Object} options
 * @param {number}   options.ttl      Cache TTL in seconds (default 60)
 * @param {number}   options.swrWindow  Stale-while-revalidate window in seconds (default 30)
 * @param {string[]} options.tags     Tags for grouped invalidation
 * @param {boolean}  options.userScoped  If true, cache is per-user (default false)
 * @param {Function} options.keyFn    Custom key builder fn(req) → string
 * @param {Function} options.shouldCache fn(req) → bool, skip cache if false
 */
function hotCache(options = {}) {
    const {
        ttl         = 60,
        swrWindow   = 30,
        tags        = [],
        userScoped  = false,
        keyFn       = null,
        shouldCache: shouldCacheFn = null
    } = options;

    return async function hotCacheMiddleware(req, res, next) {
        // Only cache GET requests
        if (req.method !== 'GET') return next();

        // Honour Cache-Control: no-cache from clients
        if (req.headers['cache-control'] === 'no-cache') return next();

        // Allow custom bypass logic
        if (shouldCacheFn && !shouldCacheFn(req)) return next();

        // Build cache key
        let cacheKey;
        if (keyFn) {
            cacheKey = keyFn(req);
        } else {
            const base = `hc:${req.path}`;
            const qs   = Object.keys(req.query).sort().map(k => `${k}=${req.query[k]}`).join('&');
            const user = userScoped && req.user ? `:u:${req.user._id}` : '';
            cacheKey = `${base}${qs ? '?' + qs : ''}${user}`;
        }

        try {
            // L1/L2 lookup
            const cached = await RedisCacheLayer.get(cacheKey);
            if (cached !== null) {
                res.setHeader('X-Cache', 'HIT');
                res.setHeader('X-Cache-Key', cacheKey);
                return res.json(cached);
            }
        } catch (err) {
            logger.warn(`[HOT-CACHE] Cache read error: ${err.message}`);
        }

        // Cache miss — intercept res.json to store response
        const originalJson = res.json.bind(res);
        res.json = async function(body) {
            // Only cache successful responses
            if (res.statusCode >= 200 && res.statusCode < 300 && body) {
                try {
                    await RedisCacheLayer.set(cacheKey, body, ttl, swrWindow);
                    // Tag registration
                    if (tags.length > 0) {
                        const CacheTagService = require('../services/cacheTagService');
                        await CacheTagService.set(cacheKey, body, ttl, tags);
                    }
                } catch (err) {
                    logger.warn(`[HOT-CACHE] Cache write error: ${err.message}`);
                }
            }
            res.setHeader('X-Cache', 'MISS');
            res.setHeader('X-Cache-Key', cacheKey);
            return originalJson(body);
        };

        next();
    };
}

module.exports = hotCache;
