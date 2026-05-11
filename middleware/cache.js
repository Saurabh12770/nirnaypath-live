const Redis = require('ioredis');

// Initialize Redis client with fallback
let redis;
let isRedisAvailable = false;

try {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
            if (times > 3) return null; // stop retrying after 3 attempts
            return Math.min(times * 50, 2000);
        }
    });

    redis.on('error', (err) => {
        console.warn('Redis Connection Error:', err.message);
        isRedisAvailable = false;
    });

    redis.on('connect', () => {
        console.log('Redis connected successfully.');
        isRedisAvailable = true;
    });
} catch (err) {
    console.warn('Redis failed to initialize:', err.message);
}

// In-memory fallback for high availability
const localCache = new Map();

/**
 * Get data from cache
 */
async function getCachedData(key) {
    if (isRedisAvailable) {
        try {
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch (err) {
            console.error('Redis Get Error:', err);
        }
    }

    // Fallback to local
    const cachedItem = localCache.get(key);
    if (!cachedItem) return null;
    if (Date.now() > cachedItem.expiry) {
        localCache.delete(key);
        return null;
    }
    return cachedItem.data;
}

/**
 * Set data to cache
 */
async function setCachedData(key, data, ttlSeconds) {
    if (isRedisAvailable) {
        try {
            await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
            return;
        } catch (err) {
            console.error('Redis Set Error:', err);
        }
    }

    // Fallback to local
    localCache.set(key, {
        data,
        expiry: Date.now() + (ttlSeconds * 1000)
    });
}

/**
 * Clear cache
 */
async function clearCache(key) {
    if (isRedisAvailable) {
        try {
            if (key) await redis.del(key);
            else await redis.flushall();
            return;
        } catch (err) {
            console.error('Redis Clear Error:', err);
        }
    }

    if (key) localCache.delete(key);
    else localCache.clear();
}

module.exports = {
    getCachedData,
    setCachedData,
    clearCache
};
