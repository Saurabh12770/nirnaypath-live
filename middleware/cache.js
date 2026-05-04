const cache = new Map();

/**
 * Get data from cache
 * @param {string} key Cache key
 * @returns {any|null} Cached data or null if not found or expired
 */
function getCachedData(key) {
    const cachedItem = cache.get(key);
    if (!cachedItem) {
        return null;
    }

    const now = Date.now();
    if (now > cachedItem.expiry) {
        cache.delete(key);
        return null;
    }

    return cachedItem.data;
}

/**
 * Set data to cache
 * @param {string} key Cache key
 * @param {any} data Data to cache
 * @param {number} ttlSeconds Time to live in seconds
 */
function setCachedData(key, data, ttlSeconds) {
    const expiry = Date.now() + (ttlSeconds * 1000);
    cache.set(key, {
        data,
        expiry
    });
}

/**
 * Clear specific key or entire cache
 * @param {string} [key] Optional key to clear, clears all if not provided
 */
function clearCache(key) {
    if (key) {
        cache.delete(key);
    } else {
        cache.clear();
    }
}

module.exports = {
    getCachedData,
    setCachedData,
    clearCache
};
