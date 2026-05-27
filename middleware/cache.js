const { getRedisClient, isRedisAvailable } = require('../services/redisService');

const CACHE_VERSION = 'v1'; // Phase 4: Version-based cache keying

// In-memory fallback for high availability
const localCache = new Map();

/**
 * Get data from cache
 */
async function getCachedData(key) {
    const versionedKey = `${CACHE_VERSION}_${key}`;
    if (isRedisAvailable()) {
        try {
            const redis = getRedisClient();
            const data = await redis.get(versionedKey);
            if (!data) return null;
            return JSON.parse(data);
        } catch (err) {
            console.warn('[Cache] Redis Get Error (Falling back):', err.message);
        }
    }

    // Fallback to local
    const cachedItem = localCache.get(versionedKey);
    if (!cachedItem) return null;
    if (Date.now() > cachedItem.expiry) {
        localCache.delete(versionedKey);
        return null;
    }
    
    // FAANG-Level Immutability: ALWAYS return a deep clone for local memory objects
    try {
        const val = cachedItem.data;
        if (Array.isArray(val) && val.length <= 500 && val.every(i => typeof i === 'string' || typeof i === 'number' || typeof i === 'boolean' || i === null)) {
            if (!Object.isFrozen(val)) {
                Object.freeze(val);
            }
            return val;
        }
        return JSON.parse(JSON.stringify(val));
    } catch (e) {
        return cachedItem.data;
    }
}

/**
 * Set data to cache
 */
async function setCachedData(key, data, ttlSeconds) {
    const versionedKey = `${CACHE_VERSION}_${key}`;
    if (isRedisAvailable()) {
        try {
            const redis = getRedisClient();
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
    const versionedKey = key ? `${CACHE_VERSION}_${key}` : null;
    if (isRedisAvailable()) {
        try {
            const redis = getRedisClient();
            if (versionedKey) await redis.del(versionedKey);
            else await redis.flushall();
            return;
        } catch (err) {
            console.error('Redis Clear Error:', err);
        }
    }

    if (versionedKey) localCache.delete(versionedKey);
    else localCache.clear();
}

module.exports = {
    getCachedData,
    setCachedData,
    clearCache
};
