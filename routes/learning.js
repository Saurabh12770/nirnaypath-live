const express = require('express');
const auth = require('../middleware/auth');
const AdaptiveLearningService = require('../services/adaptiveLearningService');
const StudentLearningProfileService = require('../services/studentLearningProfileService');
const PerformanceAnalyticsService = require('../services/performanceAnalyticsService');
const router = express.Router();

/**
 * GET /api/learning/plan
 * Returns the AI-generated daily study plan
 */
router.get('/plan', auth, async (req, res) => {
    try {
        const plan = await AdaptiveLearningService.generateDailyPlan(req.user._id);
        res.json(plan);
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate study plan' });
    }
});

/**
 * GET /api/learning/revision
 * Returns the prioritized revision queue (Spaced Repetition)
 */
router.get('/revision', auth, async (req, res) => {
    try {
        const queue = await StudentLearningProfileService.getRevisionQueue(req.user._id);
        res.json(queue);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch revision queue' });
    }
});

/**
 * GET /api/learning/intelligence
 * Combined predictive intelligence for the dashboard
 */
router.get('/intelligence', auth, async (req, res) => {
    try {
        const [profile, predictive] = await Promise.all([
            StudentLearningProfileService.getProfile(req.user._id),
            PerformanceAnalyticsService.getPredictiveMetrics(req.user._id)
        ]);
        res.json({ profile, predictive });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch learning intelligence' });
    }
});

module.exports = router;
