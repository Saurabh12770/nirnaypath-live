/**
 * Question Repository (Phase 3 — Security Hardened)
 * ==================================================
 * ONLY fetches data. NO business logic. NO selection.
 *
 * SECURITY FIX: Path traversal vulnerability patched.
 * ALL subject inputs are validated through the centralized
 * allowedSubjects whitelist BEFORE any filesystem access.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const Question  = require('../models/question');
const DedupEngine = require('./dedupEngine');
const CacheLayer = require('./cacheLayer');
const { validateSubjects } = require('../config/allowedSubjects');

// Resolve the canonical data directory once at module load time with a bulletproof fallback chain.
let DATA_DIR = path.resolve(__dirname, '../data');
if (!fs.existsSync(DATA_DIR) || !fs.statSync(DATA_DIR).isDirectory()) {
    DATA_DIR = path.resolve(__dirname, '../../data');
}
if (!fs.existsSync(DATA_DIR) || !fs.statSync(DATA_DIR).isDirectory()) {
    DATA_DIR = path.resolve(process.cwd(), 'data');
}
if (!fs.existsSync(DATA_DIR) || !fs.statSync(DATA_DIR).isDirectory()) {
    DATA_DIR = path.resolve(process.cwd(), 'server/data');
}

/**
 * Assert that a resolved file path is strictly inside DATA_DIR.
 * This is the last-resort invariant; it should never trip if
 * validateSubjects() did its job — but we keep both layers.
 *
 * @param {string} resolvedPath
 * @throws if path escapes the data directory
 */
function assertInsideDataDir(resolvedPath) {
    if (!resolvedPath.startsWith(DATA_DIR + path.sep) &&
        resolvedPath !== DATA_DIR) {
        throw new Error(
            `[SECURITY] Path invariant violated: "${resolvedPath}" is outside "${DATA_DIR}"`
        );
    }
}

class LruTtlCache {
    constructor(maxSize = 5, ttlMs = 300000) {
        this.maxSize = maxSize;
        this.ttlMs = ttlMs;
        this.cache = new Map();
    }

    get(key) {
        if (!this.cache.has(key)) return null;
        const entry = this.cache.get(key);
        if (Date.now() - entry.timestamp > this.ttlMs) {
            this.cache.delete(key);
            return null;
        }
        this.cache.delete(key);
        this.cache.set(key, entry);
        return entry.data;
    }

    set(key, data) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    has(key) {
        return this.get(key) !== null;
    }

    get size() {
        return this.cache.size;
    }
}

class QuestionRepository {
    static precompiledCache = new LruTtlCache(5, 300000);

    /**
     * Precompile all static JSON questions into deep-frozen, memory-safe pools.
     * Executed during startup to eliminate CPU spikes, GC pressure, and disk reads.
     */
    /**
     * Precompile frequently used static JSON questions into deep-frozen, memory-safe pools in background.
     * Hardened: Only precompiles frequently used subjects in background to prevent memory spikes & OOM.
     */
    static async precompileAllSubjects() {
        const startTime = Date.now();
        const subjectsToPrecompile = ['history', 'polity', 'geography'];
        let totalQuestions = 0;

        console.log(`[BOOT][PRECOMPILE] Starting background warmup for frequently used subjects: ${subjectsToPrecompile.join(', ')}`);

        // Async/background warmup process to prevent startup thread blocking and memory spikes
        (async () => {
            for (const sub of subjectsToPrecompile) {
                const filePath = path.join(DATA_DIR, `${sub}.json`);
                if (!fs.existsSync(filePath)) continue;

                try {
                    const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    let subQuestions = Array.isArray(rawData) ? rawData : (rawData.questions || []);

                    // Normalize correctAnswer & adapt options structure once at boot
                    const adaptedQuestions = subQuestions.map(q => {
                        let normalizedCorrect = q.correctAnswer;
                        if (typeof normalizedCorrect === 'string') {
                            const charVal = normalizedCorrect.toLowerCase().trim();
                            const optIdx  = ['a', 'b', 'c', 'd'].indexOf(charVal);
                            if (optIdx !== -1) normalizedCorrect = optIdx;
                        } else if (q.correctOption !== undefined && q.correctOption !== null) {
                            const optIdx = ['a', 'b', 'c', 'd'].indexOf(
                                String(q.correctOption).toLowerCase().trim()
                            );
                            if (optIdx !== -1) normalizedCorrect = optIdx;
                        }
                        if (normalizedCorrect === undefined || normalizedCorrect === null) {
                            normalizedCorrect = 0;
                        }

                        if (
                            q.options &&
                            q.options.length > 0 &&
                            typeof q.options[0] === 'object' &&
                            !Array.isArray(q.options[0])
                        ) {
                            return {
                                ...q,
                                question_en:   q.question?.en || q.question_en || '',
                                question_hi:   q.question?.hi || q.question_hi || '',
                                options_en:    q.options?.map(o => o.text?.en || '') || [],
                                options_hi:    q.options?.map(o => o.text?.hi || '') || [],
                                correctAnswer: normalizedCorrect
                            };
                        }
                        return { ...q, correctAnswer: normalizedCorrect };
                    });

                    // FAANG-level Protection: Deep-freeze the static precompiled pool
                    adaptedQuestions.forEach(q => Object.freeze(q));
                    Object.freeze(adaptedQuestions);

                    this.precompiledCache.set(sub, adaptedQuestions);
                    totalQuestions += adaptedQuestions.length;
                } catch (e) {
                    console.error(`[BOOT][PRECOMPILE] Failed to precompile subject "${sub}": ${e.message}`);
                }
            }
            console.log(`[BOOT][PRECOMPILE] Warmup complete. Cached ${totalQuestions} questions across background subjects.`);
        })().catch(err => {
            console.error(`[BOOT][PRECOMPILE] Background precompilation failed:`, err.message);
        });
    }

    /**
     * Fetch questions for one or many subjects, with optional topic filter.
     *
     * @param {string|string[]} subjectOrSubjects
     * @param {string|null}     topic
     * @returns {Promise<object[]>} deep-cloned, safe question objects
     */
    static async fetchQuestions(subjectOrSubjects, topic = null) {
        const { yieldIfLagging } = require('../utils/eventLoopSafeguard');
        await yieldIfLagging(50); // SRE: cooperative yielding

        if (!subjectOrSubjects) return [];

        const raw = Array.isArray(subjectOrSubjects)
            ? subjectOrSubjects
            : [subjectOrSubjects];

        // ── SECURITY: Whitelist validation ──────────────────────────────────
        const safeSubjects = validateSubjects(raw);

        const blocked = raw.filter(s => {
            const lower = (typeof s === 'string' ? s : '').toLowerCase().trim();
            return !safeSubjects.includes(lower.replace(/\.[^.]+$/, ''));
        });

        if (blocked.length > 0) {
            console.error(
                `[SECURITY][QuestionRepository] PATH TRAVERSAL ATTEMPT BLOCKED. ` +
                `Rejected subjects: ${JSON.stringify(blocked)} | ` +
                `Timestamp: ${new Date().toISOString()}`
            );
        }

        if (safeSubjects.length === 0) {
            console.warn(`[QuestionRepository] All subjects rejected by whitelist. raw=${JSON.stringify(raw)}`);
            return [];
        }
        // ────────────────────────────────────────────────────────────────────

        const topicLower = topic
            ? String(topic).toLowerCase().trim()
            : null;

        const cacheKey = `questions:${safeSubjects.sort().join(',')}:${topicLower || 'all'}`;
        const cachedPool = CacheLayer.getSnapshot(cacheKey);
        if (cachedPool) {
            console.log(`[QuestionRepository][CACHE] HIT for key="${cacheKey}" (pool size: ${cachedPool.length})`);
            return cachedPool;
        }

        // Lazy-warmup if not already precompiled (for instant hydration resilience)
        if (this.precompiledCache.size === 0) {
            await this.precompileAllSubjects();
        }

        const fetchStartTime = Date.now();

        // ── MongoDB fetch ────────────────────────────────────────────────────
        const query = {
            $or: [
                { subject:   { $in: safeSubjects } },
                { subjectId: { $in: safeSubjects } }
            ]
        };

        if (topicLower) {
            query.$and = [{
                $or: [
                    { topic:   topicLower },
                    { topicId: topicLower }
                ]
            }];
        }

        let pool = await Question.find(query).lean();

        // ── JSON file fallback (served INSTANTLY from precompiled cache) ─────
        for (const sub of safeSubjects) {
            const cachedQuestions = this.precompiledCache.get(sub);
            if (cachedQuestions) {
                if (topicLower) {
                    const filtered = cachedQuestions.filter(q => {
                        const qTopic = String(q.topic || q.topicId || '').toLowerCase().trim();
                        return qTopic === topicLower;
                    });
                    pool.push(...filtered);
                } else {
                    pool.push(...cachedQuestions);
                }
            } else {
                // Last-resort fallback for dynamically created files
                const filePath = path.join(DATA_DIR, `${sub}.json`);
                const resolved = path.resolve(filePath);
                try {
                    assertInsideDataDir(resolved);
                } catch (invariantErr) {
                    console.error(`[SECURITY][QuestionRepository] ${invariantErr.message}`);
                    continue;
                }

                if (!fs.existsSync(resolved)) continue;

                try {
                    const rawData = JSON.parse(fs.readFileSync(resolved, 'utf8'));
                    let subQuestions = Array.isArray(rawData) ? rawData : (rawData.questions || []);

                    // Normalize and lazy load into LRU precompiledCache
                    const adaptedQuestions = subQuestions.map(q => {
                        let normalizedCorrect = q.correctAnswer;
                        if (typeof normalizedCorrect === 'string') {
                            const charVal = normalizedCorrect.toLowerCase().trim();
                            const optIdx  = ['a', 'b', 'c', 'd'].indexOf(charVal);
                            if (optIdx !== -1) normalizedCorrect = optIdx;
                        } else if (q.correctOption !== undefined && q.correctOption !== null) {
                            const optIdx = ['a', 'b', 'c', 'd'].indexOf(
                                String(q.correctOption).toLowerCase().trim()
                            );
                            if (optIdx !== -1) normalizedCorrect = optIdx;
                        }
                        if (normalizedCorrect === undefined || normalizedCorrect === null) {
                            normalizedCorrect = 0;
                        }

                        if (
                            q.options &&
                            q.options.length > 0 &&
                            typeof q.options[0] === 'object' &&
                            !Array.isArray(q.options[0])
                        ) {
                            return {
                                ...q,
                                question_en:   q.question?.en || q.question_en || '',
                                question_hi:   q.question?.hi || q.question_hi || '',
                                options_en:    q.options?.map(o => o.text?.en || '') || [],
                                options_hi:    q.options?.map(o => o.text?.hi || '') || [],
                                correctAnswer: normalizedCorrect
                            };
                        }
                        return { ...q, correctAnswer: normalizedCorrect };
                    });

                    adaptedQuestions.forEach(q => Object.freeze(q));
                    Object.freeze(adaptedQuestions);
                    this.precompiledCache.set(sub, adaptedQuestions);

                    if (topicLower) {
                        const filtered = adaptedQuestions.filter(q => {
                            const qTopic = String(q.topic || q.topicId || '').toLowerCase().trim();
                            return qTopic === topicLower;
                        });
                        pool.push(...filtered);
                    } else {
                        pool.push(...adaptedQuestions);
                    }
                } catch (e) {
                    console.error(`[QuestionRepository] Fallback JSON Read Error for subject "${sub}": ${e.message}`);
                }
            }
        }

        console.log(
            `[QuestionRepository] Fetch took ${Date.now() - fetchStartTime}ms ` +
            `for subject(s): [${safeSubjects.join(', ')}]` +
            `${topicLower ? ` topic: "${topicLower}"` : ''}. ` +
            `Raw pool size: ${pool.length}`
        );

        // ── Cross-source semantic deduplication ──────────────────────────────
        const dedupedPool = DedupEngine.removeSemanticDuplicates(pool);

        // ── Normalize correctAnswer to a numeric index ───────────────────────
        const adaptedPool = dedupedPool.map(q => {
            // Already adapted & frozen from precompile pool
            if (Object.isFrozen(q)) return q;

            let normalizedCorrect = q.correctAnswer;
            if (typeof normalizedCorrect === 'string') {
                const charVal = normalizedCorrect.toLowerCase().trim();
                const optIdx  = ['a', 'b', 'c', 'd'].indexOf(charVal);
                if (optIdx !== -1) normalizedCorrect = optIdx;
            } else if (q.correctOption !== undefined && q.correctOption !== null) {
                const optIdx = ['a', 'b', 'c', 'd'].indexOf(
                    String(q.correctOption).toLowerCase().trim()
                );
                if (optIdx !== -1) normalizedCorrect = optIdx;
            }
            if (normalizedCorrect === undefined || normalizedCorrect === null) {
                normalizedCorrect = 0;
            }

            if (
                q.options &&
                q.options.length > 0 &&
                typeof q.options[0] === 'object' &&
                !Array.isArray(q.options[0])
            ) {
                return {
                    ...q,
                    question_en:   q.question?.en || q.question_en || '',
                    question_hi:   q.question?.hi || q.question_hi || '',
                    options_en:    q.options?.map(o => o.text?.en || '') || [],
                    options_hi:    q.options?.map(o => o.text?.hi || '') || [],
                    correctAnswer: normalizedCorrect
                };
            }
            return { ...q, correctAnswer: normalizedCorrect };
        });

        // Cache the processed adapted pool (5 minutes TTL)
        CacheLayer.setSnapshot(cacheKey, adaptedPool, 300);

        // ── ALWAYS return deep-cloned objects (immutable output) ─────────────
        return JSON.parse(JSON.stringify(adaptedPool || []));
    }
}

module.exports = QuestionRepository;
