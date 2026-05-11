const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const LiveSession = require('../models/LiveSession');
const Question = require('../models/Question');

// 1. Create a new live session
router.post('/', auth, adminAuth, async (req, res) => {
    try {
        const { exam, subject, startTime, duration, questionCount = 50 } = req.body;
        
        // Randomly select questions for this session
        const randomQuestions = await Question.aggregate([
            { $match: { subject: subject.toLowerCase() } },
            { $sample: { size: parseInt(questionCount) } },
            { $project: { _id: 1 } }
        ]);

        if (!randomQuestions.length) {
            return res.status(404).json({ error: 'No questions found for this subject' });
        }

        const session = new LiveSession({
            exam,
            subject,
            startTime: new Date(startTime),
            duration: parseInt(duration),
            questions: randomQuestions.map(q => q._id),
            createdBy: req.user._id
        });

        await session.save();
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. List all live sessions
router.get('/', auth, adminAuth, async (req, res) => {
    try {
        const sessions = await LiveSession.find().sort({ startTime: -1 });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Delete an upcoming session
router.delete('/:id', auth, adminAuth, async (req, res) => {
    try {
        const session = await LiveSession.findOne({ _id: req.params.id, status: 'upcoming' });
        if (!session) {
            return res.status(404).json({ error: 'Session not found or already started' });
        }
        await session.remove();
        res.json({ message: 'Session deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
