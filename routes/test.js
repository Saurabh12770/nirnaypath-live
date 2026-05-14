const express = require('express');
const auth = require('../middleware/auth');
const TestResult = require('../models/testResult');
const User = require('../models/user');
const { sendResultEmail } = require('../services/emailService');
const { evaluateBadges } = require('../services/badgeService');
const AdaptiveLearningService = require('../services/adaptiveLearningService');
const router = express.Router();

const crypto = require('crypto');
const TestSession = require('../models/testSession');
const Question = require('../models/question');
const QuestionService = require('../services/questionService');

/**
 * GET /api/test/health
 */
router.get('/health', (req, res) => {
    res.json({ status: 'active', timestamp: new Date() });
});

/**
 * POST /api/test/start
 * HARDENED: Atomic session creation with global uniqueness guarantee and centralized QuestionRuntimeEngine
 */
router.post('/start', auth, async (req, res) => {
    const requestId = crypto.randomBytes(4).toString('hex');
    try {
        const { subject, count, timeLimit, exam, topicId } = req.body;
        if (!subject) return res.status(400).json({ error: 'Subject is required' });

        const subLower = subject.toLowerCase().trim();
        const sessionId = crypto.randomUUID();

        // 1. Unified Selection Pipeline
        const finalQuestions = await QuestionService.getTestQuestions({
            userId: req.user._id,
            subject: subLower,
            count
        });

        if (!finalQuestions || finalQuestions.length === 0) {
            return res.status(404).json({ error: `No questions found for subject: ${subject}.` });
        }

        // 2. Atomic Session Creation
        const session = new TestSession({
            userId: req.user._id,
            sessionId,
            subject: subLower,
            exam: exam || 'General',
            topic: topicId ? topicId.toLowerCase().trim() : null,
            questionCount: finalQuestions.length,
            timeLimit: parseInt(timeLimit) || 3600,
            startTime: new Date(),
            status: 'active',
            questionIds: finalQuestions.map(q => q._id ? q._id.toString() : q.id)
        });

        // Use atomic save with error handling for duplicate sessionId
        try {
            await session.save();
        } catch (saveErr) {
            if (saveErr.code === 11000) {
                return res.status(409).json({ error: 'Session conflict. Please try again.' });
            }
            throw saveErr;
        }

        res.status(201).json({
            sessionId,
            questions: finalQuestions,
            startTime: session.startTime
        });
    } catch (error) {
        console.error(`[TestStart][${requestId}] CRITICAL ERROR:`, error);
        res.status(500).json({ error: 'Internal system failure during test initialization' });
    }
});

// Submit test result
router.post('/submit', auth, async (req, res) => {
    try {
        const { sessionId, exam, subject, testName, score, totalQuestions, correct, incorrect, unattempted, accuracy, answers, mode, modeValue } = req.body;
        
        // --- INPUT VALIDATION ---
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: 'Answers array is required.' });
        }
        // 1. Session Identity Lock (Harden userId + sessionId binding)
        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required for submission.' });
        }

        const session = await TestSession.findOne({ 
            sessionId, 
            userId: req.user._id, 
            status: 'active' 
        });
        
        if (!session) {
            console.log(`[Submit][403] Session not found or not active: sid=${sessionId}, uid=${req.user._id}`);
            return res.status(403).json({ error: 'Invalid, already submitted, or unauthorized test session.' });
        }

        // 2. Time Validation (Server-side source of truth with immutable timestamp)
        const now = new Date();
        const timeTaken = Math.floor((now.getTime() - session.startTime.getTime()) / 1000);
        const GRACE_PERIOD = 120; // Increased to 120s for debugging high latency environments

        if (timeTaken > (session.timeLimit + GRACE_PERIOD)) {
            console.log(`[Submit][403] Session expired: sid=${sessionId}, elapsed=${timeTaken}, limit=${session.timeLimit}`);
            session.status = 'expired';
            await session.save();
            return res.status(403).json({ error: 'Test time expired. Submission rejected.' });
        }

        // 3. Backend Score Calculation (Security Hardening)
        const { loadQuestions } = require('../utils/questionLoader');
        let allAvailableQuestions = [];
        
        // Try DB first for all IDs
        const dbQuestions = await Question.find({ 
            $or: [
                { _id: { $in: session.questionIds.filter(id => id.length === 24) } },
                { id: { $in: session.questionIds } }
            ]
        }).lean();
        
        allAvailableQuestions = dbQuestions;

        // If not all found, fallback to JSON
        if (allAvailableQuestions.length < session.questionIds.length) {
            const fileQuestions = await loadQuestions(session.subject);
            if (fileQuestions) {
                const missingIds = session.questionIds.filter(id => !allAvailableQuestions.find(q => (q._id?.toString() === id || q.id === id)));
                const fromFile = fileQuestions.filter(q => missingIds.includes(q.id));
                allAvailableQuestions = [...allAvailableQuestions, ...fromFile];
            }
        }

        let calcCorrect = 0;
        let calcIncorrect = 0;
        let calcUnattempted = 0;
        
        const validatedAnswers = session.questionIds.map((qId, index) => {
            const question = allAvailableQuestions.find(q => (q._id?.toString() === qId || q.id === qId));
            const userChoice = answers[index]; // Index-based mapping from frontend
            
            const isAttempted = userChoice !== null && userChoice !== undefined;
            const correctOption = question ? (question.correctAnswer !== undefined ? question.correctAnswer : question.answer) : null;
            const isCorrect = isAttempted && String(userChoice) === String(correctOption);
            
            const topic = question?.topic || 'General';
            const topicId = (question?.topicId || topic).toLowerCase().trim();

            if (!isAttempted) calcUnattempted++;
            else if (isCorrect) calcCorrect++;
            else calcIncorrect++;

            return {
                questionId: qId,
                question_en: question?.question_en || question?.text || question?.question,
                question_hi: question?.question_hi,
                selected: userChoice,
                correct: correctOption,
                explanation_en: question?.explanation_en || question?.explanation,
                explanation_hi: question?.explanation_hi,
                isCorrect,
                topic,
                topicId
            };
        });

        const calcTotal = session.questionIds.length;
        const calcScore = calcCorrect; // 1 mark per correct answer, no negative marking yet
        const calcAccuracy = calcTotal > 0 ? Math.round((calcCorrect / (calcCorrect + calcIncorrect || 1)) * 100) : 0;

        // 4. Save Result
        const testResult = new TestResult({
            userId: req.user._id,
            sessionId: session.sessionId, // Link to session
            exam: session.exam,
            subject: session.subject,
            topic: session.topic,
            testName: testName || (session.topic ? `Topic: ${session.topic}` : `${session.exam} - ${session.subject}`),
            score: calcScore,
            totalQuestions: calcTotal,
            correct: calcCorrect,
            incorrect: calcIncorrect,
            unattempted: calcUnattempted,
            accuracy: calcAccuracy,
            timeTaken: timeTaken,
            answers: validatedAnswers,
            mode: session.topic ? 'drill' : (mode || 'full'),
            modeValue: session.topic || modeValue || null
        });

        try {
            await testResult.save();
        } catch (saveErr) {
            if (saveErr.code === 11000) {
                return res.status(409).json({ error: 'Result already exists for this session.' });
            }
            throw saveErr;
        }
        
        // Mark session as submitted (Atomic Update)
        const updatedSession = await TestSession.findOneAndUpdate(
            { sessionId, status: 'active' },
            { $set: { status: 'submitted' } },
            { new: true }
        );

        if (!updatedSession) {
            // This handles the race condition where another request already submitted
            return res.status(409).json({ error: 'Session already submitted or no longer active.' });
        }

        // --- Streak & Badge Logic (HARDENED: Atomic Updates) ---
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        
        // Use findOneAndUpdate to avoid VersionError under high concurrency
        const user = await User.findOneAndUpdate(
            { _id: req.user._id },
            { 
                $set: { lastActiveDate: today },
                // Streak logic needs more care if we want it perfectly atomic, 
                // but at least we avoid crashing.
            },
            { new: true }
        );

        // For streak and badges, we can do best-effort or more complex logic.
        // For now, let's just ensure we don't crash the submission.
        let earnedBadges = [];
        try {
            const totalTests = await TestResult.countDocuments({ userId: req.user._id });
            earnedBadges = evaluateBadges(user, testResult, totalTests);
            
            if (earnedBadges.length > 0) {
                await User.updateOne(
                    { _id: req.user._id },
                    { $addToSet: { badges: { $each: earnedBadges } } }
                );
            }
        } catch (badgeErr) {
            console.error('[BadgeError] Failed to update badges:', badgeErr.message);
        }
        
        // Send email (now queued via BullMQ in emailService)
        await sendResultEmail(user, testResult).catch(err => console.error('[Email] Failed to queue result email:', err));
        
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
