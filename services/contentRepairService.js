const TopicTaxonomyService = require('./topicTaxonomyService');

class ContentRepairService {
    static repair(q) {
        const repaired = { ...q._doc || q };
        let wasRepaired = false;

        // 1. Repair Topic
        const originalTopic = repaired.topic || repaired.topicId;
        const newTopic = TopicTaxonomyService.canonicalizeTopic(originalTopic);
        if (originalTopic !== newTopic) {
            repaired.topic = newTopic;
            repaired.topicId = newTopic.toLowerCase().replace(/\s+/g, '_');
            wasRepaired = true;
        }

        // 2. Repair missing English Text from legacy `text` field
        if (!repaired.question_en && repaired.text) {
            repaired.question_en = repaired.text;
            wasRepaired = true;
        }

        // 3. Repair Options (Trim whitespace, remove A), B) prefixes)
        if (repaired.options_en || repaired.options) {
            const opts = repaired.options_en || repaired.options;
            const cleanOpts = opts.map(o => {
                let cleaned = String(o).trim();
                cleaned = cleaned.replace(/^[A-Da-d][\.\)]\s*/, '');
                return cleaned;
            });
            if (JSON.stringify(opts) !== JSON.stringify(cleanOpts)) {
                repaired.options_en = cleanOpts;
                if (!repaired.options) repaired.options = cleanOpts;
                wasRepaired = true;
            }
        }

        // 4. Difficulty Fallback
        if (!['EASY', 'MEDIUM', 'HARD'].includes((repaired.difficulty || '').toUpperCase())) {
            repaired.difficulty = 'MEDIUM';
            wasRepaired = true;
        }

        // 5. Answer Mapping (if answer is string but correctAnswer index is missing)
        if (repaired.correctAnswer === undefined || repaired.correctAnswer === null) {
            if (repaired.answer && repaired.options_en) {
                const ansStr = String(repaired.answer).trim().toLowerCase();
                const idx = repaired.options_en.findIndex(o => String(o).trim().toLowerCase() === ansStr);
                if (idx !== -1) {
                    repaired.correctAnswer = idx;
                    wasRepaired = true;
                }
            }
        }

        return { repaired, wasRepaired };
    }
}

module.exports = ContentRepairService;
