import express from 'express';
import Question from '../models/Question.js';
import TestSession from '../models/TestSession.js';
import TestResult from '../models/TestResult.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Create / Start a new test session
// @route   POST /api/tests/sessions
// @access  Private
router.post('/sessions', protect, async (req, res, next) => {
  const { testType, exam, subject, topic, subtopic } = req.body;

  if (!testType || !exam) {
    res.status(400);
    throw new Error('Test type and exam are required');
  }

  try {
    // 1. Build Match Query based on test type
    const matchQuery = { exam };
    let questionLimit = 10;
    let timerDuration = 600; // 10 minutes default

    if (testType === 'topic') {
      if (!subject || !topic) {
        res.status(400);
        throw new Error('Subject and topic are required for topic test');
      }
      matchQuery.subject = subject;
      matchQuery.topic = topic;
      if (subtopic) matchQuery.subtopic = subtopic;
      questionLimit = 10; // 10 questions
      timerDuration = 600; // 10 minutes
    } else if (testType === 'subject') {
      if (!subject) {
        res.status(400);
        throw new Error('Subject is required for subject test');
      }
      matchQuery.subject = subject;
      questionLimit = 20; // 20 questions
      timerDuration = 1200; // 20 minutes
    } else if (testType === 'full_mock') {
      questionLimit = 30; // 30 questions
      timerDuration = 1800; // 30 minutes
    }

    // 2. Fetch random questions using MongoDB $sample
    const pipeline = [
      { $match: matchQuery },
      { $sample: { size: questionLimit } }
    ];

    const sampledQuestions = await Question.aggregate(pipeline);

    if (sampledQuestions.length === 0) {
      res.status(404);
      throw new Error('No questions found matching the selected criteria');
    }

    // 3. Create the test session
    const session = await TestSession.create({
      userId: req.user._id,
      testType,
      exam,
      subject,
      topic,
      subtopic,
      questions: sampledQuestions.map(q => q._id),
      timeRemaining: timerDuration,
      status: 'active',
    });

    // Strip out answer keys and explanations to prevent cheating on frontend
    const questionsResponse = sampledQuestions.map(q => ({
      _id: q._id,
      exam: q.exam,
      subject: q.subject,
      topic: q.topic,
      subtopic: q.subtopic,
      difficulty: q.difficulty,
      question: q.question,
      options: q.options,
    }));

    res.status(201).json({
      success: true,
      session: {
        id: session._id,
        testType: session.testType,
        exam: session.exam,
        subject: session.subject,
        topic: session.topic,
        subtopic: session.subtopic,
        questions: questionsResponse,
        timeRemaining: session.timeRemaining,
        status: session.status,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get active test session details (without answers)
// @route   GET /api/tests/sessions/:id
// @access  Private
router.get('/sessions/:id', protect, async (req, res, next) => {
  try {
    const session = await TestSession.findById(req.params.id)
      .populate('questions', '-answer -explanation');

    if (!session) {
      res.status(404);
      throw new Error('Test session not found');
    }

    if (session.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to access this session');
    }

    res.status(200).json({
      success: true,
      session: {
        id: session._id,
        testType: session.testType,
        exam: session.exam,
        subject: session.subject,
        topic: session.topic,
        subtopic: session.subtopic,
        questions: session.questions,
        answers: Object.fromEntries(session.answers || new Map()),
        timeRemaining: session.timeRemaining,
        status: session.status,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Save test answers and remaining time (autosave)
// @route   PUT /api/tests/sessions/:id
// @access  Private
router.put('/sessions/:id', protect, async (req, res, next) => {
  const { answers, timeRemaining } = req.body;

  try {
    const session = await TestSession.findById(req.params.id);

    if (!session) {
      res.status(404);
      throw new Error('Test session not found');
    }

    if (session.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    if (session.status !== 'active') {
      res.status(400);
      throw new Error('Cannot update a submitted test session');
    }

    if (answers) {
      // Merge new answers into the answers Map
      Object.entries(answers).forEach(([qId, val]) => {
        session.answers.set(qId, val);
      });
    }

    if (timeRemaining !== undefined) {
      session.timeRemaining = Math.max(0, timeRemaining);
    }

    await session.save();

    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

// @desc    Submit & Grade test session
// @route   POST /api/tests/sessions/:id/submit
// @access  Private
router.post('/sessions/:id/submit', protect, async (req, res, next) => {
  try {
    const session = await TestSession.findById(req.params.id).populate('questions');

    if (!session) {
      res.status(404);
      throw new Error('Test session not found');
    }

    if (session.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized');
    }

    if (session.status !== 'active') {
      res.status(400);
      throw new Error('Session is already submitted');
    }

    // 1. Mark session submitted
    session.status = 'submitted';
    await session.save();

    // 2. Grade questions
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let unattempted = 0;
    const totalQuestions = session.questions.length;

    // Track performance by topic
    const topicStats = {}; // { [topic]: { correct: 0, total: 0 } }

    session.questions.forEach((q) => {
      const qId = q._id.toString();
      const topicName = q.topic || 'General';
      
      if (!topicStats[topicName]) {
        topicStats[topicName] = { correct: 0, total: 0 };
      }
      topicStats[topicName].total += 1;

      if (!session.answers.has(qId)) {
        unattempted += 1;
      } else {
        const selected = session.answers.get(qId);
        if (selected === q.answer) {
          correctAnswers += 1;
          topicStats[topicName].correct += 1;
        } else {
          wrongAnswers += 1;
        }
      }
    });

    // Compute strong & weak topics based on topic accuracy
    const strongTopics = [];
    const weakTopics = [];
    
    Object.entries(topicStats).forEach(([topic, stats]) => {
      const accuracy = (stats.correct / stats.total) * 100;
      if (accuracy >= 70) {
        strongTopics.push(topic);
      } else if (accuracy < 50) {
        weakTopics.push(topic);
      }
    });

    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    
    // Estimate session duration
    let duration = 600; // default 10m
    if (session.testType === 'subject') duration = 1200;
    if (session.testType === 'full_mock') duration = 1800;
    const timeTaken = duration - session.timeRemaining;

    // 3. Create test result
    const result = await TestResult.create({
      sessionId: session._id,
      userId: req.user._id,
      testType: session.testType,
      exam: session.exam,
      subject: session.subject,
      topic: session.topic,
      subtopic: session.subtopic,
      score: correctAnswers,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      unattempted,
      accuracy,
      duration: Math.max(0, timeTaken),
      analysis: {
        strongTopics,
        weakTopics,
      },
    });

    res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get graded test result details with explanations
// @route   GET /api/tests/results/:id
// @access  Private
router.get('/results/:id', protect, async (req, res, next) => {
  try {
    const result = await TestResult.findById(req.params.id);

    if (!result) {
      res.status(404);
      throw new Error('Test result not found');
    }

    if (result.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to view these results');
    }

    // Load original session questions WITH answers & explanations for student review
    const session = await TestSession.findById(result.sessionId).populate('questions');

    res.status(200).json({
      success: true,
      result,
      session: {
        id: session._id,
        testType: session.testType,
        exam: session.exam,
        questions: session.questions,
        answers: Object.fromEntries(session.answers || new Map()),
      },
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user's mock test attempts history
// @route   GET /api/tests/history
// @access  Private
router.get('/history', protect, async (req, res, next) => {
  try {
    const history = await TestResult.find({ userId: req.user._id })
      .sort({ submittedAt: -1 });
    res.status(200).json({ success: true, history });
  } catch (error) {
    next(error);
  }
});

export default router;
