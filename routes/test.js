const express = require('express');
const auth = require('../middleware/auth');
const TestResult = require('../models/TestResult');
const User = require('../models/User');
const { sendResultEmail } = require('../services/emailService');
const { evaluateBadges } = require('../services/badgeService');
const router = express.Router();

// Submit test result
router.post('/submit', auth, async (req, res) => {
    try {
        const { exam, subject, testName, score, totalQuestions, correct, incorrect, unattempted, accuracy, answers, mode, modeValue } = req.body;
        
        const testResult = new TestResult({
            userId: req.user._id,
            exam,
            subject,
            testName,
            score,
            totalQuestions,
            correct,
            incorrect,
            unattempted,
            accuracy,
            answers,
            mode: mode || 'full',
            modeValue: modeValue || null
        });

        await testResult.save();

        // --- Streak & Badge Logic ---
        const user = await User.findById(req.user._id);
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        
        let newStreak = user.streakCount || 0;
        const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
        const lastActiveDateOnly = lastActive ? new Date(Date.UTC(lastActive.getUTCFullYear(), lastActive.getUTCMonth(), lastActive.getUTCDate())) : null;

        if (!lastActiveDateOnly) {
            newStreak = 1;
        } else {
            const diffTime = today - lastActiveDateOnly;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                newStreak += 1; // Yesterday, so increment
            } else if (diffDays > 1) {
                newStreak = 1;  // Gap found, reset to 1
            }
            // If diffDays is 0 (today), streak stays the same
        }

        user.streakCount = newStreak;
        user.lastActiveDate = today;

        // Evaluate Badges
        const totalTests = await TestResult.countDocuments({ userId: user._id });
        const earnedBadges = evaluateBadges(user, testResult, totalTests);
        
        if (earnedBadges.length > 0) {
            user.badges = [...new Set([...(user.badges || []), ...earnedBadges])];
        }

        await user.save();
        // ----------------------------
        
        // Send email in background
        sendResultEmail(user, testResult);
        
        res.status(201).json({ 
            message: 'Test result saved successfully', 
            resultId: testResult._id,
            streak: user.streakCount,
            newBadges: earnedBadges
        });
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
