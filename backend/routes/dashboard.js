import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import TestResult from '../models/TestResult.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SYLLABUS_DIR = path.join(__dirname, '..', '..', 'data', 'syllabus');

// Helper to count total subtopics in all syllabus files
const getTotalSubtopicsCount = () => {
  try {
    const files = fs.readdirSync(SYLLABUS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
    let total = 0;
    for (const file of files) {
      const content = fs.readFileSync(path.join(SYLLABUS_DIR, file), 'utf-8');
      const data = JSON.parse(content);
      if (data.subjects) {
        data.subjects.forEach(subj => {
          if (subj.topics) {
            subj.topics.forEach(top => {
              if (top.subtopics) {
                total += top.subtopics.length;
              }
            });
          }
        });
      }
    }
    return total || 50; // Fallback to 50 if zero
  } catch (error) {
    console.error('Error calculating total subtopics:', error.message);
    return 50;
  }
};

// @desc    Get dashboard summary statistics
// @route   GET /api/dashboard/summary
// @access  Private
router.get('/summary', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Fetch test results
    const results = await TestResult.find({ userId }).sort({ submittedAt: -1 });

    const testsAttempted = results.length;

    // Calculate average accuracy
    const avgAccuracy = testsAttempted > 0
      ? results.reduce((acc, curr) => acc + curr.accuracy, 0) / testsAttempted
      : 0;

    // 2. Extract strong and weak topics
    const strongSet = new Set();
    const weakSet = new Set();

    results.forEach(r => {
      if (r.analysis) {
        if (r.analysis.strongTopics) {
          r.analysis.strongTopics.forEach(t => strongSet.add(t));
        }
        if (r.analysis.weakTopics) {
          r.analysis.weakTopics.forEach(t => weakSet.add(t));
        }
      }
    });

    // Remove strong topics from weak topics (remediation)
    strongSet.forEach(t => weakSet.delete(t));

    // 3. Learning progress percentage
    const user = await User.findById(userId);
    const completedCount = user.learningProgress ? user.learningProgress.size : 0;
    const totalSubtopics = getTotalSubtopicsCount();
    const learningProgress = Math.min(100, parseFloat(((completedCount / totalSubtopics) * 100).toFixed(1)));

    // 4. Recent activity
    const recentActivity = [];

    // Add recent tests
    results.slice(0, 5).forEach(r => {
      recentActivity.push({
        id: r._id,
        type: 'test',
        label: `${r.exam} ${r.testType.replace('_', ' ').toUpperCase()} Test - Score: ${r.score}/${r.totalQuestions}`,
        date: r.submittedAt,
        meta: { accuracy: r.accuracy }
      });
    });

    // We can show completed topics as activity too (sort in code later)
    // For simplicity, we just list the completed count as part of summary, but we could list last actions.

    // 5. Performance Trend (last 7 attempts)
    const trend = results.slice(0, 7).reverse().map(r => ({
      date: new Date(r.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      accuracy: parseFloat(r.accuracy.toFixed(1)),
      score: r.score
    }));

    res.status(200).json({
      success: true,
      stats: {
        testsAttempted,
        accuracy: parseFloat(avgAccuracy.toFixed(1)),
        weakTopics: Array.from(weakSet).slice(0, 5),
        strongTopics: Array.from(strongSet).slice(0, 5),
        learningProgress,
        recentActivity: recentActivity.sort((a, b) => b.date - a.date),
        performanceTrend: trend
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
