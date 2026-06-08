import express from 'express';
import Bookmark from '../models/Bookmark.js';
import Question from '../models/Question.js';
import LearningContent from '../models/LearningContent.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Add / Toggle a bookmark
// @route   POST /api/bookmarks
// @access  Private
router.post('/', protect, async (req, res, next) => {
  const { type, targetId } = req.body;

  if (!type || !targetId) {
    res.status(400);
    throw new Error('Please provide bookmark type and targetId');
  }

  try {
    // Check if duplicate exists
    const existing = await Bookmark.findOne({
      userId: req.user._id,
      type,
      targetId,
    });

    if (existing) {
      // Toggle off: Delete existing bookmark if user hits it again
      await Bookmark.findByIdAndDelete(existing._id);
      return res.status(200).json({ success: true, message: 'Bookmark removed', bookmarked: false });
    }

    // Verify target exists
    if (type === 'question') {
      const q = await Question.findById(targetId);
      if (!q) {
        res.status(404);
        throw new Error('Question not found');
      }
    } else if (type === 'content') {
      const c = await LearningContent.findById(targetId);
      if (!c) {
        res.status(404);
        throw new Error('Study content not found');
      }
    } else {
      res.status(400);
      throw new Error('Invalid bookmark type');
    }

    const bookmark = await Bookmark.create({
      userId: req.user._id,
      type,
      targetId,
    });

    res.status(201).json({
      success: true,
      message: 'Bookmark added',
      bookmarked: true,
      bookmark,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all bookmarks for active user
// @route   GET /api/bookmarks
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id });
    const populated = [];

    for (const b of bookmarks) {
      if (b.type === 'question') {
        const q = await Question.findById(b.targetId).select('-answer -explanation');
        if (q) {
          populated.push({
            id: b._id,
            type: b.type,
            targetId: b.targetId,
            createdAt: b.createdAt,
            details: {
              title: `Question: ${q.question.en.substring(0, 50)}...`,
              subject: q.subject,
              topic: q.topic,
              subtopic: q.subtopic,
              exam: q.exam
            }
          });
        }
      } else if (b.type === 'content') {
        const c = await LearningContent.findById(b.targetId);
        if (c) {
          populated.push({
            id: b._id,
            type: b.type,
            targetId: b.targetId,
            createdAt: b.createdAt,
            details: {
              title: `${c.subtopic} Notes`,
              subject: c.subject,
              topic: c.topic,
              subtopic: c.subtopic,
              exam: c.exam
            }
          });
        }
      }
    }

    res.status(200).json({ success: true, bookmarks: populated });
  } catch (error) {
    next(error);
  }
});

// @desc    Remove a bookmark
// @route   DELETE /api/bookmarks/:id
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) {
      res.status(404);
      throw new Error('Bookmark not found');
    }

    if (bookmark.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    await Bookmark.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Bookmark removed successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
