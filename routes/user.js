'use strict';

const express = require('express');
const auth = require('../middleware/auth');
const TestResult = require('../models/testResult');
const router = express.Router();

// ─── GET /api/user/me ─────────────────────────────────────────────────────────
// Get user profile and recent tests (last 10 for dashboard widget)
router.get('/me', auth, async (req, res) => {
    try {
        const tests = await TestResult.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10);
            
        const streak = await calculateStreak(req.user._id);
        
        res.json({
            user: {
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                plan: req.user.plan,
                createdAt: req.user.createdAt,
                streakCount: streak,
                lastActiveDate: req.user.lastActiveDate,
                badges: req.user.badges || []
            },
            recentTests: tests,
            streak: streak
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── GET /api/user/stats ──────────────────────────────────────────────────────
// Get aggregate user stats (total tests, avg accuracy, per-subject breakdown)
router.get('/stats', auth, async (req, res) => {
    try {
        const tests = await TestResult.find({ userId: req.user._id });
        
        if (tests.length === 0) {
            return res.json({
                totalTests: 0,
                avgAccuracy: 0,
                subjectStats: {}
            });
        }

        const totalTests = tests.length;
        let totalAccuracy = 0;
        const subjectData = {};

        tests.forEach(test => {
            totalAccuracy += test.accuracy;
            
            if (!subjectData[test.subject]) {
                subjectData[test.subject] = { total: 0, correct: 0, count: 0 };
            }
            subjectData[test.subject].total += test.totalQuestions;
            subjectData[test.subject].correct += test.correct;
            subjectData[test.subject].count += 1;
        });

        const subjectStats = {};
        for (const sub in subjectData) {
            subjectStats[sub] = Math.round((subjectData[sub].correct / subjectData[sub].total) * 100);
        }

        res.json({
            totalTests,
            avgAccuracy: Math.round(totalAccuracy / totalTests),
            subjectStats
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ─── GET /api/user/result/:id ─────────────────────────────────────────────────
// Fetch a single TestResult by MongoDB _id.
// SECURITY: enforces userId ownership so users cannot view each other's results.
router.get('/result/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format to prevent CastError
        if (!id || !/^[a-f\d]{24}$/i.test(id)) {
            return res.status(400).json({ error: 'Invalid result ID format.' });
        }

        const result = await TestResult.findOne({
            _id: id,
            userId: req.user._id   // ownership gate
        }).lean();

        if (!result) {
            return res.status(404).json({ error: 'Result not found or access denied.' });
        }

        res.json(result);
    } catch (error) {
        console.error('[UserResult] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ─── GET /api/user/history ────────────────────────────────────────────────────
// Returns paginated test history.
// Query params:
//   page     {number}  default 1
//   limit    {number}  default 20, max 50
//   subject  {string}  optional filter (exact, lowercase)
//   exam     {string}  optional filter (exact, lowercase)
//   sort     {string}  'newest' | 'oldest' | 'accuracy' | 'score'  default 'newest'
router.get('/history', auth, async (req, res) => {
    try {
        let { page = 1, limit = 20, subject, exam, sort = 'newest' } = req.query;

        // Clamp and sanitize pagination params
        page  = Math.max(1, parseInt(page)  || 1);
        limit = Math.min(50, Math.max(1, parseInt(limit) || 20));

        const query = { userId: req.user._id };
        if (subject) query.subject = subject.toLowerCase().trim();
        if (exam)    query.exam    = exam.toLowerCase().trim();

        const sortMap = {
            newest:   { createdAt: -1 },
            oldest:   { createdAt:  1 },
            accuracy: { accuracy: -1, createdAt: -1 },
            score:    { score: -1, createdAt: -1 }
        };
        const sortObj = sortMap[sort] || sortMap.newest;

        const skip = (page - 1) * limit;

        const [results, total] = await Promise.all([
            TestResult.find(query)
                .sort(sortObj)
                .skip(skip)
                .limit(limit)
                .select('exam subject testName score totalQuestions correct incorrect unattempted accuracy timeTaken mode modeValue createdAt topic')
                .lean(),
            TestResult.countDocuments(query)
        ]);

        // Provide distinct subjects/exams for filter dropdowns — cached by client
        const [subjects, exams] = await Promise.all([
            TestResult.distinct('subject', { userId: req.user._id }),
            TestResult.distinct('exam',    { userId: req.user._id })
        ]);

        res.json({
            results,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            filters: { subjects: subjects.sort(), exams: exams.sort() }
        });
    } catch (error) {
        console.error('[UserHistory] Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ─── Helper ───────────────────────────────────────────────────────────────────
async function calculateStreak(userId) {
    const tests = await TestResult.find({ userId })
        .sort({ createdAt: -1 })
        .select('createdAt');
        
    if (tests.length === 0) return 0;

    const testDates = [...new Set(tests.map(t => t.createdAt.toISOString().split('T')[0]))];
    
    let streak = 0;
    const today     = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let currentDateToCheck;
    
    if (testDates[0] === today) {
        currentDateToCheck = new Date(today);
    } else if (testDates[0] === yesterday) {
        currentDateToCheck = new Date(yesterday);
    } else {
        return 0;
    }
    
    for (let i = 0; i < testDates.length; i++) {
        const dateStr = currentDateToCheck.toISOString().split('T')[0];
        if (testDates.includes(dateStr)) {
            streak++;
            currentDateToCheck.setDate(currentDateToCheck.getDate() - 1);
        } else {
            break;
        }
    }
    
    return streak;
}

module.exports = router;
