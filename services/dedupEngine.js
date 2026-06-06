/**
 * Dedup Engine - Simplified v2.0
 */

'use strict';

class DedupEngine {
    static validateFinalOutput(questions) {
        if (!questions || !Array.isArray(questions)) {
            return [];
        }

        const seenIds = new Set();
        const seenTexts = new Set();
        const uniqueQuestions = [];

        for (const q of questions) {
            const id = String(q.id || q._id || '').trim().toLowerCase();
            if (!id) continue;
            
            if (seenIds.has(id)) {
                continue;
            }

            const normalizedText = this.normalizeText(q.question_en || q.text || '');
            if (normalizedText && seenTexts.has(normalizedText)) {
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
        
        for (const q of questions) {
            const textEn = this.normalizeText(q.question_en || q.text || '');
            const textHi = this.normalizeText(q.question_hi || '');

            let isDuplicate = false;

            if (textEn && seenEnTexts.has(textEn)) {
                isDuplicate = true;
            } else if (textHi && seenHiTexts.has(textHi)) {
                isDuplicate = true;
            }

            if (!isDuplicate) {
                // Fuzzy check against already processed pool
                for (const uq of uniqueQuestions) {
                    const uqEn = this.normalizeText(uq.question_en || uq.text || '');
                    if (textEn && uqEn && this.getSimilarity(textEn, uqEn) > 0.85) {
                        isDuplicate = true;
                        break;
                    }
                }
            }

            if (isDuplicate) {
                continue;
            }

            if (textEn) seenEnTexts.add(textEn);
            if (textHi) seenHiTexts.add(textHi);
            uniqueQuestions.push(q);
        }
        
        return uniqueQuestions;
    }

    static normalizeText(text) {
        if (!text || typeof text !== 'string') return '';
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
