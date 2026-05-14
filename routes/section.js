const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const sectionsMapping = require('../config/sections');
const { requirePlan } = require('../middleware/planGuard');
const QuestionService = require('../services/QuestionService');
const crypto = require('crypto');
const TestSession = require('../models/TestSession');

/**
 * GET /api/section/:sectionName?count=75
 * Returns combined randomized questions from multiple subjects in a section.
 */
router.get('/:sectionName', auth, requirePlan('sectional_tests'), async (req, res) => {
    try {
        const { sectionName } = req.params;
        const count = parseInt(req.query.count) || 75;
        const subjects = sectionsMapping[sectionName];

        if (!subjects || subjects.length === 0) {
            return res.status(404).json({ error: 'Section not found' });
        }

        const sessionId = crypto.randomUUID();

        // 1. Unified Selection Pipeline
        const finalQuestions = await QuestionService.getTestQuestions({
            userId: req.user._id,
            subject: subjects, // Array of subjects
            count
        });

        if (!finalQuestions || finalQuestions.length === 0) {
            return res.status(404).json({ error: 'No questions found for this section' });
        }

        // 2. Atomic Session Creation
        const session = new TestSession({
            userId: req.user._id,
            sessionId,
            subject: 'sectional',
            exam: sectionName,
            questionCount: finalQuestions.length,
            timeLimit: Math.round(count * 60 * 0.8), // 0.8 min per question
            startTime: new Date(),
            status: 'active',
            questionIds: finalQuestions.map(q => q._id ? q._id.toString() : q.id)
        });

        await session.save();

        res.json({
            sessionId,
            questions: finalQuestions,
            timeLimit: count * 0.8, // Approx 48 seconds per question
            sectionName: sectionName,
            startTime: session.startTime
        });
    } catch (error) {
        const { trace, CATEGORIES } = require('../utils/runtimeTrace');
        trace(CATEGORIES.QUESTION_FLOW, 'Sectional Test Error', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
