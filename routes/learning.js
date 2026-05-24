const express = require('express');
const auth = require('../middleware/auth');
const AdaptiveLearningService = require('../services/adaptiveLearningService');
const AIStudyPlannerService = require('../services/aiStudyPlannerService');
const AITutorService = require('../services/aiTutorService');
const StudentLearningProfileService = require('../services/studentLearningProfileService');
const PerformanceAnalyticsService = require('../services/performanceAnalyticsService');
const TestResult = require('../models/testResult');
const router = express.Router();

/**
 * GET /api/learning/plan
 * Returns the AI-generated daily study plan with tasks, backlog count, and focus area.
 */
router.get('/plan', auth, async (req, res) => {
    try {
        const plan = await AIStudyPlannerService.generateDailyPlan(req.user._id);
        res.json(plan);
    } catch (err) {
        console.error('[LEARNING] /plan error:', err.message);
        res.status(500).json({ error: 'Failed to generate daily study plan.' });
    }
});

/**
 * GET /api/learning/weekly
 * Returns the 7-day weekly study schedule with dynamically allocated time blocks.
 */
router.get('/weekly', auth, async (req, res) => {
    try {
        const schedule = await AIStudyPlannerService.generateWeeklySchedule(req.user._id);
        res.json(schedule);
    } catch (err) {
        console.error('[LEARNING] /weekly error:', err.message);
        res.status(500).json({ error: 'Failed to generate weekly schedule.' });
    }
});

/**
 * GET /api/learning/revision
 * Returns the spaced repetition queue with forgetting curves and urgency scores.
 */
router.get('/revision', auth, async (req, res) => {
    try {
        const queue = await AdaptiveLearningService.calculateSpacedRepetition(
            req.user._id,
            req.query.subject || null
        );
        res.json(queue);
    } catch (err) {
        console.error('[LEARNING] /revision error:', err.message);
        res.status(500).json({ error: 'Failed to fetch revision queue.' });
    }
});

/**
 * GET /api/learning/mastery
 * Returns the current topic mastery scores (0.0 to 1.0) for the student.
 */
router.get('/mastery', auth, async (req, res) => {
    try {
        const masteryMap = await AdaptiveLearningService.getTopicMasteryScores(
            req.user._id,
            req.query.subject || null
        );
        const masteryObj = {};
        masteryMap.forEach((value, key) => { masteryObj[key] = value; });
        res.json({ userId: req.user._id, mastery: masteryObj });
    } catch (err) {
        console.error('[LEARNING] /mastery error:', err.message);
        res.status(500).json({ error: 'Failed to fetch mastery scores.' });
    }
});

/**
 * GET /api/learning/intelligence
 * Combined predictive intelligence for the dashboard (profile + predictive metrics).
 */
router.get('/intelligence', auth, async (req, res) => {
    try {
        const [profile, predictive, spacedRep] = await Promise.all([
            StudentLearningProfileService.getProfile(req.user._id),
            PerformanceAnalyticsService.getPredictiveMetrics(req.user._id),
            AdaptiveLearningService.calculateSpacedRepetition(req.user._id)
        ]);
        res.json({
            profile,
            predictive,
            spacedRepetition: spacedRep.slice(0, 5),     // top 5 most urgent revisions
            overdueCount: spacedRep.filter(t => t.isOverdue).length
        });
    } catch (err) {
        console.error('[LEARNING] /intelligence error:', err.message);
        res.status(500).json({ error: 'Failed to fetch learning intelligence.' });
    }
});

/* ============================================================
   MODULE C — AI TUTOR ENDPOINTS
   ============================================================ */

/**
 * POST /api/learning/tutor/explain
 * Explain a specific wrong answer from a user's test session.
 * Body: { sessionId, questionId }
 */
router.post('/tutor/explain', auth, async (req, res) => {
    try {
        const { sessionId, questionId } = req.body;
        if (!sessionId || !questionId) {
            return res.status(400).json({ error: 'sessionId and questionId are required.' });
        }
        const explanation = await AITutorService.explainWrongAnswer(req.user._id, sessionId, questionId);
        if (explanation && explanation.success === false) {
            return res.json({
                success: false,
                source: "fallback",
                message: "AI service unavailable"
            });
        }
        res.json(explanation);
    } catch (err) {
        console.error('[LEARNING] /tutor/explain error:', err.message);
        res.status(500).json({ error: 'Failed to generate explanation.' });
    }
});

/**
 * POST /api/learning/tutor/hint
 * Generate up to 3 progressive hints for a question.
 * Body: { questionText, topic, correctAnswer }
 */
router.post('/tutor/hint', auth, async (req, res) => {
    try {
        const { questionText, topic, correctAnswer } = req.body;
        if (!questionText || !correctAnswer) {
            return res.status(400).json({ error: 'questionText and correctAnswer are required.' });
        }
        const hints = await AITutorService.generateHints(questionText, topic, correctAnswer);
        if (hints && hints.success === false) {
            return res.json(hints);
        }
        res.json({ hints });
    } catch (err) {
        console.error('[LEARNING] /tutor/hint error:', err.message);
        res.status(500).json({ error: 'Failed to generate hints.' });
    }
});

/**
 * GET /api/learning/tutor/summary
 * Generate a concept summary for a topic.
 * Query: ?topic=AncientHistory&exam=UPSC
 */
router.get('/tutor/summary', auth, async (req, res) => {
    try {
        const { topic, exam } = req.query;
        if (!topic) {
            return res.status(400).json({ error: 'topic query parameter is required.' });
        }
        const summary = await AITutorService.generateConceptSummary(topic, exam || 'UPSC');
        if (summary && summary.success === false) {
            return res.json({
                success: false,
                source: "fallback",
                message: "AI service unavailable"
            });
        }
        res.json(summary);
    } catch (err) {
        console.error('[LEARNING] /tutor/summary error:', err.message);
        res.status(500).json({ error: 'Failed to generate concept summary.' });
    }
});

/**
 * GET /api/learning/tutor/mistakes
 * Detect repeated mistake patterns from test history.
 * Query: ?limit=20
 */
router.get('/tutor/mistakes', auth, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const analysis = await AITutorService.detectRepeatedMistakes(req.user._id, limit);
        res.json(analysis);
    } catch (err) {
        console.error('[LEARNING] /tutor/mistakes error:', err.message);
        res.status(500).json({ error: 'Failed to analyse mistake patterns.' });
    }
});

/* ============================================================
   MODULE D — OFFLINE SYNC ENDPOINT
   ============================================================ */

/**
 * POST /api/learning/sync
 * Receive and persist offline-queued test results (Module D).
 * Body: { offlineResults: [{ sessionId, answers, subject, exam, createdAt, ... }] }
 * Conflict resolution: skip existing sessionIds (idempotent).
 */
router.post('/sync', auth, async (req, res) => {
    try {
        const { offlineResults } = req.body;
        if (!Array.isArray(offlineResults) || offlineResults.length === 0) {
            return res.status(400).json({ error: 'offlineResults array is required and must not be empty.' });
        }

        const userId = req.user._id;
        const results = { synced: [], skipped: [], failed: [] };

        for (const payload of offlineResults) {
            const { sessionId } = payload;
            if (!sessionId) {
                results.failed.push({ sessionId: 'MISSING', reason: 'sessionId is required' });
                continue;
            }

            // Idempotency: skip if already exists
            const existing = await TestResult.findOne({ sessionId }).lean();
            if (existing) {
                results.skipped.push({ sessionId, reason: 'Already synced — session exists in database.' });
                continue;
            }

            try {
                // Resolve conflict: use the offline session's createdAt, fallback to now
                const createdAt = payload.createdAt ? new Date(payload.createdAt) : new Date();

                const newResult = new TestResult({
                    userId,
                    sessionId,
                    exam: payload.exam || 'UNKNOWN',
                    subject: payload.subject || 'UNKNOWN',
                    testName: payload.testName || `Offline Test — ${createdAt.toISOString().split('T')[0]}`,
                    mode: payload.mode || 'full',
                    score: payload.score || 0,
                    totalQuestions: payload.totalQuestions || (payload.answers || []).length,
                    correct: payload.correct || 0,
                    incorrect: payload.incorrect || 0,
                    unattempted: payload.unattempted || 0,
                    accuracy: payload.accuracy || 0,
                    answers: payload.answers || [],
                    createdAt
                });

                await newResult.save();
                results.synced.push({ sessionId });
            } catch (saveErr) {
                results.failed.push({ sessionId, reason: saveErr.message });
            }
        }

        res.json({
            message: `Sync complete. ${results.synced.length} synced, ${results.skipped.length} skipped, ${results.failed.length} failed.`,
            ...results
        });
    } catch (err) {
        console.error('[LEARNING] /sync error:', err.message);
        res.status(500).json({ error: 'Failed to process offline sync.' });
    }
});

module.exports = router;
