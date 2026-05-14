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
}

module.exports = QuestionQualityService;
