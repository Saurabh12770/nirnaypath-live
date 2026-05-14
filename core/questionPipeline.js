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
        const pipelineStartTime = Date.now();
        const targetCount = parseInt(count) || 50;
        const subString = Array.isArray(subject) ? subject.join('_') : subject;
        const cacheKey = `pipeline_${subString}_${userId}_${targetCount}`;

        // Check Cache (Immutable Snapshot)
        let cached = CacheLayer.getSnapshot(cacheKey);
        if (cached) return cached;

        const t1 = Date.now();
        // 1. Repository fetch questions (Immutable array of all subject questions)
        const fullPool = await QuestionRepository.fetchQuestions(subject);
        const t2 = Date.now();

        // 2. History exclusion filter
        const seenIds = await HistoryService.getRecentQuestionWindow(userId, 5);
        const t3 = Date.now();
        
        const freshPool = [];
        let excludedCount = 0;
        for (const q of fullPool) {
            const id = String(q._id || q.id || q.questionId || '').trim().toLowerCase();
            if (seenIds.has(id)) {
                console.log(`[Forensic] EXCLUDED: Question ${id} was seen in a recent test.`);
                excludedCount++;
            } else {
                freshPool.push(q);
            }
        }

        // 3. SelectionEngine picks questions
        const selectedQuestions = SelectionEngine.select(freshPool, targetCount);
        const t4 = Date.now();

        // 4. DedupEngine validates output and actually removes duplicates
        const dedupedQuestions = DedupEngine.validateFinalOutput(selectedQuestions);
        const t5 = Date.now();

        // 4.5 Runtime Consistency Check
        const uniqueTexts = new Set(dedupedQuestions.map(q => DedupEngine.normalizeText(q.question_en || q.question_hi || q.text || '')));
        uniqueTexts.delete('');
        const hasTexts = dedupedQuestions.some(q => DedupEngine.normalizeText(q.question_en || q.question_hi || q.text || ''));

        if (hasTexts && uniqueTexts.size !== dedupedQuestions.length) {
            console.error(`[QuestionPipeline] ERROR: Runtime consistency check failed! Expected ${dedupedQuestions.length} unique texts, got ${uniqueTexts.size}.`);
            throw new Error('Runtime consistency check failed: semantic duplicates found in final payload.');
        }

        let warningMessage = null;
        if (dedupedQuestions.length < targetCount) {
            warningMessage = `Only ${dedupedQuestions.length} unique questions available for this subject after excluding duplicates and history.`;
            console.warn(`[QuestionPipeline] ${warningMessage}`);
        }

        const resultPayload = {
            questions: dedupedQuestions,
            warning: warningMessage
        };

        // 5. Freeze result
        const frozenResult = CacheLayer.deepFreeze(JSON.parse(JSON.stringify(resultPayload)));
        const t6 = Date.now();

        console.log(`[QuestionPipeline] Performance Trace: Fetch: ${t2-t1}ms | History: ${t3-t2}ms | Selection: ${t4-t3}ms | Dedup Check: ${t5-t4}ms | Freeze: ${t6-t5}ms | Total: ${Date.now() - pipelineStartTime}ms`);

        // Store snapshot in cache (short TTL since history changes)
        CacheLayer.setSnapshot(cacheKey, frozenResult, 30); // 30 seconds to prevent double-click issues

        // 6. Return response
        return frozenResult;
    }
}

module.exports = QuestionPipeline;
