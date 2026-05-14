const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { loadQuestions } = require('../utils/questionLoader');
const { getCachedData, setCachedData } = require('../middleware/cache');

// Specific rate limit for questions endpoint
const questionLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 200, // Limit each IP to 200 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP for questions, please try again after 1 minute' }
});

router.get('/questions/:subject', questionLimiter, async (req, res, next) => {
    const { trace, CATEGORIES } = require('../utils/runtimeTrace');
    try {
        const { subject } = req.params;
        const subLower = subject.toLowerCase().trim();
        const cacheKey = `questions_${subLower}`;

        trace(CATEGORIES.QUESTION_FLOW, 'Question Fetch Requested', { subject: subLower });

        // 1. Check Cache
        const cachedData = await getCachedData(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }

        // 2. Fetch from MongoDB (Source of Truth)
        const Question = require('../models/Question');
        let questions = await Question.find({ 
            $or: [{ subjectId: subLower }, { subject: subLower }] 
        }).lean();

        // 3. Fallback to JSON if MongoDB is empty
        if (!questions || questions.length === 0) {
            trace(CATEGORIES.QUESTION_FLOW, 'MongoDB Pool Empty, falling back to JSON', { subject: subLower });
            const { loadQuestions } = require('../utils/questionLoader');
            questions = await loadQuestions(subLower);
        }

        if (!questions || questions.length === 0) {
            return res.status(404).json({ error: 'Questions not found for the requested subject' });
        }

        // 4. Cache & Return
        await setCachedData(cacheKey, questions, 600);
        res.json(questions);
    } catch (error) {
        trace(CATEGORIES.QUESTION_FLOW, 'Question Fetch Error', { error: error.message });
        next(error);
    }
});

router.get('/subject/:subject/topics', questionLimiter, async (req, res) => {
    try {
        const { subject } = req.params;
        const cacheKey = `questions_${subject}`;

        let questions = await getCachedData(cacheKey);
        if (!questions) {
            questions = await loadQuestions(subject);
            if (questions) {
                await setCachedData(cacheKey, questions, 600);
            }
        }

        if (!questions) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        const topics = [...new Set(questions.map(q => q.topic).filter(t => !!t))];
        res.json(topics.sort());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
