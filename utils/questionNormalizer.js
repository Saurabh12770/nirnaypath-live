/**
 * NirnayPath Question Normalizer v4.0
 * FAANG-Level Data Integrity Layer
 */

const normalizeQuestion = (q) => {
    if (!q) return null;
    const doc = q._doc || q;
    
    // --- 1. Text Normalization (Bilingual Fallback Chain) ---
    const question_en = (
        doc.question_en || 
        doc.questionEnglish || 
        doc.text || 
        doc.question || 
        'Question text missing'
    ).trim();

    const question_hi = (
        doc.question_hi || 
        doc.questionHindi || 
        doc.hindi_text ||
        (doc.question_en ? doc.question_en : question_en)
    ).trim();

    // --- 2. Options Normalization (Multi-Format Support) ---
    const getOptions = (source) => {
        if (!source) return [];
        if (Array.isArray(source)) return source.map(o => String(o).trim()).filter(o => o !== '');
        
        if (typeof source === 'object') {
            // Handle numbered maps {0: "a", 1: "b"} or {"1": "a", "2": "b"}
            const values = Object.keys(source)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map(key => source[key]);
            return values.map(o => String(o).trim()).filter(o => o !== '');
        }

        if (typeof source === 'string' && source.includes(',')) {
            // Handle comma-separated strings
            return source.split(',').map(o => o.trim()).filter(o => o !== '');
        }

        return [];
    };

    let opts_en = getOptions(doc.options_en || doc.options || doc.choices || doc.options_English);
    let opts_hi = getOptions(doc.options_hi || doc.options_Hindi);

    const origOptsEnLength = opts_en.length;
    const origOptsHiLength = opts_hi.length;

    // Enforce exactly 4 options
    const normalizeOptions = (opts, lang = 'en') => {
        let clean = [...opts];
        if (clean.length < 4) {
            const placeholders = lang === 'en' ? ['Option A', 'Option B', 'Option C', 'Option D'] : ['विकल्प A', 'विकल्प B', 'विकल्प C', 'विकल्प D'];
            while (clean.length < 4) {
                clean.push(placeholders[clean.length]);
            }
        }
        return clean.slice(0, 4);
    };

    opts_en = normalizeOptions(opts_en, 'en');
    opts_hi = opts_hi.length >= 4 ? normalizeOptions(opts_hi, 'hi') : [...opts_en];

    // --- 3. Answer Normalization (Intelligent Mapping) ---
    let correctAnswer = 0;
    const rawAns = doc.correctAnswer !== undefined ? doc.correctAnswer : (doc.answer !== undefined ? doc.answer : doc.correct_option);
    let isCorrectAnswerOutOfRange = false;

    if (rawAns !== undefined && rawAns !== null) {
        if (typeof rawAns === 'number') {
            if (rawAns < 0 || rawAns > 3) {
                isCorrectAnswerOutOfRange = true;
            }
            correctAnswer = Math.max(0, Math.min(3, Math.floor(rawAns)));
        } else if (typeof rawAns === 'string') {
            const s = rawAns.trim().toUpperCase();
            if (['A', 'B', 'C', 'D'].includes(s)) {
                correctAnswer = ['A', 'B', 'C', 'D'].indexOf(s);
            } else if (['0', '1', '2', '3'].includes(s)) {
                correctAnswer = parseInt(s);
            } else {
                // Try to match text
                const idx = opts_en.findIndex(o => o.toLowerCase() === s.toLowerCase());
                if (idx !== -1) {
                    correctAnswer = idx;
                } else {
                    isCorrectAnswerOutOfRange = true;
                }
            }
        } else {
            isCorrectAnswerOutOfRange = true;
        }
    }

    // --- 4. Explanation Normalization ---
    const explanation_en = (doc.explanation_en || doc.explanation || doc.solution || 'Detailed explanation is being processed for this question.').trim();
    const explanation_hi = (doc.explanation_hi || doc.explanation_hindi || explanation_en).trim();

    // --- 5. Invalid Detection (Forensic Marking) ---
    const isInvalid = (
        question_en === 'Question text missing' ||
        new Set(opts_en).size < 2 || // Detect junk data
        origOptsEnLength < 4 ||
        (origOptsHiLength > 0 && origOptsHiLength < 4) ||
        isCorrectAnswerOutOfRange
    );

    return {
        id: doc._id || doc.id || doc.questionId,
        question_en,
        question_hi,
        options_en: opts_en,
        options_hi: opts_hi,
        explanation_en,
        explanation_hi,
        correctAnswer,
        subject: doc.subjectId || doc.subject || 'general',
        topic: doc.topicId || doc.topic || 'general',
        difficulty: doc.difficulty || 'medium',
        isInvalid
    };
};

/**
 * Normalizes an entire bank of questions.
 * @param {Array} questions - Raw question array
 * @returns {Object} { valid, invalid, stats }
 */
const normalizeBank = (questions) => {
    if (!Array.isArray(questions)) {
        return { valid: [], invalid: [], stats: { total: 0, valid: 0, invalid: 0 } };
    }

    const DedupEngine = require('../services/dedupEngine');
    const valid = [];
    const invalid = [];
    const seenIds = new Set();
    const seenTexts = new Set();

    questions.forEach(q => {
        try {
            const normalized = normalizeQuestion(q);
            if (!normalized || normalized.isInvalid) {
                invalid.push(q);
                return;
            }

            // 1. ID Dedup
            const id = String(normalized.id || '').trim().toLowerCase();
            if (id && seenIds.has(id)) return;
            if (id) seenIds.add(id);

            // 2. Semantic Dedup
            const text = DedupEngine.normalizeText(normalized.question_en || normalized.question_hi || '');
            if (text && seenTexts.has(text)) {
                // If it's a semantic duplicate, we skip it but don't count it as "invalid" 
                // because the data itself might be valid, just redundant.
                return;
            }
            if (text) seenTexts.add(text);

            valid.push(normalized);
        } catch (e) {
            console.error('[Normalizer] Error normalizing question:', e.message);
            invalid.push(q);
        }
    });

    return {
        valid,
        invalid,
        stats: {
            total: questions.length,
            valid: valid.length,
            invalid: invalid.length,
            duplicatesRemoved: questions.length - valid.length - invalid.length
        }
    };
};

module.exports = { 
    normalizeQuestion,
    normalizeBank
};
