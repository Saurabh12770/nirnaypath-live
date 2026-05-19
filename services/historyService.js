/**
 * History Service (Phase 5)
 * Exclusion system.
 */

const TestResult = require('../models/testResult');
const context = require('../utils/context');

class HistoryService {
    static async getSeenQuestionIds(userId) {
        const store = context.getStore();
        const ctxUserId = store ? store.userId : null;
        const validUserId = userId || ctxUserId;

        if (!validUserId) {
            console.warn('[HistoryService] WARNING: No userId provided. History exclusion bypassed.');
            return new Set();
        }
        
        if (ctxUserId && String(validUserId) !== String(ctxUserId)) {
            console.warn(`[HistoryService] WARNING: Passed userId (${validUserId}) doesn't match context userId (${ctxUserId})`);
        }
        
        // Return IDs from all previous tests
        const results = await TestResult.find({ userId: validUserId })
            .select('answers.questionId')
            .lean();

        const seen = new Set();
        for (const test of results) {
            if (test.answers) {
                test.answers.forEach(ans => {
                    const qId = ans.id || ans.questionId || ans._id;
                    if (qId) {
                        seen.add(String(qId).trim().toLowerCase());
                    }
                });
            }
        }
        return seen;
    }

    static async getRecentQuestionWindow(userId, windowSize = 5) {
        const store = context.getStore();
        const ctxUserId = store ? store.userId : null;
        const validUserId = userId || ctxUserId;

        if (!validUserId) {
            console.warn('[HistoryService] WARNING: No userId provided. History exclusion bypassed.');
            return new Set();
        }
        
        // Return IDs from the sliding window (last N tests)
        // [FIX 3] HISTORY: Query using userId + sliding window
        const results = await TestResult.find({ userId: validUserId })
            .sort({ createdAt: -1 })
            .limit(windowSize)
            .select('answers.questionId')
            .lean();

        const seen = new Set();
        for (const test of results) {
            if (test.answers) {
                test.answers.forEach(ans => {
                    const qId = ans.id || ans.questionId || ans._id;
                    if (qId) {
                        seen.add(String(qId).trim().toLowerCase());
                    }
                });
            }
        }
        return seen;
    }

    static async getRecentQuestionWindowExclusions(userId, windowSize = 5) {
        const store = context.getStore();
        const ctxUserId = store ? store.userId : null;
        const validUserId = userId || ctxUserId;

        if (!validUserId) {
            console.warn('[HistoryService] WARNING: No userId provided. History exclusions bypassed.');
            return { ids: new Set(), texts: new Set() };
        }

        const results = await TestResult.find({ userId: validUserId })
            .sort({ createdAt: -1 })
            .limit(windowSize)
            .select('answers.questionId answers.question_en')
            .lean();

        const ids = new Set();
        const texts = new Set();
        const { normalizeText } = require('../utils/questionFingerprint');

        for (const test of results) {
            if (test.answers) {
                test.answers.forEach(ans => {
                    const qId = ans.questionId || ans.id || ans._id;
                    if (qId) ids.add(String(qId).trim().toLowerCase());
                    
                    const normTxt = normalizeText(ans.question_en);
                    if (normTxt) texts.add(normTxt);
                });
            }
        }
        return { ids, texts };
    }
}

module.exports = HistoryService;
