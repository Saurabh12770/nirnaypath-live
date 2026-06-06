const TestResult = require('../models/testResult');
const { resolveTopicIdentifier } = require('./topicNormalizer');
const Integrity = require('./questionIntegrityService');

/**
 * NirnayPath Question Selection & Deduplication Service
 * Phase 8: Production-Grade Reliability Engine
 */
class QuestionSelectionService {
    
    /**
     * Fisher-Yates Shuffle on a CLONED array
     */
    static shuffle(array) {
        const cloned = [...array];
        for (let i = cloned.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
        }
        return cloned;
    }

    /**
     * Get IDs of questions from last 5 tests for a user and subject
     */
    static async getExcludedIds(userId, subject) {
        if (!userId) return new Set();

        const lastTests = await TestResult.find({ 
            userId, 
            subject: subject.toLowerCase().trim() 
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('answers.questionId')
        .lean();

        const excludedIds = new Set();
        lastTests.forEach(test => {
            if (test.answers) {
                test.answers.forEach(ans => {
                    const id = ans.questionId ? String(ans.questionId).trim().toLowerCase() : null;
                    if (id) excludedIds.add(id);
                });
            }
        });

        return excludedIds;
    }

    /**
     * Core Selection Engine (Hardened)
     * Load Pool → Normalize IDs → Deep Dedup → Integrity Filter → Exclusion Filter → Immutable Clone → Fisher-Yates → Final Assertion
     */
    static async select(pool, count, options = {}) {
        const { userId, subject, topicId, sessionHistory = [] } = options;

        // 1. Immutable Clone & Primary Dedup
        // Ensure we never mutate the source pool (e.g. cached MongoDB objects)
        const immutablePool = Integrity.immutableClone(pool);
        let cleanPool = Integrity.deduplicate(immutablePool);

        // 2. Filter by Topic if provided
        if (topicId) {
            const tLower = topicId.toLowerCase().trim();
            cleanPool = cleanPool.filter(q => {
                const qTopic = resolveTopicIdentifier(q);
                return qTopic && qTopic.toLowerCase().trim() === tLower;
            });
        }

        // 3. History Exclusion
        let excludedIds = new Set();
        if (userId && subject) {
            excludedIds = await this.getExcludedIds(userId, subject);
        }

        // Add session history to excluded IDs
        sessionHistory.forEach(id => {
            if (id) excludedIds.add(String(id).trim().toLowerCase());
        });

        // 4. Integrity Filtering & Split (Fresh vs. Seen)
        const freshPool = [];
        const seenPool = [];

        cleanPool.forEach(q => {
            if (!Integrity.validateStructure(q)) return; // Skip malformed questions

            const id = Integrity.normalizeId(q);
            if (id && excludedIds.has(id)) {
                seenPool.push(q);
            } else if (id) {
                freshPool.push(q);
            }
        });

        // 5. Selection with Fallback
        const selected = [];
        const usedIds = new Set();

        const addUnique = (source) => {
            const shuffled = this.shuffle(source);
            let added = 0;
            for (const q of shuffled) {
                if (selected.length >= count) break;
                const id = Integrity.normalizeId(q);
                if (id && !usedIds.has(id)) {
                    selected.push(q);
                    usedIds.add(id);
                    added++;
                }
            }
            return added;
        };

        const freshAdded = addUnique(freshPool);
        let seenAdded = 0;
        if (selected.length < count) {
            seenAdded = addUnique(seenPool);
        }

        // 6. FINAL INTEGRITY ASSERTION (Crucial Phase 8 requirement)
        // Hard crash if duplicates were somehow selected
        Integrity.assertUniqueness(selected, `subject:${subject}`);

        // Log selection details
        console.log('Hardened Selection Completed:', {
            requested: count,
            selected: selected.length,
            freshPool: freshPool.length,
            seenPool: seenPool.length,
            excluded: excludedIds.size,
            freshAdded,
            seenAdded,
            subject,
            userId
        });

        return selected;
    }
}

const pickQuestions = async (pool, count, userId, subject) => {
    const selected = await QuestionSelectionService.select(pool, count, { userId, subject });
    return { selected, stats: { total: pool.length, selected: selected.length } };
};

const selectQuestions = (pool, count, excludeIds = new Set()) => {
    const Integrity = require('./questionIntegrityService');
    
    // 1. Initial pool stats
    const poolTotal = pool.length;
    
    // 2. Validate/Normalize structures and deduplicate
    const cleanPool = Integrity.deduplicate(pool);
    const validPool = cleanPool.filter(q => Integrity.validateStructure(q));
    const afterIntegrityFilter = validPool.length;
    
    // Convert excludeIds to a lowercase string set for casing resilience
    const excludes = new Set(Array.from(excludeIds || []).map(id => String(id).toLowerCase().trim()));
    
    // 3. Separate fresh vs seen pools
    const freshPool = [];
    const seenPool = [];
    
    validPool.forEach(q => {
        const id = String(q.id || q.questionId || q._id || '').toLowerCase().trim();
        if (excludes.has(id)) {
            seenPool.push(q);
        } else {
            freshPool.push(q);
        }
    });
    
    const historyExcluded = seenPool.length;
    
    // 4. Perform Fisher-Yates shuffle
    const shuffledFresh = QuestionSelectionService.shuffle(freshPool);
    const shuffledSeen = QuestionSelectionService.shuffle(seenPool);
    
    let selected = [];
    let usedFallback = false;
    
    if (shuffledFresh.length >= count) {
        selected = shuffledFresh.slice(0, count);
    } else {
        // Fallback: take all fresh, and pad from seen pool
        selected = [...shuffledFresh];
        const needed = count - selected.length;
        selected.push(...shuffledSeen.slice(0, needed));
        usedFallback = true;
    }
    
    // Limit to validPool length to avoid exceeding pool size
    if (selected.length > validPool.length) {
        selected = selected.slice(0, validPool.length);
    }
    
    return {
        selected,
        stats: {
            poolTotal,
            afterIntegrityFilter,
            historyExcluded,
            usedFallback,
            served: selected.length
        }
    };
};

const shuffleFair = (pool) => {
    return QuestionSelectionService.shuffle(pool);
};

module.exports = {
    QuestionSelectionService,
    pickQuestions,
    selectQuestions,
    shuffleFair
};
