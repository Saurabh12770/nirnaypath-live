const Redis = require('ioredis');
const logger = require('../utils/logger');

let redisClient = null;
let redisAvailable = false;
let _errorLogged = false;

/**
 * Initialize Redis safely.
 * Requires REDIS_URL env var — no localhost fallback.
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

    // Secure protocol detection
    if (!url.startsWith('redis://') && !url.startsWith('rediss://')) {
        logger.error('[REDIS] Invalid REDIS_URL protocol. Must start with redis:// or rediss://');
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
                const delay = Math.min(times * 1000, 5000);
                logger.warn(`[REDIS] Connection retry #${times} in ${delay}ms`);
                return delay;
            },
            reconnectOnError: (err) => err.message.includes('READONLY'),
        });

        redisClient.on('connect', () => logger.info('[REDIS] Socket connected.'));
        redisClient.on('ready', () => {
            redisAvailable = true;
            _errorLogged = false;
            logger.info('[REDIS] Client ready and ACTIVE.');
        });
        redisClient.on('error', (err) => {
            redisAvailable = false;
            if (!_errorLogged) {
                logger.error('[REDIS] Error:', { code: err.code, message: err.message });
                _errorLogged = true;
            }
        });
        redisClient.on('reconnecting', (delay) => {
            logger.warn(`[REDIS] Connection lost. Reconnecting in ${delay}ms...`);
        });
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

const verifyRedis = async () => {
    if (process.env.ENABLE_REDIS === 'false') {
        redisAvailable = false;
        return false;
    }
    const url = process.env.REDIS_URL;
    if (!url) {
        redisAvailable = false;
        return false;
    }
    const client = getRedisClient();
    if (!client) {
        redisAvailable = false;
        return false;
    }
    try {
        await Promise.race([
            client.ping(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Ping timeout')), 3000))
        ]);
        logger.info('[REDIS] Startup health check successful. Redis is ACTIVE.');
        redisAvailable = true;
        return true;
    } catch (err) {
        logger.error('[REDIS] Startup health check failed. Redis is DEGRADED.', { error: err.message });
        redisAvailable = false;
        return false;
    }
};

// Trigger boot-time validation
verifyRedis().catch(() => {});

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

const zlib = require('zlib');

/**
 * Compresses string/buffer using gzip.
 */
function compressPayload(data) {
    if (!data) return data;
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    return zlib.gzipSync(str);
}

/**
 * Decompresses gzip data back to string.
 */
function decompressPayload(buffer) {
    if (!buffer) return buffer;
    return zlib.gunzipSync(buffer).toString();
}

module.exports = { 
    initRedis, 
    getRedisClient, 
    isRedisAvailable, 
    verifyRedis, 
    disconnectRedis,
    compressPayload,
    decompressPayload
};

