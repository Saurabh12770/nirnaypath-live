'use strict';

/**
 * sanitizeQuestions.js
 * ====================
 * SECURITY: Centralized question sanitizer.
 *
 * Problem: Raw pipeline payloads expose correctAnswer, answer,
 * explanation*, correctOption — ALL of which allow trivial cheating.
 *
 * Fix: Every public API endpoint MUST call sanitizeForClient() before
 * serialising questions in the HTTP response. Explanations and correct
 * answers are ONLY permitted in:
 *   - POST /api/test/submit  (reviewed answers, server-calculated)
 *   - GET  /api/test/review  (authenticated post-submission review)
 *   - Admin analysis endpoints
 *
 * This module also provides a dev-mode payload inspector that logs any
 * response that accidentally includes answer fields.
 */

/** Fields that MUST NEVER appear in a public question payload */
const FORBIDDEN_FIELDS = [
    'correctAnswer',
    'correctOption',
    'correct',
    'answer',
    'explanation',
    'explanation_en',
    'explanation_hi',
    'solution',
    'solution_en',
    'solution_hi',
    'hint',           // reserved – may contain implicit answer
    '_correctIdx',
];

/**
 * Sanitize a single question object for client delivery.
 * Strips all answer/explanation fields.
 *
 * @param {object} q - Raw question from pipeline
 * @returns {object} Safe question payload
 */
function sanitizeQuestion(q) {
    if (!q || typeof q !== 'object') return q;

    const safe = {
        id:          q.id || (q._id ? q._id.toString() : undefined),
        question:    q.question,
        question_en: q.question_en,
        question_hi: q.question_hi,
        options:     q.options,
        options_en:  q.options_en,
        options_hi:  q.options_hi,
        topic:       q.topic,
        topicId:     q.topicId,
        difficulty:  q.difficulty,
        subject:     q.subject,
        subjectId:   q.subjectId,
        tags:        q.tags,
        examType:    q.examType,
    };

    // Remove undefined keys so the payload stays clean
    Object.keys(safe).forEach(k => {
        if (safe[k] === undefined) delete safe[k];
    });

    return safe;
}

/**
 * Sanitize an array of questions.
 *
 * @param {object[]} questions
 * @returns {object[]}
 */
function sanitizeForClient(questions) {
    if (!Array.isArray(questions)) {
        console.error('[sanitizeQuestions] Expected array, got:', typeof questions);
        return [];
    }
    return questions.map(sanitizeQuestion);
}

/**
 * Development-mode payload inspector.
 * Call after res.json() equivalent to detect accidental leaks.
 * NEVER called in production (guard is inside the function).
 *
 * @param {object} payload - The full response payload
 * @param {string} endpoint - Label for logging
 */
function inspectPayloadForLeaks(payload, endpoint = 'unknown') {
    if (process.env.NODE_ENV === 'production') return;

    const payloadStr = JSON.stringify(payload);
    const leaked = FORBIDDEN_FIELDS.filter(f => {
        // Check for the key as a JSON property name
        const pattern = new RegExp(`"${f}"\\s*:`);
        return pattern.test(payloadStr);
    });

    if (leaked.length > 0) {
        console.error(
            `[LEAK_INSPECTOR][${endpoint}] ANSWER LEAKAGE DETECTED! ` +
            `Forbidden fields present in response: [${leaked.join(', ')}]`
        );
    }
}

/**
 * Assert that a payload is clean (for use in integration tests / CI).
 * Throws if any forbidden field is found.
 *
 * @param {object|object[]} payload
 * @throws {Error} if any answer field is present
 */
function assertNoAnswerLeakage(payload) {
    const payloadStr = JSON.stringify(payload);
    const leaked = FORBIDDEN_FIELDS.filter(f => {
        const pattern = new RegExp(`"${f}"\\s*:`);
        return pattern.test(payloadStr);
    });
    if (leaked.length > 0) {
        throw new Error(
            `REGRESSION: Answer leakage detected! Fields: [${leaked.join(', ')}]`
        );
    }
}

module.exports = {
    sanitizeQuestion,
    sanitizeForClient,
    inspectPayloadForLeaks,
    assertNoAnswerLeakage,
    FORBIDDEN_FIELDS,
};
