const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PerformanceAnalyticsService = require('../services/performanceAnalyticsService');
const { requirePlan } = require('../middleware/planGuard');

/**
 * GET /api/analytics/overview
 */
router.get('/overview', auth, async (req, res) => {
    try {
        const stats = await PerformanceAnalyticsService.getOverview(req.user._id);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/analytics/topics
 */
router.get('/topics', auth, requirePlan('advanced_analytics'), async (req, res) => {
    try {
        const stats = await PerformanceAnalyticsService.getTopicMastery(req.user._id);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/analytics/trends
 */
router.get('/trends', auth, async (req, res) => {
    try {
        const stats = await PerformanceAnalyticsService.getTrends(req.user._id);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/analytics/readiness
 */
router.get('/readiness', auth, requirePlan('advanced_analytics'), async (req, res) => {
    try {
        const stats = await PerformanceAnalyticsService.getReadiness(req.user._id);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/analytics/streak
 */
router.get('/streak', auth, async (req, res) => {
    try {
        const stats = await PerformanceAnalyticsService.getStreak(req.user._id);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
