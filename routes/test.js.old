const express = require('express');
console.log('[BOOT] routes/test.js loaded');
const auth = require('../middleware/auth');
const TestResult = require('../models/TestResult');
const User = require('../models/User');
const { sendResultEmail } = require('../services/emailService');
const { evaluateBadges } = require('../services/badgeService');
const router = express.Router();

const crypto = require('crypto');
const TestSession = require('../models/TestSession');
const Question = require('../models/Question');

/**
 * GET /api/test/health
 * Diagnostic endpoint to verify test router is active.
 */
router.get('/health', (req, res) => {
    res.json({ status: 'active', timestamp: new Date() });
});

/**
 * POST /api/test/start
 * Initializes a server-side test session and returns randomized questions.
 */
router.post('/start', auth, async (req, res) => {
    try {
        const { subject, count, timeLimit, exam } = req.body;
        console.log('[TEST START]', req.body);
        console.log(`[TestStart] Request: subject=${subject}, count=${count}, exam=${exam}, user=${req.user?._id}`);
        
        if (!subject) {
            return res.status(400).json({ error: 'Subject is required' });
        }

        const qCount = Math.min(parseInt(count) || 50, 200);

        // 1. Fetch Randomized Questions
        const subLower = subject.toLowerCase().trim();
        const matchQuery = subLower === 'all' 
            ? {} 
            : { $or: [{ subject: subLower }, { subjectId: subLower }] };

        console.log(`[TestStart] Query: ${JSON.stringify(matchQuery)}`);

        const questions = await Question.aggregate([
            { $match: matchQuery },
            { $sample: { size: qCount } }
        ]);

        console.log(`[TestStart] Found: ${questions.length} questions`);

        if (!questions || questions.length === 0) {
            return res.status(404).json({ error: `No questions found for subject: ${subject}` });
        }

        // 2. Create Session
        const sessionId = crypto.randomUUID();
        const session = new TestSession({
            userId: req.user._id,
            sessionId,
            subject: subject.toLowerCase(),
            exam: exam || 'General',
            questionCount: questions.length,
            timeLimit: parseInt(timeLimit) || 3600, // default 1 hour
            startTime: new Date(),
            status: 'active'
        });

        await session.save();

        res.status(201).json({
            sessionId,
            questions,
            startTime: session.startTime,
            timeLimit: session.timeLimit
        });
    } catch (error) {
        console.error('Test Start Error:', error);
        res.status(500).json({ error: 'Failed to start test session' });
    }
});

// Submit test result
router.post('/submit', auth, async (req, res) => {
    try {
        const { sessionId, exam, subject, testName, score, totalQuestions, correct, incorrect, unattempted, accuracy, answers, mode, modeValue } = req.body;
        
        // 1. Session Validation
        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required for submission.' });
        }

        const session = await TestSession.findOne({ sessionId, userId: req.user._id, status: 'active' });
        if (!session) {
            return res.status(403).json({ error: 'Invalid or already submitted test session.' });
        }

        // 2. Time Validation (Server-side source of truth)
        const now = new Date();
        const elapsedSeconds = (now - session.startTime) / 1000;
        const GRACE_PERIOD = 30; // 30 seconds grace for network latency

        if (elapsedSeconds > (session.timeLimit + GRACE_PERIOD)) {
            session.status = 'expired';
            await session.save();
            return res.status(403).json({ error: 'Test time expired. Submission rejected.' });
        }

        // 3. Save Result
        const testResult = new TestResult({
            userId: req.user._id,
            exam: exam || session.exam,
            subject: subject || session.subject,
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
        
        // Mark session as submitted
        session.status = 'submitted';
        await session.save();

        // --- Streak & Badge Logic ---
        const user = await User.findById(req.user._id);
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
                newStreak += 1;
            } else if (diffDays > 1) {
                newStreak = 1;
            }
        }

        user.streakCount = newStreak;
        user.lastActiveDate = today;

        const totalTests = await TestResult.countDocuments({ userId: user._id });
        const earnedBadges = evaluateBadges(user, testResult, totalTests);
        
        if (earnedBadges.length > 0) {
            user.badges = [...new Set([...(user.badges || []), ...earnedBadges])];
        }

        await user.save();
        
        // Send email (now queued via BullMQ in emailService)
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
