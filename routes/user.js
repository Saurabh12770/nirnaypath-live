const express = require('express');
const auth = require('../middleware/auth');
const TestResult = require('../models/TestResult');
const router = express.Router();

// Get user profile and recent tests
router.get('/me', auth, async (req, res) => {
    try {
        const tests = await TestResult.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(10);
            
        // Calculate streak
        const streak = await calculateStreak(req.user._id);
        
        res.json({
            user: {
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                plan: req.user.plan,
                createdAt: req.user.createdAt,
                streakCount: req.user.streakCount || 0,
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

// Get user stats
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
                subjectData[test.subject] = {
                    total: 0,
                    correct: 0,
                    count: 0
                };
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

async function calculateStreak(userId) {
    const tests = await TestResult.find({ userId })
        .sort({ createdAt: -1 })
        .select('createdAt');
        
    if (tests.length === 0) return 0;

    const testDates = [...new Set(tests.map(t => t.createdAt.toISOString().split('T')[0]))];
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
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
