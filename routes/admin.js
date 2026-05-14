const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const Question = require('../models/question');
const User = require('../models/user');
const TestResult = require('../models/testResult');
const Payment = require('../models/payment');
const { loadQuestions } = require('../utils/questionLoader');
const { atomicWriteFile } = require('../utils/fileUtils');
const QQS = require('../services/questionQualityService');

// List questions from MongoDB (Primary source of truth)
router.get('/questions/:subject', auth, adminAuth, async (req, res) => {
    const { trace, CATEGORIES } = require('../utils/runtimeTrace');
    try {
        const { subject } = req.params;
        const { page = 1, limit = 50, topic = '', difficulty = '', search = '' } = req.query;
        
        const subLower = subject.toLowerCase().trim();
        trace(CATEGORIES.ADMIN_FLOW, 'Question List Requested', { subject: subLower, page });
        
        const query = { 
            $or: [{ subjectId: subLower }, { subject: subLower }] 
        };

        if (topic) query.topic = topic; 
        if (difficulty) query.difficulty = difficulty;
        if (search) {
            query.$or = [
                { question_en: { $regex: search, $options: 'i' } },
                { question_hi: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * parseInt(limit);
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

/**
 * Sync MongoDB to JSON File (Asynchronous Backup)
 * Phase 6: JSON is fallback only
 */
const syncToJSON = async (subject) => {
    try {
        const subLower = subject.toLowerCase().trim();
        const questions = await Question.find({ 
            $or: [{ subjectId: subLower }, { subject: subLower }] 
        }).lean();
        
        const filePath = path.join(__dirname, '../data', `${subLower}.json`);
        await atomicWriteFile(filePath, questions);
        console.log(`[Backup] Synced ${questions.length} questions to ${subLower}.json`);
    } catch (err) {
        console.error('[Backup] JSON Sync Error:', err.message);
    }
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


// Add new question (MongoDB Direct) — with quality scoring
router.post('/questions/:subject', auth, adminAuth, async (req, res) => {
    const { trace, CATEGORIES } = require('../utils/runtimeTrace');
    try {
        const { subject } = req.params;
        const subLower = subject.toLowerCase().trim();
        
        trace(CATEGORIES.ADMIN_FLOW, 'Question Add Attempt', { subject: subLower });

        // Validation warnings (non-blocking)
        const { valid, warnings } = QQS.validate(req.body);

        const questionData = { 
            ...req.body, 
            subjectId: subLower,
            subject: subLower,
            createdAt: new Date(),
            ...QQS.score(req.body), // attach qualityScore, qualityFlags, reviewRequired
        };
        
        const question = new Question(questionData);
        await question.save();
        
        trace(CATEGORIES.ADMIN_FLOW, 'Question Add Success', { qId: question._id });
        syncToJSON(subject).catch(() => {});
        
        res.status(201).json({ message: 'Question added', question, warnings });
    } catch (error) {
        trace(CATEGORIES.ADMIN_FLOW, 'Question Add Failure', { error: error.message });
        res.status(500).json({ error: error.message });
    }
});

// Update question — re-score quality on every save
router.put('/questions/:subject/:id', auth, adminAuth, async (req, res) => {
    try {
        const { subject, id } = req.params;
        const updatedData = req.body;
        delete updatedData._id; // Safety

        // Attach fresh quality metrics
        const qualityMeta = QQS.score(updatedData);
        Object.assign(updatedData, qualityMeta);
        
        const question = await Question.findOneAndUpdate(
            { $or: [{ _id: id.length === 24 ? id : undefined }, { id: id }] },
            { $set: updatedData },
            { new: true }
        );
        
        if (!question) return res.status(404).json({ error: 'Question not found' });

        const { warnings } = QQS.validate(updatedData);
        syncToJSON(subject).catch(() => {});
        res.json({ message: 'Question updated', question, warnings });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete question
router.delete('/questions/:subject/:id', auth, adminAuth, async (req, res) => {
    try {
        const { subject, id } = req.params;
        
        const question = await Question.findOneAndDelete({
            $or: [{ _id: id.length === 24 ? id : null }, { id: id }]
        });

        if (!question) return res.status(404).json({ error: 'Question not found' });

        syncToJSON(subject).catch(() => {});
        res.json({ message: 'Question deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Bulk upload — with duplicate detection + quality scoring + validation
router.post('/questions/:subject/bulk', auth, adminAuth, async (req, res) => {
    try {
        const { subject } = req.params;
        const { questions: newBatch } = req.body;
        
        if (!Array.isArray(newBatch) || newBatch.length === 0) {
            return res.status(400).json({ error: 'Questions must be a non-empty array' });
        }

        const subLower = subject.toLowerCase().trim();
        const uploadSummary = { total: newBatch.length, inserted: 0, duplicatesSkipped: 0, warnings: [] };

        // Fetch existing hashes for this subject to detect duplicates
        const existingRaw = await Question.find(
            { $or: [{ subjectId: subLower }, { subject: subLower }] },
            { question_en: 1, text: 1 }
        ).lean();
        const existingHashes = new Set(
            existingRaw.map(q => crypto.createHash('md5').update((q.question_en || q.text || '').trim().toLowerCase()).digest('hex'))
        );

        const toInsert = [];
        for (const q of newBatch) {
            const enText = (q.question_en || q.text || '').trim();
            const hash = crypto.createHash('md5').update(enText.toLowerCase()).digest('hex');
            if (existingHashes.has(hash)) {
                uploadSummary.duplicatesSkipped++;
                continue;
            }
            existingHashes.add(hash); // guard within batch too

            const { warnings } = QQS.validate(q);
            if (warnings.length) uploadSummary.warnings.push({ text: enText.slice(0, 40), warnings });

            toInsert.push({
                ...q,
                subjectId: subLower,
                subject: subLower,
                createdAt: new Date(),
                ...QQS.score(q),
            });
        }

        if (toInsert.length) await Question.insertMany(toInsert, { ordered: false });
        uploadSummary.inserted = toInsert.length;
        syncToJSON(subject).catch(() => {});
        
        res.json({ message: `Bulk upload complete`, ...uploadSummary });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── Review Queue — questions flagged for admin attention ─────────────────────
router.get('/questions/review-queue', auth, adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [questions, total] = await Promise.all([
            Question.find({ reviewRequired: true })
                .sort({ qualityScore: 1 }) // lowest quality first
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Question.countDocuments({ reviewRequired: true }),
        ]);
        res.json({ questions, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── Approve a question from review queue ─────────────────────────────────────
router.patch('/questions/:id/approve', auth, adminAuth, async (req, res) => {
    try {
        const q = await Question.findByIdAndUpdate(
            req.params.id,
            { $set: { reviewRequired: false } },
            { new: true }
        );
        if (!q) return res.status(404).json({ error: 'Question not found' });
        res.json({ message: 'Question approved', question: q });
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
    const { trace, CATEGORIES } = require('../utils/runtimeTrace');
    try {
        trace(CATEGORIES.ADMIN_FLOW, 'Dashboard Stats Requested');
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
        trace(CATEGORIES.ADMIN_FLOW, 'Dashboard Stats Error', { error: error.message });
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
