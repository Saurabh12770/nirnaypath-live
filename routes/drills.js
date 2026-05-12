const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const crypto = require('crypto');
const TestSession = require('../models/TestSession');
const Question = require('../models/Question');
const { getCachedData, setCachedData } = require('../middleware/cache');
const { requirePlan } = require('../middleware/planGuard');
const { resolveTopicIdentifier } = require('../utils/topicNormalizer');
const { loadQuestions } = require('../utils/questionLoader');

/**
 * GET /api/drill/:subject/:topic?count=20
 * HARDENED: Now creates a TestSession to enable server-side scoring and analytics.
 */
router.get('/:subject/:topic', auth, requirePlan('free'), async (req, res) => {
    const requestId = crypto.randomBytes(4).toString('hex');
    try {
        const { subject, topic } = req.params;
        const count = Math.min(parseInt(req.query.count) || 20, 100);
        const subLower = subject.toLowerCase().trim();
        const topicLower = topic.toLowerCase().trim();

        console.log(`[DrillStart][${requestId}] Request for ${subLower} - ${topicLower}`);

        // 1. Fetch Randomized Questions from Unified Pool
        const cacheKey = `pool_${subLower}_${topicLower}`;
        let pool = await getCachedData(cacheKey);

        if (!pool || !Array.isArray(pool) || pool.length < count) {
            console.log(`[DrillStart][${requestId}] Pool miss/low. Fetching from DB...`);
            try {
                pool = await Question.aggregate([
                    { 
                        $match: { 
                            $and: [
                                { $or: [{ subjectId: subLower }, { subject: subLower }] },
                                { $or: [{ topicId: topicLower }, { topic: topicLower }] }
                            ]
                        } 
                    },
                    { $sample: { size: Math.max(count * 5, 50) } }
                ]).lean();
            } catch (dbErr) {
                console.error(`[DrillStart][${requestId}] DB Aggregate failed:`, dbErr.message);
                pool = [];
            }

            if (pool && pool.length > 0) {
                await setCachedData(cacheKey, pool, 300);
            }
        }

        // 2. Fallback to JSON if DB is empty/fails
        if (!pool || pool.length === 0) {
            console.log(`[DrillStart][${requestId}] DB empty. Falling back to JSON for: ${subLower}`);
            const questions = await loadQuestions(subLower);
            const qArray = Array.isArray(questions) ? questions : (questions?.questions || []);
            
            if (qArray.length > 0) {
                pool = qArray.filter(q => resolveTopicIdentifier(q) === topicLower);
            }
        }

        if (!pool || !Array.isArray(pool) || pool.length === 0) {
            return res.status(404).json({ error: `No questions found for topic: ${topic}` });
        }

        const finalQuestions = [...pool]
            .sort(() => 0.5 - Math.random())
            .slice(0, count);

        // 3. Atomic Session Creation
        const sessionId = crypto.randomUUID();
        const session = new TestSession({
            userId: req.user._id,
            sessionId,
            subject: subLower,
            topic: topicLower,
            exam: 'Drill',
            questionCount: finalQuestions.length,
            timeLimit: 3600,
            startTime: new Date(),
            status: 'active',
            questionIds: finalQuestions.map(q => q._id ? q._id.toString() : q.id)
        });

        await session.save();

        // 4. Response
        const mappedQuestions = finalQuestions.map(q => {
            const doc = q._doc || q;
            return {
                id: doc._id || doc.id,
                text: doc.text || doc.question_en,
                options: doc.options || doc.options_en,
                subject: doc.subject || doc.subjectId,
                topic: resolveTopicIdentifier(doc),
                correctAnswer: doc.correctAnswer !== undefined ? doc.correctAnswer : doc.answer
            };
        });

        res.json({
            sessionId,
            topic: topicLower,
            subject: subLower,
            questions: mappedQuestions,
            startTime: session.startTime
        });

    } catch (error) {
        console.error(`[DrillStart][${requestId}] CRITICAL ERROR:`, error);
        res.status(500).json({ error: 'Internal failure during drill initialization' });
    }
});

module.exports = router;
