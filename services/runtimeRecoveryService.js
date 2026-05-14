/**
 * Runtime Recovery Service
 * Phase 7 - Enterprise Certification
 */

const mongoose = require('mongoose');
const CacheCoordinatorService = require('./cacheCoordinatorService');
const RuntimeSupervisorService = require('./runtimeSupervisorService');
const ContentApprovalService = require('./contentApprovalService');

class RuntimeRecoveryService {
    
    /**
     * 1. Recover Redis/Cache Failure
     */
    static recoverRedisFailure() {
        // If external cache dies, fallback to purely local immutable reads
        CacheCoordinatorService.localCache.clear();
        RuntimeSupervisorService.logTrace({ type: 'RECOVERY_CACHE_CLEARED', action: 'Fallback to cold boot' });
        return { success: true, message: 'Local cache purged, ready for rebuild.' };
    }

    /**
     * 2. Recover Mongo Disconnect Storm
     */
    static async recoverMongoDisconnect() {
        if (mongoose.connection.readyState === 0) { // 0 = disconnected
            try {
                // Trigger reconnect logic (assuming connection URI is stored in env)
                if (process.env.MONGODB_URI) {
                    await mongoose.connect(process.env.MONGODB_URI);
                    RuntimeSupervisorService.logTrace({ type: 'RECOVERY_MONGO_RECONNECTED' });
                    return { success: true };
                }
                return { success: false, error: 'No URI available for auto-reconnect' };
            } catch (e) {
                RuntimeSupervisorService.logTrace({ type: 'RECOVERY_MONGO_FAILED', error: e.message });
                return { success: false, error: e.message };
            }
        }
        return { success: true, message: 'Mongo already connected' };
    }

    /**
     * 3. Recover Corrupt Cache
     */
    static recoverCorruptCache(subject) {
        CacheCoordinatorService.invalidate(`questions_${subject.toLowerCase()}`);
        RuntimeSupervisorService.logTrace({ type: 'RECOVERY_CORRUPT_CACHE', subject });
        return { success: true };
    }

    /**
     * 4. Recover Failed Approval
     */
    static recoverFailedApproval(backupId) {
        return ContentApprovalService.rollbackApproval(backupId);
    }

    /**
     * 5. Recover Worker Crash
     */
    static recoverWorkerCrash(workerId) {
        // Log the crash. In an enterprise setup like PM2 or BullMQ, 
        // the worker auto-restarts, but we must purge any stale locks it held.
        RuntimeSupervisorService.logTrace({ type: 'RECOVERY_WORKER_CRASH', workerId });
        const DistributedLockService = require('./distributedLockService');
        DistributedLockService.detectStaleLocks(); // Force purge
        return { success: true };
    }
}

module.exports = RuntimeRecoveryService;
