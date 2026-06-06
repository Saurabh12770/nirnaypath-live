/**
2.0 Rate Limiter Middleware
---------------------------
Simple, fast, and in-memory rate limiting.
*/

'use strict';

const logger = require('../utils/logger');

// Local in-memory store
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

const createRateLimiter = (tierName, windowMs, maxLimitLoader) => {
    return (req, res, next) => {
        const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
        const maxLimit = typeof maxLimitLoader === 'function' ? maxLimitLoader() : maxLimitLoader;
        const key = `rate_limit:${tierName}:${clientIp}`;

        const now = Date.now();
        let record = localLimiterStore.get(key);

        if (!record || now > record.resetTime) {
            record = {
                count: 1,
                resetTime: now + windowMs
            };
            localLimiterStore.set(key, record);
        } else {
            record.count += 1;
        }

        const remaining = Math.max(0, maxLimit - record.count);
        res.setHeader('X-RateLimit-Limit', maxLimit);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

        if (record.count > maxLimit) {
            logger.warn(`[RATE_LIMIT_BLOCKED] Client blocked on tier="${tierName}": ip="${clientIp}" (req count: ${record.count}/${maxLimit})`);
            const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
            res.setHeader('Retry-After', retryAfterSec);

            return res.status(429).json({
                success: false,
                error: 'Too many requests. Please try again later.',
                retryAfterMs: record.resetTime - now
            });
        }

        next();
    };
};

const parseEnvInt = (value, defaultValue) => {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) || parsed <= 0 ? defaultValue : parsed;
};

// General API Rate Limiter
const generalLimiter = createRateLimiter(
    'general',
    15 * 60 * 1000, // 15 minutes
    () => parseEnvInt(process.env.RATE_LIMIT_MAX, 300)
);

// Test Engine Rate Limiter
const testEngineLimiter = createRateLimiter(
    'test',
    15 * 60 * 1000, // 15 minutes
    () => parseEnvInt(process.env.TEST_LIMIT_MAX, 150)
);

// Auth Rate Limiter
const authLimiter = createRateLimiter(
    'auth',
    15 * 60 * 1000, // 15 minutes
    () => parseEnvInt(process.env.AUTH_LIMIT_MAX, 50)
);

module.exports = {
    createRateLimiter,
    generalLimiter,
    testEngineLimiter,
    authLimiter
};
