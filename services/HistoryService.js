/**
 * History Service (Phase 5)
 * Exclusion system.
 */

const TestResult = require('../models/TestResult');

class HistoryService {
    static async getSeenQuestionIds(userId) {
        if (!userId) return new Set();
        
        // Return IDs from all previous tests
        const results = await TestResult.find({ userId })
            .select('answers.questionId')
            .lean();

        const seen = new Set();
        for (const test of results) {
            if (test.answers) {
                test.answers.forEach(ans => {
                    if (ans.questionId) {
                        seen.add(String(ans.questionId).trim().toLowerCase());
                    }
                });
            }
        }
        return seen;
    }

    static async getRecentQuestionWindow(userId, windowSize = 5) {
        if (!userId) return new Set();
        
        // Return IDs from only the last N tests
        const results = await TestResult.find({ userId })
            .sort({ createdAt: -1 })
            .limit(windowSize)
            .select('answers.questionId')
            .lean();

        const seen = new Set();
        for (const test of results) {
            if (test.answers) {
                test.answers.forEach(ans => {
                    if (ans.questionId) {
                        seen.add(String(ans.questionId).trim().toLowerCase());
                    }
                });
            }
        }
        return seen;
    }
}

module.exports = HistoryService;
