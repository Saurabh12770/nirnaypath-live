import express from 'express';
import LearningContent from '../models/LearningContent.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Helper to escape regex characters
const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// @desc    Get study content for a subtopic
// @route   GET /api/learn/content/:exam/:subject/:topic/:subtopic
// @access  Private
router.get('/content/:exam/:subject/:topic/:subtopic', protect, async (req, res, next) => {
  const { exam, subject, topic, subtopic } = req.params;

  try {
    // Perform case-insensitive search — NEVER auto-create placeholder docs
    const content = await LearningContent.findOne({
      exam:     new RegExp(`^${escapeRegExp(exam)}$`, 'i'),
      subject:  new RegExp(`^${escapeRegExp(subject)}$`, 'i'),
      topic:    new RegExp(`^${escapeRegExp(topic)}$`, 'i'),
      subtopic: new RegExp(`^${escapeRegExp(subtopic)}$`, 'i'),
    }).populate('practiceMcqs');

    if (!content) {
      return res.status(404).json({
        success: false,
        message: `Content not yet available for: ${subtopic}`,
        exam,
        subject,
        topic,
        subtopic,
      });
    }

    res.status(200).json({
      success: true,
      content,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update subtopic learning progress (complete/uncomplete)
// @route   POST /api/learn/progress
// @access  Private
router.post('/progress', protect, async (req, res, next) => {
  const { subtopic, completed } = req.body;

  if (!subtopic) {
    res.status(400);
    throw new Error('Please provide subtopic name');
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Set or delete in map
    if (completed) {
      user.learningProgress.set(subtopic, true);
    } else {
      user.learningProgress.delete(subtopic);
    }

    await user.save();

    res.status(200).json({
      success: true,
      learningProgress: Object.fromEntries(user.learningProgress),
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user's progress map
// @route   GET /api/learn/progress
// @access  Private
router.get('/progress', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      learningProgress: Object.fromEntries(user.learningProgress || new Map()),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
