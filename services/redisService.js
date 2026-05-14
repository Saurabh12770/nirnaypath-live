const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;
let redisAvailable = false;
let redisErrorLogged = false;

/**
 * Initialize Redis with safety
 */
const initRedis = () => {
    // Return existing client if already initialized
    if (redisClient) return redisClient;

    const redisUrl = process.env.REDIS_URL;
    
    // Feature Flag check
    if (process.env.ENABLE_REDIS === 'false') {
        logger.warn('[REDIS] Redis is explicitly disabled via ENABLE_REDIS flag.');
        return null;
    }

    // Default to localhost for development if no URL provided
    const connectionString = redisUrl || 'redis://127.0.0.1:6379';
    
    try {
        logger.info('[REDIS] Initializing Redis connection...', { 
            url: redisUrl ? 'CONNECTED_VIA_ENV' : 'LOCAL_FALLBACK' 
        });

        redisClient = new Redis(connectionString, {
            maxRetriesPerRequest: null,
            enableReadyCheck: true,
            // Capped retry strategy to prevent infinite reconnect storms
            retryStrategy: (times) => {
                const delay = Math.min(times * 500, 5000); // Max 5s delay
                
                if (times > 10) {
                    if (!redisErrorLogged) {
                        logger.error('[REDIS] Max reconnection attempts reached. Redis features will be disabled.', { 
                            attempts: times 
                        });
                        redisErrorLogged = true;
                    }
                    // Return null to stop retrying and avoid crash loops
                    // However, for production resilience, we might want to keep trying slowly
                    // but we MUST ensure it doesn't block the rest of the app.
                    // Returning null here stops this specific instance.
                    return null; 
                }
                return delay;
            },
            reconnectOnError: (err) => {
                const targetError = 'READONLY';
                if (err.message.includes(targetError)) {
                    return true;
                }
                return false;
            },
            connectTimeout: 10000 // 10 seconds timeout
        });

        redisClient.on('connect', () => {
            logger.info('[REDIS] Socket connected to Redis.');
        });

        redisClient.on('ready', () => {
            redisAvailable = true;
            redisErrorLogged = false;
            logger.info('[REDIS] Redis client ready and cluster-ready.');
        });

        redisClient.on('error', (err) => {
            redisAvailable = false;
            // Only log the error once until it recovers to prevent log spam
            if (!redisErrorLogged) {
                logger.error('[REDIS] Redis connection error', { 
                    message: err.message,
                    code: err.code 
                });
                redisErrorLogged = true;
            }
        });

        redisClient.on('end', () => {
            redisAvailable = false;
            logger.warn('[REDIS] Redis connection closed.');
        });

        return redisClient;
    } catch (error) {
        logger.error('[REDIS] Fatal error during Redis client creation', { error: error.message });
        return null;
    }
};

/**
 * Get active Redis client
 */
const getRedisClient = () => {
    if (!redisClient) return initRedis();
    return redisClient;
};

/**
 * Check if Redis is currently available and ready
 */
const isRedisAvailable = () => {
    return redisAvailable && redisClient && redisClient.status === 'ready';
};

/**
 * Force disconnect (useful for testing or shutdown)
 */
const disconnectRedis = async () => {
    if (redisClient) {
        logger.info('[REDIS] Closing Redis connection...');
        await redisClient.quit();
        redisClient = null;
        redisAvailable = false;
    }
};

module.exports = {
    initRedis,
    getRedisClient,
    isRedisAvailable,
    disconnectRedis
};
