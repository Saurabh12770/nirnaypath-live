const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getCachedData, setCachedData } = require('../middleware/cache');
const { requirePlan } = require('../middleware/planGuard');
const Question = require('../models/Question');

/**
 * GET /api/drill/:subject/:topic?count=20
 * Returns questions filtered by topic for a given subject.
 */
router.get('/:subject/:topic', auth, requirePlan('free'), async (req, res) => {
    try {
        const { subject, topic } = req.params;
        const count = Math.min(parseInt(req.query.count) || 20, 100);
        
        // Use MongoDB aggregation for efficient random sampling with filters
        const questions = await Question.aggregate([
            { 
                $match: { 
                    subject: subject.toLowerCase(),
                    topic: { $regex: new RegExp(`^${topic}$`, 'i') }
                } 
            },
            { $sample: { size: count } }
        ]);

        if (!questions || questions.length === 0) {
            return res.status(404).json({ error: `No questions found for topic: ${topic}` });
        }

        res.json(questions);
    } catch (error) {
        console.error('Drill error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
