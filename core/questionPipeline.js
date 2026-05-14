/**
 * Final Pipeline Orchestrator (Phase 8)
 * THE ONLY VALID FLOW.
 */

const QuestionRepository = require('../services/questionRepository');
const HistoryService = require('../services/historyService');
const SelectionEngine = require('../services/selectionEngine');
const DedupEngine = require('../services/dedupEngine');
const CacheLayer = require('../services/cacheLayer');

class QuestionPipeline {
    static async execute({ userId, subject, count }) {
        const targetCount = parseInt(count) || 50;
        const subString = Array.isArray(subject) ? subject.join('_') : subject;
        const cacheKey = `pipeline_${subString}_${userId}_${targetCount}`;

        // Check Cache (Immutable Snapshot)
        let cached = CacheLayer.getSnapshot(cacheKey);
        if (cached) return cached;

        // 1. Repository fetch questions (Immutable array of all subject questions)
        const fullPool = await QuestionRepository.fetchQuestions(subject);

        // 2. History exclusion filter
        const seenIds = await HistoryService.getRecentQuestionWindow(userId, 5);
        
        const freshPool = fullPool.filter(q => {
            const id = String(q._id || q.id || q.questionId || '').trim().toLowerCase();
            return !seenIds.has(id);
        });

        // 3. SelectionEngine picks questions
        const selectedQuestions = SelectionEngine.select(freshPool, targetCount);

        // If we didn't get enough from the fresh pool, we COULD fallback to seen, 
        // but to STRICTLY guarantee "No repetition across last N tests", we ONLY use freshPool.
        // If we want a fallback, we could mix seenPool, but requirements state: "Zero repetition across sessions".
        
        // 4. DedupEngine validates output
        DedupEngine.validateFinalOutput(selectedQuestions);

        // 5. Freeze result
        const frozenResult = CacheLayer.deepFreeze(JSON.parse(JSON.stringify(selectedQuestions)));

        // Store snapshot in cache (short TTL since history changes)
        CacheLayer.setSnapshot(cacheKey, frozenResult, 30); // 30 seconds to prevent double-click issues

        // 6. Return response
        return frozenResult;
    }
}

module.exports = QuestionPipeline;
