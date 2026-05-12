const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const sectionsMapping = require('../config/sections');
const { loadQuestions } = require('../utils/questionLoader');
const { getCachedData, setCachedData } = require('../middleware/cache');
const { requirePlan } = require('../middleware/planGuard');

/**
 * GET /api/section/:sectionName?count=75
 * Returns combined randomized questions from multiple subjects in a section.
 */
router.get('/:sectionName', auth, requirePlan('pro_monthly'), async (req, res) => {
    try {
        const { sectionName } = req.params;
        const count = parseInt(req.query.count) || 75;
        const subjects = sectionsMapping[sectionName];

        if (!subjects) {
            return res.status(404).json({ error: 'Section not found' });
        }

        let allQuestions = [];

        // Load all questions for the section's subjects
        for (const subject of subjects) {
            const cacheKey = `questions_${subject}`;
            let questions = getCachedData(cacheKey);
            if (!questions) {
                questions = await loadQuestions(subject);
                if (questions && questions.length > 0) {
                    setCachedData(cacheKey, questions, 600);
                }
            }
            if (questions) {
                allQuestions = allQuestions.concat(questions);
            }
        }

        if (allQuestions.length === 0) {
            return res.status(404).json({ error: 'No questions found for this section' });
        }

        // Randomly select 'count' questions
        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, Math.min(count, shuffled.length));

        res.json({
            questions: selected,
            timeLimit: count * 0.8, // Approx 48 seconds per question, e.g., 75 questions = 60 mins
            sectionName: sectionName
        });
    } catch (error) {
        console.error('Section error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
