/**
2.0 Caching Middleware
----------------------
Pure in-memory Map cache.
*/

'use strict';

const localCache = new Map();

/**
 * Get data from cache
 */
async function getCachedData(key) {
    const cachedItem = localCache.get(key);
    if (!cachedItem) return null;
    if (Date.now() > cachedItem.expiry) {
        localCache.delete(key);
        return null;
    }
    
    // Return deep cloned version to prevent mutable references
    try {
        return JSON.parse(JSON.stringify(cachedItem.data));
    } catch (e) {
        return cachedItem.data;
    }
}

/**
 * Set data to cache
 */
async function setCachedData(key, data, ttlSeconds) {
    localCache.set(key, {
        data,
        expiry: Date.now() + (ttlSeconds * 1000)
    });
}

/**
 * Clear cache
 */
async function clearCache(key) {
    if (key) {
        localCache.delete(key);
    } else {
        localCache.clear();
    }
}

module.exports = {
    getCachedData,
    setCachedData,
    clearCache
};
