const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { loadQuestions } = require('../utils/questionLoader');
const { getCachedData, setCachedData } = require('../middleware/cache');
const { pickQuestions, selectQuestions, shuffleFair } = require('../utils/questionSelectionService');
const optionalAuth = require('../middleware/auth');

// Specific rate limit for questions endpoint
const questionLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP for questions, please try again after 1 minute' }
});

/**
 * GET /api/questions/:subject?count=100
 * Phase 1/6/7: Returns a deduplicated, integrity-checked question pool.
 * - Authenticated users: history-aware (excludes last 5 tests' questions)
 * - Guests: fair-shuffle + integrity filter only
 * Response shape unchanged for frontend compatibility.
 */
router.get('/questions/:subject', questionLimiter, async (req, res, next) => {
    try {
        const { subject } = req.params;
        const count = parseInt(req.query.count) || 0; // 0 = serve full pool
        const cacheKey = `questions_${subject}`;

        console.log(`[API] Request for subject: ${subject}`);

        // Load from cache or disk
        let questions = await getCachedData(cacheKey);
        if (!questions) {
            console.log(`[API] Cache miss for: ${subject}. Loading from disk...`);
            questions = await loadQuestions(subject);
            if (!questions || questions.length === 0) {
                return res.status(404).json({ error: 'Questions not found for the requested subject' });
            }
            await setCachedData(cacheKey, questions, 600);
        } else {
            console.log(`[API] Cache hit for: ${subject}`);
        }

        // Resolve authenticated user (optional — guests still get questions)
        let userId = null;
        try {
            const authHeader = req.headers['authorization'];
            if (authHeader) {
                const jwt = require('jsonwebtoken');
                const token = authHeader.replace('Bearer ', '');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded._id || decoded.id || null;
            }
        } catch (_) { /* unauthenticated — proceed as guest */ }

        // Phase 1/6/7: Deduplicate + integrity check + fair shuffle
        if (count > 0 && userId) {
            // Authenticated: full deduplication against last 5 tests
            const { selected, stats } = await pickQuestions(questions, count, userId, subject);
            console.log(`[API] Selection stats:`, stats);
            return res.json(selected);
        } else if (count > 0) {
            // Guest: just integrity + shuffle, no history
            const { selected } = selectQuestions(questions, count);
            return res.json(selected);
        }

        // No count specified → return full pool (shuffled, integrity-filtered)
        // Backward-compatible with existing frontend that handles its own selection
        const { valid } = require('../utils/questionNormalizer').normalizeBank(questions);
        res.json(shuffleFair(valid));

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/subject/:subject/topics
 * Unchanged — returns topic list from the normalized pool.
 */
router.get('/subject/:subject/topics', async (req, res) => {
    try {
        const { subject } = req.params;
        const cacheKey = `questions_${subject}`;

        let questions = await getCachedData(cacheKey);
        if (!questions) {
            questions = await loadQuestions(subject);
            if (questions && questions.length > 0) {
                await setCachedData(cacheKey, questions, 600);
            }
        }

        if (!questions || questions.length === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        const topics = [...new Set(questions.map(q => q.topic).filter(t => !!t))];
        res.json(topics.sort());
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

