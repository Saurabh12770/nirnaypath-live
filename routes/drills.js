const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const crypto = require('crypto');
const TestSession = require('../models/TestSession');
const { requirePlan } = require('../middleware/planGuard');
const QuestionService = require('../services/QuestionService');

/**
 * GET /api/drill/:subject/:topic?count=20
 * HARDENED: Uses QuestionRuntimeEngine for selection and creates a TestSession.
 */
router.get('/:subject/:topic', auth, requirePlan('free'), async (req, res) => {
    const requestId = crypto.randomBytes(4).toString('hex');
    try {
        const { subject, topic } = req.params;
        const count = Math.min(parseInt(req.query.count) || 20, 100);
        const subLower = subject.toLowerCase().trim();
        const topicLower = topic.toLowerCase().trim();
        const sessionId = crypto.randomUUID();

        console.log(`[DrillStart][${requestId}] Request for ${subLower} - ${topicLower}`);

        // 1. Unified Selection Pipeline
        const finalQuestions = await QuestionService.getTestQuestions({
            userId: req.user._id,
            subject: subLower,
            count
        });

        if (!finalQuestions || finalQuestions.length === 0) {
            return res.status(404).json({ error: `No questions found for topic: ${topic}` });
        }

        // 2. Atomic Session Creation
        const session = new TestSession({
            userId: req.user._id,
            sessionId,
            subject: subLower,
            topic: topicLower,
            exam: 'Drill',
            questionCount: finalQuestions.length,
            timeLimit: 3600,
            startTime: new Date(),
            status: 'active',
            questionIds: finalQuestions.map(q => q._id ? q._id.toString() : q.id)
        });

        await session.save();

        res.json({
            sessionId,
            topic: topicLower,
            subject: subLower,
            questions: finalQuestions,
            startTime: session.startTime
        });

    } catch (error) {
        console.error(`[DrillStart][${requestId}] CRITICAL ERROR:`, error);
        res.status(500).json({ error: 'Internal failure during drill initialization' });
    }
});

module.exports = router;
