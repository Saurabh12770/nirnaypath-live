const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const Payment = require('../models/Payment');
const TestResult = require('../models/TestResult');
const { loadQuestions } = require('../utils/questionLoader');

// Helper to save questions to JSON file
const saveQuestionsToFile = async (subject, questions) => {
    const filePath = path.join(__dirname, '../data', `${subject}.json`);
    await fs.writeFile(filePath, JSON.stringify(questions, null, 2), 'utf8');
};

// ══════════════════════════════════════════════════════════
// 1. QUESTION MANAGEMENT
// ══════════════════════════════════════════════════════════

// List all subjects
router.get('/subjects', auth, adminAuth, async (req, res) => {
    try {
        const dataDir = path.join(__dirname, '../data');
        const files = await fs.readdir(dataDir);
        const subjects = files
            .filter(f => f.endsWith('.json'))
            .map(f => f.replace('.json', ''));
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
        
        let questions = await loadQuestions(subject);
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
        const newQuestion = req.body;
        
        let questions = await loadQuestions(subject);
        if (!questions) questions = [];

        // Assign a unique ID if not provided
        if (!newQuestion.id) newQuestion.id = Date.now().toString();
        
        questions.push(newQuestion);
        await saveQuestionsToFile(subject, questions);
        
        res.status(201).json({ message: 'Question added', question: newQuestion });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update question
router.put('/questions/:subject/:id', auth, adminAuth, async (req, res) => {
    try {
        const { subject, id } = req.params;
        const updatedData = req.body;
        
        let questions = await loadQuestions(subject);
        const idx = questions.findIndex(q => q.id === id || q._id === id);
        
        if (idx === -1) return res.status(404).json({ error: 'Question not found' });

        questions[idx] = { ...questions[idx], ...updatedData };
        await saveQuestionsToFile(subject, questions);
        
        res.json({ message: 'Question updated', question: questions[idx] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete question
router.delete('/questions/:subject/:id', auth, adminAuth, async (req, res) => {
    try {
        const { subject, id } = req.params;
        let questions = await loadQuestions(subject);
        
        const filtered = questions.filter(q => q.id !== id && q._id !== id);
        if (filtered.length === questions.length) return res.status(404).json({ error: 'Question not found' });

        await saveQuestionsToFile(subject, filtered);
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

        let existing = await loadQuestions(subject);
        if (!existing) existing = [];

        const merged = [...existing, ...newBatch];
        await saveQuestionsToFile(subject, merged);
        
        res.json({ message: `Successfully uploaded ${newBatch.length} questions` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ══════════════════════════════════════════════════════════
// 2. USER MANAGEMENT
// ══════════════════════════════════════════════════════════

// List users with stats
router.get('/users', auth, adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 50, search = '' } = req.query;
        const query = search ? { 
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        } : {};

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-password');

        const count = await User.countDocuments(query);

        // Map users to include test counts (simplified)
        const userList = await Promise.all(users.map(async (u) => {
            const testCount = await TestResult.countDocuments({ userId: u._id });
            return { ...u.toObject(), testsCount: testCount };
        }));

        res.json({ users: userList, total: count, page: parseInt(page) });
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

router.get('/stats', auth, adminAuth, async (req, res) => {
    try {
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

        res.json({
            users: { total: totalUsers, pro: proUsers, banned: bannedUsers },
            tests: { today: testsToday, week: testsThisWeek, total: totalTests },
            revenue: totalRevenue,
            activeUsers: activeUserIds.length
        });
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
