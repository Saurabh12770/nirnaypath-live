'use strict';

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const Question = require('../models/question');
const User = require('../models/user');
const TestResult = require('../models/testResult');
const LearningContent = require('../models/learningContent');
const LearningContentService = require('../services/learningContentService');
const SyllabusService = require('../services/syllabusService');

const SYLLABUS_PATH = path.resolve(__dirname, '../data/syllabus/index.json');

// ══════════════════════════════════════════════════════════
// 1. STATS & ANALYTICS
// ══════════════════════════════════════════════════════════

router.get('/stats', auth, adminAuth, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const proUsers = await User.countDocuments({ plan: { $in: ['pro_monthly', 'pro_yearly'] } });
        const bannedUsers = await User.countDocuments({ isActive: false });
        const totalQuestions = await Question.countDocuments();
        const totalNotes = await LearningContent.countDocuments();
        const totalTests = await TestResult.countDocuments();

        // Count tests taken today (24h) and this week (7d)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        startOfWeek.setHours(0, 0, 0, 0);

        const testsToday = await TestResult.countDocuments({ createdAt: { $gte: startOfDay } });
        const testsThisWeek = await TestResult.countDocuments({ createdAt: { $gte: startOfWeek } });

        const activeUserIds = await TestResult.distinct('userId', { createdAt: { $gte: startOfWeek } });

        res.json({
            users: { total: totalUsers, pro: proUsers, banned: bannedUsers },
            tests: { today: testsToday, week: testsThisWeek, total: totalTests },
            questions: { total: totalQuestions },
            notes: { total: totalNotes },
            revenue: 0, // payment system stripped in NP 2.0
            activeUsers: activeUserIds.length
        });
    } catch (error) {
        console.error('[ADMIN STATS] Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ══════════════════════════════════════════════════════════
// 2. QUESTION MANAGEMENT (CRUD)
// ══════════════════════════════════════════════════════════

// List all approved subjects
router.get('/subjects', auth, adminAuth, async (req, res) => {
    try {
        const subjects = SyllabusService.getAllSubjects();
        res.json(subjects.map(s => s.id));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get paginated questions for a subject
router.get('/questions/:subject', auth, adminAuth, async (req, res) => {
    try {
        const { subject } = req.params;
        const { page = 1, limit = 50, topic = '', difficulty = '', search = '' } = req.query;

        const query = {};
        if (subject && subject !== 'all') {
            query.$or = [{ subjectId: subject.toLowerCase() }, { subject: subject.toLowerCase() }];
        }

        if (search) {
            query.$or = [
                { question_en: { $regex: search, $options: 'i' } },
                { question_hi: { $regex: search, $options: 'i' } },
                { text: { $regex: search, $options: 'i' } }
            ];
        }

        if (topic) {
            query.$or = [{ topicId: topic }, { topic: topic }];
        }
        if (difficulty) {
            query.difficulty = difficulty.toUpperCase();
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const questions = await Question.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Question.countDocuments(query);
        res.json({ questions, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new question
router.post('/questions/:subject', auth, adminAuth, async (req, res) => {
    try {
        const { subject } = req.params;
        const subLower = subject.toLowerCase().trim();
        const body = req.body;

        const questionData = {
            subjectId: subLower,
            subject: subLower,
            topicId: body.topic,
            topic: body.topic,
            question_en: body.question_en,
            question_hi: body.question_hi,
            options_en: body.options_en,
            options: body.options_en,
            correctAnswer: body.correctAnswer,
            difficulty: (body.difficulty || 'MEDIUM').toUpperCase(),
            explanation_en: body.explanation_en,
            explanation_hi: body.explanation_hi,
            createdAt: new Date()
        };

        const question = new Question(questionData);
        await question.save();
        res.status(201).json({ message: 'Question added successfully', question });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update question
router.put('/questions/:subject/:id', auth, adminAuth, async (req, res) => {
    try {
        const { subject, id } = req.params;
        const subLower = subject.toLowerCase().trim();
        const body = req.body;

        const updatedData = {
            subjectId: subLower,
            subject: subLower,
            topicId: body.topic,
            topic: body.topic,
            question_en: body.question_en,
            question_hi: body.question_hi,
            options_en: body.options_en,
            options: body.options_en,
            correctAnswer: body.correctAnswer,
            difficulty: (body.difficulty || 'MEDIUM').toUpperCase(),
            explanation_en: body.explanation_en,
            explanation_hi: body.explanation_hi,
            updatedAt: new Date()
        };

        const question = await Question.findByIdAndUpdate(id, { $set: updatedData }, { new: true });
        if (!question) return res.status(404).json({ error: 'Question not found' });
        res.json({ message: 'Question updated successfully', question });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete question
router.delete('/questions/:subject/:id', auth, adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const question = await Question.findByIdAndDelete(id);
        if (!question) return res.status(404).json({ error: 'Question not found' });
        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Bulk upload questions
router.post('/questions/:subject/bulk', auth, adminAuth, async (req, res) => {
    try {
        const { subject } = req.params;
        const subLower = subject.toLowerCase().trim();
        const { questions: newBatch } = req.body;

        if (!Array.isArray(newBatch) || newBatch.length === 0) {
            return res.status(400).json({ error: 'Questions must be a non-empty array' });
        }

        const toInsert = newBatch.map(q => ({
            subjectId: subLower,
            subject: subLower,
            topicId: q.topic || q.topicId,
            topic: q.topic || q.topicId,
            question_en: q.question_en || q.text,
            question_hi: q.question_hi,
            options_en: q.options_en || q.options,
            options: q.options_en || q.options,
            correctAnswer: q.correctAnswer,
            difficulty: (q.difficulty || 'MEDIUM').toUpperCase(),
            explanation_en: q.explanation_en || q.explanation,
            explanation_hi: q.explanation_hi,
            createdAt: new Date()
        }));

        await Question.insertMany(toInsert, { ordered: false });
        res.json({ message: 'Bulk upload complete', inserted: toInsert.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ══════════════════════════════════════════════════════════
// 3. LEARNING CONTENT / NOTES MANAGEMENT (CRUD)
// ══════════════════════════════════════════════════════════

// List all learning content notes
router.get('/learning-content', auth, adminAuth, async (req, res) => {
    try {
        const { exam, subject, topic, page = 1, limit = 50 } = req.query;
        const query = {};
        if (exam) query.exam = exam;
        if (subject) query.subject = subject.toLowerCase();
        if (topic) query.topic = topic;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const items = await LearningContent.find(query)
            .sort({ exam: 1, subject: 1, topic: 1, subTopic: 1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await LearningContent.countDocuments(query);
        res.json({ items, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get single learning content detail
router.get('/learning-content/:id', auth, adminAuth, async (req, res) => {
    try {
        const item = await LearningContent.findById(req.params.id).lean();
        if (!item) return res.status(404).json({ error: 'Learning content not found.' });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create or Update learning content note
router.post('/learning-content', auth, adminAuth, async (req, res) => {
    try {
        const content = await LearningContentService.upsertContent(req.body);
        res.status(201).json({ message: 'Learning content saved successfully', content });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update specific learning content note
router.put('/learning-content/:id', auth, adminAuth, async (req, res) => {
    try {
        const data = { ...req.body, _id: req.params.id };
        const content = await LearningContentService.upsertContent(data);
        res.json({ message: 'Learning content updated successfully', content });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete learning content note
router.delete('/learning-content/:id', auth, adminAuth, async (req, res) => {
    try {
        const success = await LearningContentService.deleteContent(req.params.id);
        if (!success) return res.status(404).json({ error: 'Learning content not found.' });
        res.json({ message: 'Learning content deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ══════════════════════════════════════════════════════════
// 4. SYLLABUS MANAGEMENT (CRUD)
// ══════════════════════════════════════════════════════════

// Get index.json syllabus
router.get('/syllabus', auth, adminAuth, async (req, res) => {
    try {
        const raw = await fs.readFile(SYLLABUS_PATH, 'utf8');
        res.json(JSON.parse(raw));
    } catch (error) {
        res.status(500).json({ error: 'Failed to read syllabus file: ' + error.message });
    }
});

// Update index.json syllabus
router.put('/syllabus', auth, adminAuth, async (req, res) => {
    try {
        const syllabusData = req.body;
        if (!syllabusData || !Array.isArray(syllabusData.exams)) {
            return res.status(400).json({ error: 'Invalid syllabus data. Must contain exams array.' });
        }
        await fs.writeFile(SYLLABUS_PATH, JSON.stringify(syllabusData, null, 2), 'utf8');
        SyllabusService.clearCache();
        res.json({ message: 'Syllabus updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save syllabus file: ' + error.message });
    }
});

// ══════════════════════════════════════════════════════════
// 5. USER MANAGEMENT
// ══════════════════════════════════════════════════════════

router.get('/users', auth, adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 50, search = '' } = req.query;
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-password')
            .lean();

        const total = await User.countDocuments(query);

        const usersWithStats = await Promise.all(users.map(async (u) => {
            const testsCount = await TestResult.countDocuments({ userId: u._id });
            return { ...u, testsCount };
        }));

        res.json({ users: usersWithStats, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/users/:userId', auth, adminAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive, plan, role } = req.body;
        const updates = {};
        if (isActive !== undefined) updates.isActive = isActive;
        if (plan !== undefined) updates.plan = plan;
        if (role !== undefined) updates.role = role;

        const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ══════════════════════════════════════════════════════════
// 6. BACKWARD COMPATIBILITY / MOCK ENDPOINTS
// ══════════════════════════════════════════════════════════

router.get('/payments', auth, adminAuth, (req, res) => {
    res.json([]);
});

router.get('/live-sessions', auth, adminAuth, (req, res) => {
    res.json([]);
});

router.post('/live-sessions', auth, adminAuth, (req, res) => {
    res.json({ message: 'Live sessions disabled in NirnayPath 2.0', questions: [] });
});

router.delete('/live-sessions/:id', auth, adminAuth, (req, res) => {
    res.json({ message: 'Live sessions disabled' });
});

module.exports = router;
