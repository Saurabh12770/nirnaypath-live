/**
 * Selection Engine - Simplified v2.0
 */

'use strict';

const crypto = require('crypto');

class SelectionEngine {
    static select(pool, count, reservedIds = new Set()) {
        if (!pool || pool.length === 0) return [];
        
        // Build strictly unique eligible pool
        const uniquePool = this.removeInternalDuplicates(pool, reservedIds);
        const targetCount = Math.min(parseInt(count) || 20, uniquePool.length);

        // Fisher-Yates shuffle
        const shuffled = [...uniquePool];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = crypto.randomInt(0, i + 1);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        const selected = shuffled.slice(0, targetCount);

        // Final safety dedup pass
        const finalSet = new Set();
        const finalSelection = [];
        for (const q of selected) {
            const id = String(q.id || q._id || '').trim().toLowerCase();
            if (!finalSet.has(id) && !reservedIds.has(id)) {
                finalSet.add(id);
                finalSelection.push(q);
            }
        }

        return finalSelection;
    }

    // Ensure no duplicates within input pool by ID AND normalized text
    static removeInternalDuplicates(pool, reservedIds = new Set()) {
        const seenIds = new Set();
        const seenTexts = new Set();
        const unique = [];

        for (const q of pool) {
            const id = String(q.id || q._id || '').trim().toLowerCase();
            if (!id || reservedIds.has(id)) continue;

            const textEn = q.question_en || q.text || '';
            const normalizedText = textEn.toLowerCase().replace(/[^\w\u0900-\u097F]/g, '');

            if (!seenIds.has(id) && (!normalizedText || !seenTexts.has(normalizedText))) {
                seenIds.add(id);
                if (normalizedText) seenTexts.add(normalizedText);
                unique.push(q);
            }
        }
        return unique;
    }
}

module.exports = SelectionEngine;
