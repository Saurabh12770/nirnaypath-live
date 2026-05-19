'use strict';

/**
 * questionFingerprint.js
 * ======================
 * PHASE 2 — Stable, collision-resistant question fingerprinting.
 *
 * Generates a deterministic SHA-256 hash for each question using:
 *   - Normalized question text (EN + HI)
 *   - Normalized options
 *   - Subject
 *   - Difficulty
 *
 * Used by dedup pipeline to eliminate:
 *   - Same question stored under different IDs
 *   - Variants with minor punctuation/spacing differences
 *   - Cross-subject duplicates
 */

const crypto = require('crypto');

/**
 * Normalize a text string for stable hashing:
 *   - lowercase
 *   - strip punctuation (keep Devanagari)
 *   - collapse whitespace
 *
 * @param {string} text
 * @returns {string}
 */
function normalizeText(text) {
    if (!text || typeof text !== 'string') return '';
    return text
        .toLowerCase()
        .replace(/[^\w\u0900-\u097F\s]/g, '') // keep alphanum + Devanagari
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Normalize an array of option strings.
 * Options are sorted alphabetically so reordering doesn't produce a different hash.
 *
 * @param {any[]} options
 * @returns {string}
 */
function normalizeOptions(options) {
    if (!Array.isArray(options) || options.length === 0) return '';

    const texts = options.map(o => {
        if (typeof o === 'string') return normalizeText(o);
        if (o && typeof o === 'object') {
            // Support { text: { en, hi } } or { en, hi } or { text: string }
            const en = o.text?.en || o.en || o.text || '';
            const hi = o.text?.hi || o.hi || '';
            return normalizeText(`${en}${hi}`);
        }
        return '';
    });

    return texts.sort().join('|');
}

/**
 * Generate a stable SHA-256 fingerprint for a question.
 *
 * @param {object} q - Question object (any schema variant)
 * @returns {string} 16-character hex fingerprint (first 64 bits of SHA-256)
 */
function generateFingerprint(q) {
    if (!q || typeof q !== 'object') return '';

    const textEn = normalizeText(
        q.question_en || q.question?.en || q.text || ''
    );
    const textHi = normalizeText(
        q.question_hi || q.question?.hi || ''
    );
    const opts = normalizeOptions(
        q.options_en || q.options || []
    );
    const subject    = normalizeText(q.subject    || q.subjectId || '');
    const difficulty = normalizeText(q.difficulty || '');

    const payload = `${textEn}|||${textHi}|||${opts}|||${subject}|||${difficulty}`;

    return crypto
        .createHash('sha256')
        .update(payload, 'utf8')
        .digest('hex')
        .slice(0, 16); // 8 bytes = 64 bits — sufficient uniqueness for dedup
}

/**
 * Annotate an array of questions with their fingerprints (mutates a clone).
 *
 * @param {object[]} questions
 * @returns {object[]} Cloned questions with _fingerprint field added
 */
function annotateFingerprints(questions) {
    if (!Array.isArray(questions)) return [];
    return questions.map(q => ({
        ...q,
        _fingerprint: generateFingerprint(q)
    }));
}

/**
 * Deduplicate an array of questions by fingerprint.
 * First occurrence wins; duplicates are logged and dropped.
 *
 * @param {object[]} questions
 * @returns {object[]}
 */
function deduplicateByFingerprint(questions) {
    if (!Array.isArray(questions)) return [];

    const seen = new Map(); // fingerprint → first id
    const unique = [];
    let dropped = 0;

    for (const q of questions) {
        const fp = generateFingerprint(q);
        const id = q.id || q.questionId || (q._id ? q._id.toString() : '?');

        if (!fp) {
            unique.push(q); // Can't fingerprint — keep it
            continue;
        }

        if (seen.has(fp)) {
            console.warn(
                `[QUESTION_FINGERPRINT][DEDUPE] Duplicate detected. ` +
                `Dropping id="${id}" (same fingerprint as id="${seen.get(fp)}")`
            );
            dropped++;
            continue;
        }

        seen.set(fp, id);
        unique.push(q);
    }

    if (dropped > 0) {
        console.log(`[QUESTION_FINGERPRINT][DEDUPE] Dropped ${dropped} duplicates from pool of ${questions.length}.`);
    }

    return unique;
}

module.exports = {
    generateFingerprint,
    annotateFingerprints,
    deduplicateByFingerprint,
    normalizeText,
    normalizeOptions,
};
