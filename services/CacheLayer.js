/**
 * Cache Layer (Phase 7)
 * IMMUTABLE SYSTEM
 */

class CacheLayer {
    static _store = new Map();

    static deepFreeze(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        
        Object.keys(obj).forEach(prop => {
            if (typeof obj[prop] === 'object' && !Object.isFrozen(obj[prop])) {
                CacheLayer.deepFreeze(obj[prop]);
            }
        });
        
        return Object.freeze(obj);
    }

    static getSnapshot(key) {
        if (!this._store.has(key)) return null;
        
        const data = this._store.get(key);
        // Guarantee no reference leakage: parse(stringify) then deepFreeze
        try {
            const clone = JSON.parse(JSON.stringify(data.value));
            return this.deepFreeze(clone);
        } catch(e) {
            return null;
        }
    }

    static setSnapshot(key, value, ttlSecs = 300) {
        try {
            // Store stringified to guarantee immutability in memory
            const clonedForStorage = JSON.parse(JSON.stringify(value));
            this._store.set(key, {
                value: clonedForStorage,
                expires: Date.now() + (ttlSecs * 1000)
            });
        } catch(e) {
            console.error('[CacheLayer] Serialization Error:', e.message);
        }
    }

    static invalidate(key) {
        this._store.delete(key);
    }

    // Optional: cleanup interval
    static cleanup() {
        const now = Date.now();
        for (const [key, item] of this._store.entries()) {
            if (now > item.expires) {
                this._store.delete(key);
            }
        }
    }
}

module.exports = CacheLayer;
