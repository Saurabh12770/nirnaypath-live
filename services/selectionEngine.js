/**
 * Selection Engine (Phase 4)
 * PURE LOGIC. NO DB access. NO cache access. NO history logic.
 */

class SelectionEngine {
    static select(pool, count, reservedIds = new Set()) {
        if (!pool || pool.length === 0) return [];
        
        // [FIX 4] SELECTION ENGINE LOGIC: Build strictly unique eligible pool
        // Exclude any IDs that might have been reserved since the pool was fetched
        const uniquePool = this.removeInternalDuplicates(pool, reservedIds);
        const targetCount = Math.min(parseInt(count) || 50, uniquePool.length);

        // Fisher-Yates shuffle
        const shuffled = [...uniquePool];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const selected = shuffled.slice(0, targetCount);

        // [FIX 6] FINAL SAFETY DEDUP PASS: Ensure no duplicate IDs in final slice
        const finalSet = new Set();
        const finalSelection = [];
        for (const q of selected) {
            const id = String(q.id || q.questionId || q._id || '').trim().toLowerCase();
            if (!finalSet.has(id) && !reservedIds.has(id)) {
                finalSet.add(id);
                finalSelection.push(q);
            }
        }

        return finalSelection;
    }

    // Ensure no duplicates within input pool by ID AND TEXT
    static removeInternalDuplicates(pool, reservedIds = new Set()) {
        const SemanticDedupService = require('./semanticDedupService');
        const seenIds = new Set();
        const seenTexts = new Set();
        const seenFingerprints = new Set();
        const unique = [];

        for (const q of pool) {
            const id = String(q.id || q.questionId || q._id || '').trim().toLowerCase();
            if (!id || reservedIds.has(id)) continue;

            const textEn = q.question_en || q.text || '';
            const normalizedText = textEn.toLowerCase().replace(/[^\w\u0900-\u097F]/g, '');
            const fingerprint = SemanticDedupService.getSemanticFingerprint(q);

            if (!seenIds.has(id) && (!normalizedText || !seenTexts.has(normalizedText)) && (!fingerprint || !seenFingerprints.has(fingerprint))) {
                seenIds.add(id);
                if (normalizedText) seenTexts.add(normalizedText);
                if (fingerprint) seenFingerprints.add(fingerprint);
                unique.push(q);
            }
        }
        return unique;
    }
}

module.exports = SelectionEngine;
