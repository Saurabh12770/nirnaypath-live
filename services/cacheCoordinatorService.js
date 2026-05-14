/**
 * Cache Coordinator Service for NirnayPath
 * Phase 6 - Elimination of Drift
 */

const crypto = require('crypto');

class CacheCoordinatorService {
    // Local In-Memory Fallback
    static localCache = new Map();

    /**
     * Deep clone to enforce immutability
     */
    static deepClone(obj) {
        return obj ? JSON.parse(JSON.stringify(obj)) : obj;
    }

    /**
     * Compute stable hash for arrays
     */
    static computeHash(data) {
        if (!data) return '';
        const str = typeof data === 'string' ? data : JSON.stringify(data);
        return crypto.createHash('md5').update(str).digest('hex');
    }

    /**
     * 1. Immutable Cache Reads
     */
    static get(key) {
        // In a real Redis environment, we would await redis.get(key)
        // For this layer, we use localCache ensuring we NEVER return a mutable reference.
        const entry = this.localCache.get(key);
        if (!entry) return null;

        // Simulate Graceful Redis Failure - Always fallback to local cache safely
        return this.deepClone(entry.data);
    }

    /**
     * 2. Versioned Cache Keys & Storage
     */
    static set(key, data) {
        const hash = this.computeHash(data);
        const versionedKey = `${key}:v1`; // Hardcoded v1 for simplicity in this architecture phase

        const entry = {
            data: this.deepClone(data),
            hash,
            timestamp: Date.now()
        };

        this.localCache.set(key, entry);
        // We also store under versioned key if needed
        this.localCache.set(versionedKey, entry);
    }

    /**
     * 3. Drift Detection
     */
    static checkDrift(key, newData) {
        const entry = this.localCache.get(key);
        if (!entry) return true; // It's empty, so it drifted from existence

        const newHash = this.computeHash(newData);
        if (entry.hash !== newHash) {
            // Drift detected!
            this.invalidate(key);
            return true;
        }
        return false;
    }

    static invalidate(key) {
        this.localCache.delete(key);
        this.localCache.delete(`${key}:v1`);
    }

    /**
     * 4. Cache Integrity Audit
     */
    static auditIntegrity() {
        let staleKeys = 0;
        let totalSize = 0;
        const now = Date.now();

        for (const [key, entry] of this.localCache.entries()) {
            if (now - entry.timestamp > 1000 * 60 * 60 * 24) { // 24 hours stale
                staleKeys++;
            }
            totalSize += JSON.stringify(entry.data).length;
        }

        return {
            totalKeys: this.localCache.size,
            staleKeys,
            totalSizeBytes: totalSize
        };
    }
}

module.exports = CacheCoordinatorService;
