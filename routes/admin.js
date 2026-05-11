const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const Payment = require('../models/Payment');
const TestResult = require('../models/TestResult');
const Question = require('../models/Question');

// Questions are now stored in MongoDB. File-based save removed.

// ══════════════════════════════════════════════════════════
// 1. QUESTION MANAGEMENT
// ══════════════════════════════════════════════════════════

// List all subjects
router.get('/subjects', auth, adminAuth, async (req, res) => {
    try {
        const subjects = await Question.distinct('subject');
        res.json(subjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Paginated questions for a subject
router.get('/questions/:subject', auth, adminAuth, async (req, res) => {
    try {
        const { subject } = req.params;
        const { page = 1, limit = 50, topic = '', difficulty = '', search = '' } = req.query;
        
        let questions = await Question.find({ subject: subject.toLowerCase() }).lean();
        if (!questions) return res.status(404).json({ error: 'Subject not found' });

        // Apply Filters
        if (topic) questions = questions.filter(q => q.topic === topic);
        if (difficulty) questions = questions.filter(q => q.difficulty === difficulty);
        if (search) {
            const s = search.toLowerCase();
            questions = questions.filter(q => 
                (q.question_en && q.question_en.toLowerCase().includes(s)) ||
                (q.question_hi && q.question_hi.toLowerCase().includes(s))
            );
        }

        const total = questions.length;
        const start = (page - 1) * limit;
        const paginated = questions.slice(start, start + parseInt(limit));

        res.json({ questions: paginated, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new question
router.post('/questions/:subject', auth, adminAuth, async (req, res) => {
    try {
        const { subject } = req.params;
        const questionData = req.body;
        
        questionData.subject = subject.toLowerCase();
        if (!questionData.id) questionData.id = `Q-${Date.now()}`;
        
        const question = new Question(questionData);
        await question.save();
        
        // Invalidate Cache
        await clearCache(`qs_subject_${subject.toLowerCase()}`);
        await clearCache('admin_stats');
        
        res.status(201).json({ message: 'Question added', question });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update question
router.put('/questions/:subject/:id', auth, adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        
        const question = await Question.findOneAndUpdate(
            { $or: [{ id: id }, { _id: mongoose.Types.ObjectId.isValid(id) ? id : null }] },
            updatedData,
            { new: true }
        );
        
        if (!question) return res.status(404).json({ error: 'Question not found' });
        
        // Invalidate Cache
        await clearCache(`qs_subject_${subject.toLowerCase()}`);
        await clearCache('admin_stats');
        
        res.json({ message: 'Question updated', question });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete question
router.delete('/questions/:subject/:id', auth, adminAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Question.findOneAndDelete({ 
            $or: [{ id: id }, { _id: mongoose.Types.ObjectId.isValid(id) ? id : null }] 
        });
        
        if (!result) return res.status(404).json({ error: 'Question not found' });

        // Invalidate Cache
        await clearCache(`qs_subject_${subject.toLowerCase()}`);
        await clearCache('admin_stats');

        res.json({ message: 'Question deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Bulk upload
router.post('/questions/:subject/bulk', auth, adminAuth, async (req, res) => {
    try {
        const { subject } = req.params;
        const { questions: newBatch } = req.body;
        
        if (!Array.isArray(newBatch)) return res.status(400).json({ error: 'Questions must be an array' });

        const ops = newBatch.map(q => ({
            updateOne: {
                filter: { id: q.id || `Q-${Date.now()}-${Math.random()}` },
                update: { $set: { ...q, subject: subject.toLowerCase() } },
                upsert: true
            }
        }));

        await Question.bulkWrite(ops);
        
        // Invalidate Cache
        await clearCache(`qs_subject_${subject.toLowerCase()}`);
        await clearCache('admin_stats');
        
        res.json({ message: `Successfully uploaded/updated ${newBatch.length} questions` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ══════════════════════════════════════════════════════════
// 2. USER MANAGEMENT
// ══════════════════════════════════════════════════════════

// List users with stats (optimized with aggregation)
router.get('/users', auth, adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 50, search = '' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const lmt = parseInt(limit);

        const matchQuery = search ? { 
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        } : {};

        const [userList, totalCount] = await Promise.all([
            User.aggregate([
                { $match: matchQuery },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: lmt },
                {
                    $lookup: {
                        from: 'testresults',
                        localField: '_id',
                        foreignField: 'userId',
                        as: 'tests'
                    }
                },
                {
                    $addFields: {
                        testsCount: { $size: '$tests' }
                    }
                },
                {
                    $project: {
                        password: 0,
                        tests: 0
                    }
                }
            ]),
            User.countDocuments(matchQuery)
        ]);

        res.json({ users: userList, total: totalCount, page: parseInt(page) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user (Ban/Unban, Change Plan)
router.put('/users/:userId', auth, adminAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;
        
        const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');
        res.json({ message: 'User updated', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ══════════════════════════════════════════════════════════
// 3. ANALYTICS & STATS
// ══════════════════════════════════════════════════════════

const { getCachedData, setCachedData, clearCache } = require('../middleware/cache');

router.get('/stats', auth, adminAuth, async (req, res) => {
    try {
        const cacheKey = 'admin_stats';
        const cached = await getCachedData(cacheKey);
        if (cached) return res.json(cached);

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        startOfWeek.setHours(0, 0, 0, 0);

        const [totalUsers, proUsers, bannedUsers, testsToday, testsThisWeek, totalTests] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ plan: 'pro_monthly' }),
            User.countDocuments({ isActive: false }),
            TestResult.countDocuments({ createdAt: { $gte: startOfDay } }),
            TestResult.countDocuments({ createdAt: { $gte: startOfWeek } }),
            TestResult.countDocuments()
        ]);

        const payments = await Payment.find({ status: 'success' });
        const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

        const activeUserIds = await TestResult.distinct('userId', { createdAt: { $gte: startOfWeek } });

        const stats = {
            users: { total: totalUsers, pro: proUsers, banned: bannedUsers },
            tests: { today: testsToday, week: testsThisWeek, total: totalTests },
            revenue: totalRevenue,
            activeUsers: activeUserIds.length
        };

        // Cache for 1 minute
        await setCachedData(cacheKey, stats, 60);

        res.json(stats);
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ══════════════════════════════════════════════════════════
// 4. PAYMENT REPORTing
// ══════════════════════════════════════════════════════════

router.get('/payments', auth, adminAuth, async (req, res) => {
    try {
        const { start, end } = req.query;
        let query = { status: 'success' };
        if (start && end) {
            query.createdAt = { $gte: new Date(start), $lte: new Date(end) };
        }

        const payments = await Payment.find(query)
            .sort({ createdAt: -1 })
            .populate('userId', 'name email');
        
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
