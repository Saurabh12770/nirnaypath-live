const TestResult = require('../models/testResult');

class PerformanceAnalyticsService {
    
    /**
     * Get Overview Stats (High Level)
     */
    static async getOverview(userId) {
        try {
            const hasTests = await TestResult.exists({ userId });
            if (!hasTests) {
                return { totalTests: 0, avgAccuracy: 0, totalQuestions: 0, totalCorrect: 0, avgTimePerTest: 0 };
            }

            const stats = await TestResult.aggregate([
                { $match: { userId: userId } },
                { 
                    $group: {
                        _id: null,
                        totalTests: { $sum: 1 },
                        avgAccuracy: { $avg: "$accuracy" },
                        totalQuestions: { $sum: "$totalQuestions" },
                        totalCorrect: { $sum: "$correct" },
                        avgTimePerTest: { $avg: "$timeTaken" }
                    }
                }
            ]);

            const raw = stats[0] || { totalTests: 0, avgAccuracy: 0, totalQuestions: 0, totalCorrect: 0, avgTimePerTest: 0 };
            raw.avgAccuracy = Math.min(Math.max(Math.round(raw.avgAccuracy || 0), 0), 100);
            raw.avgTimePerTest = Math.round(raw.avgTimePerTest || 0);

            return raw;
        } catch (err) {
            console.error('[Analytics] Overview aggregation failed:', err.message);
            return { totalTests: 0, avgAccuracy: 0, totalQuestions: 0, totalCorrect: 0, avgTimePerTest: 0 };
        }
    }

    /**
     * Get Topic-wise Performance
     */
    static async getTopicMastery(userId) {
        try {
            const topicStats = await TestResult.aggregate([
                { $match: { userId: userId } },
                { $unwind: "$answers" },
                {
                    $group: {
                        _id: "$answers.topicId",
                        topicName: { $first: "$answers.topic" },
                        attempts: { $sum: 1 },
                        correct: { $sum: { $cond: ["$answers.isCorrect", 1, 0] } },
                        avgAccuracy: { $avg: { $cond: ["$answers.isCorrect", 100, 0] } }
                    }
                },
                { $sort: { avgAccuracy: -1 } }
            ]);

            const mappedStats = topicStats.map(t => ({
                topicId: t._id || 'general',
                topicName: t.topicName || t._id || 'General',
                attempts: t.attempts,
                correct: t.correct,
                avgAccuracy: Math.round(t.avgAccuracy || 0)
            }));

            const strongest = mappedStats.filter(t => t.avgAccuracy >= 80).slice(0, 5);
            const weakest = mappedStats.filter(t => t.avgAccuracy < 60).slice(0, 5);

            return { strongest, weakest, all: mappedStats };
        } catch (err) {
            console.error('[Analytics] Topic mastery aggregation failed:', err.message);
            return { strongest: [], weakest: [], all: [] };
        }
    }

    /**
     * Get Subject-wise Performance
     */
    static async getSubjectMastery(userId) {
        try {
            const subjectStats = await TestResult.aggregate([
                { $match: { userId: userId } },
                {
                    $group: {
                        _id: "$subject",
                        attempts: { $sum: "$totalQuestions" },
                        correct: { $sum: "$correct" },
                        avgAccuracy: { $avg: "$accuracy" }
                    }
                },
                { $sort: { avgAccuracy: -1 } }
            ]);

            return subjectStats.map(s => ({
                subject: s._id || 'General',
                attempts: s.attempts,
                correct: s.correct,
                avgAccuracy: Math.round(s.avgAccuracy || 0)
            }));
        } catch (err) {
            console.error('[Analytics] Subject mastery aggregation failed:', err.message);
            return [];
        }
    }

    /**
     * Improvement Trends (Last 30 days)
     */
    static async getTrends(userId) {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const trends = await TestResult.aggregate([
                { 
                    $match: { 
                        userId: userId,
                        createdAt: { $gte: thirtyDaysAgo }
                    } 
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        avgAccuracy: { $avg: "$accuracy" },
                        testCount: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } }
            ]);

            return trends.map(t => ({
                date: t._id,
                avgAccuracy: Math.round(t.avgAccuracy || 0),
                testCount: t.testCount
            }));
        } catch (err) {
            console.error('[Analytics] Trends aggregation failed:', err.message);
            return [];
        }
    }
}

module.exports = PerformanceAnalyticsService;
