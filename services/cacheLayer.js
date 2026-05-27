'use strict';

/**
 * Cache Layer (Phase 3 — Hardened)
 * =================================
 * IMMUTABLE SYSTEM with:
 *  - Deep clone on write (prevents mutable shared references)
 *  - Deep freeze on read (prevents downstream mutation)
 *  - TTL-based expiry with cleanup
 *  - LRU eviction when MAX_ENTRIES is reached
 *  - Cache hit/miss telemetry
 *  - getDiagnostics() for /api/health/deep
 */

const MAX_ENTRIES    = parseInt(process.env.CACHE_MAX_ENTRIES   || '500');
const DEFAULT_TTL_MS = parseInt(process.env.CACHE_DEFAULT_TTL_S || '300') * 1000;
const CACHE_VERSION  = process.env.CACHE_VERSION || '1';

class CacheLayer {
    // Private store: key → { value, expires, version, hits, lastAccess }
    static _store = new Map();

    // Telemetry counters
    static _hits   = 0;
    static _misses = 0;
    static _evictions = 0;
    static _expirations = 0;

    // ── Utilities ────────────────────────────────────────────────────────────

    static deepFreeze(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        Object.keys(obj).forEach(prop => {
            if (typeof obj[prop] === 'object' && !Object.isFrozen(obj[prop])) {
                CacheLayer.deepFreeze(obj[prop]);
            }
        });
        return Object.freeze(obj);
    }

    // ── Core API ─────────────────────────────────────────────────────────────

    /**
     * Get a cached value. Returns null on miss or expiry.
     */
    static getSnapshot(key) {
        const entry = this._store.get(key);

        if (!entry) {
            this._misses++;
            return null;
        }

        // Version mismatch — treat as miss
        if (entry.version !== CACHE_VERSION) {
            this._store.delete(key);
            this._misses++;
            this._expirations++;
            console.log(`[CACHE] Version mismatch for key="${key}". Evicted.`);
            return null;
        }

        // TTL expiry
        if (Date.now() > entry.expires) {
            this._store.delete(key);
            this._misses++;
            this._expirations++;
            return null;
        }

        // Hit — update LRU access time
        entry.lastAccess = Date.now();
        entry.hits++;
        this._hits++;

        // Return deep-cloned + frozen — ZERO reference leakage
        try {
            const val = entry.value;
            if (Array.isArray(val) && val.length <= 500 && val.every(i => typeof i === 'string' || typeof i === 'number' || typeof i === 'boolean' || i === null)) {
                return this.deepFreeze(val);
            }
            const clone = JSON.parse(JSON.stringify(val));
            return this.deepFreeze(clone);
        } catch (e) {
            console.error('[CacheLayer] Read serialization error:', e.message);
            return null;
        }
    }

    /**
     * Store a value. Enforces LRU eviction if MAX_ENTRIES reached.
     */
    static setSnapshot(key, value, ttlSecs = DEFAULT_TTL_MS / 1000) {
        try {
            // Deep clone on write — prevent shared mutable references
            const cloned = JSON.parse(JSON.stringify(value));

            // LRU eviction: evict the least-recently-accessed entry if at capacity
            if (!this._store.has(key) && this._store.size >= MAX_ENTRIES) {
                this._evictLRU();
            }

            this._store.set(key, {
                value:      cloned,
                expires:    Date.now() + (ttlSecs * 1000),
                version:    CACHE_VERSION,
                hits:       0,
                lastAccess: Date.now()
            });
        } catch (e) {
            console.error('[CacheLayer] Write serialization error:', e.message);
        }
    }

    static invalidate(key) {
        this._store.delete(key);
    }

    /**
     * Evict the entry with the oldest lastAccess time (LRU).
     */
    static _evictLRU() {
        let oldest    = Infinity;
        let oldestKey = null;

        for (const [k, entry] of this._store.entries()) {
            if (entry.lastAccess < oldest) {
                oldest    = entry.lastAccess;
                oldestKey = k;
            }
        }

        if (oldestKey) {
            this._store.delete(oldestKey);
            this._evictions++;
            console.log(`[CACHE][LRU] Evicted key="${oldestKey}"`);
        }
    }

    /**
     * Remove all expired entries. Call periodically (e.g. every 60s).
     */
    static cleanup() {
        const now = Date.now();
        for (const [key, entry] of this._store.entries()) {
            if (now > entry.expires || entry.version !== CACHE_VERSION) {
                this._store.delete(key);
                this._expirations++;
            }
        }
    }

    /**
     * Full cache diagnostics for /api/health/deep.
     */
    static getDiagnostics() {
        this.cleanup(); // Purge expired entries first for accurate count

        const now = Date.now();
        let totalHits = 0;
        let expiredCount = 0;

        for (const entry of this._store.values()) {
            totalHits += entry.hits;
            if (now > entry.expires) expiredCount++;
        }

        const totalRequests = this._hits + this._misses;
        const hitRate = totalRequests > 0
            ? `${Math.round((this._hits / totalRequests) * 100)}%`
            : 'N/A';

        return {
            status:       'healthy',
            entries:      this._store.size,
            maxEntries:   MAX_ENTRIES,
            hitRate,
            totalHits:    this._hits,
            totalMisses:  this._misses,
            evictions:    this._evictions,
            expirations:  this._expirations,
            cacheVersion: CACHE_VERSION,
            defaultTtlSec: DEFAULT_TTL_MS / 1000
        };
    }
}

// Auto-cleanup on a 60s interval (non-blocking)
setInterval(() => CacheLayer.cleanup(), 60 * 1000).unref();

module.exports = CacheLayer;
