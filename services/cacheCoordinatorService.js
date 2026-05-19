'use strict';

/**
 * Cache Coordinator Service
 * =========================
 * Thin adapter over the canonical CacheLayer.
 * All cache operations are delegated to CacheLayer (LRU, TTL, version-aware).
 * This eliminates the previous split-brain where two independent Maps held
 * potentially conflicting values for the same keys.
 */

const crypto = require('crypto');
const CacheLayer = require('./cacheLayer');

class CacheCoordinatorService {
    /**
     * Compute stable hash for arrays / objects
     */
    static computeHash(data) {
        if (!data) return '';
        const str = typeof data === 'string' ? data : JSON.stringify(data);
        return crypto.createHash('md5').update(str).digest('hex');
    }

    /**
     * Read from canonical cache — returns immutable deep-frozen clone or null.
     */
    static get(key) {
        return CacheLayer.getSnapshot(key);
    }

    /**
     * Write to canonical cache with optional TTL.
     */
    static set(key, data, ttlSecs) {
        CacheLayer.setSnapshot(key, data, ttlSecs);
    }

    /**
     * Drift Detection — check if stored value differs from newData.
     * Invalidates cache if drift detected, returns true.
     */
    static checkDrift(key, newData) {
        const current = CacheLayer.getSnapshot(key);
        if (!current) return true; // Not cached — treat as drifted

        const storedHash = this.computeHash(current);
        const newHash = this.computeHash(newData);

        if (storedHash !== newHash) {
            CacheLayer.invalidate(key);
            return true;
        }
        return false;
    }

    static invalidate(key) {
        CacheLayer.invalidate(key);
    }

    /**
     * Cache Integrity Audit — delegates to CacheLayer diagnostics.
     */
    static auditIntegrity() {
        return CacheLayer.getDiagnostics();
    }
}

module.exports = CacheCoordinatorService;

