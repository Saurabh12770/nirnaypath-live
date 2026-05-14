/**
 * Selection Engine (Phase 4)
 * PURE LOGIC. NO DB access. NO cache access. NO history logic.
 */

class SelectionEngine {
    static select(pool, count) {
        if (!pool || pool.length === 0) return [];
        
        const targetCount = Math.min(parseInt(count) || 50, pool.length);
        const uniquePool = this.removeInternalDuplicates(pool);

        // Fisher-Yates shuffle
        const shuffled = [...uniquePool];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled.slice(0, targetCount);
    }

    // Ensure no duplicates within input pool
    static removeInternalDuplicates(pool) {
        const seen = new Set();
        const unique = [];
        for (const q of pool) {
            const id = String(q._id || q.id || q.questionId || '').trim().toLowerCase();
            if (id && !seen.has(id)) {
                seen.add(id);
                unique.push(q);
            }
        }
        return unique;
    }
}

module.exports = SelectionEngine;
