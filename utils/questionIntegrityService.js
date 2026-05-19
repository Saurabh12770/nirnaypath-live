const crypto = require('crypto');
const { trace, CATEGORIES } = require('./runtimeTrace');

/**
 * NirnayPath Question Integrity Service (Phase 8 Hardened)
 * Centrally manages normalization, deduplication, and immutable pool management.
 */
class QuestionIntegrityService {
    
    /**
     * Normalize Question ID to a consistent String format.
     * Handles MongoDB ObjectId, numeric IDs, and string IDs.
     */
    static normalizeId(q) {
        if (!q) return null;
        const rawId = q._id || q.id || q.questionId;
        if (!rawId) return null;
        
        // Convert ObjectId to string, handle numbers, and trim strings
        return String(rawId).trim().toLowerCase();
    }

    /**
     * Deep clone a question pool to ensure zero side-effects.
     * Prevents shared object mutation across concurrent test sessions.
     */
    static immutableClone(pool) {
        if (!Array.isArray(pool)) return [];
        // Use JSON parse/stringify for safe deep cloning of simple data objects
        return JSON.parse(JSON.stringify(pool));
    }

    /**
     * Create a semantic hash for a question to detect duplicates with different IDs.
     * Uses normalized English text as the primary fingerprint.
     */
    static getSemanticHash(q) {
        if (!q) return null;
        const DedupEngine = require('../services/dedupEngine');
        const text = DedupEngine.normalizeText(q.question_en || q.question || q.text || '');
        if (!text || text.length < 5) return null; // Ignore junk
        return crypto.createHash('md5').update(text).digest('hex');
    }

    /**
     * Deduplicate a pool by normalized ID and semantic hash.
     * Ensures structural integrity before selection begins.
     */
    static deduplicate(pool) {
        if (!Array.isArray(pool)) return [];
        const seenIds = new Set();
        const seenHashes = new Set();
        const clean = [];
        
        for (const q of pool) {
            const id = this.normalizeId(q);
            const hash = this.getSemanticHash(q);
            
            const isDuplicateId = id && seenIds.has(id);
            const isDuplicateHash = hash && seenHashes.has(hash);

            if (!isDuplicateId && !isDuplicateHash) {
                if (id) seenIds.add(id);
                if (hash) seenHashes.add(hash);
                clean.push(q);
            } else {
                // Potential duplicate detected
                if (isDuplicateHash && !isDuplicateId) {
                    trace(CATEGORIES.QUESTION_FLOW, 'Semantic duplicate detected', { id, hash });
                }
            }
        }
        return clean;
    }

    /**
     * Final safety check to ensure zero duplicates in the final selection.
     * THROW HARD if violated.
     */
    static assertUniqueness(selected, context = '') {
        const ids = selected.map(q => this.normalizeId(q));
        const uniqueIds = new Set(ids);
        
        if (uniqueIds.size !== selected.length) {
            const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
            const errorMsg = `[IntegrityViolation] Duplicate questions detected in final set! Context: ${context}. Duplicates: ${duplicates.join(', ')}`;
            
            trace(CATEGORIES.QUESTION_FLOW, errorMsg, { 
                selectedCount: selected.length, 
                uniqueCount: uniqueIds.size 
            });
            
            throw new Error(errorMsg);
        }
        return true;
    }

    /**
     * Standardize question content for rendering.
     * Ensures all required fields exist.
     */
    static validateStructure(q) {
        if (!q) return false;
        if (q.isInvalid === true) return false;
        const hasText = q.question_en || q.question_hi || q.question || q.text;
        const hasOptions = (q.options_en && q.options_en.length >= 4) || (q.options && q.options.length >= 4) || q.option1;
        return !!(hasText && hasOptions);
    }
}

module.exports = QuestionIntegrityService;
