const Redis = require('ioredis');

// Initialize Redis client with fallback
let redis;
let isRedisAvailable = false;
const CACHE_VERSION = 'v1'; // Phase 4: Version-based cache keying

try {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
        maxRetriesPerRequest: 1,
        commandTimeout: 2000, // Phase 3: Circuit Breaker - prevent slow Redis from hanging requests
        retryStrategy: (times) => {
            if (times > 2) return null; // stop retrying quickly
            return 500;
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
    const versionedKey = `${CACHE_VERSION}_${key}`;
    if (isRedisAvailable) {
        try {
            // maxTimeMS for redis.get simulation via commandTimeout
            const data = await redis.get(versionedKey);
            if (!data) return null;
            return JSON.parse(data);
        } catch (err) {
            console.warn('[Cache] Redis Get Error (Falling back):', err.message);
            // Don't disable redis on single error, but use fallback
        }
    }

    // Fallback to local
    const cachedItem = localCache.get(versionedKey); // Use versionedKey consistently
    if (!cachedItem) return null;
    if (Date.now() > cachedItem.expiry) {
        localCache.delete(versionedKey);
        return null;
    }
    
    // FAANG-Level Immutability: ALWAYS return a deep clone for local memory objects
    // This prevents one request from mutating the cached pool for all others.
    try {
        return JSON.parse(JSON.stringify(cachedItem.data));
    } catch (e) {
        return cachedItem.data; // Fallback to reference if cloning fails
    }
}

/**
 * Set data to cache
 */
async function setCachedData(key, data, ttlSeconds) {
    const versionedKey = `${CACHE_VERSION}_${key}`;
    if (isRedisAvailable) {
        try {
            await redis.set(versionedKey, JSON.stringify(data), 'EX', ttlSeconds);
            return;
        } catch (err) {
            console.warn('[Cache] Redis Set Error:', err.message);
        }
    }

    // Fallback to local
    localCache.set(versionedKey, {
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
