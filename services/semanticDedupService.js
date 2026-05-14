const crypto = require('crypto');

/**
 * Phase 3: Semantic Deduplication Service
 */
class SemanticDedupService {
    // Basic stopwords for EN and HI
    static STOPWORDS = new Set([
        'the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'in', 'of', 'to', 'for', 'with', 'by', 'was', 'were', 'what', 'who', 'how', 'when', 'where', 'why',
        'है', 'था', 'थे', 'थी', 'और', 'या', 'का', 'की', 'के', 'में', 'से', 'पर', 'को', 'क्या', 'कौन', 'कैसे', 'कब', 'कहाँ', 'क्यों'
    ]);

    static normalizeText(text) {
        if (!text) return '';
        // 1. Lowercase
        let normalized = String(text).toLowerCase();
        // 2. Remove punctuation and special characters
        normalized = normalized.replace(/[^\w\s\u0900-\u097F]/g, ' ');
        // 3. Remove extra whitespace
        normalized = normalized.replace(/\s+/g, ' ').trim();
        // 4. Remove stopwords
        const tokens = normalized.split(' ');
        const filtered = tokens.filter(t => !this.STOPWORDS.has(t) && t.length > 1);
        // 5. Sort alphabetically to handle reworded sentences (e.g., "India's first president" vs "first president of India")
        return filtered.sort().join(' ');
    }

    static getSemanticFingerprint(q) {
        const textEn = q.question_en || q.text || q.question || '';
        const normEn = this.normalizeText(textEn);
        
        // If English is empty, try Hindi
        if (!normEn) {
            const textHi = q.question_hi || '';
            const normHi = this.normalizeText(textHi);
            if (!normHi) return null;
            return crypto.createHash('md5').update(`hi:${normHi}`).digest('hex');
        }

        return crypto.createHash('md5').update(`en:${normEn}`).digest('hex');
    }

    static detectSemanticDuplicates(pool) {
        const fingerprintMap = new Map();
        const duplicates = [];
        const uniques = [];

        for (const q of pool) {
            const fingerprint = this.getSemanticFingerprint(q);
            if (!fingerprint) {
                // Cannot fingerprint (malformed), treat as unique for now, caught by quality service
                uniques.push(q);
                continue;
            }

            if (fingerprintMap.has(fingerprint)) {
                duplicates.push({ original: fingerprintMap.get(fingerprint).id || fingerprintMap.get(fingerprint)._id, duplicate: q.id || q._id });
            } else {
                fingerprintMap.set(fingerprint, q);
                uniques.push(q);
            }
        }

        return { uniques, duplicates };
    }
}

module.exports = SemanticDedupService;
