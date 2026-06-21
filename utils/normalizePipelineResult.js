'use strict';

/**
 * normalizePipelineResult.js
 * ==========================
 * Normalizes question pipeline result formats.
 * Supports legacy bare array responses and modern object responses
 * with structured warnings and metadata.
 *
 * @param {any} raw - Raw pipeline result
 * @returns {{ questions: object[], warnings: string[], metadata: { count: number } }}
 */
function normalizePipelineResult(raw) {
    let questions = [];
    const warnings = [];

    if (raw === null || raw === undefined) {
        warnings.push('Pipeline result is null or undefined');
    } else if (Array.isArray(raw)) {
        questions = raw;
    } else if (typeof raw === 'object') {
        if (raw.questions !== undefined) {
            if (Array.isArray(raw.questions)) {
                questions = raw.questions;
            } else {
                questions = [];
                warnings.push('questions field is present but not an array');
            }
        }
        
        if (raw.warning && typeof raw.warning === 'string') {
            warnings.push(raw.warning);
        }
        if (Array.isArray(raw.warnings)) {
            warnings.push(...raw.warnings);
        }
    } else {
        warnings.push('Pipeline result is of invalid type ' + typeof raw);
    }

    return {
        questions,
        warnings,
        metadata: {
            count: questions.length
        }
    };
}

module.exports = {
    normalizePipelineResult
};
