const express = require('express');
const router = express.Router();
const { createRateLimiter } = require('../middleware/rateLimiter');
const { loadQuestions } = require('../utils/questionLoader');
const { getCachedData, setCachedData } = require('../middleware/cache');
const { pickQuestions, selectQuestions, shuffleFair } = require('../utils/questionSelectionService');
const auth = require('../middleware/auth');

// Specific dynamic rate limit for questions endpoint
const questionLimiter = createRateLimiter('questions', 60 * 1000, 200);

/**
 * GET /api/questions/:subject?count=100
 * Phase 1/6/7: Returns a deduplicated, integrity-checked question pool.
 * - Authenticated users: history-aware (excludes last 5 tests' questions)
 * - Guests: fair-shuffle + integrity filter only
 * Response shape unchanged for frontend compatibility.
 */
router.get('/questions/:subject', questionLimiter, async (req, res, next) => {
    try {
        const subject = req.params.subject.toLowerCase();
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
        } catch (err) {
            if (req.headers['authorization']) {
                console.warn('[API] JWT verification failed for optional auth:', err.message);
            }
            /* unauthenticated — proceed as guest */
        }

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
        const subject = req.params.subject.toLowerCase();
        const topicsCacheKey = `topics_${subject}`;
        const questionsCacheKey = `questions_${subject}`;

        // Tier 1: Check topics-only cache (TTL 10min = 600s)
        let topics = await getCachedData(topicsCacheKey);
        if (topics && Array.isArray(topics) && topics.length > 0) {
            return res.json(topics);
        }

        // Tier 2: Check MongoDB using index-covered / fast query
        try {
            const Question = require('../models/question');
            const [rawTopicIds, rawTopics] = await Promise.all([
                Question.distinct('topicId', { $or: [{ subjectId: subject }, { subject }] }),
                Question.distinct('topic', { $or: [{ subjectId: subject }, { subject }] })
            ]);

            const merged = [...new Set([...rawTopicIds, ...rawTopics])];
            let dbTopics = merged
                .filter(t => t && t.toLowerCase() !== 'general')
                .map(t => {
                    return t
                        .split(/[_\s-]+/)
                        .map(word => {
                            const w = word.toLowerCase();
                            if (w === 'ssc' || w === 'cgl' || w === 'pcs' || w === 'cbt') {
                                return word.toUpperCase();
                            }
                            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                        })
                        .join(' ');
                });

            dbTopics = [...new Set(dbTopics)].filter(t => !!t).sort();

            if (dbTopics && dbTopics.length > 0) {
                // Cache topics-only list
                await setCachedData(topicsCacheKey, dbTopics, 600);
                return res.json(dbTopics);
            }
        } catch (dbErr) {
            console.warn(`[API] Tier 2 MongoDB distinct failed, falling back to cache/disk:`, dbErr.message);
        }

        // Tier 3: Check questions cache (questions_${subject})
        let questions = await getCachedData(questionsCacheKey);
        if (questions && questions.length > 0) {
            topics = [...new Set(questions.map(q => q.topic).filter(t => !!t))].sort();
            await setCachedData(topicsCacheKey, topics, 600);
            return res.json(topics);
        }

        // Tier 4: Load questions from file (cold path)
        questions = await loadQuestions(subject);
        if (!questions || questions.length === 0) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        // Cache the full questions array
        await setCachedData(questionsCacheKey, questions, 600);

        topics = [...new Set(questions.map(q => q.topic).filter(t => !!t))].sort();
        // Cache topics-only list
        await setCachedData(topicsCacheKey, topics, 600);

        res.json(topics);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

