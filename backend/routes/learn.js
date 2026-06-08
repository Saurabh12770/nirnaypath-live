import express from 'express';
import LearningContent from '../models/LearningContent.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get study content for a subtopic
// @route   GET /api/learn/content/:exam/:subject/:topic/:subtopic
// @access  Private
router.get('/content/:exam/:subject/:topic/:subtopic', protect, async (req, res, next) => {
  const { exam, subject, topic, subtopic } = req.params;

  try {
    // Perform search (case-insensitive for convenience)
    let content = await LearningContent.findOne({
      exam: new RegExp(`^${exam}$`, 'i'),
      subject: new RegExp(`^${subject}$`, 'i'),
      topic: new RegExp(`^${topic}$`, 'i'),
      subtopic: new RegExp(`^${subtopic}$`, 'i'),
    }).populate('practiceMcqs');

    if (!content) {
      // Create a premium placeholder to ensure no page failure, allowing edits
      content = await LearningContent.create({
        exam,
        subject,
        topic,
        subtopic,
        introduction: `Welcome to the study page for ${subtopic}. This topic forms an important part of the ${subject} syllabus for the ${exam} exam.`,
        detailedExplanation: `### ${subtopic} Overview\nDetailed concepts, diagrams, and descriptions for **${subtopic}** are currently being updated by the administration. You can use the Admin Panel to edit and update this layout with structured markdown notes, figures, and tables.`,
        concepts: ['Key Terminology', 'Fundamental Framework', 'Core Principles'],
        importantFacts: [`Exam-relevant points for ${subtopic}.`],
        examples: [`Illustrative scenarios and case analyses.`],
        tables: [
          {
            title: `${subtopic} Reference Table`,
            headers: ['Aspect', 'Details', 'Key takeaway'],
            rows: [['Introduction', 'Historical & Analytical overview', 'Primary understanding']]
          }
        ],
        revisionNotes: `Quick bullet points summarizing the essentials of ${subtopic} for final-hour revision.`,
        pyqs: [],
        practiceMcqs: []
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
