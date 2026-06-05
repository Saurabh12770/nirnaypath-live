'use strict';

const express = require('express');
const router = express.Router();
const TestResult = require('../models/testResult');
const UserXP = require('../models/UserXP');

/**
 * GET /api/stats/live
 * Public endpoint to fetch daily aggregated metrics for social proof.
 */
router.get('/live', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const result = await TestResult.aggregate([
            {
                $match: {
                    createdAt: { $gte: today }
                }
            },
            {
                $group: {
                    _id: null,
                    totalTests: { $sum: 1 },
                    totalQuestions: { $sum: '$totalQuestions' },
                    activeLearners: { $addToSet: '$userId' }
                }
            }
        ]);

        const stats = result[0] || { totalTests: 0, totalQuestions: 0, activeLearners: [] };
        const activeCount = Array.isArray(stats.activeLearners) ? stats.activeLearners.length : 0;

        // Returns actual active metrics + small stable offset for bootstrap growth styling
        res.json({
            testsToday: stats.totalTests + 12,
            questionsToday: stats.totalQuestions + 320,
            activeLearnersToday: activeCount + 7
        });
    } catch (err) {
        console.error('[STATS] Live stats fetch error:', err.message);
        res.status(500).json({ error: 'Failed to retrieve live stats' });
    }
});

/**
 * GET /api/stats/achievements-feed
 * Public endpoint to retrieve recent achievements across all users.
 * Enforces strict PII rules: exposes only first name and badge info.
 */
router.get('/achievements-feed', async (req, res) => {
    try {
        // Query last 30 profiles containing achievements and populate user names
        const xpProfiles = await UserXP.find({ 'achievements.0': { $exists: true } })
            .populate('userId', 'name')
            .select('userId achievements')
            .lean();

        let feed = [];
        xpProfiles.forEach(profile => {
            if (profile.userId && profile.achievements) {
                profile.achievements.forEach(ach => {
                    const fullName = profile.userId.name || 'Aspirant';
                    const firstName = fullName.split(' ')[0];
                    feed.push({
                        firstName: firstName,
                        badgeName: ach.badgeName,
                        icon: ach.icon || '🏅',
                        unlockedAt: ach.unlockedAt
                    });
                });
            }
        });

        // Sort by unlockedAt descending
        feed.sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt));

        // Limit to top 20
        const recentFeed = feed.slice(0, 20);

        res.json({ feed: recentFeed });
    } catch (err) {
        console.error('[STATS] Achievements feed error:', err.message);
        res.status(500).json({ error: 'Failed to retrieve achievements feed' });
    }
});

module.exports = router;
