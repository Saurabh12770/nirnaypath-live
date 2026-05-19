'use strict';

const fs = require('fs/promises');
const path = require('path');
const { getRedisClient, isRedisAvailable } = require('./redisService');

class LocalizationEngine {
    constructor() {
        this.supportedLocales = ['en', 'hi'];
        this.bundleCache = new Map();
    }

    async loadBundle(locale) {
        if (!this.supportedLocales.includes(locale)) locale = 'en';

        // 1. Check in-memory cache first (fastest path)
        if (this.bundleCache.has(locale)) {
            return this.bundleCache.get(locale);
        }

        // 2. Check Redis if available
        if (isRedisAvailable()) {
            try {
                const redis = getRedisClient();
                const cached = await redis.get(`locale:${locale}`);
                if (cached) {
                    const bundle = JSON.parse(cached);
                    this.bundleCache.set(locale, bundle);
                    return bundle;
                }
            } catch (e) {
                // Redis read failure is non-fatal — fall through to disk
            }
        }

        // 3. Fallback to disk
        try {
            const bundlePath = path.join(__dirname, '..', 'locales', `${locale}.json`);
            const data = await fs.readFile(bundlePath, 'utf8');
            const bundle = JSON.parse(data);

            // Cache in Redis asynchronously (non-blocking)
            if (isRedisAvailable()) {
                const redis = getRedisClient();
                redis.set(`locale:${locale}`, data, 'EX', 86400).catch(() => {});
            }

            this.bundleCache.set(locale, bundle);
            return bundle;
        } catch (e) {
            // Locale file missing — return empty bundle (graceful degradation)
            return {};
        }
    }

    async translate(locale, key) {
        const bundle = await this.loadBundle(locale);
        return bundle[key] || key;
    }
}

module.exports = new LocalizationEngine();
