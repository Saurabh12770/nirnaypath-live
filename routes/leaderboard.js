const express = require('express');
const auth = require('../middleware/auth');
const TestResult = require('../models/TestResult');
const User = require('../models/User');
const router = express.Router();

const { getCachedData, setCachedData } = require('../middleware/cache');

/**
 * GET /api/leaderboard/global
 * Top 10 users across all exams by total XP (Total Correct * 10)
 */
router.get('/global', auth, async (req, res) => {
    try {
        const cacheKey = 'leaderboard_global';
        const cached = await getCachedData(cacheKey);
        if (cached) return res.json(cached);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const leaderboard = await TestResult.aggregate([
            { 
                $match: { 
                    createdAt: { $gte: thirtyDaysAgo },
                    timeTaken: { $gt: 10 } // Anti-cheat: exclude suspiciously fast tests
                } 
            },
            {
                $group: {
                    _id: "$userId",
                    totalScore: { $sum: "$score" },
                    testsCount: { $sum: 1 },
                    avgAccuracy: { $avg: "$accuracy" }
                }
            },
            { $sort: { totalScore: -1, avgAccuracy: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            { $unwind: "$userInfo" },
            {
                $project: {
                    _id: 0,
                    userId: "$_id",
                    userName: "$userInfo.name",
                    totalScore: 1,
                    testsCount: 1,
                    avgAccuracy: 1,
                    level: { $add: [{ $floor: { $divide: [{ $multiply: ["$totalScore", 10] }, 1000] } }, 1] }
                }
            }
        ]);

        const result = leaderboard.map((entry, index) => ({ rank: index + 1, ...entry }));
        await setCachedData(cacheKey, result, 600);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/leaderboard/subject/:subject
 */
router.get('/subject/:subject', auth, async (req, res) => {
    try {
        const { subject } = req.params;
        const cacheKey = `leaderboard_sub_${subject.toLowerCase()}`;
        const cached = await getCachedData(cacheKey);
        if (cached) return res.json(cached);

        const leaderboard = await TestResult.aggregate([
            { 
                $match: { 
                    subject: subject.toLowerCase(),
                    timeTaken: { $gt: 10 }
                } 
            },
            {
                $group: {
                    _id: "$userId",
                    totalScore: { $sum: "$score" },
                    testsCount: { $sum: 1 },
                    maxAccuracy: { $max: "$accuracy" }
                }
            },
            { $sort: { totalScore: -1, maxAccuracy: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            { $unwind: "$userInfo" },
            {
                $project: {
                    _id: 0,
                    userName: "$userInfo.name",
                    totalScore: 1,
                    testsCount: 1,
                    maxAccuracy: 1
                }
            }
        ]);

        const result = leaderboard.map((entry, index) => ({ rank: index + 1, ...entry }));
        await setCachedData(cacheKey, result, 600);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/leaderboard/:exam
 * Returns top 10 users for a specific exam in the last 7 days.
 */
router.get('/:exam', auth, async (req, res) => {
    try {
        const { exam } = req.params;
        const cacheKey = `leaderboard_${exam.toLowerCase()}`;
        
        // Cache Check
        const cached = await getCachedData(cacheKey);
        if (cached) return res.json(cached);

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

        const result = leaderboard.map((entry, index) => ({
            rank: index + 1,
            ...entry
        }));

        // Cache for 5 minutes
        await setCachedData(cacheKey, result, 300);

        res.json(result);
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
