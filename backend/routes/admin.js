import express from 'express';
import Question from '../models/Question.js';
import LearningContent from '../models/LearningContent.js';
import User from '../models/User.js';
import TestResult from '../models/TestResult.js';
import { protect, adminOnly } from '../middleware/auth.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SYLLABUS_DIR = path.join(__dirname, '..', '..', 'data', 'syllabus');

// Apply protection to all admin endpoints
router.use(protect);
router.use(adminOnly);

// ==========================================
// 1. QUESTION MANAGEMENT
// ==========================================

// @desc    Get all questions (paginated)
// @route   GET /api/admin/questions
router.get('/questions', async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const total = await Question.countDocuments({});
    const questions = await Question.find({}).skip(skip).limit(limit).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      questions,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Create a question
// @route   POST /api/admin/questions
router.post('/questions', async (req, res, next) => {
  const { exam, subject, topic, subtopic, difficulty, question, options, answer, explanation } = req.body;
  try {
    const newQuestion = await Question.create({
      exam,
      subject,
      topic,
      subtopic,
      difficulty,
      question,
      options,
      answer,
      explanation
    });

    res.status(201).json({ success: true, question: newQuestion });
  } catch (error) {
    next(error);
  }
});

// @desc    Update a question
// @route   PUT /api/admin/questions/:id
router.put('/questions/:id', async (req, res, next) => {
  try {
    const updated = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) {
      res.status(404);
      throw new Error('Question not found');
    }
    res.status(200).json({ success: true, question: updated });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete a question
// @route   DELETE /api/admin/questions/:id
router.delete('/questions/:id', async (req, res, next) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404);
      throw new Error('Question not found');
    }
    res.status(200).json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 2. LEARNING CONTENT MANAGEMENT
// ==========================================

// @desc    Create / Update learning content
// @route   POST /api/admin/content
router.post('/content', async (req, res, next) => {
  const { exam, subject, topic, subtopic, introduction, detailedExplanation, concepts, importantFacts, examples, tables, revisionNotes, pyqs } = req.body;
  try {
    // Check if subtopic content already exists
    let content = await LearningContent.findOne({ subtopic });
    
    if (content) {
      // Update
      content.exam = exam;
      content.subject = subject;
      content.topic = topic;
      content.introduction = introduction;
      content.detailedExplanation = detailedExplanation;
      content.concepts = concepts;
      content.importantFacts = importantFacts;
      content.examples = examples;
      content.tables = tables;
      content.revisionNotes = revisionNotes;
      content.pyqs = pyqs || [];
      await content.save();
    } else {
      // Create
      content = await LearningContent.create({
        exam,
        subject,
        topic,
        subtopic,
        introduction,
        detailedExplanation,
        concepts,
        importantFacts,
        examples,
        tables,
        revisionNotes,
        pyqs: pyqs || []
      });
    }

    res.status(200).json({ success: true, content });
  } catch (error) {
    next(error);
  }
});

// @desc    Get study content for a subtopic (Admin view)
// @route   GET /api/admin/content/:exam/:subject/:topic/:subtopic
router.get('/content/:exam/:subject/:topic/:subtopic', async (req, res, next) => {
  const { exam, subject, topic, subtopic } = req.params;
  try {
    const content = await LearningContent.findOne({
      exam: new RegExp(`^${exam}$`, 'i'),
      subject: new RegExp(`^${subject}$`, 'i'),
      topic: new RegExp(`^${topic}$`, 'i'),
      subtopic: new RegExp(`^${subtopic}$`, 'i')
    });
    
    res.status(200).json({ success: true, content });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 3. USER MANAGEMENT
// ==========================================

// @desc    Get all users
// @route   GET /api/admin/users
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
});

// @desc    Toggle user role (student / admin)
// @route   PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    
    user.role = user.role === 'admin' ? 'student' : 'admin';
    await user.save();
    
    res.status(200).json({ success: true, user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 4. REPORTS / METRICS
// ==========================================

// @desc    Get admin metrics summary report
// @route   GET /api/admin/reports
router.get('/reports', async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalQuestions = await Question.countDocuments({});
    const totalAttempts = await TestResult.countDocuments({});
    const totalContent = await LearningContent.countDocuments({});

    // Accuracy average across the entire system
    const results = await TestResult.find({});
    const globalAccuracy = results.length > 0
      ? results.reduce((acc, curr) => acc + curr.accuracy, 0) / results.length
      : 0;

    res.status(200).json({
      success: true,
      report: {
        totalUsers,
        totalQuestions,
        totalAttempts,
        totalContent,
        globalAccuracy: parseFloat(globalAccuracy.toFixed(1))
      }
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 5. SYLLABUS MANAGEMENT
// ==========================================

// @desc    Get syllabus JSON for editing
// @route   GET /api/admin/syllabus/:exam
router.get('/syllabus/:exam', async (req, res, next) => {
  const examId = req.params.exam.toLowerCase();
  const filePath = path.join(SYLLABUS_DIR, `${examId}.json`);

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: `Syllabus file for ${examId} not found` });
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    res.status(200).json({ success: true, syllabus: data });
  } catch (error) {
    next(error);
  }
});

// @desc    Save syllabus JSON
// @route   PUT /api/admin/syllabus/:exam
router.put('/syllabus/:exam', async (req, res, next) => {
  const examId = req.params.exam.toLowerCase();
  const filePath = path.join(SYLLABUS_DIR, `${examId}.json`);

  try {
    const { exam, subjects } = req.body;
    if (!exam || !subjects || !Array.isArray(subjects)) {
      res.status(400);
      throw new Error('Invalid syllabus format. Must include exam name and subjects array.');
    }

    // Write file
    fs.writeFileSync(filePath, JSON.stringify({ exam, subjects }, null, 2), 'utf-8');

    res.status(200).json({
      success: true,
      message: `Syllabus for ${exam} updated successfully`,
      syllabus: { exam, subjects }
    });
  } catch (error) {
    next(error);
  }
});

export default router;

