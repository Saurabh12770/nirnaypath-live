'use strict';
/**
 * NirnayPath — AI Recommendation Engine (Phase 10 — Module C)
 * =============================================================
 * Generates personalised study recommendations using:
 *  - Last 30 test results (topic accuracy, improvement rate)
 *  - Readiness score from PerformanceAnalyticsService
 *  - Streak behaviour from UserXP
 *  - Weak-topic detection with improvement trend analysis
 *
 * NO mocked data — all calculations from real DB records.
 */

const TestResult                = require('../models/testResult');
const UserXP                    = require('../models/UserXP');
const CacheLayer                = require('./cacheLayer');

// Lazy-require to avoid circular deps
const getReadiness = async (userId) => {
    try {
        const PAS = require('./performanceAnalyticsService');
        return await PAS.getReadiness(userId);
    } catch { return { score: 0, confidence: 'Low' }; }
};

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Group test answers by topic and aggregate accuracy.
 * @returns {Map<topicId, { topic, attempts, correct, accuracy, trend }>}
 */
function buildTopicMap(results) {
    const map = new Map();

    results.forEach((r, resultIndex) => {
        (r.answers || []).forEach(a => {
            const key = a.topicId || a.topic || 'general';
            if (!map.has(key)) {
                map.set(key, { topic: a.topic || key, topicId: key, attempts: 0, correct: 0, resultIndices: [] });
            }
            const entry = map.get(key);
            entry.attempts++;
            if (a.isCorrect) entry.correct++;
            entry.resultIndices.push(resultIndex); // track which test had this topic
        });
    });

    // Compute accuracy and trend per topic
    for (const [, entry] of map) {
        entry.accuracy = entry.attempts > 0
            ? Math.round((entry.correct / entry.attempts) * 100)
            : 0;

        // Trend: compare first half vs second half accuracy
        const mid = Math.floor(entry.resultIndices.length / 2);
        const firstHalf  = entry.resultIndices.slice(0, mid);
        const secondHalf = entry.resultIndices.slice(mid);

        const calcHalfAcc = (indices, results) => {
            let c = 0, a = 0;
            indices.forEach(i => {
                (results[i]?.answers || []).forEach(ans => {
                    if ((ans.topicId || ans.topic || 'general') === entry.topicId) {
                        a++;
                        if (ans.isCorrect) c++;
                    }
                });
            });
            return a > 0 ? (c / a) * 100 : 0;
        };

        const firstAcc  = firstHalf.length  > 0 ? calcHalfAcc(firstHalf,  results) : entry.accuracy;
        const secondAcc = secondHalf.length > 0 ? calcHalfAcc(secondHalf, results) : entry.accuracy;
        entry.improvementRate = Math.round(secondAcc - firstAcc); // positive = improving
    }

    return map;
}

class RecommendationService {

    /**
     * Generate full personalised recommendation set for a user.
     * @param {ObjectId|string} userId
     * @returns {Object} { weakTopics, recommendations, nextTest, studySuggestions, focusAreas }
     */
    static async generate(userId) {
        const cacheKey = `rec_${userId}`;
        const cached   = CacheLayer.getSnapshot(cacheKey);
        if (cached) return cached;

        // ── 1. Fetch last 30 tests ─────────────────────────────────────
        const results = await TestResult.find({ userId })
            .sort({ createdAt: -1 })
            .limit(30)
            .lean();

        // ── 2. Build topic accuracy map ────────────────────────────────
        const topicMap = buildTopicMap(results);

        // ── 3. Fetch readiness + XP/streak ────────────────────────────
        const [readiness, xpRecord] = await Promise.all([
            getReadiness(userId),
            UserXP.findOne({ userId }).select('currentStreak level totalXP weeklyXP').lean()
        ]);

        const streak = xpRecord?.currentStreak || 0;
        const level  = xpRecord?.level || 1;

        // ── 4. Classify topics ────────────────────────────────────────
        const allTopics = Array.from(topicMap.values());

        const weakTopics = allTopics
            .filter(t => t.attempts >= 3 && t.accuracy < 60)
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 5)
            .map(t => ({
                topicId:         t.topicId,
                topic:           t.topic,
                accuracy:        t.accuracy,
                attempts:        t.attempts,
                improvementRate: t.improvementRate,
                priority:        t.accuracy < 40 ? 'critical' : 'high'
            }));

        const improvingTopics = allTopics
            .filter(t => t.attempts >= 3 && t.improvementRate > 10)
            .sort((a, b) => b.improvementRate - a.improvementRate)
            .slice(0, 3);

        const strongTopics = allTopics
            .filter(t => t.attempts >= 3 && t.accuracy >= 75)
            .sort((a, b) => b.accuracy - a.accuracy)
            .slice(0, 3);

        // ── 5. Compute overall stats ───────────────────────────────────
        const recentTests  = results.slice(0, 7);
        const avgAccuracy  = recentTests.length > 0
            ? Math.round(recentTests.reduce((s, r) => s + r.accuracy, 0) / recentTests.length)
            : 0;

        // Subjects tested
        const subjectFreq = {};
        results.forEach(r => { subjectFreq[r.subject] = (subjectFreq[r.subject] || 0) + 1; });
        const topSubject = Object.entries(subjectFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

        // ── 6. Build Recommendations ───────────────────────────────────
        const recommendations = [];

        // A. Weak topic drills
        weakTopics.slice(0, 3).forEach(t => {
            recommendations.push({
                type:     'WEAKNESS_CORRECTION',
                priority: t.priority,
                title:    `Focus on ${t.topic}`,
                message:  `Your accuracy in "${t.topic}" is only ${t.accuracy}%. A focused drill will boost your score.`,
                action:   `/drills?topic=${encodeURIComponent(t.topicId)}`,
                data:     { topicId: t.topicId, accuracy: t.accuracy }
            });
        });

        // B. Streak-based motivation
        if (streak === 0) {
            recommendations.push({
                type:    'STREAK_START',
                priority: 'high',
                title:   'Start Your Streak Today',
                message: 'Take one test today to start building your daily streak and earn bonus XP!',
                action:  '/dashboard'
            });
        } else if (streak >= 3 && streak < 7) {
            recommendations.push({
                type:    'STREAK_MAINTAIN',
                priority: 'normal',
                title:   `${streak} Days Strong — Keep Going!`,
                message: `You're on a ${streak}-day streak. Reach 7 days to unlock the Week Warrior badge!`,
                action:  '/dashboard'
            });
        }

        // C. Readiness-based suggestions
        const readinessScore = readiness?.score || 0;
        if (readinessScore < 40) {
            recommendations.push({
                type:     'READINESS_BOOST',
                priority: 'high',
                title:    'Boost Your Exam Readiness',
                message:  `Your exam readiness is ${readinessScore}%. Focus on weak topics and daily tests to improve.`,
                action:   '/dashboard',
                data:     { readinessScore }
            });
        } else if (readinessScore >= 75) {
            recommendations.push({
                type:     'READINESS_GOOD',
                priority: 'low',
                title:    'Strong Exam Readiness!',
                message:  `You're at ${readinessScore}% readiness. Try harder topics to push higher.`,
                action:   '/dashboard',
                data:     { readinessScore }
            });
        }

        // D. Improvement recognition
        if (improvingTopics.length > 0) {
            const t = improvingTopics[0];
            recommendations.push({
                type:     'IMPROVEMENT_RECOGNITION',
                priority: 'low',
                title:    `Great Progress in ${t.topic}!`,
                message:  `You've improved ${t.improvementRate > 0 ? '+' : ''}${t.improvementRate}% in "${t.topic}" recently. Keep the momentum!`,
                action:   `/drills?topic=${encodeURIComponent(t.topicId)}`
            });
        }

        // ── 7. Next Test Suggestions ───────────────────────────────────
        const nextTest = [];

        // Suggest a drill on weakest topic
        if (weakTopics.length > 0) {
            nextTest.push({
                type:    'drill',
                subject: results[0]?.subject || topSubject || 'general',
                topic:   weakTopics[0].topicId,
                reason:  `Lowest accuracy topic: ${weakTopics[0].accuracy}%`,
                url:     `/drills?topic=${encodeURIComponent(weakTopics[0].topicId)}`
            });
        }

        // Suggest a full mock if not taken in 3 days
        const lastFull = results.find(r => r.mode === 'full');
        const daysSinceFull = lastFull
            ? Math.floor((Date.now() - new Date(lastFull.createdAt).getTime()) / 86400000)
            : 999;

        if (daysSinceFull >= 3) {
            nextTest.push({
                type:    'full_mock',
                subject: topSubject || 'general',
                reason:  daysSinceFull >= 7 ? 'No full mock in over a week!' : 'Time for your periodic full mock test',
                url:     `/test?subject=${encodeURIComponent(topSubject || 'general')}`
            });
        }

        // ── 8. Study Suggestions (time-based) ────────────────────────
        const studySuggestions = [];
        const hour = new Date().getHours();

        if (hour >= 6 && hour < 12) {
            studySuggestions.push({ time: 'morning', suggestion: 'Morning is perfect for full mock tests — your focus is at peak.' });
        } else if (hour >= 14 && hour < 18) {
            studySuggestions.push({ time: 'afternoon', suggestion: 'Afternoon sessions are great for topic drills and revision.' });
        } else if (hour >= 18 && hour < 22) {
            studySuggestions.push({ time: 'evening', suggestion: 'Evening is ideal for reviewing your weak topics from today.' });
        }

        if (avgAccuracy < 50) {
            studySuggestions.push({ type: 'study_plan', suggestion: 'Your average accuracy is below 50%. Spend 30 minutes on concept revision before each test.' });
        }

        // ── 9. Focus Areas ────────────────────────────────────────────
        const focusAreas = weakTopics.slice(0, 3).map(t => ({
            topicId:  t.topicId,
            topic:    t.topic,
            accuracy: t.accuracy,
            action:   'drill'
        }));

        if (focusAreas.length === 0 && allTopics.length > 0) {
            // If no weak topics, suggest maintaining strongest
            strongTopics.slice(0, 2).forEach(t => {
                focusAreas.push({ topicId: t.topicId, topic: t.topic, accuracy: t.accuracy, action: 'maintain' });
            });
        }

        // ── 10. Assemble response ─────────────────────────────────────
        const output = {
            generatedAt:     new Date(),
            userId:          String(userId),
            profile: {
                level,
                streak,
                avgAccuracy,
                readinessScore,
                testsAnalysed: results.length
            },
            weakTopics,
            improvingTopics: improvingTopics.map(t => ({ topicId: t.topicId, topic: t.topic, improvementRate: t.improvementRate })),
            strongTopics:    strongTopics.map(t => ({ topicId: t.topicId, topic: t.topic, accuracy: t.accuracy })),
            recommendations: recommendations.sort((a, b) => {
                const p = { critical: 0, high: 1, normal: 2, low: 3 };
                return (p[a.priority] || 2) - (p[b.priority] || 2);
            }),
            nextTest,
            studySuggestions,
            focusAreas
        };

        // Cache for 5 minutes
        CacheLayer.setSnapshot(cacheKey, output, 300);

        return output;
    }

    /**
     * Invalidate recommendation cache for a user (call after test submit).
     */
    static invalidateCache(userId) {
        CacheLayer.invalidate(`rec_${userId}`);
    }
}

module.exports = RecommendationService;
