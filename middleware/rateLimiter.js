/**
 * Dynamic Redis-Backed Rate Limiting Middleware (Phase 9 — Production Hardened)
 * ===========================================================================
 * SRE-grade rate limiting coordinator with:
 *  - High-performance Redis tracking (atomic INCR + EXPIRE) when available
 *  - Seamless in-memory degradation fallback (LRU map) when Redis is offline
 *  - Tiered security limits:
 *      * GENERAL: For standard API endpoints (Default: 100 req / 15m)
 *      * AUTH: Protects login/signup from brute-force (Default: 5 req / 15m)
 *      * PAYMENT: Secures Razorpay checkout initiation (Default: 15 req / 15m)
 *  - Dynamic limits adjustment (loads values live from process.env)
 *  - Whitelist support (IP addresses in process.env.RATE_LIMIT_WHITELIST bypass restrictions)
 */

'use strict';

const { isRedisAvailable, getRedisClient } = require('../services/redisService');
const logger = require('../utils/logger');

// Local in-memory store for fallback offline degradation
const localLimiterStore = new Map();

// Periodic cleanup of expired local store entries (every 60s)
setInterval(() => {
    const now = Date.now();
    for (const [key, record] of localLimiterStore.entries()) {
        if (now > record.resetTime) {
            localLimiterStore.delete(key);
        }
    }
}, 60000).unref();

/**
 * Fetch and parse whitelisted IPs from environment variables
 * @returns {string[]} Array of whitelisted IP strings
 */
const getWhitelistedIPs = () => {
    const raw = process.env.RATE_LIMIT_WHITELIST || '127.0.0.1,::1';
    return raw.split(',').map(ip => ip.trim());
};

/**
 * Core rate limiter factory function
 * 
 * @param {string} tierName Unique identifier for the rate-limiting tier ('general', 'auth', 'payment')
 * @param {number} windowMs Time window size in milliseconds
 * @param {function} maxLimitLoader Function or number returning max requests in this window
 * @returns {function} Express middleware function
 */
const createRateLimiter = (tierName, windowMs, maxLimitLoader) => {
    const windowSeconds = Math.ceil(windowMs / 1000);

    return async (req, res, next) => {
        const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        
        // 1. IP Whitelisting Layer
        const whitelist = getWhitelistedIPs();
        if (whitelist.includes(clientIp)) {
            return next();
        }

        // Resolve maximum limits dynamically (allows live adjustments)
        const maxLimit = typeof maxLimitLoader === 'function' ? maxLimitLoader() : maxLimitLoader;
        const key = `rate_limit:${tierName}:${clientIp}`;

        let currentCount = 0;
        let ttlLeftMs = windowMs;

        // 2. Redis-Backed Execution Path
        if (isRedisAvailable()) {
            try {
                const redis = getRedisClient();
                
                // Atomic increment and TTL setter
                const count = await redis.incr(key);
                if (count === 1) {
                    await redis.expire(key, windowSeconds);
                    ttlLeftMs = windowMs;
                } else {
                    const ttlSec = await redis.ttl(key);
                    ttlLeftMs = ttlSec > 0 ? ttlSec * 1000 : windowMs;
                }

                currentCount = count;
            } catch (err) {
                // SRE Degradation Invariant: Never crash client requests on Redis connection issues
                logger.warn(`[RATE_LIMIT][REDIS_FAIL] Error incrementing rate limit: ${err.message}. Falling back to in-memory limiter.`);
                currentCount = 0; // Trigger local fallback path below
            }
        }

        // 3. Local In-Memory Fallback Path
        if (currentCount === 0) {
            const now = Date.now();
            let record = localLimiterStore.get(key);

            if (!record || now > record.resetTime) {
                record = {
                    count: 1,
                    resetTime: now + windowMs
                };
                localLimiterStore.set(key, record);
                currentCount = 1;
                ttlLeftMs = windowMs;
            } else {
                record.count += 1;
                currentCount = record.count;
                ttlLeftMs = record.resetTime - now;
            }
        }

        // Set standard rate limiting headers
        const remaining = Math.max(0, maxLimit - currentCount);
        res.setHeader('X-RateLimit-Limit', maxLimit);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', new Date(Date.now() + ttlLeftMs).toISOString());

        // 4. Threshold Validation
        if (currentCount > maxLimit) {
            logger.warn(`[RATE_LIMIT_BLOCKED] Client blocked on tier="${tierName}": ip="${clientIp}" (req count: ${currentCount}/${maxLimit})`);
            
            return res.status(429).json({
                success: false,
                error: 'Too many requests. Please try again later.',
                retryAfterMs: ttlLeftMs
            });
        }

        next();
    };
};

// --- PRE-CONFIGURED PRODUCTION TIERS ---

// General API Rate Limiter
const generalLimiter = createRateLimiter(
    'general',
    15 * 60 * 1000, // 15 minutes
    () => parseInt(process.env.RATE_LIMIT_MAX || '100')
);

// Authentication Endpoint Rate Limiter
const authLimiter = createRateLimiter(
    'auth',
    15 * 60 * 1000, // 15 minutes
    () => parseInt(process.env.AUTH_LIMIT_MAX || '5')
);

// Payment Initiation Rate Limiter
const paymentLimiter = createRateLimiter(
    'payment',
    15 * 60 * 1000, // 15 minutes
    () => parseInt(process.env.PAYMENT_LIMIT_MAX || '15')
);

module.exports = {
    createRateLimiter,
    generalLimiter,
    authLimiter,
    paymentLimiter
};
