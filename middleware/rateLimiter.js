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

        // 2. Critical Path Exemption Layer (Zero-429 Guarantee for key business flows)
        const normalizedPath = ((req.baseUrl || '') + (req.path || req.url || '')).toLowerCase().split('?')[0].replace(/\/$/, '');
        const isCriticalRoute = 
            normalizedPath.startsWith('/api/auth') ||
            normalizedPath === '/api/test/start' ||
            normalizedPath === '/api/test/submit' ||
            normalizedPath === '/api/test/heartbeat' ||
            normalizedPath === '/api/user/me';

        console.log(`[RateLimiter] tierName=${tierName} path=${normalizedPath} ip=${clientIp} isCritical=${isCriticalRoute}`);

        if (isCriticalRoute) {
            const isLoginOrSignup = normalizedPath === '/api/auth/login' || normalizedPath === '/api/auth/signup';
            if (tierName === 'auth' && isLoginOrSignup) {
                // Brute-force protection: allow AUTH_LIMITER to monitor credentials endpoints
            } else {
                return next();
            }
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
                
                // Atomic increment and TTL setter via multi block
                const multi = redis.multi();
                multi.incr(key);
                multi.ttl(key);
                const results = await multi.exec();
                
                const count = results[0][1];
                let ttlSec = results[1][1];
                
                if (count === 1 || ttlSec === -1) {
                    await redis.expire(key, windowSeconds);
                    ttlLeftMs = windowMs;
                } else {
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
            
            // Compute Retry-After in whole seconds (required by RFC 7231)
            const retryAfterSec = Math.ceil(ttlLeftMs / 1000);
            res.setHeader('Retry-After', retryAfterSec);

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

const parseEnvInt = (value, defaultValue) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) || parsed <= 0 ? defaultValue : parsed;
};

// General API Rate Limiter
const generalLimiter = createRateLimiter(
    'general',
    15 * 60 * 1000, // 15 minutes
    () => parseEnvInt(process.env.RATE_LIMIT_MAX, 200)
);

// Authentication Endpoint Rate Limiter
const authLimiter = createRateLimiter(
    'auth',
    15 * 60 * 1000, // 15 minutes
    () => parseEnvInt(process.env.AUTH_LIMIT_MAX, 5)
);

// Payment Initiation Rate Limiter
const paymentLimiter = createRateLimiter(
    'payment',
    15 * 60 * 1000, // 15 minutes
    () => parseEnvInt(process.env.PAYMENT_LIMIT_MAX, 15)
);

// Telemetry Rate Limiter
// Telemetry is a high-frequency internal endpoint — it must not compete with
// the general /api/ quota (100 req/15min shared across ALL endpoints).
// Client patch (v4.1) sends max 1 req/30s = max 30 req/15min per tab.
// Allowing 60 per window gives headroom for 2 concurrent tabs safely.
const telemetryLimiter = createRateLimiter(
    'telemetry',
    15 * 60 * 1000, // 15 minutes
    () => parseEnvInt(process.env.TELEMETRY_LIMIT_MAX, 60)
);

// Test Engine Rate Limiter
// Dedicated bucket for test engine non-exempt routes, default: 100 req / 15 min.
const testEngineLimiter = createRateLimiter(
    'test',
    15 * 60 * 1000, // 15 minutes
    () => parseEnvInt(process.env.TEST_LIMIT_MAX, 100)
);

module.exports = {
    createRateLimiter,
    generalLimiter,
    authLimiter,
    paymentLimiter,
    telemetryLimiter,
    testEngineLimiter
};
