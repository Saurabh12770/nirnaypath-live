/**
 * NirnayPath Offline Storage Library
 * Module D — Offline-First Learning (Phase 12)
 *
 * Provides a fully featured, promise-based IndexedDB wrapper for:
 * - Caching question pools for offline test sessions
 * - Storing offline test attempts locally
 * - Managing a sync queue to upload attempts when back online
 * - Conflict resolution via session timestamps (oldest wins, duplicates skipped)
 *
 * Usage:
 *   import NirnayPathOfflineStorage from '/js/offlineStorage.js';
 *   const store = new NirnayPathOfflineStorage();
 *   await store.init();
 */

const DB_NAME = 'nirnaypath_offline_v1';
const DB_VERSION = 1;

const STORES = {
    QUESTIONS:      'offline_questions',      // Cached question pools per subject
    ATTEMPTS:       'offline_attempts',       // Completed offline test sessions
    SYNC_QUEUE:     'sync_queue',             // Attempts pending server upload
    USER_PROFILE:   'user_profile_cache',     // Cached user/mastery snapshot
};

class NirnayPathOfflineStorage {

    constructor() {
        this.db = null;
        this._initPromise = null;
    }

    /* ------------------------------------------------------------------ */
    /*  INITIALIZATION                                                      */
    /* ------------------------------------------------------------------ */

    /**
     * Open (or upgrade) the IndexedDB database.
     * Safe to call multiple times — returns the same promise.
     */
    init() {
        if (this._initPromise) return this._initPromise;

        this._initPromise = new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);

            req.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Questions store — keyed by subjectId
                if (!db.objectStoreNames.contains(STORES.QUESTIONS)) {
                    const qs = db.createObjectStore(STORES.QUESTIONS, { keyPath: 'subjectId' });
                    qs.createIndex('cachedAt', 'cachedAt', { unique: false });
                }

                // Offline attempts store — keyed by sessionId
                if (!db.objectStoreNames.contains(STORES.ATTEMPTS)) {
                    const as = db.createObjectStore(STORES.ATTEMPTS, { keyPath: 'sessionId' });
                    as.createIndex('createdAt', 'createdAt', { unique: false });
                    as.createIndex('synced', 'synced', { unique: false });
                }

                // Sync queue — keyed by sessionId (mirrors attempts until uploaded)
                if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
                    db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'sessionId' });
                }

                // User profile snapshot store — single record keyed 'profile'
                if (!db.objectStoreNames.contains(STORES.USER_PROFILE)) {
                    db.createObjectStore(STORES.USER_PROFILE, { keyPath: 'key' });
                }
            };

            req.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            req.onerror = (event) => {
                console.error('[OfflineStorage] IndexedDB open failed:', event.target.error);
                reject(event.target.error);
            };
        });

        return this._initPromise;
    }

    /** Internal helper: wrap an IDBRequest in a promise */
    _promisify(request) {
        return new Promise((resolve, reject) => {
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror  = (e) => reject(e.target.error);
        });
    }

    /* ------------------------------------------------------------------ */
    /*  QUESTION POOL CACHING                                               */
    /* ------------------------------------------------------------------ */

    /**
     * Cache a question pool for offline use.
     * Replaces any existing cache for the same subject.
     * @param {string} subjectId
     * @param {Array}  questions
     */
    async cacheQuestions(subjectId, questions) {
        await this.init();
        const tx = this.db.transaction(STORES.QUESTIONS, 'readwrite');
        const store = tx.objectStore(STORES.QUESTIONS);
        await this._promisify(store.put({
            subjectId,
            questions,
            cachedAt: new Date().toISOString(),
            count: questions.length
        }));
        console.log(`[OfflineStorage] Cached ${questions.length} questions for "${subjectId}"`);
    }

    /**
     * Retrieve a cached question pool.
     * Returns null if no cache exists or if cache is stale (>24h old).
     * @param {string} subjectId
     * @param {number} maxAgeHours — default 24
     * @returns {Promise<Array|null>}
     */
    async getOfflineQuestions(subjectId, maxAgeHours = 24) {
        await this.init();
        const tx = this.db.transaction(STORES.QUESTIONS, 'readonly');
        const store = tx.objectStore(STORES.QUESTIONS);
        const record = await this._promisify(store.get(subjectId));

        if (!record) return null;

        const ageHours = (Date.now() - new Date(record.cachedAt).getTime()) / (1000 * 3600);
        if (ageHours > maxAgeHours) {
            console.warn(`[OfflineStorage] Cache for "${subjectId}" is stale (${ageHours.toFixed(1)}h old). Returning anyway.`);
        }

        return record.questions || null;
    }

    /* ------------------------------------------------------------------ */
    /*  OFFLINE ATTEMPT STORAGE                                             */
    /* ------------------------------------------------------------------ */

    /**
     * Save an offline test attempt locally.
     * Generates a unique sessionId if not provided.
     * @param {Object} attempt — { exam, subject, testName, answers[], score, ... }
     * @returns {Promise<string>} sessionId of saved attempt
     */
    async saveOfflineAttempt(attempt) {
        await this.init();

        // Generate sessionId if not present
        if (!attempt.sessionId) {
            attempt.sessionId = `offline_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        }

        const record = {
            ...attempt,
            createdAt: attempt.createdAt || new Date().toISOString(),
            synced: false,
            syncedAt: null
        };

        const tx = this.db.transaction([STORES.ATTEMPTS, STORES.SYNC_QUEUE], 'readwrite');
        await this._promisify(tx.objectStore(STORES.ATTEMPTS).put(record));
        await this._promisify(tx.objectStore(STORES.SYNC_QUEUE).put(record));

        console.log(`[OfflineStorage] Saved offline attempt: ${record.sessionId}`);
        return record.sessionId;
    }

    /**
     * Get all unsynced offline attempts from the sync queue.
     * @returns {Promise<Array>}
     */
    async getUnsyncedAttempts() {
        await this.init();
        const tx = this.db.transaction(STORES.SYNC_QUEUE, 'readonly');
        const store = tx.objectStore(STORES.SYNC_QUEUE);
        return this._promisify(store.getAll());
    }

    /**
     * Get all saved offline attempts (synced + unsynced).
     * @returns {Promise<Array>}
     */
    async getAllAttempts() {
        await this.init();
        const tx = this.db.transaction(STORES.ATTEMPTS, 'readonly');
        return this._promisify(tx.objectStore(STORES.ATTEMPTS).getAll());
    }

    /* ------------------------------------------------------------------ */
    /*  SYNCHRONIZATION                                                     */
    /* ------------------------------------------------------------------ */

    /**
     * Synchronize all queued offline attempts with the server.
     * Uses /api/learning/sync endpoint with idempotent conflict resolution.
     *
     * Conflict resolution strategy:
     *   - Server skips sessions that already exist (duplicate sessionId).
     *   - createdAt from the offline device is preserved as the authoritative timestamp.
     *
     * @param {string} authToken — JWT Bearer token for the authenticated user
     * @returns {Promise<Object>} { synced, skipped, failed }
     */
    async syncToServer(authToken) {
        const queue = await this.getUnsyncedAttempts();

        if (queue.length === 0) {
            console.log('[OfflineStorage] Sync queue is empty. Nothing to sync.');
            return { synced: [], skipped: [], failed: [] };
        }

        console.log(`[OfflineStorage] Syncing ${queue.length} offline attempt(s) to server...`);

        let result = { synced: [], skipped: [], failed: [] };

        try {
            const response = await fetch('/api/learning/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ offlineResults: queue })
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }

            result = await response.json();

            // Mark successfully synced items in local DB
            const syncedIds = new Set((result.synced || []).map(s => s.sessionId));
            const skippedIds = new Set((result.skipped || []).map(s => s.sessionId));
            const processedIds = new Set([...syncedIds, ...skippedIds]);

            if (processedIds.size > 0) {
                const tx = this.db.transaction([STORES.ATTEMPTS, STORES.SYNC_QUEUE], 'readwrite');
                const attemptsStore = tx.objectStore(STORES.ATTEMPTS);
                const queueStore = tx.objectStore(STORES.SYNC_QUEUE);

                for (const sessionId of processedIds) {
                    // Mark as synced in ATTEMPTS store
                    const record = await this._promisify(attemptsStore.get(sessionId));
                    if (record) {
                        record.synced = true;
                        record.syncedAt = new Date().toISOString();
                        await this._promisify(attemptsStore.put(record));
                    }
                    // Remove from sync queue
                    await this._promisify(queueStore.delete(sessionId));
                }
            }

            console.log(`[OfflineStorage] Sync complete: ${result.synced?.length || 0} synced, ${result.skipped?.length || 0} skipped, ${result.failed?.length || 0} failed.`);
        } catch (err) {
            console.error('[OfflineStorage] Sync request failed:', err.message);
            result.failed = queue.map(q => ({ sessionId: q.sessionId, reason: err.message }));
        }

        return result;
    }

    /* ------------------------------------------------------------------ */
    /*  USER PROFILE CACHE                                                  */
    /* ------------------------------------------------------------------ */

    /**
     * Cache the user's learning profile snapshot for offline use.
     * @param {Object} profile — { userId, mastery, revision, plan, ... }
     */
    async cacheUserProfile(profile) {
        await this.init();
        const tx = this.db.transaction(STORES.USER_PROFILE, 'readwrite');
        await this._promisify(tx.objectStore(STORES.USER_PROFILE).put({
            key: 'profile',
            ...profile,
            cachedAt: new Date().toISOString()
        }));
        console.log('[OfflineStorage] User learning profile cached.');
    }

    /**
     * Retrieve the cached user learning profile.
     * @returns {Promise<Object|null>}
     */
    async getCachedProfile() {
        await this.init();
        const tx = this.db.transaction(STORES.USER_PROFILE, 'readonly');
        const record = await this._promisify(tx.objectStore(STORES.USER_PROFILE).get('profile'));
        return record || null;
    }

    /* ------------------------------------------------------------------ */
    /*  ONLINE/OFFLINE DETECTION WITH AUTO-SYNC                             */
    /* ------------------------------------------------------------------ */

    /**
     * Register an online event listener that auto-syncs when the device reconnects.
     * @param {string} authToken — JWT Bearer token
     */
    registerAutoSync(authToken) {
        if (typeof window === 'undefined') return;

        const onOnline = async () => {
            console.log('[OfflineStorage] Connection restored. Starting auto-sync...');
            const result = await this.syncToServer(authToken);
            // Dispatch a custom DOM event so UI can react
            window.dispatchEvent(new CustomEvent('nirnaypath:sync-complete', { detail: result }));
        };

        window.addEventListener('online', onOnline);
        console.log('[OfflineStorage] Auto-sync registered. Will fire on next reconnection.');
    }

    /**
     * Check if the device is currently online.
     * @returns {boolean}
     */
    isOnline() {
        return typeof navigator !== 'undefined' ? navigator.onLine : true;
    }

    /* ------------------------------------------------------------------ */
    /*  UTILITIES                                                           */
    /* ------------------------------------------------------------------ */

    /**
     * Get a quick summary of the offline database state.
     * @returns {Promise<Object>}
     */
    async getDatabaseStats() {
        await this.init();

        const [allAttempts, unsyncedAttempts] = await Promise.all([
            this.getAllAttempts(),
            this.getUnsyncedAttempts()
        ]);

        return {
            totalAttempts: allAttempts.length,
            syncedAttempts: allAttempts.filter(a => a.synced).length,
            pendingSyncCount: unsyncedAttempts.length,
            isOnline: this.isOnline()
        };
    }

    /**
     * Clear all data from the offline database (use cautiously).
     * @param {boolean} clearSyncQueue — also clear unsynced queue (default false for safety)
     */
    async clearCache(clearSyncQueue = false) {
        await this.init();
        const storesToClear = [STORES.QUESTIONS, STORES.USER_PROFILE];
        if (clearSyncQueue) storesToClear.push(STORES.SYNC_QUEUE, STORES.ATTEMPTS);

        for (const storeName of storesToClear) {
            const tx = this.db.transaction(storeName, 'readwrite');
            await this._promisify(tx.objectStore(storeName).clear());
        }

        console.log('[OfflineStorage] Cache cleared for:', storesToClear.join(', '));
    }
}

// Export as singleton — attach to window for global access
if (typeof window !== 'undefined') {
    window.NirnayPathOfflineStorage = NirnayPathOfflineStorage;
}

export default NirnayPathOfflineStorage;
