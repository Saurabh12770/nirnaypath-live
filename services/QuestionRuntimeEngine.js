/**
 * NirnayPath Question Runtime Engine (Phase 2 Forensic Reconstruction)
 *
 * This is the SINGLE SOURCE OF TRUTH for all question selection.
 * NO route may fetch, randomize, or filter questions directly.
 */

const crypto = require('crypto');
const QuestionRepository = require('./questionRepository');
const TestResult = require('../models/TestResult');
const { normalizeQuestion } = require('../utils/questionNormalizer');
const { trace, CATEGORIES } = require('../utils/runtimeTrace');
const AdaptiveLearningService = require('./adaptiveLearningService');

class IntegrityViolationError extends Error {
    constructor(message) {
        super(message);
        this.name = "IntegrityViolationError";
    }
}

class QuestionRuntimeEngine {
    
    // 1. Canonical ID Resolution
    static canonicalizeId(q) {
        if (!q) return null;
        const rawId = q._id || q.id || q.questionId;
        if (!rawId) return null;
        return String(rawId).trim().toLowerCase();
    }

    // 2. Deep Immutable Clone
    static immutableClone(obj) {
        if (!obj) return null;
        return JSON.parse(JSON.stringify(obj));
    }

    // 3. Centralized Pool Loading (via QuestionRepository)
    static async loadPool(subject, topicId = null) {
        const subjects = Array.isArray(subject) ? subject.map(s => s.toLowerCase().trim()) : [subject.toLowerCase().trim()];
        
        let pool = [];
        let source = 'questionRepository';

        for (const sub of subjects) {
            const filters = { subject: sub };
            if (topicId) filters.topic = topicId.toLowerCase().trim();
            
            const questions = await QuestionRepository.getQuestions(filters);
            pool.push(...questions);
        }

        return { pool, source };
    }

    // 4. Get Excluded IDs (History)
    static async getExcludedIds(userId, subject) {
        if (!userId) return new Set();
        const subjects = Array.isArray(subject) ? subject.map(s => s.toLowerCase().trim()) : [subject.toLowerCase().trim()];
        
        let matchQuery = { userId };
        if (!subjects.includes('all')) {
            matchQuery.$or = [
                { subject: { $in: subjects } },
                { subject: 'sectional' }
            ];
        }

        // Rolling 5 tests
        const lastTests = await TestResult.find(matchQuery)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('answers.questionId')
        .lean();

        const excludedIds = new Set();
        for (const test of lastTests) {
            if (test.answers) {
                test.answers.forEach(ans => {
                    const id = this.canonicalizeId({ _id: ans.questionId });
                    if (id) excludedIds.add(id);
                });
            }
        }
        return excludedIds;
    }

    // 5. Fisher-Yates Shuffle
    static shuffle(array) {
        const cloned = [...array];
        for (let i = cloned.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
        }
        return cloned;
    }

    // 6. The Master Pipeline
    static async generateTestSession({ userId, sessionId, subject, topicId, count, exam, mode = 'full', sessionHistory = [] }) {
        const reqSubject = subject || 'general';
        const targetCount = Math.min(parseInt(count) || 50, 200);

        // 1. LOAD
        const { pool: rawPool, source } = await this.loadPool(reqSubject, topicId);
        
        // 2. NORMALIZE & DEDUP SOURCE
        const dedupedMap = new Map();
        let invalidCount = 0;
        
        for (const q of rawPool) {
            const nq = normalizeQuestion(q);
            if (!nq || nq.isInvalid) {
                invalidCount++;
                continue;
            }
            const cId = this.canonicalizeId(nq);
            if (cId && !dedupedMap.has(cId)) {
                dedupedMap.set(cId, nq);
            }
        }
        
        let validPool = Array.from(dedupedMap.values());

        // 3. EXCLUDE HISTORY & SESSION
        let excludedSet = await this.getExcludedIds(userId, reqSubject);
        sessionHistory.forEach(id => {
            const cid = this.canonicalizeId({ _id: id });
            if (cid) excludedSet.add(cid);
        });

        const freshPool = [];
        const seenPool = [];

        for (const q of validPool) {
            const cId = this.canonicalizeId(q);
            if (excludedSet.has(cId)) {
                seenPool.push(q);
            } else {
                freshPool.push(q);
            }
        }

        // 4. ADAPTIVE SCORING (Optional, applies to fresh pool)
        let scoredFreshPool = freshPool;
        if (userId && mode !== 'section') {
             // Adaptive Scoring can be expensive, run on fresh only
             scoredFreshPool = await AdaptiveLearningService.scoreQuestions(userId, freshPool);
        }

        // 5. SELECTION & SHUFFLE
        const finalSelection = [];
        const selectedIds = new Set();
        let dupesDetected = 0;

        const pickFrom = (sourceArray) => {
            const shuffled = this.shuffle(sourceArray);
            for (const q of shuffled) {
                if (finalSelection.length >= targetCount) break;
                const cId = this.canonicalizeId(q);
                if (selectedIds.has(cId)) {
                    dupesDetected++;
                    continue;
                }
                finalSelection.push(q);
                selectedIds.add(cId);
            }
        };

        pickFrom(scoredFreshPool);
        if (finalSelection.length < targetCount) {
            pickFrom(this.shuffle(seenPool)); // Fallback to seen questions if pool is exhausted
        }

        // 6. HARD ASSERTIONS
        if (selectedIds.size !== finalSelection.length) {
            throw new IntegrityViolationError(`Duplicate IDs selected in final set! Selected: ${finalSelection.length}, Unique: ${selectedIds.size}`);
        }

        // 7. TRACE LOGGING
        const traceLog = {
            route: mode,
            userId: userId || 'guest',
            sessionId,
            subject: reqSubject,
            topic: topicId || 'none',
            source,
            rawPoolSize: rawPool.length,
            dedupedPoolSize: validPool.length,
            invalidFiltered: invalidCount,
            excludedCount: excludedSet.size,
            selectedCount: finalSelection.length,
            duplicateDetected: dupesDetected,
            duplicateIds: [],
            cacheSource: source === 'cache',
            fallbackUsed: source === 'json_fallback',
            timestamp: new Date().toISOString()
        };

        const fs = require('fs');
        const path = require('path');
        const traceFile = path.join(__dirname, '../logs/question_runtime_trace.json');
        
        try {
            if (!fs.existsSync(path.dirname(traceFile))) {
                fs.mkdirSync(path.dirname(traceFile), { recursive: true });
            }
            fs.appendFileSync(traceFile, JSON.stringify(traceLog) + '\n');
        } catch(e) {
            console.error('Failed to write forensic trace:', e);
        }

        return this.immutableClone(finalSelection);
    }
}

module.exports = QuestionRuntimeEngine;
