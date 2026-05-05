const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const ChatMessage = require('../models/ChatMessage');
const { askAI } = require('../services/aiService');

// POST /api/chat
router.post('/', auth, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const user = await User.findById(req.user._id);
        
        // Rate Limiting Logic
        const today = new Date().setHours(0,0,0,0);
        if (user.lastChatDate < today) {
            user.chatCount = 0;
            user.lastChatDate = new Date();
        }

        if (user.plan !== 'pro_monthly' && user.chatCount >= 100) {
            return res.status(403).json({ 
                error: 'Daily limit reached (100 messages). Upgrade to Pro for unlimited AI tutoring!',
                limitReached: true
            });
        }

        // Fetch last 10 messages for context
        const history = await ChatMessage.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(10);
        
        // Save User Message
        const userMsg = new ChatMessage({
            userId: user._id,
            role: 'user',
            content: message
        });
        await userMsg.save();

        // Get AI Response
        const aiResult = await askAI(message, history.reverse());
        const botReply = typeof aiResult === 'string' ? aiResult : aiResult.text;
        const isFallback = aiResult.isFallback || false;

        // Save Bot Message
        const botMsg = new ChatMessage({
            userId: user._id,
            role: 'model',
            content: botReply
        });
        await botMsg.save();

        // Update User Chat Count
        user.chatCount += 1;
        await user.save();

        res.json({ reply: botReply, isFallback: isFallback });
    } catch (error) {
        console.error("Chat Route Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// GET /api/chat/history
router.get('/history', auth, async (req, res) => {
    try {
        const history = await ChatMessage.find({ userId: req.user._id })
            .sort({ createdAt: 1 })
            .limit(50);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
