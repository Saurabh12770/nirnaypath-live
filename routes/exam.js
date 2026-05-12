const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Question = require('../models/Question');
const TestResult = require('../models/TestResult');
const crypto = require('crypto');

/**
 * POST /api/exam/start
 * Accepts { subject, count }
 */
router.post('/start', auth, async (req, res) => {
    try {
        const { subject, count = 50 } = req.body;
        const limit = Math.min(parseInt(count) || 50, 100);

        if (!subject) {
            return res.status(400).json({ error: 'Subject is required' });
        }

        console.log(`[ExamStart] User: ${req.user._id}, Subject: ${subject}, Count: ${limit}`);

        const questions = await Question.aggregate([
            { 
                $match: { 
                    $or: [
                        { subject: subject.toLowerCase() },
                        { subjectId: subject.toLowerCase() }
                    ]
                } 
            },
            { $sample: { size: limit } }
        ]);

        if (!questions || questions.length === 0) {
            return res.status(404).json({ error: `No questions found for subject: ${subject}` });
        }

        const examId = crypto.randomUUID();
        res.json({ examId, questions });
    } catch (error) {
        console.error('Exam Start Error:', error);
        res.status(500).json({ error: 'Server error starting exam' });
    }
});

/**
 * POST /api/exam/submit
 * Accepts { examId, answers: [ { questionId, selected } ], subject, exam, testName }
 */
router.post('/submit', auth, async (req, res) => {
    try {
        const { examId, answers = [], subject, exam, testName } = req.body;
        
        if (!subject || !exam) {
            return res.status(400).json({ error: 'Missing metadata (subject/exam)' });
        }

        // Fetch questions to verify answers
        const questionIds = answers.map(a => a.questionId);
        const questions = await Question.find({ _id: { $in: questionIds } });
        const questionMap = questions.reduce((map, q) => {
            map[q._id.toString()] = q;
            return map;
        }, {});

        let correct = 0;
        let incorrect = 0;
        let unattempted = 0;
        const processedAnswers = [];

        // Note: The client should send all questions in the test, even if not answered
        // But for robustness, we'll iterate through the provided answers
        answers.forEach(ans => {
            const q = questionMap[ans.questionId];
            if (!q) return;

            const isCorrect = String(ans.selected).trim() === String(q.correctAnswer).trim();
            if (ans.selected === null || ans.selected === undefined || ans.selected === '') {
                unattempted++;
            } else if (isCorrect) {
                correct++;
            } else {
                incorrect++;
            }

            processedAnswers.push({
                questionId: ans.questionId,
                userAnswer: ans.selected ? String(ans.selected) : null,
                correctAnswer: String(q.correctAnswer),
                isCorrect: isCorrect,
                topic: q.topic || 'General'
            });
        });

        const total = questions.length;
        const accuracy = total > 0 ? (correct / (correct + incorrect || 1)) * 100 : 0;

        const result = new TestResult({
            userId: req.user._id,
            exam: exam || 'Mock Test',
            subject: subject,
            testName: testName || `${subject} Mock Test`,
            score: correct,
            totalQuestions: total,
            correct,
            incorrect,
            unattempted: total - (correct + incorrect),
            accuracy: parseFloat(accuracy.toFixed(1)),
            answers: processedAnswers
        });

        await result.save();

        res.json({
            score: correct,
            total,
            accuracy: accuracy.toFixed(1),
            correct,
            incorrect,
            unattempted: total - (correct + incorrect)
        });
    } catch (error) {
        console.error('Exam Submit Error:', error);
        res.status(500).json({ error: 'Server error submitting exam' });
    }
});

module.exports = router;
