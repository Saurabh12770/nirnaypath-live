'use strict';

const express         = require('express');
const auth            = require('../middleware/auth');
const TestResult      = require('../models/testResult');
const User            = require('../models/user');
const router          = express.Router();
const crypto          = require('crypto');
const TestSession     = require('../models/testSession');
const Question        = require('../models/question');
const QuestionService = require('../services/questionService');
const { sanitizeForClient }        = require('../utils/sanitizeQuestions');

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

        // ── ATOMIC PER-USER MUTEX ────────────────────────────────────────────────
        // Atomically claim the testStartLock on the User document.
        // Only succeeds if: no lock exists, OR the existing lock has expired (TTL).
        // This prevents two concurrent /start requests from both creating sessions.
        const LOCK_TTL_MS = 15000; // 15s — plenty for question pipeline + DB write
        const lockExpiry = new Date(Date.now() + LOCK_TTL_MS);
        const lockClaimed = await User.findOneAndUpdate(
            {
                _id: req.user._id,
                $or: [
                    { testStartLock: null },
                    { testStartLockExpiry: { $lt: new Date() } }
                ]
            },
            { $set: { testStartLock: requestId, testStartLockExpiry: lockExpiry } },
            { new: false }
        );

        if (!lockClaimed) {
            return res.status(409).json({ error: 'A test session is already being started. Please wait a moment.' });
        }
        // ── END MUTEX CLAIM ──────────────────────────────────────────────────────

        try {
            // 1. Unified Selection Pipeline
            const rawPipelineResult = await QuestionService.getTestQuestions({
                userId: req.user._id,
                subject: subLower,
                topicId,
                count
            });

            const finalQuestions = rawPipelineResult || [];
            const warnings = [];

            if (finalQuestions.length === 0) {
                return res.status(404).json({ error: `No questions found for subject: ${subject}.` });
            }

            // FIX #2: Strip all answer/explanation fields via centralized sanitizer
            const sanitizedQuestions = sanitizeForClient(finalQuestions);
            const warning = warnings && warnings.length > 0 ? warnings[0] : null;

            // Deactivate any existing active session for the user (safe inside mutex)
            await TestSession.updateMany(
                { userId: req.user._id, status: 'active' },
                { $set: { status: 'expired' } }
            );

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
        } finally {
            // ── RELEASE MUTEX ────────────────────────────────────────────────────
            // Always release the lock after the operation (success or failure).
            // Only release our own lock to prevent clobbering a newer lock.
            await User.updateOne(
                { _id: req.user._id, testStartLock: requestId },
                { $set: { testStartLock: null, testStartLockExpiry: null } }
            ).catch(err => console.error(`[TestStart][${requestId}] Failed to release mutex:`, err.message));
            // ── END MUTEX RELEASE ─────────────────────────────────────────────────
        }
    } catch (error) {
        console.error(`[TestStart][${requestId}] CRITICAL ERROR:`, error);
        res.status(500).json({ error: 'Internal system failure during test initialization' });
    }
});

// Submit test result
router.post('/submit', auth, async (req, res) => {
    let sessionUpdated = false;
    let resultSaved = false;
    let sessionId = null;
    try {
        const body = req.body || {};
        sessionId = body.sessionId;
        const { exam, subject, testName, score, totalQuestions, correct, incorrect, unattempted, accuracy, answers, mode, modeValue } = body;
        
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

        // Perform the atomic status update from 'active' or 'expired' to 'submitted' first to block duplicate requests.
        // This ensures late submissions can still be recorded rather than throwing a 403 error.
        const session = await TestSession.findOneAndUpdate(
            { sessionId, userId: req.user._id, status: { $in: ['active', 'expired'] } },
            { $set: { status: 'submitted' } },
            { new: false } // returns the original session before update so we can use its details
        );
        
        if (!session) {
            // SRE: Retry mechanism for duplicate submission race condition.
            // If another request is currently processing the submit flow, the TestResult might
            // not be saved yet. We poll up to 5 times (total 1 second) to allow it to finish.
            let existingResult = null;
            for (let i = 0; i < 5; i++) {
                existingResult = await TestResult.findOne({ sessionId, userId: req.user._id });
                if (existingResult) break;
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            if (existingResult) {
                return res.status(200).json({ 
                    message: 'Test result saved successfully', 
                    resultId: existingResult._id,
                    streak: req.user.streakCount || 0,
                    newBadges: []
                });
            }
            console.log(`[Submit][403] Session not found or not active: sid=${sessionId}, uid=${req.user._id}`);
            return res.status(403).json({ error: 'Invalid, already submitted, or unauthorized test session.' });
        }

        sessionUpdated = true;

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
        
        // SRE Resilience: Instead of rejecting late submissions with 403 and wiping out student progress,
        // we accept the submission gracefully. This prevents any data loss from network latency or late client pings.
        let isLate = false;
        if (timeTaken > session.timeLimit) {
            isLate = true;
            console.log(`[Submit] Late submission detected gracefully processed: sid=${sessionId}, elapsed=${timeTaken}s, limit=${session.timeLimit}s.`);
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
                const missingIds = session.questionIds.filter(id => !allAvailableQuestions.find(q => (q._id?.toString() === id || String(q.id || '').toLowerCase() === String(id).toLowerCase())));
                const fromFile = fileQuestions.filter(q => missingIds.map(id => String(id).toLowerCase()).includes(String(q.id || '').toLowerCase()));
                allAvailableQuestions = [...allAvailableQuestions, ...fromFile];
            }
        }

        let calcCorrect = 0;
        let calcIncorrect = 0;
        let calcUnattempted = 0;
        
        const validatedAnswers = session.questionIds.map((qId, index) => {
            const qIdLower = String(qId).toLowerCase();
            const question = allAvailableQuestions.find(q => (q._id?.toString() === qId || String(q.id || '').toLowerCase() === qIdLower));
            
            // Query only from normalizedAnswers
            const ansObj = normalizedAnswers.find(a => a && String(a.questionId).toLowerCase() === qIdLower);
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
            resultSaved = true;
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

        // --- Simple Badge Evaluation (inline — no external service) ---
        let earnedBadges = [];
        try {
            const totalTests = await TestResult.countDocuments({ userId: req.user._id });

            // Evaluate milestone badges
            const BADGE_RULES = [
                { key: 'test30',     condition: () => totalTests >= 30 },
                { key: 'test100',    condition: () => totalTests >= 100 },
                { key: 'streak7',    condition: () => newStreak >= 7 },
                { key: 'perfect100', condition: () => calcAccuracy >= 100 }
            ];

            const user = await User.findById(req.user._id).select('badges').lean();
            const existingBadges = new Set(user?.badges || []);
            const newBadges = BADGE_RULES
                .filter(r => r.condition() && !existingBadges.has(r.key))
                .map(r => r.key);

            if (newBadges.length > 0) {
                await User.updateOne(
                    { _id: req.user._id },
                    { $addToSet: { badges: { $each: newBadges } } }
                );
                earnedBadges = newBadges;
            }
        } catch (gamifyErr) {
            console.error('[Badge] Failed to evaluate badges:', gamifyErr.message);
        }
        
        res.status(201).json({ 
            message: 'Test result saved successfully', 
            resultId: testResult._id,
            streak: newStreak,
            newBadges: earnedBadges
        });
    } catch (error) {
        if (sessionUpdated && !resultSaved) {
            try {
                await TestSession.updateOne(
                    { sessionId, userId: req.user._id },
                    { $set: { status: 'active' } }
                );
            } catch (rollbackErr) {
                console.error('[SubmitRollback] Failed to rollback session status:', rollbackErr.message);
            }
        }
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

        // 2. Persist the violation in session document
        const mapType = {
            'tab_switch': 'tab_switch',
            'window_blur': 'window_blur',
            'copy_paste': 'clipboard_usage',
            'right_click': 'shortcut_usage',
            'devtools_open': 'devtools_detected',
            'fullscreen_exit': 'fullscreen_exit',
            'multiple_sessions': 'multiple_tabs'
        };
        const violationType = mapType[safeType] || 'tab_switch';
        
        session.violations.push({
            violationType,
            timestamp: new Date(),
            userAgent: req.get('User-Agent') || '',
            ip: req.ip || ''
        });
        session.violationCount = (session.violationCount || 0) + 1;
        
        const violationCount = session.violationCount;
        let locked = false;
        
        if (violationCount >= VIOLATION_LOCK_THRESHOLD) {
            session.status = 'expired';
            session.locked = true;
            locked = true;
            console.warn(
                `[ANTI_CHEAT] SESSION LOCKED: user=${req.user._id} ` +
                `session=${sessionId} violations=${violationCount}`
            );
        }
        
        await session.save();

        console.log(
            `[ANTI_CHEAT] Violation recorded: user=${req.user._id} ` +
            `session=${sessionId} type=${safeType}`
        );

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
    const { sessionId, clientState, metrics, answers, markedForReview } = req.body || {};
    if (!sessionId || typeof sessionId !== 'string') {
        return res.status(400).json({ error: 'sessionId required and must be a string' });
    }
    if (!req.user || !req.user._id) {
        return res.status(401).json({ error: 'Unauthorized: missing user identifier' });
    }

    try {
        const session = await TestSession.findOne({ sessionId, userId: req.user._id });
        if (!session) return res.status(404).json({ error: 'Session not found' });
        
        if (session.locked || session.status !== 'active') {
            return res.status(403).json({ error: 'Session terminated', status: session.status });
        }

        // 1. Authoritative Clock Sync
        const now = new Date();
        const startTime = session.startTime instanceof Date ? session.startTime : new Date(session.startTime || session.createdAt || now);
        const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        const timeLimit = typeof session.timeLimit === 'number' ? session.timeLimit : 0;
        let timeLeft = timeLimit - elapsedSeconds;
        
        let isExpired = false;
        if (timeLeft <= 0) {
            timeLeft = 0;
            isExpired = true;
            session.status = 'expired';
        }

        // 2. Autosave State Merger
        if (answers && typeof answers === 'object' && !Array.isArray(answers)) {
            if (!session.answers || typeof session.answers.set !== 'function') {
                session.answers = new Map();
            }
            for (const [key, val] of Object.entries(answers)) {
                if (key !== undefined) {
                    session.answers.set(String(key), val);
                }
            }
        }
        if (markedForReview && Array.isArray(markedForReview)) {
            session.markedForReview = markedForReview.map(item => Number(item)).filter(item => !isNaN(item));
        }

        // 3. Telemetry & Integrity Injection (Phase 10B)
        // If client sends riskScore >= 100, enforce server lock immediately.
        if (metrics && typeof metrics === 'object' && typeof metrics.riskScore === 'number' && metrics.riskScore >= 100) {
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
        console.error('[HEARTBEAT] Error details:', error);
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
