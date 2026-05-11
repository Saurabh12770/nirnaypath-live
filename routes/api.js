const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { getCachedData, setCachedData } = require('../middleware/cache');
const Question = require('../models/Question');

// Specific rate limit for questions endpoint
const questionLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 200, // Limit each IP to 200 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP for questions, please try again after 1 minute' }
});

router.get('/questions/:subject', questionLimiter, async (req, res, next) => {
    try {
        const { subject } = req.params;
        const count = Math.min(parseInt(req.query.count) || 50, 200);
        const cacheKey = `qs_${subject.toLowerCase()}_${count}`;
        
        // Cache Check
        const cached = await getCachedData(cacheKey);
        if (cached) return res.json(cached);

        const questions = await Question.aggregate([
            { $match: { subject: subject.toLowerCase() } },
            { $sample: { size: count } }
        ]);

        if (!questions || questions.length === 0) {
            return res.status(404).json({ error: 'No questions found for this subject' });
        }

        // Cache for 10 minutes
        await setCachedData(cacheKey, questions, 600);

        res.json(questions);
    } catch (err) {
        next(err);
    }
});

router.get('/subject/:subject/topics', async (req, res) => {
    try {
        const { subject } = req.params;
        const cacheKey = `topics_${subject.toLowerCase()}`;

        let topics = await getCachedData(cacheKey);
        if (topics) return res.json(topics);

        const questions = await Question.find({ subject: subject.toLowerCase() }).lean();
        if (!questions || questions.length === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        const uniqueTopics = [...new Set(questions.map(q => q.topic).filter(t => !!t))].sort();
        
        // Cache for 1 hour
        await setCachedData(cacheKey, uniqueTopics, 3600);

        res.json(uniqueTopics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
