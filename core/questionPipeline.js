const QuestionRepository = require('../services/questionRepository');
const HistoryService = require('../services/historyService');
const SelectionEngine = require('../services/selectionEngine');
const DedupEngine = require('../services/dedupEngine');
const QuestionReservationManager = require('../services/questionReservationService');
const crypto = require('crypto');

class QuestionPipeline {
    static async execute({ userId, subject, count, retryCount = 0 }) {
        const pipelineStartTime = Date.now();
        const targetCount = parseInt(count) || 50;
        const sessionId = crypto.randomUUID();
        
        let releaseLock = null;
        let selectedIds = [];

        try {
            // 1. Acquire Atomic User Lock (Prevent parallel requests for same user)
            releaseLock = await QuestionReservationManager.acquireUserLock(userId);

            // 2. Fetch Pool
            const fullPool = await QuestionRepository.fetchQuestions(subject);

            // 3. Filter History & Active Reservations
            const seenIds = await HistoryService.getRecentQuestionWindow(userId, 10 + (retryCount * 5));
            const reservedIds = await QuestionReservationManager.getReservedIds(userId);

            const filteredPool = fullPool.filter(q => {
                const id = String(q._id || q.id || q.questionId || '').trim().toLowerCase();
                return !seenIds.has(id) && !reservedIds.has(id);
            });

            // 4. Selection Engine (PURE LOGIC)
            const initialSelection = SelectionEngine.select(filteredPool, targetCount, reservedIds);
            selectedIds = initialSelection.map(q => String(q._id || q.id || q.questionId || '').trim().toLowerCase());

            // 5. Atomic Reservation (Source of Truth check)
            const reserveSuccess = await QuestionReservationManager.reserveAtomically(userId, selectedIds, sessionId);
            
            if (!reserveSuccess) {
                if (retryCount < 3) {
                    console.warn(`[Pipeline] Race condition detected. Retrying selection...`);
                    releaseLock(); releaseLock = null;
                    return await this.execute({ userId, subject, count, retryCount: retryCount + 1 });
                }
                throw new Error('Critical selection failure: too many concurrent requests.');
            }

            // 6. Global Invariant Enforcer (Final Safety Net)
            const isSafe = await QuestionReservationManager.verifyInvariant(userId, selectedIds);
            if (!isSafe) {
                console.error(`[Pipeline] GLOBAL INVARIANT VIOLATION! Rolling back...`);
                await QuestionReservationManager.release(userId, selectedIds);
                if (retryCount < 3) {
                    releaseLock(); releaseLock = null;
                    return await this.execute({ userId, subject, count, retryCount: retryCount + 1 });
                }
                throw new Error('Safety integrity check failed.');
            }

            // 7. Success - Mark for Commit
            await QuestionReservationManager.commit(userId, selectedIds);

            const finalQuestions = DedupEngine.validateFinalOutput(initialSelection);

            console.log(`[DUPLICATION_DIAGNOSTIC]
                sessionId: ${sessionId}
                poolSize: ${fullPool.length}
                historyFiltered: ${seenIds.size}
                reservedFiltered: ${reservedIds.size}
                finalSelected: ${finalQuestions.length}
                retryCount: ${retryCount}
                status: COMMITTED
                totalTime: ${Date.now() - pipelineStartTime}ms`);

            return {
                questions: finalQuestions,
                warning: finalQuestions.length < targetCount ? `Only ${finalQuestions.length} questions available.` : null
            };

        } catch (error) {
            console.error(`[Pipeline] FATAL ERROR: ${error.message}`);
            if (selectedIds.length > 0) {
                await QuestionReservationManager.release(userId, selectedIds);
            }
            throw error;
        } finally {
            if (releaseLock) releaseLock();
        }
    }
}

module.exports = QuestionPipeline;
