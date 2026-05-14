/**
 * Question Repository (Phase 3)
 * ONLY fetches data. NO business logic. NO selection.
 */

const fs = require('fs');
const path = require('path');
const Question = require('../models/question');

class QuestionRepository {
    static async fetchQuestions(subjectOrSubjects) {
        if (!subjectOrSubjects) return [];
        const subjects = Array.isArray(subjectOrSubjects) ? subjectOrSubjects : [subjectOrSubjects];
        const subLowers = subjects.map(s => s.toLowerCase().trim());

        // MongoDB fetch
        let pool = await Question.find({
            $or: [
                { subject: { $in: subLowers } },
                { subjectId: { $in: subLowers } }
            ]
        }).lean();

        // JSON fallback ONLY if Mongo is empty
        if (!pool || pool.length === 0) {
            pool = [];
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
        }

        // ALWAYS return deep cloned objects (immutable output)
        return JSON.parse(JSON.stringify(pool || []));
    }
}

module.exports = QuestionRepository;
