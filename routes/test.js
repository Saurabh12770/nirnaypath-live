'use strict';

const express    = require('express');
const auth       = require('../middleware/auth');
const TestResult = require('../models/testResult');
const User       = require('../models/user');
const { sendResultEmail }   = require('../services/emailService');
const { evaluateBadges }    = require('../services/badgeService');
const AdaptiveLearningService = require('../services/adaptiveLearningService');
const XPService = require('../services/xpService');
const AchievementService = require('../services/achievementService');
const notificationService = require('../services/notificationService');
const RecommendationService = require('../server/services/recommendationService');
const router  = express.Router();
const crypto  = require('crypto');
const TestSession   = require('../models/testSession');
const Question      = require('../models/question');
const QuestionService = require('../services/questionService');
const TestViolation   = require('../models/testViolation');
const { normalizePipelineResult }  = require('../utils/normalizePipelineResult');
const { sanitizeForClient, inspectPayloadForLeaks } = require('../utils/sanitizeQuestions');

/** Number of violations that trigger a session lock */
const VIOLATION_LOCK_THRESHOLD = parseInt(process.env.VIOLATION_LOCK_THRESHOLD || '3');

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
    const { yieldIfLagging } = require('../utils/eventLoopSafeguard');
    await yieldIfLagging(50); // SRE: yield thread control under high event-loop lag

    const requestId = crypto.randomBytes(4).toString('hex');
    try {
        const { subject, count, timeLimit, exam, topicId } = req.body;
        if (!subject) return res.status(400).json({ error: 'Subject is required' });

        const subLower = subject.toLowerCase().trim();
        const sessionId = crypto.randomUUID();

        // 1. Unified Selection Pipeline
        const rawPipelineResult = await QuestionService.getTestQuestions({
            userId: req.user._id,
            subject: subLower,
            topicId,
            count
        });

        // FIX #3: normalize contract — prevents .map crash
        const { questions: finalQuestions, warnings } = normalizePipelineResult(
            rawPipelineResult,
            { requestId, subject: subLower }
        );

        if (!finalQuestions || finalQuestions.length === 0) {
            return res.status(404).json({ error: `No questions found for subject: ${subject}.` });
        }

        // FIX #2: Strip all answer/explanation fields via centralized sanitizer
        const sanitizedQuestions = sanitizeForClient(finalQuestions);
        const warning = warnings && warnings.length > 0 ? warnings[0] : null;

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
            questionIds: finalQuestions.map(q => q.id || (q._id ? q._id.toString() : null))
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

        const responsePayload = {
            sessionId,
            questions: sanitizedQuestions,
            startTime: session.startTime
        };
        if (warning) {
            responsePayload.warning = warning;
        }
        res.status(201).json(responsePayload);
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
        if (!answers || (typeof answers !== 'object' && !Array.isArray(answers))) {
            console.error(`[Submit][400] Validation failed: answers payload is missing or invalid. Received type: ${typeof answers}`);
            return res.status(400).json({ error: 'Answers payload must be an array or an object.' });
        }
        // 1. Session Identity Lock (Harden userId + sessionId binding)
        if (!sessionId) {
            console.error('[Submit][400] Validation failed: sessionId is missing.');
            return res.status(400).json({ error: 'Session ID is required for submission.' });
        }

        // Perform the atomic status update from 'active' to 'submitted' first to block duplicate requests
        const session = await TestSession.findOneAndUpdate(
            { sessionId, userId: req.user._id, status: 'active' },
            { $set: { status: 'submitted' } },
            { new: false } // returns the original session before update so we can use its details
        );
        
        if (!session) {
            console.log(`[Submit][403] Session not found or not active: sid=${sessionId}, uid=${req.user._id}`);
            return res.status(403).json({ error: 'Invalid, already submitted, or unauthorized test session.' });
        }

        // --- IMMEDIATELY NORMALIZE INTO STANDARD INTERNAL STRUCTURE ---
        let normalizedAnswers = [];
        if (Array.isArray(answers)) {
            normalizedAnswers = answers.map((a, idx) => {
                if (a && typeof a === 'object') {
                    const qId = a.questionId || a.id || (session.questionIds && session.questionIds[idx]);
                    const ansVal = a.userAnswer !== undefined ? a.userAnswer : (a.selected !== undefined ? a.selected : a.answer);
                    return { questionId: String(qId), answer: ansVal };
                } else {
                    const qId = session.questionIds && session.questionIds[idx];
                    return { questionId: String(qId), answer: a };
                }
            });
        } else if (answers && typeof answers === 'object') {
            normalizedAnswers = Object.entries(answers).map(([qId, val]) => {
                if (val && typeof val === 'object') {
                    const ansVal = val.userAnswer !== undefined ? val.userAnswer : (val.selected !== undefined ? val.selected : val.answer);
                    return { questionId: String(qId), answer: ansVal };
                }
                return { questionId: String(qId), answer: val };
            });
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
            
            // Query only from normalizedAnswers
            const ansObj = normalizedAnswers.find(a => a && String(a.questionId) === String(qId));
            const userChoice = ansObj ? ansObj.answer : undefined;
            
            const isAttempted = userChoice !== null && userChoice !== undefined;
            let correctOption = null;
            let isCorrect = false;

            if (question) {
                if (question.correctAnswer !== undefined && question.correctAnswer !== null) {
                    correctOption = question.correctAnswer;
                } else if (question.correctOption !== undefined && question.correctOption !== null) {
                    const optIdx = ['a', 'b', 'c', 'd'].indexOf(String(question.correctOption).toLowerCase().trim());
                    correctOption = optIdx !== -1 ? optIdx : question.correctOption;
                } else if (question.answer !== undefined && question.answer !== null) {
                    correctOption = question.answer;
                }
            }
            
            if (correctOption !== null && isAttempted) {
                isCorrect = String(userChoice) === String(correctOption);
            }
            
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
        
        // Note: Session status was atomically updated to 'submitted' at the start of submission to prevent races.
        const updatedSession = session;

        // --- Streak & Badge Logic (HARDENED: Atomic Updates) ---
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        
        // Fetch original user info to check their last active date for streak calculations
        const originalUser = await User.findById(req.user._id).select('lastActiveDate streakCount').lean();
        let newStreak = originalUser ? (originalUser.streakCount || 0) : 0;
        let gapDays = 0;

        if (originalUser && originalUser.lastActiveDate) {
            const lastActive = new Date(originalUser.lastActiveDate);
            const lastActiveUTC = new Date(Date.UTC(lastActive.getUTCFullYear(), lastActive.getUTCMonth(), lastActive.getUTCDate()));
            const diffTime = today - lastActiveUTC;
            gapDays = Math.floor(diffTime / 86400000);

            if (gapDays === 1) {
                newStreak += 1;
            } else if (gapDays > 1) {
                newStreak = 1;
            }
        } else {
            newStreak = 1;
        }

        // Use findOneAndUpdate to avoid VersionError under high concurrency
        const user = await User.findOneAndUpdate(
            { _id: req.user._id },
            { 
                $set: { lastActiveDate: today, streakCount: newStreak }
            },
            { new: true }
        );

        // For streak and badges, we can do best-effort or more complex logic.
        // For now, let's just ensure we don't crash the submission.
        let earnedBadges = [];
        try {
            const totalTests = await TestResult.countDocuments({ userId: req.user._id });
            
            // 1. Award XP for test completion & accuracy
            const xpAwards = await XPService.awardForTestSubmit(req.user._id, testResult);
            
            // 2. Award XP for streak if milestone hit
            const streakAwards = await XPService.awardForStreak(req.user._id, newStreak);
            xpAwards.push(...streakAwards);

            // 3. Award XP for comeback if milestone hit
            if (gapDays > 1) {
                const comebackAwards = await XPService.awardForComeback(req.user._id, gapDays);
                xpAwards.push(...comebackAwards);
            }

            // 4. Update current streak in UserXP record
            const xpRecord = await XPService.getOrCreate(req.user._id);
            xpRecord.currentStreak = newStreak;
            if (newStreak > xpRecord.longestStreak) {
                xpRecord.longestStreak = newStreak;
            }
            await xpRecord.save();

            // 5. Evaluate achievements
            const unlockedAchievements = await AchievementService.evaluateAfterTest(req.user._id, testResult, totalTests, newStreak);
            
            // 6. Notify user of achievements
            for (const ach of unlockedAchievements) {
                earnedBadges.push(ach.name);
                await notificationService.sendAchievement(req.user._id, ach).catch(() => {});
            }

            // 7. Check if user leveled up
            const hasLevelUp = xpAwards.some(a => a.levelUp);
            if (hasLevelUp) {
                const maxAwardedLevel = Math.max(...xpAwards.filter(a => a.levelUp).map(a => a.level));
                await notificationService.sendLevelUp(req.user._id, maxAwardedLevel).catch(() => {});
            }

            // 8. If new badges were earned via legacy badgeService too, combine them
            const legacyBadges = evaluateBadges(user, testResult, totalTests);
            if (legacyBadges.length > 0) {
                await User.updateOne(
                    { _id: req.user._id },
                    { $addToSet: { badges: { $each: legacyBadges } } }
                );
                for (const badge of legacyBadges) {
                    if (!earnedBadges.includes(badge)) {
                        earnedBadges.push(badge);
                    }
                }
            }

            // 9. Invalidate AI Recommendations Cache to trigger fresh predictions on dashboard reload
            RecommendationService.invalidateCache(req.user._id);

        } catch (gamifyErr) {
            console.error('[GamificationError] Failed to process gamification rewards:', gamifyErr.message);
        }
        
        // Send email (now queued via BullMQ in emailService)
        await sendResultEmail(user, testResult).catch(err => console.error('[Email] Failed to queue result email:', err));
        
        res.status(201).json({ 
            message: 'Test result saved successfully', 
            resultId: testResult._id,
            streak: newStreak,
            newBadges: earnedBadges
        });
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/test/violation
 * ========================
 * PHASE 4 — Real backend anti-cheat.
 * Receives integrity violation events from the frontend, persists them to
 * MongoDB, and auto-locks the session after VIOLATION_LOCK_THRESHOLD is reached.
 *
 * Body: { sessionId, type, detail }
 */
router.post('/violation', auth, async (req, res) => {
    const { sessionId, type, detail } = req.body;

    if (!sessionId || !type) {
        return res.status(400).json({ error: 'sessionId and type are required' });
    }

    const ALLOWED_TYPES = [
        'tab_switch', 'window_blur', 'copy_paste', 'right_click',
        'devtools_open', 'fullscreen_exit', 'multiple_sessions',
        'time_anomaly', 'other'
    ];
    const safeType = ALLOWED_TYPES.includes(type) ? type : 'other';

    try {
        // 1. Verify session belongs to user and is still active
        const session = await TestSession.findOne({
            sessionId,
            userId: req.user._id
        });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (session.status !== 'active') {
            return res.status(409).json({
                error: 'Session is no longer active',
                status: session.status
            });
        }

        // 2. Persist the violation
        await TestViolation.create({
            userId:    req.user._id,
            sessionId,
            type:      safeType,
            detail:    String(detail || '').slice(0, 500), // cap length
            ipAddress: req.ip || '',
            userAgent: req.get('User-Agent') || ''
        });

        console.log(
            `[ANTI_CHEAT] Violation recorded: user=${req.user._id} ` +
            `session=${sessionId} type=${safeType}`
        );

        // 3. Count total violations for this session
        const violationCount = await TestViolation.countDocuments({ sessionId });

        let locked = false;
        if (violationCount >= VIOLATION_LOCK_THRESHOLD) {
            // 4. Lock the session — prevents further submission
            await TestSession.findOneAndUpdate(
                { sessionId, status: 'active' },
                { $set: { status: 'expired' } }
            );
            locked = true;
            console.warn(
                `[ANTI_CHEAT] SESSION LOCKED: user=${req.user._id} ` +
                `session=${sessionId} violations=${violationCount}`
            );
        }

        return res.json({
            recorded: true,
            violationCount,
            locked,
            message: locked
                ? 'Session locked due to repeated integrity violations.'
                : `Violation recorded (${violationCount}/${VIOLATION_LOCK_THRESHOLD}).`
        });

    } catch (error) {
        console.error('[ANTI_CHEAT] Error recording violation:', error.message);
        res.status(500).json({ error: 'Failed to record violation' });
    }
});



/**
 * POST /api/test/heartbeat
 * Enterprise unified endpoint handling Telemetry, Integrity Validation, Clock Sync, and Autosave.
 */
router.post('/heartbeat', auth, async (req, res) => {
    const { sessionId, clientState, metrics, answers, markedForReview } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

    try {
        const session = await TestSession.findOne({ sessionId, userId: req.user._id });
        if (!session) return res.status(404).json({ error: 'Session not found' });
        
        if (session.locked || session.status !== 'active') {
            return res.status(403).json({ error: 'Session terminated', status: session.status });
        }

        // 1. Authoritative Clock Sync
        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - session.startTime.getTime()) / 1000);
        let timeLeft = session.timeLimit - elapsedSeconds;
        
        let isExpired = false;
        if (timeLeft <= 0) {
            timeLeft = 0;
            isExpired = true;
            session.status = 'expired';
        }

        // 2. Autosave State Merger
        if (answers) {
            for (const [key, val] of Object.entries(answers)) {
                session.answers.set(key, val);
            }
        }
        if (markedForReview && Array.isArray(markedForReview)) {
            session.markedForReview = markedForReview;
        }

        // 3. Telemetry & Integrity Injection (Phase 10B)
        // If client sends riskScore >= 100, enforce server lock immediately.
        if (metrics && metrics.riskScore >= 100) {
             session.status = 'terminated';
             session.locked = true;
             session.terminatedReason = 'integrity_failure_heartbeat';
        }

        await session.save();
        
        res.json({
            success: true,
            serverTime: now,
            elapsedSeconds,
            timeLeft,
            isExpired,
            status: session.status
        });
    } catch (error) {
        console.error('[HEARTBEAT] Error:', error.message);
        res.status(500).json({ error: 'Heartbeat failed' });
    }
});

/**
 * POST /api/test/autosave
 * Continuously save the student's progress and marked-for-review state.
 */
router.post('/autosave', auth, async (req, res) => {
    const { sessionId, answers, markedForReview } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

    try {
        const session = await TestSession.findOne({ sessionId, userId: req.user._id, status: 'active' });
        if (!session) return res.status(404).json({ error: 'Active session not found' });

        if (answers) {
            for (const [key, val] of Object.entries(answers)) {
                session.answers.set(key, val);
            }
        }
        if (markedForReview && Array.isArray(markedForReview)) {
            session.markedForReview = markedForReview;
        }

        await session.save();
        res.json({ success: true });
    } catch (error) {
        console.error('[AUTOSAVE] Error:', error.message);
        res.status(500).json({ error: 'Autosave failed' });
    }
});

/**
 * GET /api/test/sync/:sessionId
 * Returns the authoritative server time, elapsed time, and the latest saved answers.
 * Essential for resuming crashed exams safely.
 */
router.get('/sync/:sessionId', auth, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await TestSession.findOne({ sessionId, userId: req.user._id });
        if (!session) return res.status(404).json({ error: 'Session not found' });

        const now = new Date();
        const elapsedSeconds = Math.floor((now.getTime() - session.startTime.getTime()) / 1000);
        let timeLeft = session.timeLimit - elapsedSeconds;
        
        // Force expiry strictly if time is up
        let isExpired = false;
        if (timeLeft <= 0) {
            timeLeft = 0;
            isExpired = true;
            if (session.status === 'active') {
                session.status = 'expired';
                await session.save();
            }
        }

        res.json({
            serverTime: now,
            elapsedSeconds,
            timeLeft,
            isExpired,
            status: session.status,
            answers: session.answers || {},
            markedForReview: session.markedForReview || []
        });
    } catch (error) {
        console.error('[SYNC] Error:', error.message);
        res.status(500).json({ error: 'Sync failed' });
    }
});

module.exports = router;
