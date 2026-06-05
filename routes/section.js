'use strict';

const express    = require('express');
const router     = express.Router();
const auth       = require('../middleware/auth');
const crypto     = require('crypto');
const User        = require('../models/user');
const TestSession = require('../models/testSession');
const sectionsMapping = require('../config/sections');
const { requirePlan }             = require('../middleware/planGuard');
const QuestionService             = require('../services/questionService');
const { normalizePipelineResult } = require('../utils/normalizePipelineResult');
const { sanitizeForClient, inspectPayloadForLeaks } = require('../utils/sanitizeQuestions');

/**
 * GET /api/section/:sectionName?count=75
 *
 * Returns combined randomized questions from multiple subjects in a section.
 *
 * HARDENED (Phase 7):
 *  - FIX #2: Answers stripped via sanitizeForClient() before response
 *  - FIX #3: Pipeline result normalized via normalizePipelineResult()
 *            (eliminates "finalQuestions.map is not a function" crash)
 * BUG-008 FIX: testStartLock mutex guards against concurrent duplicate sessions
 */
router.get('/:sectionName', auth, requirePlan('sectional_tests'), async (req, res) => {
    const requestId = crypto.randomBytes(4).toString('hex');

    try {
        const { sectionName } = req.params;
        const count    = Math.min(parseInt(req.query.count) || 75, 200);
        const subjects = sectionsMapping[sectionName];

        if (!subjects || subjects.length === 0) {
            return res.status(404).json({ error: 'Section not found' });
        }

        // ── ATOMIC PER-USER MUTEX (BUG-008) ──────────────────────────────────────
        // Prevents two concurrent /section/:name requests from both creating sessions.
        // Identical to the pattern used in routes/test.js /start.
        const LOCK_TTL_MS = 15000; // 15s — sufficient for question pipeline + DB write
        const lockExpiry  = new Date(Date.now() + LOCK_TTL_MS);
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
        // ── END MUTEX CLAIM ───────────────────────────────────────────────────────

        try {
            const sessionId = crypto.randomUUID();

            console.log(`[SectionStart][${requestId}] Section "${sectionName}" subjects=[${subjects.join(',')}] count=${count}`);

            // 1. Unified Selection Pipeline (subjects is an array)
            const rawPipelineResult = await QuestionService.getTestQuestions({
                userId:  req.user._id,
                subject: subjects,
                count
            });

            // FIX #3: Normalize — prevents .map crash when pipeline returns object
            const { questions: finalQuestions, warnings } = normalizePipelineResult(
                rawPipelineResult,
                { requestId, section: sectionName }
            );

            if (!finalQuestions || finalQuestions.length === 0) {
                console.warn(`[SectionStart][${requestId}] No questions found for section: "${sectionName}"`);
                return res.status(404).json({ error: 'No questions found for this section' });
            }

            // 2. Atomic Session Creation
            const session = new TestSession({
                userId:        req.user._id,
                sessionId,
                subject:       'sectional',
                exam:          sectionName,
                questionCount: finalQuestions.length,
                timeLimit:     Math.round(count * 60 * 0.8), // 0.8 min per question
                startTime:     new Date(),
                status:        'active',
                questionIds:   finalQuestions.map(q => q.id || (q._id ? q._id.toString() : null))
            });

            await session.save();

            // FIX #2: Strip all answer/explanation fields before sending to client
            const sanitizedQuestions = sanitizeForClient(finalQuestions);

            const responsePayload = {
                sessionId,
                sectionName,
                questions:  sanitizedQuestions,
                timeLimit:  Math.round(count * 0.8 * 60), // in seconds
                startTime:  session.startTime,
            };

            if (warnings && warnings.length > 0) {
                responsePayload.warning = warnings[0];
            }

            // Dev-mode leak detector (no-op in production)
            inspectPayloadForLeaks(responsePayload, `GET /api/section/${sectionName}`);

            res.json(responsePayload);

        } finally {
            // ── RELEASE MUTEX ─────────────────────────────────────────────────────
            // Always release our own lock (success or failure).
            // Only clear our requestId to avoid clobbering a newer lock.
            await User.updateOne(
                { _id: req.user._id, testStartLock: requestId },
                { $set: { testStartLock: null, testStartLockExpiry: null } }
            ).catch(err => console.error(`[SectionStart][${requestId}] Failed to release mutex:`, err.message));
            // ── END MUTEX RELEASE ─────────────────────────────────────────────────
        }

    } catch (error) {
        console.error(`[SectionStart][${requestId}] CRITICAL ERROR:`, error.message, error.stack);
        res.status(500).json({ error: 'Internal failure during sectional test initialization' });
    }
});

module.exports = router;
