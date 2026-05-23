'use strict';

const TestResult = require('../models/testResult');
const UserXP = require('../models/UserXP');
const QuestionSelectionService = require('../utils/questionSelectionService');
const RecommendationService = require('../server/services/recommendationService');
const PerformanceAnalyticsService = require('./performanceAnalyticsService');

/**
 * NirnayPath Adaptive AI Learning Engine
 * Module A — Adaptive AI Learning Ecosystem
 */
class AdaptiveLearningService {

    /**
     * Compute response-speed confidence score based on actual vs average speed.
     * Speed ratio = responseSpeedMs / averageTimeMs.
     * @param {boolean} isCorrect - whether answer was correct
     * @param {number} responseSpeedMs - time taken by student in milliseconds
     * @param {number} averageTimeMs - standard expected time in milliseconds
     * @returns {number} Confidence score (0.0 to 1.0)
     */
    static calculateConfidenceScore(isCorrect, responseSpeedMs, averageTimeMs) {
        const speed = responseSpeedMs || 30000;
        const avg = averageTimeMs || 30000;
        const ratio = speed / avg;

        if (isCorrect) {
            if (ratio < 0.5) return 1.0;         // Fast & Correct (High confidence)
            if (ratio <= 1.5) return 0.7;        // Average speed & Correct
            return 0.4;                          // Slow & Correct (Hesitant / moderate confidence)
        } else {
            if (ratio < 0.5) return 0.1;         // Fast & Incorrect (Careless error / poor confidence)
            return 0.2;                          // Slow & Incorrect (Conceptual misunderstanding)
        }
    }

    /**
     * Compute the student's mastery score Mt per topic.
     * Mt = (Recent Accuracy of last 10 attempts) * 0.7 + (Coverage Factor) * 0.3
     * Returns a float between 0.0 and 1.0.
     * @param {string|ObjectId} userId
     * @param {string} subjectId
     * @returns {Promise<Map<string, number>>} Map of topicId to mastery score
     */
    static async getTopicMasteryScores(userId, subjectId) {
        const masteryMap = new Map();

        // 1. Fetch test results matching user and subject
        const query = { userId };
        if (subjectId) {
            query.subject = subjectId.toLowerCase().trim();
        }

        const results = await TestResult.find(query)
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        if (results.length === 0) {
            return masteryMap; // Return empty map if no test history exists
        }

        // Aggregate correctness by topic
        const topicHistory = {};
        results.forEach(res => {
            (res.answers || []).forEach(ans => {
                const topic = ans.topicId || ans.topic || 'general';
                if (!topicHistory[topic]) {
                    topicHistory[topic] = { correct: 0, attempts: 0 };
                }
                topicHistory[topic].attempts++;
                if (ans.isCorrect) {
                    topicHistory[topic].correct++;
                }
            });
        });

        // 2. Fetch overall topic mastery metrics from PerformanceAnalyticsService
        let analyticTopics = { all: [] };
        try {
            analyticTopics = await PerformanceAnalyticsService.getTopicMastery(userId);
        } catch (err) {
            console.error('Failed to get topic mastery coverage:', err.message);
        }

        const coverageMap = {};
        (analyticTopics.all || []).forEach(t => {
            const key = t._id || t.topicName || 'general';
            coverageMap[key] = (t.correct / Math.max(t.attempts, 1));
        });

        // 3. Compute Mt score
        Object.keys(topicHistory).forEach(topic => {
            const recent = topicHistory[topic];
            const recentAcc = recent.correct / recent.attempts;
            const coverageAcc = coverageMap[topic] !== undefined ? coverageMap[topic] : recentAcc;

            const mastery = (recentAcc * 0.7) + (coverageAcc * 0.3);
            masteryMap.set(topic, Math.min(Math.max(mastery, 0.0), 1.0));
        });

        return masteryMap;
    }

    /**
     * Calculate spaced repetition schedule using the half-life forgetting curve:
     * R = e^(-t / S)
     * where R is retrieval probability, t is elapsed time, S is strength.
     * S = baseStrength (5 days) * mastery * (1 + streakBonus)
     * Next scheduled review is set when R drops below 0.6.
     * @param {string|ObjectId} userId
     * @param {string} [subjectId]
     * @returns {Promise<Array<Object>>} Spaced repetition revision list
     */
    static async calculateSpacedRepetition(userId, subjectId) {
        const query = { userId };
        if (subjectId) {
            query.subject = subjectId.toLowerCase().trim();
        }

        const results = await TestResult.find(query)
            .sort({ createdAt: -1 })
            .lean();

        if (results.length === 0) {
            return [];
        }

        // Find last seen date per topic
        const topicLastSeen = {};
        const topicNames = {};
        results.forEach(res => {
            (res.answers || []).forEach(ans => {
                const topic = ans.topicId || ans.topic || 'general';
                topicNames[topic] = ans.topic || topic;
                const d = new Date(res.createdAt);
                if (!topicLastSeen[topic] || d > topicLastSeen[topic]) {
                    topicLastSeen[topic] = d;
                }
            });
        });

        // Get mastery scores
        const masteryMap = await this.getTopicMasteryScores(userId, subjectId);

        // Fetch streak for streak bonus
        const xpRecord = await UserXP.findOne({ userId }).select('currentStreak').lean();
        const streak = xpRecord?.currentStreak || 0;
        const streakBonus = Math.min(streak * 0.05, 0.5); // max 50% bonus to retention half-life

        const now = new Date();
        const spacedRepetitionList = [];

        for (const [topicId, lastSeen] of Object.entries(topicLastSeen)) {
            const mastery = masteryMap.get(topicId) !== undefined ? masteryMap.get(topicId) : 0.5;

            // Days since last practice
            const t = Math.max((now - lastSeen) / (1000 * 3600 * 24), 0.0);

            // Strength (S) in days
            const baseStrength = 5; // standard base memory half-life of 5 days
            const strength = Math.max(baseStrength * mastery * (1 + streakBonus), 0.5);

            // Retrieval Probability (R)
            const retentionProbability = Math.exp(-t / strength);

            // Next Review Date is when R = 0.6 => t = -S * ln(0.6)
            const daysToReview = -strength * Math.log(0.6);
            const nextReviewDate = new Date(lastSeen.getTime() + daysToReview * (24 * 3600 * 1000));

            spacedRepetitionList.push({
                topicId,
                topicName: topicNames[topicId] || topicId,
                mastery: Math.round(mastery * 100) / 100,
                lastSeen,
                daysSinceLastSeen: Math.round(t * 10) / 10,
                retentionProbability: Math.round(retentionProbability * 100) / 100,
                nextReviewDate,
                urgency: Math.round((1.0 - retentionProbability) * 100) / 100,
                isOverdue: retentionProbability < 0.6
            });
        }

        // Sort by retrieval probability ascending (most forgotten first)
        return spacedRepetitionList.sort((a, b) => a.retentionProbability - b.retentionProbability);
    }

    /**
     * Dynamic Difficulty Adjustment (DDA)
     * Returns the target difficulty based on recent test performance trends.
     * @param {string|ObjectId} userId
     * @param {string} [subjectId]
     * @returns {Promise<string>} 'EASY', 'MEDIUM', or 'HARD'
     */
    static async getDDAAdjustedDifficulty(userId, subjectId) {
        const query = { userId };
        if (subjectId) {
            query.subject = subjectId.toLowerCase().trim();
        }

        const recentResults = await TestResult.find(query)
            .sort({ createdAt: -1 })
            .limit(3)
            .lean();

        if (recentResults.length === 0) {
            return 'MEDIUM'; // Default neutral starting point
        }

        // Compute rolling accuracy across last 3 sessions
        const avgAcc = recentResults.reduce((sum, r) => sum + r.accuracy, 0) / recentResults.length;

        if (avgAcc > 80) return 'HARD';
        if (avgAcc < 50) return 'EASY';
        return 'MEDIUM';
    }

    /**
     * Score pool of questions adaptively based on student intelligence map.
     * Pre-processor for QuestionSelectionService.
     * @param {string|ObjectId} userId
     * @param {Array<Object>} allQuestions - raw questions pool
     * @param {string} subjectId
     * @returns {Promise<Array<Object>>} Scored questions pool sorted descending
     */
    static async scoreQuestions(userId, allQuestions, subjectId) {
        if (!allQuestions || allQuestions.length === 0) return [];

        const [masteryMap, spacedRepList, targetDifficulty, recommendations] = await Promise.all([
            this.getTopicMasteryScores(userId, subjectId),
            this.calculateSpacedRepetition(userId, subjectId),
            this.getDDAAdjustedDifficulty(userId, subjectId),
            RecommendationService.generate(userId).catch(() => ({ weakTopics: [], recommendations: [] }))
        ]);

        // Build quick lookup map for spaced repetition urgencies
        const srUrgencyMap = {};
        spacedRepList.forEach(item => {
            srUrgencyMap[item.topicId] = item.urgency;
        });

        // Build weak topic lookup
        const weakTopicsSet = new Set((recommendations?.weakTopics || []).map(t => String(t.topicId).toLowerCase().trim()));

        const scoredPool = allQuestions.map(q => {
            const topicKey = q.topicId || q.topic || 'general';
            const topicKeyLower = topicKey.toLowerCase().trim();

            const mastery = masteryMap.get(topicKey) !== undefined ? masteryMap.get(topicKey) : 0.5;
            const srUrgency = srUrgencyMap[topicKey] !== undefined ? srUrgencyMap[topicKey] : 0.0;
            const isWeak = weakTopicsSet.has(topicKeyLower);

            let selectionScore = 10;

            // 1. Mastery Gap Adjustment: Higher weight for lower mastery topics
            // Gap = 1.0 - Mastery
            selectionScore *= (1.5 - mastery);

            // 2. Spaced Repetition decay upweight
            if (srUrgency > 0.4) {
                selectionScore *= (1.0 + srUrgency);
            }

            // 3. Recommendation weak topics upweight
            if (isWeak) {
                selectionScore *= 1.5;
            }

            // 4. Difficulty alignment with DDA
            const qDifficulty = (q.difficulty || 'MEDIUM').toUpperCase().trim();
            if (qDifficulty === targetDifficulty) {
                selectionScore *= 2.0; // heavily prioritize questions matching the student's dynamic learning zone
            } else if (targetDifficulty === 'HARD' && qDifficulty === 'EASY') {
                selectionScore *= 0.3; // penalize mismatching easy questions for advanced students
            } else if (targetDifficulty === 'EASY' && qDifficulty === 'HARD') {
                selectionScore *= 0.2; // penalize high-stress questions for struggling students
            }

            // Cloned to avoid database model document mutation
            const doc = q._doc || q;
            return {
                ...doc,
                selectionScore: selectionScore * (0.9 + Math.random() * 0.2) // slight random jitter to prevent static selections
            };
        });

        // Sort descending by adaptive score
        return scoredPool.sort((a, b) => b.selectionScore - a.selectionScore);
    }

    /**
     * Select questions adaptively using the central QuestionSelectionService.
     * Integrates direct adaptive scoring into standard selection pipeline.
     */
    static async selectQuestions(userId, allQuestions, count, options = {}) {
        const subjectId = options.subject || options.subjectId;
        const scoredPool = await this.scoreQuestions(userId, allQuestions, subjectId);

        const selectionOptions = {
            userId,
            subject: subjectId,
            topicId: options.topicId,
            sessionHistory: options.sessionHistory || []
        };

        // Call the unified central selector
        return QuestionSelectionService.QuestionSelectionService.select(scoredPool, count, selectionOptions);
    }

    /**
     * Generate a personalized daily study plan
     * LEGACY WRAPPER: Now delegates to AIStudyPlannerService
     */
    static async generateDailyPlan(userId) {
        const AIStudyPlannerService = require('./aiStudyPlannerService');
        return AIStudyPlannerService.generateDailyPlan(userId);
    }

    /**
     * Get Intelligent Practice Recommendations
     * LEGACY WRAPPER: Delegates to server-side RecommendationService
     */
    static async getRecommendations(userId) {
        return RecommendationService.generate(userId);
    }
}

module.exports = AdaptiveLearningService;
