'use strict';

const express    = require('express');
const router     = express.Router();
const auth       = require('../middleware/auth');
const crypto     = require('crypto');
const TestSession = require('../models/testSession');
const { requirePlan }              = require('../middleware/planGuard');
const QuestionService              = require('../services/questionService');
const { normalizePipelineResult }  = require('../utils/normalizePipelineResult');
const { sanitizeForClient, inspectPayloadForLeaks } = require('../utils/sanitizeQuestions');

/**
 * GET /api/drill/:subject/:topic
 *
 * HARDENED (Phase 7):
 *  - FIX #2: Answers stripped via sanitizeForClient() before response
 *  - FIX #3: Pipeline result normalized via normalizePipelineResult()
 *            (eliminates "finalQuestions.map is not a function" crash)
 */
router.get('/:subject/:topic', auth, requirePlan('free'), async (req, res) => {
    const requestId = crypto.randomBytes(4).toString('hex');

    try {
        const { subject, topic } = req.params;
        const count    = Math.min(parseInt(req.query.count) || 20, 100);
        const subLower = subject.toLowerCase().trim();
        const topicLower = topic.toLowerCase().trim();
        const sessionId  = crypto.randomUUID();

        console.log(`[DrillStart][${requestId}] Request for "${subLower}" – "${topicLower}" count=${count}`);

        // 1. Unified Selection Pipeline
        const rawPipelineResult = await QuestionService.getTestQuestions({
            userId:  req.user._id,
            subject: subLower,
            topicId: topicLower,
            count
        });

        // FIX #3: Normalize — prevents .map crash when pipeline returns object
        const { questions: finalQuestions, warnings } = normalizePipelineResult(
            rawPipelineResult,
            { requestId, subject: subLower, topic: topicLower }
        );

        if (!finalQuestions || finalQuestions.length === 0) {
            console.warn(`[DrillStart][${requestId}] No questions found for topic: "${topicLower}"`);
            return res.status(404).json({ error: `No questions found for topic: ${topic}` });
        }

        // 2. Atomic Session Creation
        const session = new TestSession({
            userId:        req.user._id,
            sessionId,
            subject:       subLower,
            topic:         topicLower,
            exam:          'Drill',
            questionCount: finalQuestions.length,
            timeLimit:     3600,
            startTime:     new Date(),
            status:        'active',
            questionIds:   finalQuestions.map(q => q.id || (q._id ? q._id.toString() : null))
        });

        await session.save();

        // FIX #2: Strip all answer/explanation fields before sending to client
        const sanitizedQuestions = sanitizeForClient(finalQuestions);

        const responsePayload = {
            sessionId,
            topic:     topicLower,
            subject:   subLower,
            questions: sanitizedQuestions,
            startTime: session.startTime
        };

        if (warnings && warnings.length > 0) {
            responsePayload.warning = warnings[0]; // surface first warning
        }

        // Dev-mode leak detector (no-op in production)
        inspectPayloadForLeaks(responsePayload, `GET /api/drill/${subLower}/${topicLower}`);

        res.json(responsePayload);

    } catch (error) {
        console.error(`[DrillStart][${requestId}] CRITICAL ERROR:`, error);
        res.status(500).json({ error: 'Internal failure during drill initialization' });
    }
});

module.exports = router;
