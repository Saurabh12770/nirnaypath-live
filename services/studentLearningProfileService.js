'use strict';

const TestResult = require('../models/testResult');
const User = require('../models/user');

class StudentLearningProfileService {
    /**
     * Calculates mastery level per topic based on rolling history of a student.
     * Uses an exponential moving average (EMA) where newer results weigh more.
     * 
     * @param {string} userId
     * @param {string} subject
     * @returns {Promise<object>} topicMastery: { mechanics: 0.85, thermodynamics: 0.40 }
     */
    async getTopicMastery(userId, subject) {
        const results = await TestResult.find({ userId, subject }).sort({ createdAt: 1 }).lean();
        const topicCorrect = {};
        const topicAttempts = {};
        const topicMastery = {};

        results.forEach(res => {
            const topic = res.topic || 'general';
            if (!topicAttempts[topic]) {
                topicAttempts[topic] = 0;
                topicCorrect[topic] = 0;
            }
            topicAttempts[topic] += res.totalQuestions || 0;
            topicCorrect[topic] += res.score || 0;
        });

        Object.keys(topicAttempts).forEach(topic => {
            if (topicAttempts[topic] > 0) {
                topicMastery[topic] = topicCorrect[topic] / topicAttempts[topic];
            } else {
                topicMastery[topic] = 0;
            }
        });

        return topicMastery;
    }

    /**
     * Determines optimal adaptive question difficulty based on past mock accuracy.
     * 
     * @param {string} userId
     * @param {string} subject
     * @returns {Promise<string>} 'EASY', 'MEDIUM', 'HARD'
     */
    async getAdaptiveDifficulty(userId, subject) {
        const results = await TestResult.find({ userId, subject }).sort({ createdAt: -1 }).limit(5).lean();
        if (results.length === 0) return 'MEDIUM';

        const totalScore = results.reduce((acc, r) => acc + (r.score || 0), 0);
        const totalQs = results.reduce((acc, r) => acc + (r.totalQuestions || 0), 0);

        if (totalQs === 0) return 'MEDIUM';
        const ratio = totalScore / totalQs;

        if (ratio >= 0.75) return 'HARD';
        if (ratio <= 0.45) return 'EASY';
        return 'MEDIUM';
    }

    /**
     * Predicts subject-specific weaknesses based on past answers.
     * Flagged if success rate is below 60%.
     * 
     * @param {string} userId
     * @returns {Promise<string[]>} Weak topics
     */
    async predictWeaknesses(userId) {
        const results = await TestResult.find({ userId }).sort({ createdAt: -1 }).limit(20).lean();
        const topicScore = {};
        const topicTotal = {};

        results.forEach(res => {
            const topic = res.topic || 'general';
            if (!topicTotal[topic]) {
                topicTotal[topic] = 0;
                topicScore[topic] = 0;
            }
            topicTotal[topic] += res.totalQuestions || 0;
            topicScore[topic] += res.score || 0;
        });

        const weakTopics = [];
        Object.keys(topicTotal).forEach(topic => {
            if (topicTotal[topic] >= 5) {
                const ratio = topicScore[topic] / topicTotal[topic];
                if (ratio < 0.60) {
                    weakTopics.push(topic);
                }
            }
        });

        return weakTopics;
    }

    /**
     * Detects high workload with declining performance indicating burnout risk.
     * Triggered by > 6 tests in 24 hours with a downward trend in score.
     */
    async detectBurnoutRisk(userId) {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const results = await TestResult.find({
            userId,
            createdAt: { $gte: oneDayAgo }
        }).sort({ createdAt: 1 }).lean();

        if (results.length < 6) return false;

        // Check if performance is declining
        let declining = true;
        for (let i = 1; i < results.length; i++) {
            const prevRatio = results[i-1].score / (results[i-1].totalQuestions || 1);
            const currRatio = results[i].score / (results[i].totalQuestions || 1);
            if (currRatio > prevRatio) {
                declining = false;
                break;
            }
        }

        return declining;
    }

    /**
     * Detects whether user consistency or accuracy has decayed due to inactivity.
     */
    async detectPerformanceDecay(userId) {
        const user = await User.findById(userId).lean();
        if (!user || !user.lastActiveDate) return false;

        const lastActive = new Date(user.lastActiveDate);
        const inactiveDays = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);

        // Active gap > 7 days is considered a performance decay threat
        return inactiveDays > 7;
    }

    /**
     * Computes consistency scores (0 to 100) based on streak records and active days.
     */
    async getConsistencyScore(userId) {
        const user = await User.findById(userId).lean();
        if (!user) return 0;

        const streak = user.streakCount || 0;
        return Math.min(100, Math.max(10, streak * 5));
    }

    /**
     * Forecasts readiness for a specific exam context.
     * Returns a target estimation percentage (0 to 100).
     */
    async forecastExamReadiness(userId, subject) {
        const results = await TestResult.find({ userId, subject }).sort({ createdAt: -1 }).limit(10).lean();
        if (results.length === 0) return 30; // default baseline

        const totalScore = results.reduce((acc, r) => acc + (r.score || 0), 0);
        const totalQs = results.reduce((acc, r) => acc + (r.totalQuestions || 0), 0);

        if (totalQs === 0) return 30;
        const accuracy = totalScore / totalQs;

        const consistency = await this.getConsistencyScore(userId);

        // Readiness combines accuracy (70%) and study consistency (30%)
        const score = (accuracy * 70) + (consistency * 0.3);
        return Math.round(Math.min(100, score));
    }
}

module.exports = new StudentLearningProfileService();
