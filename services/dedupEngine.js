/**
 * Dedup Engine (Phase 6)
 * Final safety gate. Validates final output.
 */

class DedupEngine {
    static validateFinalOutput(questions) {
        if (!questions || !Array.isArray(questions)) {
            return [];
        }

        const seenIds = new Set();
        const seenTexts = new Set();
        const uniqueQuestions = [];

        for (const q of questions) {
            // Check ID
            const id = String(q._id || q.id || q.questionId || '').trim().toLowerCase();
            if (!id) continue;
            
            if (seenIds.has(id)) {
                console.warn(`[DedupEngine] Duplicate Question ID detected: ${id}`);
                continue;
            }

            // Check normalized text
            const rawText = q.question_en || q.question_hi || q.text || '';
            const normalizedText = this.normalizeText(rawText);
            
            if (normalizedText && seenTexts.has(normalizedText)) {
                console.warn(`[DedupEngine] Duplicate semantic text detected: ${normalizedText.substring(0, 30)}...`);
                continue;
            }
            
            seenIds.add(id);
            if (normalizedText) seenTexts.add(normalizedText);
            uniqueQuestions.push(q);
        }

        return uniqueQuestions;
    }

    static removeSemanticDuplicates(questions) {
        if (!questions || !Array.isArray(questions)) return [];

        const seenEnTexts = new Set();
        const seenHiTexts = new Set();
        const uniqueQuestions = [];
        
        const startTime = Date.now();

        const useFuzzy = process.env.USE_FUZZY_DEDUP === 'true';

        for (const q of questions) {
            const id = String(q._id || q.id || q.questionId || 'UNKNOWN').trim();
            const textEn = this.normalizeText(q.question_en || q.text || '');
            const textHi = this.normalizeText(q.question_hi || '');

            let isDuplicate = false;
            let conflictSnippet = '';

            if (textEn && seenEnTexts.has(textEn)) {
                isDuplicate = true;
                conflictSnippet = textEn.substring(0, 50);
            } else if (textHi && seenHiTexts.has(textHi)) {
                isDuplicate = true;
                conflictSnippet = textHi.substring(0, 50);
            }

            if (!isDuplicate && useFuzzy) {
                // Fuzzy match against unique pool
                for (const uq of uniqueQuestions) {
                    const uqEn = this.normalizeText(uq.question_en || uq.text || '');
                    const uqHi = this.normalizeText(uq.question_hi || '');
                    
                    if (textEn && uqEn && this.getSimilarity(textEn, uqEn) > 0.85) {
                        isDuplicate = true;
                        conflictSnippet = textEn.substring(0, 50) + ' (Fuzzy Match)';
                        break;
                    }
                    if (textHi && uqHi && this.getSimilarity(textHi, uqHi) > 0.85) {
                        isDuplicate = true;
                        conflictSnippet = textHi.substring(0, 50) + ' (Fuzzy Match)';
                        break;
                    }
                }
            }

            if (isDuplicate) {
                console.warn(`[DedupEngine] WARNING: Semantic duplicate detected. Dropping question ID ${id}. Snippet: ${conflictSnippet}...`);
                continue;
            }

            if (textEn) seenEnTexts.add(textEn);
            if (textHi) seenHiTexts.add(textHi);
            
            uniqueQuestions.push(q);
        }
        
        const duration = Date.now() - startTime;
        if (duration > 100 && questions.length >= 2000) {
            console.warn(`[DedupEngine] PERF WARNING: Semantic dedup took ${duration}ms for ${questions.length} questions.`);
        }

        return uniqueQuestions;
    }

    static normalizeText(text) {
        if (!text || typeof text !== 'string') return '';
        // lowercase, remove punctuation, remove spaces
        return text.toLowerCase().replace(/[^\w\u0900-\u097F]/g, '');
    }

    static getLevenshteinDistance(a, b) {
        if (!a.length) return b.length;
        if (!b.length) return a.length;
        
        const matrix = [];
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1) // deletion
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    static getSimilarity(str1, str2) {
        if (str1 === str2) return 1.0;
        const maxLen = Math.max(str1.length, str2.length);
        if (maxLen === 0) return 1.0;
        const distance = this.getLevenshteinDistance(str1, str2);
        return 1.0 - (distance / maxLen);
    }
}

module.exports = DedupEngine;
