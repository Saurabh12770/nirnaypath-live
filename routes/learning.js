'use strict';

/**
 * Learning Routes v2.0
 * =====================
 * Clean API — no AI services, no Redis, no dead imports.
 *
 * GET  /api/learning/exams           → full exam catalogue
 * GET  /api/learning/exams/:examId   → single exam + its subjects
 * GET  /api/learning/subjects        → all subjects (unique)
 * GET  /api/learning/subjects/:examId → subjects for a specific exam
 * GET  /api/learning/topics          → topics for exam+subject (query params)
 * GET  /api/learning/content         → full content for exam/subject/topic/subTopic
 * GET  /api/learning/list            → content card list for exam (+ optional subject)
 * GET  /api/learning/mcqs            → practice MCQs for exam/subject/topic
 * GET  /api/learning/bookmarks       → user bookmarks
 * POST /api/learning/bookmarks       → add bookmark
 * DELETE /api/learning/bookmarks/:id → remove bookmark
 * GET  /api/learning/stats           → content stats (admin/public)
 */

const express               = require('express');
const auth                  = require('../middleware/auth');
const SyllabusService       = require('../services/syllabusService');
const LearningContentService = require('../services/learningContentService');
const Bookmark              = require('../models/bookmark');
const router                = express.Router();

/* ─────────────────────────────────────────────────────────────
   SYLLABUS ENDPOINTS
───────────────────────────────────────────────────────────── */

/**
 * GET /api/learning/exams
 * Public — full exam catalogue with subjects
 */
router.get('/exams', (req, res) => {
    try {
        const catalogue = SyllabusService.getCatalogue();
        res.json(catalogue);
    } catch (err) {
        console.error('[LEARNING] /exams error:', err.message);
        res.status(500).json({ error: 'Failed to fetch exam catalogue.' });
    }
});

/**
 * GET /api/learning/exams/:examId
 * Public — single exam detail
 */
router.get('/exams/:examId', (req, res) => {
    try {
        const exam = SyllabusService.getExam(req.params.examId);
        if (!exam) return res.status(404).json({ error: 'Exam not found.' });
        res.json(exam);
    } catch (err) {
        console.error('[LEARNING] /exams/:id error:', err.message);
        res.status(500).json({ error: 'Failed to fetch exam.' });
    }
});

/**
 * GET /api/learning/subjects
 * Public — all unique subjects across all exams
 */
router.get('/subjects', (req, res) => {
    try {
        const subjects = SyllabusService.getAllSubjects();
        res.json({ subjects });
    } catch (err) {
        console.error('[LEARNING] /subjects error:', err.message);
        res.status(500).json({ error: 'Failed to fetch subjects.' });
    }
});

/**
 * GET /api/learning/subjects/:examId
 * Public — subjects for a specific exam
 */
router.get('/subjects/:examId', (req, res) => {
    try {
        const subjects = SyllabusService.getSubjectsForExam(req.params.examId);
        if (!subjects) return res.status(404).json({ error: 'Exam not found.' });
        res.json({ examId: req.params.examId, subjects });
    } catch (err) {
        console.error('[LEARNING] /subjects/:examId error:', err.message);
        res.status(500).json({ error: 'Failed to fetch subjects for exam.' });
    }
});

/* ─────────────────────────────────────────────────────────────
   LEARNING CONTENT ENDPOINTS
───────────────────────────────────────────────────────────── */

/**
 * GET /api/learning/topics?exam=UPSC&subject=history
 * Public — topics/sub-topics for an exam+subject
 */
router.get('/topics', async (req, res) => {
    try {
        const { exam, subject } = req.query;
        if (!exam || !subject) {
            return res.status(400).json({ error: 'exam and subject query parameters are required.' });
        }
        const topics = await LearningContentService.getTopicsForSubject(exam, subject);
        res.json({ exam, subject, topics });
    } catch (err) {
        console.error('[LEARNING] /topics error:', err.message);
        res.status(500).json({ error: 'Failed to fetch topics.' });
    }
});

/**
 * GET /api/learning/content?exam=UPSC&subject=history&topic=Ancient%20India&subTopic=Indus%20Valley
 * Auth — full learning content for a specific sub-topic
 */
router.get('/content', auth, async (req, res) => {
    try {
        const { exam, subject, topic, subTopic } = req.query;
        if (!exam || !subject || !topic || !subTopic) {
            return res.status(400).json({ error: 'exam, subject, topic, and subTopic are required.' });
        }
        const content = await LearningContentService.getContent(exam, subject, topic, subTopic);
        if (!content) {
            return res.status(404).json({ error: 'Content not found for this topic.' });
        }
        res.json(content);
    } catch (err) {
        console.error('[LEARNING] /content error:', err.message);
        res.status(500).json({ error: 'Failed to fetch content.' });
    }
});

/**
 * GET /api/learning/list?exam=UPSC&subject=history
 * Public — list of content cards for browsing
 */
router.get('/list', async (req, res) => {
    try {
        const { exam, subject } = req.query;
        if (!exam) {
            return res.status(400).json({ error: 'exam query parameter is required.' });
        }
        const list = await LearningContentService.getContentList(exam, subject || null);
        res.json({ exam, subject: subject || null, count: list.length, items: list });
    } catch (err) {
        console.error('[LEARNING] /list error:', err.message);
        res.status(500).json({ error: 'Failed to fetch content list.' });
    }
});

/**
 * GET /api/learning/mcqs?exam=UPSC&subject=history&topic=Ancient%20India
 * Auth — practice MCQs for a topic (correctAnswer included for frontend reveal)
 */
router.get('/mcqs', auth, async (req, res) => {
    try {
        const { exam, subject, topic } = req.query;
        if (!exam || !subject || !topic) {
            return res.status(400).json({ error: 'exam, subject, and topic are required.' });
        }
        const mcqs = await LearningContentService.getPracticeMcqs(exam, subject, topic);
        res.json({ exam, subject, topic, count: mcqs.length, mcqs });
    } catch (err) {
        console.error('[LEARNING] /mcqs error:', err.message);
        res.status(500).json({ error: 'Failed to fetch practice MCQs.' });
    }
});

/**
 * GET /api/learning/stats
 * Public — aggregate content stats per exam
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await LearningContentService.getStats();
        res.json({ stats });
    } catch (err) {
        console.error('[LEARNING] /stats error:', err.message);
        res.status(500).json({ error: 'Failed to fetch stats.' });
    }
});

/* ─────────────────────────────────────────────────────────────
   BOOKMARK ENDPOINTS
───────────────────────────────────────────────────────────── */

/**
 * GET /api/learning/bookmarks
 * Auth — all bookmarks for the logged-in user
 */
router.get('/bookmarks', auth, async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .lean();
        res.json({ count: bookmarks.length, bookmarks });
    } catch (err) {
        console.error('[LEARNING] /bookmarks GET error:', err.message);
        res.status(500).json({ error: 'Failed to fetch bookmarks.' });
    }
});

/**
 * POST /api/learning/bookmarks
 * Auth — add a bookmark
 * Body: { type, refId, title, exam, subject, topic }
 */
router.post('/bookmarks', auth, async (req, res) => {
    try {
        const { type, refId, title, exam, subject, topic } = req.body;
        if (!type || !refId || !title) {
            return res.status(400).json({ error: 'type, refId, and title are required.' });
        }

        // Idempotent — upsert
        const bookmark = await Bookmark.findOneAndUpdate(
            { userId: req.user._id, refId, type },
            { userId: req.user._id, type, refId, title, exam, subject, topic },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean();

        res.status(201).json({ message: 'Bookmark saved.', bookmark });
    } catch (err) {
        console.error('[LEARNING] /bookmarks POST error:', err.message);
        res.status(500).json({ error: 'Failed to save bookmark.' });
    }
});

/**
 * DELETE /api/learning/bookmarks/:id
 * Auth — remove a bookmark by its MongoDB _id
 */
router.delete('/bookmarks/:id', auth, async (req, res) => {
    try {
        const result = await Bookmark.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!result) return res.status(404).json({ error: 'Bookmark not found.' });
        res.json({ message: 'Bookmark removed.' });
    } catch (err) {
        console.error('[LEARNING] /bookmarks DELETE error:', err.message);
        res.status(500).json({ error: 'Failed to remove bookmark.' });
    }
});

module.exports = router;
