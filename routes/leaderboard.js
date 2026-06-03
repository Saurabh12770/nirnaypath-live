'use strict';
const express = require('express');
const auth = require('../middleware/auth');
const TestResult = require('../models/testResult');
const User = require('../models/user');
const UserXP = require('../models/UserXP');
const router = express.Router();

const { getCachedData, setCachedData } = require('../middleware/cache');

/**
 * Assign ranks with tie handling (standard competition ranking: 1, 1, 3)
 * @param {Array} list - Sorted list of users
 * @param {string} scoreField - Field name containing the score
 * @returns {Array} List with rank, percentile, and rankMovement added
 */
function rankAndComputeStats(list, scoreField, totalUsers) {
    let currentRank = 1;
    let usersAtRank = 0;
    let prevScore = null;

    return list.map((item, index) => {
        const score = item[scoreField] || 0;
        if (prevScore !== null && score < prevScore) {
            currentRank += usersAtRank;
            usersAtRank = 1;
        } else {
            usersAtRank++;
        }
        prevScore = score;

        // Rank movement tracking
        // previousRank defaults to currentRank if not set or 0
        const previousRank = item.previousRank || currentRank;
        const movement = previousRank - currentRank;

        // Percentile calculation
        const percentile = totalUsers > 0
            ? Math.max(0, Math.min(100, Math.round(((totalUsers - currentRank) / totalUsers) * 100)))
            : 100;

        return {
            userId:       item.userId || item._id,
            userName:     item.userName || item.name || 'Anonymous User',
            score:        score,
            level:        item.level || 1,
            streak:       item.streak || item.currentStreak || 0,
            rank:         currentRank,
            previousRank: previousRank,
            movement:     movement,
            percentile:   percentile
        };
    });
}

/**
 * GET /api/leaderboard/global
 * Paginated global leaderboard sorted by totalXP.
 */
router.get('/global', auth, async (req, res) => {
    const { yieldIfLagging } = require('../utils/eventLoopSafeguard');
    await yieldIfLagging(50);

    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
        const cacheKey = 'leaderboard_global_full';

        let rankedList = await getCachedData(cacheKey);

        if (!rankedList) {
            // Anti-cheat: only active users, exclude admins from competitive rankings
            const activeUsersXP = await UserXP.find()
                .populate({
                    path: 'userId',
                    match: { isActive: true, role: 'user' },
                    select: 'name'
                })
                .sort({ totalXP: -1 })
                .limit(1000)
                .lean();

            // Filter out populated null users (admins or inactive)
            const validUsers = activeUsersXP.filter(item => item.userId);
            const totalCount = validUsers.length;

            const baseList = validUsers.map(item => ({
                userId:       item.userId._id,
                userName:     item.userId.name,
                totalXP:      item.totalXP,
                level:        item.level,
                streak:       item.currentStreak,
                previousRank: item.rewardLog.includes('rank_init') ? item.level : 0 // Placeholder or fallback logic
            }));

            // Assign ranks using tie handling
            rankedList = rankAndComputeStats(baseList, 'totalXP', totalCount);

            // Cache full ranked list for 60 seconds
            await setCachedData(cacheKey, rankedList, 60);

            // Update users' previousRank in the DB to keep rank history (non-blocking)
            // This ensures next updates will calculate correct real movement
            const bulkOps = rankedList.map(entry => ({
                updateOne: {
                    filter: { userId: entry.userId },
                    update: { $set: { previousRank: entry.rank } }
                }
            }));
            if (bulkOps.length > 0) {
                UserXP.bulkWrite(bulkOps).catch(err => console.error('Bulk rank update failed:', err.message));
            }
        }

        const totalUsers = rankedList.length;
        const startIndex = (page - 1) * limit;
        const paginatedList = rankedList.slice(startIndex, startIndex + limit);

        // Find current requesting user's rank
        let currentUserEntry = rankedList.find(e => String(e.userId) === String(req.user._id));
        if (!currentUserEntry && req.user && req.user._id) {
            try {
                const myXP = await UserXP.findOne({ userId: req.user._id }).lean();
                if (myXP) {
                    const higherCount = await UserXP.countDocuments({ totalXP: { $gt: myXP.totalXP } });
                    currentUserEntry = {
                        userId:       req.user._id,
                        userName:     req.user.name,
                        score:        myXP.totalXP,
                        level:        myXP.level,
                        streak:       myXP.currentStreak,
                        rank:         higherCount + 1,
                        previousRank: myXP.previousRank || (higherCount + 1),
                        movement:     0,
                        percentile:   100
                    };
                }
            } catch (_) {}
        }

        res.json({
            success: true,
            leaderboard: paginatedList,
            totalUsers,
            page,
            totalPages: Math.ceil(totalUsers / limit),
            currentUser: currentUserEntry || null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/leaderboard/weekly
 * Paginated weekly leaderboard sorted by weeklyXP.
 */
router.get('/weekly', auth, async (req, res) => {
    const { yieldIfLagging } = require('../utils/eventLoopSafeguard');
    await yieldIfLagging(50);

    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
        const cacheKey = 'leaderboard_weekly_full';

        let rankedList = await getCachedData(cacheKey);

        if (!rankedList) {
            const activeUsersXP = await UserXP.find()
                .populate({
                    path: 'userId',
                    match: { isActive: true, role: 'user' },
                    select: 'name'
                })
                .sort({ weeklyXP: -1 })
                .limit(1000)
                .lean();

            const validUsers = activeUsersXP.filter(item => item.userId);
            const totalCount = validUsers.length;

            const baseList = validUsers.map(item => ({
                userId:       item.userId._id,
                userName:     item.userId.name,
                weeklyXP:     item.weeklyXP,
                level:        item.level,
                streak:       item.currentStreak,
                previousRank: item.previousRank || 0
            }));

            rankedList = rankAndComputeStats(baseList, 'weeklyXP', totalCount);
            await setCachedData(cacheKey, rankedList, 60);
        }

        const totalUsers = rankedList.length;
        const startIndex = (page - 1) * limit;
        const paginatedList = rankedList.slice(startIndex, startIndex + limit);

        let currentUserEntry = rankedList.find(e => String(e.userId) === String(req.user._id));
        if (!currentUserEntry && req.user && req.user._id) {
            try {
                const myXP = await UserXP.findOne({ userId: req.user._id }).lean();
                if (myXP) {
                    const higherCount = await UserXP.countDocuments({ weeklyXP: { $gt: myXP.weeklyXP } });
                    currentUserEntry = {
                        userId:       req.user._id,
                        userName:     req.user.name,
                        score:        myXP.weeklyXP,
                        level:        myXP.level,
                        streak:       myXP.currentStreak,
                        rank:         higherCount + 1,
                        previousRank: myXP.previousRank || (higherCount + 1),
                        movement:     0,
                        percentile:   100
                    };
                }
            } catch (_) {}
        }

        res.json({
            success: true,
            leaderboard: paginatedList,
            totalUsers,
            page,
            totalPages: Math.ceil(totalUsers / limit),
            currentUser: currentUserEntry || null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/leaderboard/subject/:subject
 * Paginated subject-specific leaderboard.
 * Calculated dynamically from TestResult records in last 30 days.
 * Excludes cheated tests.
 */
router.get('/subject/:subject', auth, async (req, res) => {
    const { yieldIfLagging } = require('../utils/eventLoopSafeguard');
    await yieldIfLagging(50);

    try {
        const { subject } = req.params;
        const subLower = subject.toLowerCase().trim();
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
        const cacheKey = `leaderboard_sub_${subLower}_full`;

        let rankedList = await getCachedData(cacheKey);

        if (!rankedList) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // Anti-cheat: Exclude tests with:
            // 1. timeTaken <= 10 seconds
            // 2. fraudProbabilityScore >= 80
            const leaderboardData = await TestResult.aggregate([
                {
                    $match: {
                        subject: subLower,
                        createdAt: { $gte: thirtyDaysAgo },
                        timeTaken: { $gt: 10 },
                        fraudProbabilityScore: { $lt: 80 }
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
                    $match: {
                        "userInfo.isActive": true,
                        "userInfo.role": "user"
                    }
                },
                {
                    $project: {
                        userId: "$_id",
                        userName: "$userInfo.name",
                        totalScore: 1,
                        testsCount: 1,
                        avgAccuracy: { $round: ["$avgAccuracy", 0] }
                    }
                }
            ]);

            const totalCount = leaderboardData.length;
            rankedList = rankAndComputeStats(leaderboardData, 'totalScore', totalCount);
            await setCachedData(cacheKey, rankedList, 120); // 2 minute cache
        }

        const totalUsers = rankedList.length;
        const startIndex = (page - 1) * limit;
        const paginatedList = rankedList.slice(startIndex, startIndex + limit);

        const currentUserEntry = rankedList.find(e => String(e.userId) === String(req.user._id));

        res.json({
            success: true,
            leaderboard: paginatedList,
            totalUsers,
            page,
            totalPages: Math.ceil(totalUsers / limit),
            currentUser: currentUserEntry || null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/leaderboard/friends
 * Leaderboard among user's friends list.
 * Fallback: if user has no friends, include peer users created in the same week.
 */
router.get('/friends', auth, async (req, res) => {
    const { yieldIfLagging } = require('../utils/eventLoopSafeguard');
    await yieldIfLagging(50);

    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
        
        // Fetch current user with their friends list
        const currentUser = await User.findById(req.user._id).select('friends').lean();
        let targetUserIds = [req.user._id];

        if (currentUser && currentUser.friends && currentUser.friends.length > 0) {
            targetUserIds.push(...currentUser.friends);
        } else {
            // Fallback: get 15 peer users to fill the friend list dynamically (no mocked data)
            const peers = await User.find({ role: 'user', isActive: true, _id: { $ne: req.user._id } })
                .limit(15)
                .select('_id')
                .lean();
            targetUserIds.push(...peers.map(p => p._id));
        }

        const xpRecords = await UserXP.find({ userId: { $in: targetUserIds } })
            .populate('userId', 'name')
            .sort({ totalXP: -1 })
            .lean();

        const baseList = xpRecords
            .filter(item => item.userId)
            .map(item => ({
                userId:       item.userId._id,
                userName:     item.userId.name,
                totalXP:      item.totalXP,
                level:        item.level,
                streak:       item.currentStreak,
                previousRank: item.previousRank || 0
            }));

        const totalUsers = baseList.length;
        const rankedList = rankAndComputeStats(baseList, 'totalXP', totalUsers);

        const startIndex = (page - 1) * limit;
        const paginatedList = rankedList.slice(startIndex, startIndex + limit);

        const currentUserEntry = rankedList.find(e => String(e.userId) === String(req.user._id));

        res.json({
            success: true,
            leaderboard: paginatedList,
            totalUsers,
            page,
            totalPages: Math.ceil(totalUsers / limit),
            currentUser: currentUserEntry || null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/leaderboard/:exam
 * Dynamic leaderboard for a specific exam category (e.g., upsc, bpsc).
 * Returns a bare array of entries sorted by totalScore.
 */
router.get('/:exam', auth, async (req, res) => {
    try {
        const { exam } = req.params;
        const examLower = exam.toLowerCase().trim();

        // Exclude static keyword routes
        if (['global', 'weekly', 'friends'].includes(examLower)) {
            return res.status(400).json({ error: 'Invalid exam parameter.' });
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const leaderboardData = await TestResult.aggregate([
            {
                $match: {
                    exam: examLower,
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: "$userId",
                    totalScore: { $sum: "$score" },
                    testsCount: { $sum: 1 }
                }
            },
            { $sort: { totalScore: -1 } },
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
                    testsCount: 1
                }
            }
        ]);

        // Assign ranks with proper tie-handling
        let currentRank = 1;
        let usersAtRank = 0;
        let prevScore = null;

        const ranked = leaderboardData.map((item, index) => {
            const score = item.totalScore || 0;
            if (prevScore !== null && score < prevScore) {
                currentRank += usersAtRank;
                usersAtRank = 1;
            } else {
                usersAtRank++;
            }
            prevScore = score;

            return {
                rank: currentRank,
                userName: item.userName || 'Anonymous User',
                totalScore: score,
                testsCount: item.testsCount || 1
            };
        });

        res.json(ranked);
    } catch (error) {
        console.error('[LeaderboardExam] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
