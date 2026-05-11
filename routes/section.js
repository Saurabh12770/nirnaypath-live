const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const sectionsMapping = require('../config/sections');
const { getCachedData, setCachedData } = require('../middleware/cache');
const { requirePlan } = require('../middleware/planGuard');
const Question = require('../models/Question');

/**
 * GET /api/section/:sectionName?count=75
 * Returns combined randomized questions from multiple subjects in a section.
 */
router.get('/:sectionName', auth, requirePlan('pro_monthly'), async (req, res) => {
    try {
        const { sectionName } = req.params;
        const count = Math.min(parseInt(req.query.count) || 75, 150);
        const subjects = sectionsMapping[sectionName];

        if (!subjects) {
            return res.status(404).json({ error: 'Section not found' });
        }

        // Production Hardening: Use MongoDB aggregation for efficient multi-subject sampling
        const questions = await Question.aggregate([
            { 
                $match: { 
                    subject: { $in: subjects.map(s => s.toLowerCase()) } 
                } 
            },
            { $sample: { size: count } }
        ]);

        if (!questions || questions.length === 0) {
            return res.status(404).json({ error: 'No questions found for this section' });
        }

        res.json({
            questions: questions,
            timeLimit: Math.round(count * 0.9), // Approx 54 seconds per question
            sectionName: sectionName
        });
    } catch (error) {
        console.error('Section error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
