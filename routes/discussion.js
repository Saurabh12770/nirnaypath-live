const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const Discussion = require('../models/Discussion');

const commentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: 'Too many comments, please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// GET /api/discussion/:questionId
// Returns threaded comments (top-level + replies)
router.get('/:questionId', async (req, res) => {
    try {
        const { questionId } = req.params;

        // Fetch all comments for this question in one query
        const all = await Discussion.find({ questionId })
            .sort({ createdAt: 1 })
            .populate('userId', 'name');

        // Build threaded structure
        const topLevel = [];
        const replyMap = {};

        all.forEach(c => {
            const obj = c.toObject();
            obj.replies = [];
            if (!c.parentId) {
                topLevel.push(obj);
                replyMap[c._id.toString()] = obj;
            }
        });

        // Attach replies to parents
        all.forEach(c => {
            if (c.parentId) {
                const parent = replyMap[c.parentId.toString()];
                if (parent) {
                    parent.replies.push(c.toObject());
                }
            }
        });

        res.json(topLevel);
    } catch (error) {
        console.error('Discussion GET error:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/discussion/:questionId
// Create a new comment or reply
router.post('/:questionId', auth, commentLimiter, async (req, res) => {
    try {
        const { questionId } = req.params;
        const { text, parentId = null } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: 'Comment text cannot be empty.' });
        }

        // If it's a reply, verify parent exists and belongs to same question
        if (parentId) {
            const parent = await Discussion.findById(parentId);
            if (!parent) {
                return res.status(404).json({ error: 'Parent comment not found.' });
            }
            if (parent.questionId !== questionId) {
                return res.status(400).json({ error: 'Parent comment belongs to a different question.' });
            }
        }

        const comment = new Discussion({
            questionId,
            userId: req.user._id,
            text: text.trim(),
            parentId: parentId || null
        });

        await comment.save();
        await comment.populate('userId', 'name');

        res.status(201).json(comment);
    } catch (error) {
        console.error('Discussion POST error:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/discussion/:commentId
// Owner or admin can delete
router.delete('/:commentId', auth, async (req, res) => {
    try {
        const comment = await Discussion.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found.' });
        }

        const isOwner = comment.userId.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'Not authorized to delete this comment.' });
        }

        await comment.deleteOne();
        res.json({ message: 'Comment deleted.' });
    } catch (error) {
        console.error('Discussion DELETE error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
