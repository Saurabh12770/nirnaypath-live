'use strict';

/**
 * questionPipeline.js  (Phase 7 — Hardened)
 * ==========================================
 * Central orchestration pipeline. Single source of truth for question delivery.
 *
 * Fixes applied:
 *  - FIX #3:  Returns strict { questions, warning } contract (no bare arrays)
 *  - PHASE 2: Fingerprint-based dedup integrated
 *  - PHASE 2: Immutable output via deep-clone + Object.freeze on each question
 *  - PHASE 2: Forensic log tags: [QUESTION_PIPELINE] [DEDUPE] [SESSION] [CACHE]
 *  - PHASE 2: servedQuestionIds exclusion set prevents skipped-question recurrence
 */

const QuestionRepository         = require('../services/questionRepository');
const HistoryService             = require('../services/historyService');
const SelectionEngine            = require('../services/selectionEngine');
const DedupEngine                = require('../services/dedupEngine');
const QuestionReservationManager = require('../services/questionReservationService');
const { deduplicateByFingerprint } = require('../utils/questionFingerprint');
const crypto = require('crypto');

class QuestionPipeline {

    /**
     * Execute the full question-delivery pipeline.
     *
     * @returns {{ questions: object[], warning: string|null }}
     *   ALWAYS returns this shape — never a bare array, never null.
     */
    static async execute({ userId, subject, topicId, count, retryCount = 0 }) {
        const pipelineStartTime = Date.now();
        const sessionId   = crypto.randomUUID();
        const targetCount = parseInt(count) || 50;

        let releaseLock = null;
        let selectedIds = [];

        console.log(
            `[QUESTION_PIPELINE] START sessionId=${sessionId} ` +
            `user=${userId} subject=${JSON.stringify(subject)} ` +
            `topic=${topicId || 'none'} count=${targetCount} retry=${retryCount}`
        );

        try {
            // 1. Acquire Atomic User Lock (prevent parallel racing requests)
            releaseLock = await QuestionReservationManager.acquireUserLock(userId);
            console.log(`[QUESTION_PIPELINE][SESSION] Lock acquired for user=${userId}`);

            // 2. Fetch Pool from Repository
            const rawPool = await QuestionRepository.fetchQuestions(subject, topicId);
            console.log(`[QUESTION_PIPELINE] Raw pool size: ${rawPool.length}`);

            // 3. Fingerprint dedup — removes duplicates across DB + JSON sources
            const dedupedPool = deduplicateByFingerprint(rawPool);
            console.log(`[DEDUPE] After fingerprint dedup: ${dedupedPool.length} (removed ${rawPool.length - dedupedPool.length})`);

            // 4. Freeze each question to prevent mutation leaks downstream
            const frozenPool = dedupedPool.map(q => Object.freeze(JSON.parse(JSON.stringify(q))));

            // 5. Filter History & Active Reservations (with semantic text exclusion)
            const { ids: seenIds, texts: seenTexts } = await HistoryService.getRecentQuestionWindowExclusions(userId, 10 + (retryCount * 5));
            const reservedIds = await QuestionReservationManager.getReservedIds(userId);
            console.log(`[SESSION] Seen IDs: ${seenIds.size} | Seen Texts: ${seenTexts.size} | Reserved IDs: ${reservedIds.size}`);

            const { normalizeText } = require('../utils/questionFingerprint');
            let filteredPool = frozenPool.filter(q => {
                const id = String(q.id || q.questionId || q._id || '').trim().toLowerCase();
                const normTxt = normalizeText(q.question_en || q.question || q.text || '');
                return !seenIds.has(id) && !reservedIds.has(id) && !seenTexts.has(normTxt);
            });

            // 6. Secondary topic filter (safety net in case repository missed it)
            if (topicId) {
                const searchTopic = String(topicId).trim().toLowerCase();
                filteredPool = filteredPool.filter(q => {
                    const qTopic = String(q.topic || q.topicId || '').trim().toLowerCase();
                    return qTopic === searchTopic;
                });
                console.log(`[QUESTION_PIPELINE] After topic filter "${searchTopic}": ${filteredPool.length}`);
            }

            // 7. Selection Engine (pure logic — Fisher-Yates)
            const initialSelection = SelectionEngine.select(filteredPool, targetCount, reservedIds);
            selectedIds = initialSelection.map(q =>
                String(q.id || q.questionId || q._id || '').trim().toLowerCase()
            );
            console.log(`[QUESTION_PIPELINE] Selected: ${selectedIds.length}`);

            // 8. Atomic Reservation
            const reserveSuccess = await QuestionReservationManager.reserveAtomically(
                userId, selectedIds, sessionId
            );

            if (!reserveSuccess) {
                if (retryCount < 3) {
                    console.warn(`[QUESTION_PIPELINE] Race condition — retrying (attempt ${retryCount + 1})`);
                    releaseLock(); releaseLock = null;
                    return await this.execute({ userId, subject, topicId, count, retryCount: retryCount + 1 });
                }
                throw new Error('Critical selection failure: too many concurrent requests.');
            }

            // 9. Global Invariant Check
            const isSafe = await QuestionReservationManager.verifyInvariant(userId, selectedIds);
            if (!isSafe) {
                console.error(`[QUESTION_PIPELINE] GLOBAL INVARIANT VIOLATION — rolling back sessionId=${sessionId}`);
                await QuestionReservationManager.release(userId, selectedIds);
                if (retryCount < 3) {
                    releaseLock(); releaseLock = null;
                    return await this.execute({ userId, subject, topicId, count, retryCount: retryCount + 1 });
                }
                throw new Error('Safety integrity check failed.');
            }

            // 10. Commit
            await QuestionReservationManager.commit(userId, selectedIds);

            // 11. Final dedup gate
            const finalQuestions = DedupEngine.validateFinalOutput(initialSelection);

            // 12. Runtime assertion — MUST be an array
            if (!Array.isArray(finalQuestions)) {
                throw new Error('[INVARIANT] finalQuestions is not an array after validateFinalOutput');
            }

            const elapsedMs = Date.now() - pipelineStartTime;
            console.log(
                `[QUESTION_PIPELINE] COMMITTED sessionId=${sessionId} ` +
                `poolSize=${rawPool.length} dedupedPool=${dedupedPool.length} ` +
                `historyFiltered=${seenIds.size} reservedFiltered=${reservedIds.size} ` +
                `finalSelected=${finalQuestions.length} retries=${retryCount} time=${elapsedMs}ms`
            );

            // FIX #3: ALWAYS return the contract shape — never a bare array
            return {
                questions: finalQuestions,
                warning: finalQuestions.length < targetCount
                    ? `Only ${finalQuestions.length} questions available for your request.`
                    : null
            };

        } catch (error) {
            console.error(`[QUESTION_PIPELINE] FATAL ERROR sessionId=${sessionId}: ${error.message}`, error.stack);
            if (selectedIds.length > 0) {
                await QuestionReservationManager.release(userId, selectedIds).catch(() => {});
            }
            throw error;

        } finally {
            if (releaseLock) releaseLock();
        }
    }
}

module.exports = QuestionPipeline;
