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
    try {
        const { subject } = req.params;
        const cacheKey = `questions_${subject}`;

        console.log(`[API] Request for subject: ${subject}`);

        // Check in-memory cache first
        const cachedData = getCachedData(cacheKey);
        if (cachedData) {
            console.log(`[API] Cache hit for: ${subject}`);
            return res.json(cachedData);
        }

        console.log(`[API] Cache miss for: ${subject}. Loading from disk...`);

        // Load from disk if not cached
        const questions = await loadQuestions(subject);
        
        if (!questions || questions.length === 0) {
            return res.status(404).json({ error: 'Questions not found for the requested subject' });
        }

        // Store in cache with 10 minutes TTL
        setCachedData(cacheKey, questions, 600);

        res.json(questions);
    } catch (error) {
        next(error);
    }
});

router.get('/subject/:subject/topics', async (req, res) => {
    try {
        const { subject } = req.params;
        const cacheKey = `questions_${subject}`;

        let questions = getCachedData(cacheKey);
        if (!questions) {
            questions = await loadQuestions(subject);
            if (questions) {
                setCachedData(cacheKey, questions, 600);
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
