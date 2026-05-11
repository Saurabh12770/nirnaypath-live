const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LiveSession = require('../models/LiveSession');
const LiveResult = require('../models/LiveResult');
const Question = require('../models/Question');

// 1. Get upcoming sessions
router.get('/upcoming', async (req, res) => {
    try {
        const sessions = await LiveSession.find({ 
            status: { $in: ['upcoming', 'live'] } 
        }).select('exam subject startTime duration registeredUsers status')
          .sort({ startTime: 1 });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. Register for a session
router.post('/register/:sessionId', auth, async (req, res) => {
    try {
        const session = await LiveSession.findById(req.params.sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        
        if (!session.registeredUsers.includes(req.user._id)) {
            session.registeredUsers.push(req.user._id);
            await session.save();
        }
        res.json({ message: 'Successfully registered' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. Start a live session
router.get('/start/:sessionId', auth, async (req, res) => {
    try {
        const session = await LiveSession.findById(req.params.sessionId).populate('questions');
        if (!session) return res.status(404).json({ error: 'Session not found' });
        
        if (session.status !== 'live') {
            return res.status(403).json({ error: 'Session is not live yet or has ended' });
        }

        res.json({
            sessionId: session._id,
            questions: session.questions,
            duration: session.duration,
            endTime: new Date(session.startTime.getTime() + session.duration * 60000)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Submit live test
router.post('/submit/:sessionId', auth, async (req, res) => {
    try {
        const { answers } = req.body;
        const session = await LiveSession.findById(req.params.sessionId).populate('questions');
        
        if (!session || session.status !== 'live') {
            return res.status(403).json({ error: 'Session is no longer accepting submissions' });
        }

        // Evaluate score
        let score = 0;
        const qMap = {};
        session.questions.forEach(q => qMap[q._id.toString()] = q);

        Object.keys(answers).forEach(qId => {
            const question = qMap[qId];
            if (question && String(question.correctAnswer) === String(answers[qId])) {
                score++;
            }
        });

        const result = new LiveResult({
            userId: req.user._id,
            liveSessionId: session._id,
            score,
            totalQuestions: session.questions.length,
            answers
        });

        await result.save();
        res.status(201).json({ score, total: session.questions.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Leaderboard
router.get('/leaderboard/:sessionId', async (req, res) => {
    try {
        const leaderboard = await LiveResult.find({ liveSessionId: req.params.sessionId })
            .sort({ score: -1, submittedAt: 1 })
            .limit(50)
            .populate('userId', 'name');
        
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
