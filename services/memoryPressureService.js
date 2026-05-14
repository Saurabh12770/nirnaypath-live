/**
 * Memory Pressure Service
 * Phase 7 - Enterprise Certification
 */

const RuntimeSupervisorService = require('./runtimeSupervisorService');
const CacheCoordinatorService = require('./cacheCoordinatorService');

class MemoryPressureService {

    /**
     * 1. Detect Memory Pressure
     */
    static detectMemoryPressure() {
        const stats = RuntimeSupervisorService.monitorHeapUsage();
        return stats.usageRatio > 0.85; // 85% is critical backpressure threshold
    }

    /**
     * 2. Adaptive Cache Eviction
     */
    static adaptiveCacheEviction() {
        if (!this.detectMemoryPressure()) return { evicted: 0 };

        // We are under pressure, clear all stale keys immediately
        let evicted = 0;
        const now = Date.now();
        for (const [key, entry] of CacheCoordinatorService.localCache.entries()) {
            if (now - entry.timestamp > 1000 * 60 * 60) { // 1 hour stale
                CacheCoordinatorService.localCache.delete(key);
                evicted++;
            }
        }

        // If STILL under pressure, clear everything (Cold boot fallback)
        if (this.detectMemoryPressure()) {
            const total = CacheCoordinatorService.localCache.size;
            CacheCoordinatorService.localCache.clear();
            evicted = total;
            RuntimeSupervisorService.logTrace({ type: 'MEMORY_PANIC_PURGE', evicted });
        }

        return { evicted };
    }

    /**
     * 3. Stream Large Question Banks
     * Provides an interface for processing massive arrays without loading into memory.
     * (Placeholder for future JSONStream or Mongo Cursor implementations)
     */
    static async *streamLargeQuestionBanks(subject) {
        const QuestionRepository = require('./questionRepository');
        const questions = await QuestionRepository.getQuestions({ subject });
        
        // Chunk it
        const chunkSize = 100;
        for (let i = 0; i < questions.length; i += chunkSize) {
            yield questions.slice(i, i + chunkSize);
        }
    }

    /**
     * 4. Runtime Backpressure
     */
    static checkRuntimeBackpressure() {
        if (this.detectMemoryPressure()) {
            // Throttle system
            RuntimeSupervisorService.logTrace({ type: 'BACKPRESSURE_ACTIVATED' });
            return true; // Indicates system should reject heavy operations (like generation)
        }
        return false;
    }
}

module.exports = MemoryPressureService;
