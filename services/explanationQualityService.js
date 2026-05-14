class ExplanationQualityService {
    static scoreExplanation(q) {
        let score = 100;
        const flags = [];

        const explEn = (q.explanation_en || q.explanation || '').trim();
        const explHi = (q.explanation_hi || '').trim();

        if (!explEn) {
            score -= 30;
            flags.push('MISSING_EXPLANATION');
            return { score, flags };
        }

        // Check for placeholder/fake explanations
        const placeholders = ['none', 'na', 'n/a', 'no explanation', 'not available', 'test', '123'];
        if (placeholders.includes(explEn.toLowerCase())) {
            score -= 30;
            flags.push('FAKE_EXPLANATION');
            return { score, flags };
        }

        // Check length (too short)
        if (explEn.length < 15) {
            score -= 15;
            flags.push('WEAK_EXPLANATION');
        }

        // Check answer-only explanations (e.g. "Option A is correct.")
        const answerOnlyPattern = /^(option\s+[a-d]\s+is\s+correct\.?)$/i;
        if (answerOnlyPattern.test(explEn)) {
            score -= 20;
            flags.push('ANSWER_ONLY_EXPLANATION');
        }

        // Check Hindi explanation
        if (!explHi) {
            score -= 10;
            flags.push('MISSING_HI_EXPLANATION');
        } else if (explHi === explEn) {
            score -= 10;
            flags.push('EN_COPIED_TO_HI_EXPLANATION');
        }

        // Note: Detecting contradictory explanations (saying B is correct when answer is A)
        // is complex. We do a dumb check: if explanation mentions "Option B is correct" but correctAnswer is 0 (A).
        const optLetterMatch = explEn.match(/option\s+([a-d])\s+is\s+correct/i);
        if (optLetterMatch) {
            const letter = optLetterMatch[1].toUpperCase();
            const expectedIndex = letter.charCodeAt(0) - 65; // A=0, B=1, etc.
            if (q.correctAnswer !== expectedIndex) {
                score -= 40;
                flags.push('CONTRADICTORY_EXPLANATION');
            }
        }

        return { score: Math.max(0, score), flags };
    }
}

module.exports = ExplanationQualityService;
