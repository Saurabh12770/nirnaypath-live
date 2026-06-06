/**
 * Question Repository - Simplified v2.0
 */

'use strict';

const fs = require('fs');
const path = require('path');
const Question = require('../models/question');
const DedupEngine = require('./dedupEngine');
const CacheLayer = require('./cacheLayer');
const { validateSubjects } = require('../config/allowedSubjects');

let DATA_DIR = path.resolve(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
    DATA_DIR = path.resolve(process.cwd(), 'data');
}

class QuestionRepository {
    /**
     * Fetch questions for one or many subjects, with optional topic filter.
     *
     * @param {string|string[]} subjectOrSubjects
     * @param {string|null}     topic
     * @returns {Promise<object[]>} deep-cloned question objects
     */
    static async fetchQuestions(subjectOrSubjects, topic = null) {
        if (!subjectOrSubjects) return [];

        const raw = Array.isArray(subjectOrSubjects) ? subjectOrSubjects : [subjectOrSubjects];
        const safeSubjects = validateSubjects(raw);

        if (safeSubjects.length === 0) {
            return [];
        }

        const topicLower = topic ? String(topic).toLowerCase().trim() : null;
        const cacheKey = `questions:${safeSubjects.sort().join(',')}:${topicLower || 'all'}`;
        
        // 1. Check in-memory cache
        const cachedPool = CacheLayer.getSnapshot(cacheKey);
        if (cachedPool) {
            return cachedPool;
        }

        let pool = [];

        // 2. Fetch from MongoDB
        const query = {
            $or: [
                { subject: { $in: safeSubjects } },
                { subjectId: { $in: safeSubjects } }
            ]
        };

        if (topicLower) {
            const topicRegex = new RegExp(`^${topicLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
            query.$and = [{
                $or: [
                    { topic: topicRegex },
                    { topicId: topicRegex }
                ]
            }];
        }

        try {
            const dbQuestions = await Question.find(query).lean();
            pool.push(...dbQuestions);
        } catch (dbErr) {
            console.error('[QuestionRepository] MongoDB fetch error:', dbErr.message);
        }

        // 3. Fetch from JSON Files fallback
        for (const sub of safeSubjects) {
            const filePath = path.join(DATA_DIR, `${sub}.json`);
            if (fs.existsSync(filePath)) {
                try {
                    const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    let subQuestions = Array.isArray(rawData) ? rawData : (rawData.questions || []);
                    
                    if (topicLower) {
                        subQuestions = subQuestions.filter(q => {
                            const qTopic = String(q.topic || q.topicId || '').toLowerCase().trim();
                            return qTopic === topicLower;
                        });
                    }
                    pool.push(...subQuestions);
                } catch (e) {
                    console.error(`[QuestionRepository] JSON Read Error for subject "${sub}": ${e.message}`);
                }
            }
        }

        // 4. Normalize fields
        const adaptedPool = pool.map(q => {
            let normalizedCorrect = q.correctAnswer;
            if (typeof normalizedCorrect === 'string') {
                const charVal = normalizedCorrect.toLowerCase().trim();
                const optIdx = ['a', 'b', 'c', 'd'].indexOf(charVal);
                if (optIdx !== -1) normalizedCorrect = optIdx;
            }
            if (normalizedCorrect === undefined || normalizedCorrect === null) {
                normalizedCorrect = 0;
            }

            return {
                ...q,
                id: q.id || q._id?.toString(),
                correctAnswer: normalizedCorrect
            };
        });

        // 5. De-duplicate across sources
        const dedupedPool = DedupEngine.removeSemanticDuplicates(adaptedPool);

        // 6. Cache and return cloned copy
        CacheLayer.setSnapshot(cacheKey, dedupedPool, 300);
        return JSON.parse(JSON.stringify(dedupedPool));
    }
}

module.exports = QuestionRepository;
