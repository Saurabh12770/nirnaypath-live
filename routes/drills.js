const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { loadQuestions } = require('../utils/questionLoader');
const { getCachedData, setCachedData } = require('../middleware/cache');
const { requirePlan } = require('../middleware/planGuard');

/**
 * GET /api/drill/:subject/:topic?count=20
 * Returns questions filtered by topic for a given subject.
 */
router.get('/:subject/:topic', auth, requirePlan('free'), async (req, res) => {
    try {
        const { subject, topic } = req.params;
        const count = parseInt(req.query.count) || 20;
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

        // Filter by topic (case-insensitive)
        const topicLower = topic.toLowerCase();
        const filtered = questions.filter(q => 
            q.topic && q.topic.toLowerCase() === topicLower
        );

        if (filtered.length === 0) {
            return res.status(404).json({ error: `No questions found for topic: ${topic}` });
        }

        // Randomly select 'count' questions
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, Math.min(count, shuffled.length));

        res.json(selected);
    } catch (error) {
        console.error('Drill error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
