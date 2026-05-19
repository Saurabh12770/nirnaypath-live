'use strict';

/**
 * normalizePipelineResult.js
 * ==========================
 * FIX #3 — ARRAY vs OBJECT PIPELINE CRASH
 *
 * Root cause:
 *   QuestionPipeline.execute() returns { questions: [], warning: null }
 *   but drills.js and section.js used the result directly as an array,
 *   causing "finalQuestions.map is not a function" crashes.
 *
 * This utility enforces a strict, documented return contract so ALL
 * callers — tests, drills, sectional, AI, adaptive — behave identically.
 *
 * Contract:
 *   {
 *     questions: Question[],   // always an array, never null
 *     metadata:  object,       // counts, timing, debug info
 *     warnings:  string[]      // non-fatal issues
 *   }
 */

/**
 * Normalizes any pipeline result into the standard contract.
 *
 * Handles:
 *   - Raw array  (legacy callers that returned array directly)
 *   - { questions, warning }   (current pipeline output)
 *   - { questions, warnings }  (future pipeline output)
 *   - null / undefined         (safe empty fallback)
 *
 * @param {any} rawResult  - Whatever the pipeline returned
 * @param {object} [meta]  - Optional additional metadata to merge
 * @returns {{ questions: object[], metadata: object, warnings: string[] }}
 */
function normalizePipelineResult(rawResult, meta = {}) {
    let questions = [];
    let warnings  = [];

    if (!rawResult) {
        warnings.push('Pipeline returned null/undefined — using empty fallback');
    } else if (Array.isArray(rawResult)) {
        // Legacy: pipeline returned bare array
        questions = rawResult;
    } else if (typeof rawResult === 'object') {
        // Standard contract: { questions, warning | warnings }
        const raw = rawResult.questions;
        if (Array.isArray(raw)) {
            questions = raw;
        } else if (raw !== undefined) {
            warnings.push(
                `Pipeline "questions" field is not an array (type: ${typeof raw}) — using empty fallback`
            );
        }

        // Collect warnings from either field name
        if (rawResult.warning)  warnings.push(String(rawResult.warning));
        if (Array.isArray(rawResult.warnings)) warnings.push(...rawResult.warnings);
    } else {
        warnings.push(`Unexpected pipeline result type: ${typeof rawResult}`);
    }

    // Final runtime assertion — must always produce an array
    if (!Array.isArray(questions)) {
        console.error('[normalizePipelineResult] INVARIANT VIOLATION: questions is not an array after normalization. Resetting to [].');
        questions = [];
        warnings.push('INVARIANT: questions field reset to [] after type error');
    }

    if (warnings.length > 0) {
        console.warn('[normalizePipelineResult] Warnings:', warnings);
    }

    return {
        questions,
        metadata: {
            count: questions.length,
            ...meta
        },
        warnings,
    };
}

module.exports = { normalizePipelineResult };
