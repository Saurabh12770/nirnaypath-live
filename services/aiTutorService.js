'use strict';

const TestResult = require('../models/testResult');
const { askAI } = require('./aiService');

/**
 * NirnayPath AI Tutor Service
 * Module C — AI Tutor
 *
 * Provides personalized tutoring on demand:
 * - Explain incorrect answers from real test history
 * - Generate up to 3 progressive hints for a question
 * - Compile concept summaries for any topic
 * - Detect repeated mistake patterns from a student's history
 */
class AITutorService {

    /**
     * Explain why a student got a specific question wrong.
     * Parses stored explanation fields first (bilingual), then falls back to AI.
     *
     * @param {string|ObjectId} userId
     * @param {string} sessionId  — the TestResult sessionId
     * @param {string} questionId — the question to explain
     * @returns {Promise<Object>} { questionId, question_en, topic, userAnswer, correctAnswer, explanation_en, explanation_hi, isFallback }
     */
    static async explainWrongAnswer(userId, sessionId, questionId) {
        const result = await TestResult.findOne({ userId, sessionId }).lean();
        if (!result) {
            return { error: 'Test session not found for this user.' };
        }

        const answer = (result.answers || []).find(a => String(a.questionId) === String(questionId));
        if (!answer) {
            return { error: 'Question not found in this test session.' };
        }

        if (answer.isCorrect) {
            return {
                questionId,
                question_en: answer.question_en || 'UNKNOWN',
                topic: answer.topic || 'UNKNOWN',
                note: 'This question was answered correctly. No explanation required.'
            };
        }

        // 1. Return stored bilingual explanation if available
        if (answer.explanation_en) {
            return {
                questionId,
                question_en: answer.question_en || 'UNKNOWN',
                topic: answer.topic || 'UNKNOWN',
                userAnswer: answer.userAnswer,
                correctAnswer: answer.correctAnswer,
                explanation_en: answer.explanation_en,
                explanation_hi: answer.explanation_hi || null,
                isFallback: false,
                source: 'stored'
            };
        }

        // 2. Fallback: Generate AI explanation
        const prompt = `A student is preparing for Indian competitive exams on the NirnayPath platform.

Topic: ${answer.topic || 'General'}
Question: ${answer.question_en || answer.question || 'UNKNOWN'}
The student selected: "${answer.userAnswer}"
The correct answer is: "${answer.correctAnswer}"

Please:
1. Explain why the student's choice is incorrect.
2. Explain why the correct answer is right.
3. Provide a key learning point to help them avoid this mistake in future.
4. Keep your response concise, structured, and encouraging.`;

        const aiResponse = await askAI(prompt, []);

        if (aiResponse && aiResponse.success === false) {
            return {
                questionId,
                question_en: answer.question_en || answer.question || 'UNKNOWN',
                topic: answer.topic || 'UNKNOWN',
                userAnswer: answer.userAnswer,
                correctAnswer: answer.correctAnswer,
                explanation_en: "AI service unavailable",
                explanation_hi: null,
                isFallback: true,
                source: 'ai_generated',
                success: false,
                message: "AI service unavailable"
            };
        }

        return {
            questionId,
            question_en: answer.question_en || answer.question || 'UNKNOWN',
            topic: answer.topic || 'UNKNOWN',
            userAnswer: answer.userAnswer,
            correctAnswer: answer.correctAnswer,
            explanation_en: aiResponse.text,
            explanation_hi: null,
            isFallback: aiResponse.isFallback,
            source: 'ai_generated'
        };
    }

    /**
     * Generate up to 3 progressive hints for a question.
     * Hints escalate from vague clue → narrower hint → near-answer (without revealing it).
     *
     * @param {string} questionText — the question in English
     * @param {string} topic        — topic for context
     * @param {string} correctAnswer — the correct answer (used to craft targeted hints)
     * @returns {Promise<Array<string>>} Array of 3 hints in escalating specificity
     */
    static async generateHints(questionText, topic, correctAnswer) {
        const prompt = `You are an AI tutor for Indian competitive exam preparation (UPSC, SSC, Banking, Railway).

Topic: ${topic || 'General'}
Question: ${questionText}
Correct Answer: ${correctAnswer}

Generate exactly 3 progressive hints for this question:
- Hint 1: Very vague clue pointing to the broad concept (do NOT reveal the answer or subject directly).
- Hint 2: A narrower clue that helps the student recall the key fact.
- Hint 3: An almost-answer clue that strongly guides toward the correct response without stating it outright.

Format your response strictly as:
HINT_1: <text>
HINT_2: <text>
HINT_3: <text>`;

        const aiResponse = await askAI(prompt, []);

        if (aiResponse && aiResponse.success === false) {
            return aiResponse;
        }

        // Parse structured output
        const lines = (aiResponse.text || '').split('\n').map(l => l.trim()).filter(Boolean);
        const hints = [];

        for (const line of lines) {
            if (line.startsWith('HINT_1:')) hints[0] = line.replace('HINT_1:', '').trim();
            else if (line.startsWith('HINT_2:')) hints[1] = line.replace('HINT_2:', '').trim();
            else if (line.startsWith('HINT_3:')) hints[2] = line.replace('HINT_3:', '').trim();
        }

        // Fallback if AI response did not match format
        if (hints.filter(Boolean).length === 0) {
            return [
                'Think about the broad theme of this topic.',
                'Recall any key events, dates, or facts related to it.',
                aiResponse.text // Full AI response as hint 3 fallback
            ];
        }

        return hints.filter(Boolean);
    }

    /**
     * Generate a structured concept summary for a given topic.
     * Useful for pre-test revision and end-of-day review.
     *
     * @param {string} topic — topic name (e.g., "Ancient History", "Indian Polity")
     * @param {string} exam  — target exam (e.g., "UPSC", "SSC", "Banking")
     * @returns {Promise<Object>} { topic, summary_en, keyFacts, mnemonics, isFallback }
     */
    static async generateConceptSummary(topic, exam) {
        const prompt = `You are a concise, expert tutor for Indian competitive exams.

Topic: ${topic}
Target Exam: ${exam || 'UPSC/SSC/Banking'}

Generate a structured concept summary:
1. SUMMARY: A 3-5 sentence summary of the core concept.
2. KEY_FACTS: 5 bullet points of the most exam-relevant facts.
3. MNEMONICS: 1-2 memory tricks or mnemonics to remember this topic.

Format strictly as:
SUMMARY: <text>
KEY_FACTS:
- <fact 1>
- <fact 2>
- <fact 3>
- <fact 4>
- <fact 5>
MNEMONICS: <text>`;

        const aiResponse = await askAI(prompt, []);

        if (aiResponse && aiResponse.success === false) {
            return aiResponse;
        }

        // Parse the structured output
        let summaryText = '';
        const keyFacts = [];
        let mnemonics = '';

        const lines = (aiResponse.text || '').split('\n').map(l => l.trim()).filter(Boolean);
        let inKeyFacts = false;

        for (const line of lines) {
            if (line.startsWith('SUMMARY:')) {
                summaryText = line.replace('SUMMARY:', '').trim();
                inKeyFacts = false;
            } else if (line.startsWith('KEY_FACTS:')) {
                inKeyFacts = true;
            } else if (line.startsWith('MNEMONICS:')) {
                mnemonics = line.replace('MNEMONICS:', '').trim();
                inKeyFacts = false;
            } else if (inKeyFacts && line.startsWith('-')) {
                keyFacts.push(line.replace(/^-\s*/, '').trim());
            }
        }

        return {
            topic,
            exam: exam || 'UNKNOWN',
            summary_en: summaryText || aiResponse.text,
            keyFacts: keyFacts.length > 0 ? keyFacts : [],
            mnemonics: mnemonics || null,
            isFallback: aiResponse.isFallback
        };
    }

    /**
     * Detect repeated mistake patterns from a student's full test history.
     * Groups errors by topic, mistake type (careless vs conceptual), and frequency.
     *
     * @param {string|ObjectId} userId
     * @param {number} limit — how many recent tests to analyse (default 20)
     * @returns {Promise<Object>} { patterns, topMistakeTopics, summary }
     */
    static async detectRepeatedMistakes(userId, limit = 20) {
        const results = await TestResult.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean();

        if (results.length === 0) {
            return { patterns: [], topMistakeTopics: [], summary: 'No test history available yet.' };
        }

        const topicErrors = {};
        let totalAnswers = 0;
        let totalWrong = 0;

        results.forEach(res => {
            (res.answers || []).forEach(ans => {
                totalAnswers++;
                if (!ans.isCorrect) {
                    totalWrong++;
                    const topic = ans.topic || ans.topicId || 'General';
                    if (!topicErrors[topic]) {
                        topicErrors[topic] = { topic, errors: 0, careless: 0, conceptual: 0 };
                    }
                    topicErrors[topic].errors++;

                    // Heuristic: if userAnswer exists but is incorrect → conceptual or careless
                    // We classify 'careless' if the answer was given but wrong, 'conceptual' if empty/skipped
                    if (ans.userAnswer && ans.userAnswer !== '') {
                        topicErrors[topic].careless++;
                    } else {
                        topicErrors[topic].conceptual++;
                    }
                }
            });
        });

        // Build patterns sorted by error count descending
        const patterns = Object.values(topicErrors)
            .sort((a, b) => b.errors - a.errors)
            .map(p => ({
                topic: p.topic,
                totalErrors: p.errors,
                carelessErrors: p.careless,
                conceptualErrors: p.conceptual,
                dominantMistakeType: p.careless > p.conceptual ? 'CARELESS' : 'CONCEPTUAL',
                urgency: p.errors >= 5 ? 'HIGH' : p.errors >= 2 ? 'MEDIUM' : 'LOW'
            }));

        const topMistakeTopics = patterns.slice(0, 5).map(p => p.topic);

        const overallRate = totalAnswers > 0 ? Math.round((totalWrong / totalAnswers) * 100) : 0;
        const summary = `Analysed ${results.length} tests. Error rate: ${overallRate}%. ` +
            (topMistakeTopics.length > 0
                ? `Repeated mistakes detected in: ${topMistakeTopics.join(', ')}.`
                : 'No dominant repeated mistake patterns detected yet.');

        return { patterns, topMistakeTopics, summary };
    }
}

module.exports = AITutorService;
