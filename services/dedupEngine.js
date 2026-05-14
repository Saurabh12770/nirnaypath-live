/**
 * Dedup Engine (Phase 6)
 * Final safety gate. Validates final output.
 */

class DedupEngine {
    static validateFinalOutput(questions) {
        if (!questions || !Array.isArray(questions)) {
            throw new Error('Invalid output format: expected array of questions');
        }

        const seenIds = new Set();
        const seenTexts = new Set();

        for (const q of questions) {
            // Check ID
            const id = String(q._id || q.id || q.questionId || '').trim().toLowerCase();
            if (!id) {
                throw new Error(`Question missing ID in final output`);
            }
            if (seenIds.has(id)) {
                throw new Error(`Duplicate Question ID detected in final output: ${id}`);
            }
            seenIds.add(id);

            // Check normalized text
            const rawText = q.question_en || q.question_hi || q.text || '';
            const normalizedText = this.normalizeText(rawText);
            
            if (normalizedText && seenTexts.has(normalizedText)) {
                throw new Error(`Duplicate semantic text detected in final output: ${normalizedText.substring(0, 30)}...`);
            }
            if (normalizedText) {
                seenTexts.add(normalizedText);
            }
        }

        return true; // Validated
    }

    static normalizeText(text) {
        if (!text || typeof text !== 'string') return '';
        // lowercase, remove punctuation, remove spaces
        return text.toLowerCase().replace(/[^\w\u0900-\u097F]/g, '');
    }
}

module.exports = DedupEngine;
