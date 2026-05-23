'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/user');
const Payment = require('../models/payment');
const TestResult = require('../models/testResult');
const UserActivityLog = require('../models/UserActivityLog');
const GrowthService = require('../services/growthService');

/**
 * POST /api/admin/intelligence/log
 * Public activity logger to collect click telemetry, page loads, and flow events.
 */
router.post('/log', auth, async (req, res) => {
    try {
        const { action, page, x, y, metadata } = req.body;
        if (!action || !page) {
            return res.status(400).json({ error: 'action and page are required.' });
        }

        const log = new UserActivityLog({
            userId: req.user._id,
            action,
            page,
            x: x || 0,
            y: y || 0,
            metadata: metadata || {}
        });

        await log.save();
        res.json({ success: true });
    } catch (err) {
        console.error('[ADMIN INTEL] Log activity error:', err.message);
        res.status(500).json({ error: 'Failed to record activity log.' });
    }
});

/**
 * GET /api/admin/intelligence/revenue
 * Aggregates revenue, payment details, and subscription plans.
 */
router.get('/revenue', auth, async (req, res) => {
    try {
        const analytics = await GrowthService.getSubscriptionAnalytics();
        res.json(analytics);
    } catch (err) {
        console.error('[ADMIN INTEL] Get revenue error:', err.message);
        res.status(500).json({ error: 'Failed to compute revenue analytics.' });
    }
});

/**
 * GET /api/admin/intelligence/funnel
 * Calculates user conversion rates: Signup -> Mock Attempt -> Upgrade
 */
router.get('/funnel', auth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const attemptedTest = await TestResult.distinct('userId');
        const upgradedUsers = await User.countDocuments({ plan: { $ne: 'free' } });

        const funnel = [
            { stage: 'Signup', count: totalUsers, rate: 100 },
            {
                stage: 'Test Attempt',
                count: attemptedTest.length,
                rate: totalUsers > 0 ? Math.round((attemptedTest.length / totalUsers) * 100) : 0
            },
            {
                stage: 'Premium Upgrade',
                count: upgradedUsers,
                rate: totalUsers > 0 ? Math.round((upgradedUsers / totalUsers) * 100) : 0
            }
        ];

        res.json(funnel);
    } catch (err) {
        console.error('[ADMIN INTEL] Funnel generation error:', err.message);
        res.status(500).json({ error: 'Failed to generate conversion funnel.' });
    }
});

/**
 * GET /api/admin/intelligence/retention
 * Calculates cohort retention percentages.
 * Groups users by the week they signed up and tracks their subsequent active weeks.
 */
router.get('/retention', auth, async (req, res) => {
    try {
        // Find users registered in the last 4 weeks
        const fourWeeksAgo = new Date(Date.now() - 28 * 24 * 3600 * 1000);
        const users = await User.find({ createdAt: { $gte: fourWeeksAgo } }).select('_id createdAt').lean();

        // Group signups by week number
        const cohorts = {};
        users.forEach(u => {
            const signupDate = new Date(u.createdAt);
            const weekStr = `Week_${getWeekNumber(signupDate)}`;
            if (!cohorts[weekStr]) {
                cohorts[weekStr] = { name: weekStr, size: 0, userIds: [] };
            }
            cohorts[weekStr].size++;
            cohorts[weekStr].userIds.push(u._id.toString());
        });

        // Determine how many users in each cohort had activity in week 1, 2, 3, 4
        const cohortList = await Promise.all(Object.values(cohorts).map(async (cohort) => {
            const retentionArray = [100]; // Week 0 is always 100%

            for (let w = 1; w <= 3; w++) {
                const weekStart = new Date(Date.now() - (w * 7 * 24 * 3600 * 1000));
                const activeCount = await UserActivityLog.distinct('userId', {
                    userId: { $in: cohort.userIds },
                    createdAt: { $gte: weekStart }
                });

                const rate = cohort.size > 0 ? Math.round((activeCount.length / cohort.size) * 100) : 0;
                retentionArray.push(rate);
            }

            return {
                cohort: cohort.name,
                size: cohort.size,
                retention: retentionArray
            };
        }));

        res.json(cohortList);
    } catch (err) {
        console.error('[ADMIN INTEL] Cohort retention error:', err.message);
        res.status(500).json({ error: 'Failed to calculate cohort retention.' });
    }
});

/**
 * GET /api/admin/intelligence/dropoffs
 * Identifies high-dropoff locations in checkouts and mock exams.
 */
router.get('/dropoffs', auth, async (req, res) => {
    try {
        // Mock exam drop-off stats
        const testStarts = await UserActivityLog.countDocuments({ action: 'test_start' });
        const testCompletes = await UserActivityLog.countDocuments({ action: 'test_complete' });
        const mockDropoffs = testStarts > 0 ? Math.max(0, testStarts - testCompletes) : 0;

        // Payment drop-off stats
        const checkoutStarts = await UserActivityLog.countDocuments({ action: 'checkout_start' });
        const checkoutSuccesses = await Payment.countDocuments({ status: 'success' });
        const checkoutDropoffs = checkoutStarts > 0 ? Math.max(0, checkoutStarts - checkoutSuccesses) : 0;

        res.json({
            mockExams: {
                started: testStarts,
                completed: testCompletes,
                dropoffs: mockDropoffs,
                dropoffRate: testStarts > 0 ? Math.round((mockDropoffs / testStarts) * 100) : 0
            },
            checkoutFlow: {
                started: checkoutStarts,
                completed: checkoutSuccesses,
                dropoffs: checkoutDropoffs,
                dropoffRate: checkoutStarts > 0 ? Math.round((checkoutDropoffs / checkoutStarts) * 100) : 0
            }
        });
    } catch (err) {
        console.error('[ADMIN INTEL] Dropoff analysis error:', err.message);
        res.status(500).json({ error: 'Failed to analyze flow dropoffs.' });
    }
});

/**
 * GET /api/admin/intelligence/heatmap
 * Pulls coordinate logs clustered by page for click hotspots.
 */
router.get('/heatmap', auth, async (req, res) => {
    try {
        const page = req.query.page || '/';
        const points = await UserActivityLog.find({ action: 'click', page })
            .select('x y')
            .limit(500)
            .lean();

        res.json({
            page,
            sampleSize: points.length,
            points: points.map(p => [p.x, p.y])
        });
    } catch (err) {
        console.error('[ADMIN INTEL] Heatmap fetch error:', err.message);
        res.status(500).json({ error: 'Failed to fetch click coordinates.' });
    }
});

// ISO week number helper
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

module.exports = router;
