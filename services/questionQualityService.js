const SemanticDedupService = require('./semanticDedupService');
const ExplanationQualityService = require('./explanationQualityService');

class QuestionQualityService {
    static score(q) {
        let points = 100;
        const flags = [];

        // 1. Text Presence
        const enText = (q.question_en || q.text || '').trim();
        const hiText = (q.question_hi || '').trim();
        if (!enText) {
            points -= 40;
            flags.push('NO_EN_TEXT');
        } else if (enText === hiText) {
            points -= 20;
            flags.push('EN_COPIED_TO_HI');
        }

        if (!hiText) {
            points -= 20;
            flags.push('MISSING_HI_TRANSLATION');
        }

        // 2. Options Quality
        const optEn = q.options_en || q.options || [];
        if (optEn.length !== 4) {
            points -= 10;
            flags.push('INVALID_OPTION_COUNT');
        }
        const hasEmptyOption = optEn.some(o => !o || String(o).trim() === '');
        if (hasEmptyOption) {
            points -= 10;
            flags.push('EMPTY_OPTION');
        }
        const uniqueOptions = new Set(optEn.map(o => String(o).trim().toLowerCase()));
        if (uniqueOptions.size !== optEn.length) {
            points -= 15;
            flags.push('DUPLICATE_OPTIONS');
        }

        // 3. Explanation Quality
        const explResult = ExplanationQualityService.scoreExplanation(q);
        if (explResult.flags.length > 0) {
            flags.push(...explResult.flags);
        }
        points -= (100 - explResult.score);

        // 4. Metadata Completeness
        if (!q.subjectId && !q.subject) {
            points -= 10;
            flags.push('MISSING_SUBJECT');
        }
        if (!q.topicId && !q.topic) {
            points -= 10;
            flags.push('MISSING_TOPIC');
        }
        if (!['EASY', 'MEDIUM', 'HARD'].includes((q.difficulty || '').toUpperCase())) {
            points -= 5;
            flags.push('INVALID_DIFFICULTY');
        }

        // 5. Answer Leakage
        // Check if correct option text is literally in the explanation or question (dumbly)
        const cIdx = q.correctAnswer;
        if (cIdx >= 0 && cIdx < optEn.length) {
            const correctText = String(optEn[cIdx]).toLowerCase();
            if (correctText.length > 3 && enText.toLowerCase().includes(correctText)) {
                points -= 10;
                flags.push('ANSWER_LEAKAGE');
            }
        }

        const finalScore = Math.max(0, points);
        return {
            qualityScore: finalScore,
            qualityFlags: flags,
            reviewRequired: finalScore < 80
        };
    }

    static validate(q) {
        const scoreResult = this.score(q);
        const hasEnText = !!(q.question_en || q.text || '').trim();
        const isValid = hasEnText && scoreResult.qualityScore >= 50;
        return {
            valid: isValid,
            warnings: scoreResult.qualityFlags
        };
    }

    static similarity(t1, t2) {
        if (!t1 && !t2) return 100;
        if (!t1 || !t2) return 0;
        const a = String(t1).trim().toLowerCase();
        const b = String(t2).trim().toLowerCase();
        if (a === b) return 100;
        
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
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        const dist = matrix[b.length][a.length];
        return (1 - dist / Math.max(a.length, b.length)) * 100;
    }
}

module.exports = QuestionQualityService;
