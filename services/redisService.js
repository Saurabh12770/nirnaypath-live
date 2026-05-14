const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;
let redisAvailable = false;
let _errorLogged = false;

/**
 * Initialize Redis safely.
 * Requires REDIS_URL env var — no localhost fallback on Railway.
 * NEVER throws. Returns null if Redis is disabled or unavailable.
 */
const initRedis = () => {
    if (redisClient) return redisClient;

    if (process.env.ENABLE_REDIS === 'false') {
        logger.warn('[REDIS] Disabled via ENABLE_REDIS=false.');
        return null;
    }

    const url = process.env.REDIS_URL;
    if (!url) {
        logger.warn('[REDIS] REDIS_URL not set. Redis features disabled.');
        return null;
    }

    try {
        redisClient = new Redis(url, {
            maxRetriesPerRequest: null,
            enableReadyCheck: true,
            connectTimeout: 10000,
            retryStrategy: (times) => {
                if (times > 10) {
                    if (!_errorLogged) {
                        logger.error('[REDIS] Max reconnect attempts reached. Giving up.');
                        _errorLogged = true;
                    }
                    return null;
                }
                return Math.min(times * 500, 5000);
            },
            reconnectOnError: (err) => err.message.includes('READONLY'),
        });

        redisClient.on('connect', () => logger.info('[REDIS] Socket connected.'));
        redisClient.on('ready', () => {
            redisAvailable = true;
            _errorLogged = false;
            logger.info('[REDIS] Client ready.');
        });
        redisClient.on('error', (err) => {
            redisAvailable = false;
            if (!_errorLogged) {
                logger.error('[REDIS] Error:', { code: err.code, message: err.message });
                _errorLogged = true;
            }
        });
        redisClient.on('reconnecting', () => logger.warn('[REDIS] Reconnecting...'));
        redisClient.on('end', () => {
            redisAvailable = false;
            logger.warn('[REDIS] Connection closed.');
        });

        return redisClient;
    } catch (err) {
        logger.error('[REDIS] Fatal init error:', { error: err.message });
        return null;
    }
};

const getRedisClient = () => redisClient || initRedis();
const isRedisAvailable = () => !!redisClient && redisAvailable && redisClient.status === 'ready';
const disconnectRedis = async () => {
    if (redisClient) {
        try { 
            logger.info('[REDIS] Closing Redis connection...');
            await redisClient.quit(); 
        } catch (_) {}
        redisClient = null;
        redisAvailable = false;
    }
};

module.exports = { initRedis, getRedisClient, isRedisAvailable, disconnectRedis };
