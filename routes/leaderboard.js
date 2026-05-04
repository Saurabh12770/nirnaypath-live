const express = require('express');
const auth = require('../middleware/auth');
const TestResult = require('../models/TestResult');
const User = require('../models/User');
const router = express.Router();

/**
 * GET /api/leaderboard/:exam
 * Returns top 10 users for a specific exam in the last 7 days.
 */
router.get('/:exam', auth, async (req, res) => {
    try {
        const { exam } = req.params;
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const leaderboard = await TestResult.aggregate([
            {
                $match: {
                    exam: exam.toLowerCase(),
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: "$userId",
                    totalScore: { $sum: "$score" },
                    testsCount: { $sum: 1 }
                }
            },
            {
                $sort: { totalScore: -1, testsCount: -1 }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            {
                $unwind: "$userInfo"
            },
            {
                $project: {
                    _id: 0,
                    userId: "$_id",
                    userName: "$userInfo.name",
                    totalScore: 1,
                    testsCount: 1
                }
            }
        ]);

        res.json(leaderboard.map((entry, index) => ({
            rank: index + 1,
            ...entry
        })));
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
