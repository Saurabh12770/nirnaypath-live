/**
 * Central Content Validation Schema for NirnayPath
 * Phase 4 - Content Generation & Ingestion Pipeline
 */

const crypto = require('crypto');

class QuestionContentSchema {
    
    // Core structure requirements
    static REQUIRED_FIELDS = [
        'subject',
        'topic',
        'difficulty',
        'question_en',
        'question_hi',
        'options_en',
        'options_hi',
        'explanation_en',
        'explanation_hi'
    ];

    static ALLOWED_DIFFICULTY = ['EASY', 'MEDIUM', 'HARD'];

    static PLACEHOLDERS = [
        'test', 'none', 'na', 'n/a', 'no explanation', 'not available', 
        '123', 'placeholder', 'xyz', 'abc'
    ];

    /**
     * Helper to safely trim and clean strings
     */
    static cleanString(str) {
        if (!str || typeof str !== 'string') return '';
        return str.replace(/\s+/g, ' ').trim();
    }

    /**
     * Main Structural Validator
     */
    static validateQuestionStructure(question) {
        const errors = [];
        let valid = true;

        // 1. Initial Type check
        if (!question || typeof question !== 'object') {
            return { valid: false, errors: ['Invalid question object provided'], normalizedQuestion: null };
        }

        const normalizedQuestion = { ...question };

        // 2. Normalize and check required fields
        for (const field of this.REQUIRED_FIELDS) {
            if (Array.isArray(question[field])) {
                normalizedQuestion[field] = question[field].map(item => this.cleanString(item));
            } else if (typeof question[field] === 'string') {
                normalizedQuestion[field] = this.cleanString(question[field]);
            }
            
            if (normalizedQuestion[field] === undefined || normalizedQuestion[field] === null || normalizedQuestion[field] === '' || (Array.isArray(normalizedQuestion[field]) && normalizedQuestion[field].length === 0)) {
                errors.push(`Missing or empty required field: ${field}`);
                valid = false;
            }
        }

        // 3. Difficulty Check
        if (normalizedQuestion.difficulty) {
            normalizedQuestion.difficulty = normalizedQuestion.difficulty.toUpperCase();
            if (!this.ALLOWED_DIFFICULTY.includes(normalizedQuestion.difficulty)) {
                errors.push(`Invalid difficulty: ${normalizedQuestion.difficulty}. Allowed: EASY, MEDIUM, HARD`);
                valid = false;
            }
        }

        // 4. Options Check (Length & Duplicates)
        ['options_en', 'options_hi'].forEach(optField => {
            const opts = normalizedQuestion[optField];
            if (Array.isArray(opts)) {
                if (opts.length !== 4) {
                    errors.push(`${optField} must have exactly 4 options. Found: ${opts.length}`);
                    valid = false;
                } else {
                    const uniqueOpts = new Set(opts.map(o => o.toLowerCase()));
                    if (uniqueOpts.size !== 4) {
                        errors.push(`Duplicate options found in ${optField}`);
                        valid = false;
                    }
                    if (opts.some(o => o === '')) {
                        errors.push(`Empty option string found in ${optField}`);
                        valid = false;
                    }
                }
            } else {
                errors.push(`${optField} must be an array`);
                valid = false;
            }
        });

        // 5. Correct Answer Check
        if (normalizedQuestion.correctAnswer === undefined || normalizedQuestion.correctAnswer === null) {
            errors.push('Missing correctAnswer');
            valid = false;
        } else {
            const ca = parseInt(normalizedQuestion.correctAnswer, 10);
            if (isNaN(ca) || ca < 0 || ca > 3) {
                errors.push(`correctAnswer must be an integer between 0 and 3. Found: ${normalizedQuestion.correctAnswer}`);
                valid = false;
            } else {
                normalizedQuestion.correctAnswer = ca;
            }
        }

        // 6. Explanation Check (Length & Placeholders)
        ['explanation_en', 'explanation_hi'].forEach(explField => {
            const expl = normalizedQuestion[explField];
            if (typeof expl === 'string') {
                if (expl.length < 20) {
                    errors.push(`${explField} is too short (min 20 chars)`);
                    valid = false;
                }
                const lowerExpl = expl.toLowerCase();
                if (this.PLACEHOLDERS.some(p => lowerExpl === p || lowerExpl.startsWith(p + ' '))) {
                    errors.push(`${explField} contains placeholder text`);
                    valid = false;
                }
            }
        });

        // 7. Bilingual Content Sanity Check (Not exact copies)
        if (normalizedQuestion.question_en && normalizedQuestion.question_hi) {
            if (normalizedQuestion.question_en.toLowerCase() === normalizedQuestion.question_hi.toLowerCase()) {
                errors.push('question_en and question_hi are exactly identical (failed translation)');
                valid = false;
            }
        }
        if (normalizedQuestion.explanation_en && normalizedQuestion.explanation_hi) {
            if (normalizedQuestion.explanation_en.toLowerCase() === normalizedQuestion.explanation_hi.toLowerCase()) {
                errors.push('explanation_en and explanation_hi are exactly identical (failed translation)');
                valid = false;
            }
        }

        // Ensure subtopic, examLevel exist even if empty
        normalizedQuestion.subtopic = this.cleanString(normalizedQuestion.subtopic) || null;
        normalizedQuestion.examLevel = this.cleanString(normalizedQuestion.examLevel) || 'General';
        normalizedQuestion.source = this.cleanString(normalizedQuestion.source) || 'system_generated';
        
        if (!normalizedQuestion.createdAt) {
            normalizedQuestion.createdAt = new Date().toISOString();
        }

        // We do not compute semanticHash or qualityScore here (that's for downstream pipeline services),
        // but we ensure the fields exist if provided.
        if (normalizedQuestion.qualityScore !== undefined) {
            normalizedQuestion.qualityScore = Number(normalizedQuestion.qualityScore);
        }

        return {
            valid,
            errors,
            normalizedQuestion: valid ? normalizedQuestion : null
        };
    }
}

module.exports = QuestionContentSchema;
