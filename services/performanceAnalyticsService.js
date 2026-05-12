const TestResult = require('../models/TestResult');
const User = require('../models/User');
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

        const result = stats[0] || { totalTests: 0, avgAccuracy: 0, totalQuestions: 0, totalCorrect: 0, avgTimePerTest: 0 };
        await setCachedData(cacheKey, result, 600); // 10 min cache
        return result;
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

        // Weighted formula for EdTech readiness
        // 40% Avg Accuracy, 30% Topic Coverage (Mastery > 70%), 20% Volume, 10% Improvement Rate (Simulated)
        const masteredTopics = topics.all.filter(t => t.avgAccuracy >= 70).length;
        const totalTopics = topics.all.length || 1;
        const coverage = (masteredTopics / totalTopics) * 100;

        const readinessScore = (overview.avgAccuracy * 0.5) + (coverage * 0.4) + (Math.min(overview.totalTests, 50) * 0.2);
        const finalScore = Math.min(Math.round(readinessScore), 100);

        let confidence = "Low";
        if (overview.totalTests > 20) confidence = "High";
        else if (overview.totalTests > 10) confidence = "Medium";

        return {
            score: finalScore,
            confidence,
            factors: {
                accuracy: overview.avgAccuracy,
                coverage,
                consistency: overview.totalTests > 10 ? "High" : "Developing"
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
        return {
            currentStreak: user.streakCount || 0,
            lastActive: user.lastActiveDate
        };
    }
}

module.exports = PerformanceAnalyticsService;
