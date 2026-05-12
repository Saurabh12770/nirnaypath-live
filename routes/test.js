const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Question = require('../models/Question');
const TestResult = require('../models/TestResult');

/**
 * POST /api/test/start
 * Reverted to old reliable pattern: returns randomized questions directly.
 */
router.post('/start', auth, async (req, res) => {
    try {
        const { subject, count } = req.body;
        const qCount = Math.min(parseInt(count) || 50, 200);
        
        const subLower = (subject || 'all').toLowerCase().trim();
        const matchQuery = subLower === 'all' 
            ? {} 
            : { $or: [{ subject: subLower }, { subjectId: subLower }] };

        const questions = await Question.aggregate([
            { $match: matchQuery },
            { $sample: { size: qCount } }
        ]);

        if (!questions || questions.length === 0) {
            return res.status(404).json({ error: `No questions found for subject: ${subject}` });
        }

        // Return questions directly without a server-side session as per restoration request
        res.json({ questions });
    } catch (error) {
        console.error('Test Start Error:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

/**
 * POST /api/test/submit
 * Saves test results to MongoDB.
 */
router.post('/submit', auth, async (req, res) => {
    try {
        const { 
            exam, subject, testName, score, totalQuestions, 
            correct, incorrect, unattempted, accuracy, 
            answers, mode, modeValue 
        } = req.body;
        
        const testResult = new TestResult({
            userId: req.user._id,
            exam,
            subject,
            testName,
            score,
            totalQuestions,
            correct,
            incorrect,
            unattempted,
            accuracy,
            answers,
            mode: mode || 'full',
            modeValue: modeValue || null
        });

        await testResult.save();
        
        res.status(201).json({ 
            message: 'Test result saved successfully', 
            resultId: testResult._id 
        });
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ error: 'Failed to save test result' });
    }
});

module.exports = router;
