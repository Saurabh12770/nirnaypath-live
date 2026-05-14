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
     * Deduplicate a pool by normalized ID.
     * Ensures structural integrity before selection begins.
     */
    static deduplicate(pool) {
        if (!Array.isArray(pool)) return [];
        const seen = new Set();
        const clean = [];
        
        for (const q of pool) {
            const id = this.normalizeId(q);
            if (id && !seen.has(id)) {
                seen.add(id);
                clean.push(q);
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
        const hasText = q.question_en || q.question_hi || q.question || q.text;
        const hasOptions = (q.options_en && q.options_en.length > 0) || (q.options && q.options.length > 0) || q.option1;
        return hasText && hasOptions;
    }
}

module.exports = QuestionIntegrityService;
