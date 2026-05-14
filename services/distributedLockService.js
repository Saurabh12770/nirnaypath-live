/**
 * Distributed Lock Service
 * Phase 7 - Enterprise Certification
 */

class DistributedLockService {
    // In a multi-node production setup, this would be a Redis-based locking mechanism (e.g., Redlock)
    // For this architecture phase, we use an atomic Map to prevent local concurrency storms
    static locks = new Map();

    /**
     * 1. Acquire Lock
     */
    static async acquireLock(resourceKey, ttlMs = 10000) {
        if (this.locks.has(resourceKey)) {
            const lock = this.locks.get(resourceKey);
            if (Date.now() < lock.expiresAt) {
                return { success: false, error: 'Resource is locked' };
            } else {
                // Stale lock detected, auto-expire
                this.detectStaleLocks();
            }
        }

        const lockId = `lock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.locks.set(resourceKey, {
            lockId,
            expiresAt: Date.now() + ttlMs,
            acquiredAt: Date.now()
        });

        return { success: true, lockId };
    }

    /**
     * 2. Release Lock
     */
    static releaseLock(resourceKey, lockId) {
        const lock = this.locks.get(resourceKey);
        if (lock && lock.lockId === lockId) {
            this.locks.delete(resourceKey);
            return true;
        }
        return false;
    }

    /**
     * 3. Auto Expire / Detect Stale Locks
     */
    static detectStaleLocks() {
        let staleCount = 0;
        const now = Date.now();
        for (const [key, lock] of this.locks.entries()) {
            if (now > lock.expiresAt) {
                this.locks.delete(key);
                staleCount++;
            }
        }
        return staleCount;
    }

    /**
     * 5. Force Recover Lock (Admin emergency)
     */
    static forceRecoverLock(resourceKey) {
        if (this.locks.has(resourceKey)) {
            this.locks.delete(resourceKey);
            return true;
        }
        return false;
    }
}

module.exports = DistributedLockService;
