/**
 * Question Repository (Phase 3)
 * ONLY fetches data. NO business logic. NO selection.
 */

const fs = require('fs');
const path = require('path');
const Question = require('../models/question');
const DedupEngine = require('./dedupEngine');

class QuestionRepository {
    static async fetchQuestions(subjectOrSubjects) {
        if (!subjectOrSubjects) return [];
        const subjects = Array.isArray(subjectOrSubjects) ? subjectOrSubjects : [subjectOrSubjects];
        const subLowers = subjects.map(s => s.toLowerCase().trim());

        const fetchStartTime = Date.now();
        // MongoDB fetch
        let pool = await Question.find({
            $or: [
                { subject: { $in: subLowers } },
                { subjectId: { $in: subLowers } }
            ]
        }).lean();

        // JSON fallback ALWAYS (Merge both sources per requirements)
        for (const sub of subLowers) {
            const dataPath = path.join(__dirname, `../data/${sub}.json`);
            if (fs.existsSync(dataPath)) {
                try {
                    const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                    const subQuestions = Array.isArray(rawData) ? rawData : (rawData.questions || []);
                    pool.push(...subQuestions);
                } catch (e) {
                    console.error('[QuestionRepository] JSON Read Error:', e.message);
                }
            }
        }
        
        console.log(`[QuestionRepository] Fetch took ${Date.now() - fetchStartTime}ms for subject(s): ${subLowers.join(',')}. Pool size: ${pool.length}`);

        // Cross-source semantic deduplication
        const dedupedPool = DedupEngine.removeSemanticDuplicates(pool);

        // ALWAYS return deep cloned objects (immutable output)
        return JSON.parse(JSON.stringify(dedupedPool || []));
    }
}

module.exports = QuestionRepository;
