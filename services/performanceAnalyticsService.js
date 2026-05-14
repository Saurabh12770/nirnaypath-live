const TestResult = require('../models/testResult');
const User = require('../models/user');
const { getCachedData, setCachedData } = require('../middleware/cache');

/**
 * Performance Intelligence Engine
 * Handles complex student performance analysis with MongoDB Aggregation.
 */
class PerformanceAnalyticsService {
    
    /**
     * Get Overview Stats (High Level)
     */
    static async getOverview(userId) {
        const cacheKey = `analytics_overview_${userId}`;
        const cached = await getCachedData(cacheKey);
        if (cached) return cached;

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

        // ── Analytics accuracy guard: clamp to valid range ───────────────────
        raw.avgAccuracy    = Math.min(Math.max(raw.avgAccuracy    || 0, 0), 100);
        raw.avgTimePerTest = Math.max(raw.avgTimePerTest || 0, 0);

        await setCachedData(cacheKey, raw, 600); // 10 min cache
        return raw;
    }

    /**
     * Get Topic-wise Performance Ranking
     */
    static async getTopicMastery(userId) {
        const cacheKey = `analytics_topics_${userId}`;
        const cached = await getCachedData(cacheKey);
        if (cached) return cached;

        // Flatten answers to analyze per-topic performance
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

        const strongest = topicStats.slice(0, 5);
        const weakest = [...topicStats].sort((a, b) => a.avgAccuracy - b.avgAccuracy).slice(0, 5);

        const result = { strongest, weakest, all: topicStats };
        await setCachedData(cacheKey, result, 1800); // 30 min cache
        return result;
    }

    /**
     * Improvement Trends (Last 30 days)
     */
    static async getTrends(userId) {
        const cacheKey = `analytics_trends_${userId}`;
        const cached = await getCachedData(cacheKey);
        if (cached) return cached;

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

        await setCachedData(cacheKey, trends, 3600);
        return trends;
    }

    /**
     * Exam Readiness Prediction
     */
    static async getReadiness(userId) {
        const [overview, topics] = await Promise.all([
            this.getOverview(userId),
            this.getTopicMastery(userId)
        ]);

        if (overview.totalTests < 5) {
            return { readiness: null, message: "Take at least 5 tests to calculate readiness." };
        }

        // ── Readiness formula with accuracy guard ────────────────────────────
        // Weights: 50% avg accuracy, 30% topic coverage, 20% volume (capped 50 tests)
        const masteredTopics = topics.all.filter(t => t.avgAccuracy >= 70).length;
        const totalTopics    = Math.max(topics.all.length, 1);
        const coverage       = (masteredTopics / totalTopics) * 100;

        const rawScore     = (overview.avgAccuracy * 0.5) + (coverage * 0.3) + (Math.min(overview.totalTests, 50) * 0.4);
        const finalScore   = Math.min(Math.max(Math.round(rawScore), 0), 100); // guard: 0-100

        let confidence = 'Low';
        if (overview.totalTests > 20) confidence = 'High';
        else if (overview.totalTests > 10) confidence = 'Medium';

        return {
            score: finalScore,
            confidence,
            factors: {
                accuracy:    Math.round(overview.avgAccuracy * 10) / 10,
                coverage:    Math.round(coverage * 10) / 10,
                consistency: overview.totalTests > 10 ? 'High' : 'Developing'
            }
        };
    }

    /**
     * Get Predictive Intelligence Metrics
     */
    static async getPredictiveMetrics(userId) {
        const StudentLearningProfileService = require('./studentLearningProfileService');
        const profile = await StudentLearningProfileService.getProfile(userId);
        
        if (!profile) return null;

        // Predict Rank Band (Simulated based on accuracy and volume)
        let rankBand = "Top 20% - 30%";
        if (profile.overallAccuracy > 90) rankBand = "Top 1% - 5%";
        else if (profile.overallAccuracy > 80) rankBand = "Top 5% - 15%";
        else if (profile.overallAccuracy < 50) rankBand = "Bottom 40%";

        return {
            predictedPercentile: Math.min(Math.round(profile.overallAccuracy * 1.1), 99),
            rankBand,
            learningVelocity: profile.learningVelocity.toFixed(2),
            burnoutRisk: profile.burnoutRisk,
            comebackProbability: profile.learningVelocity > 0 ? "High" : "Low"
        };
    }

    /**
     * Calculate Streak (Hardened Logic)
     */
    static async getStreak(userId) {
        const user = await User.findById(userId).select('streakCount lastActiveDate');
        if (!user) return { currentStreak: 0, lastActive: null };
        return {
            currentStreak: Math.max(user.streakCount || 0, 0), // guard: no negative streaks
            lastActive: user.lastActiveDate
        };
    }

    /**
     * Analytics health assertions (for drift detection & monitoring)
     * Returns array of assertion failures — empty array means all healthy.
     */
    static assertAnalyticsHealth(overview, readiness) {
        const failures = [];
        if (overview) {
            if (overview.avgAccuracy < 0 || overview.avgAccuracy > 100)
                failures.push(`avgAccuracy out of range: ${overview.avgAccuracy}`);
            if (overview.avgTimePerTest < 0)
                failures.push(`avgTimePerTest is negative: ${overview.avgTimePerTest}`);
        }
        if (readiness && readiness.score !== null) {
            if (readiness.score < 0 || readiness.score > 100)
                failures.push(`readinessScore out of range: ${readiness.score}`);
        }
        return failures;
    }
}

module.exports = PerformanceAnalyticsService;
