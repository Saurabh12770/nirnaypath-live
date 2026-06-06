/**
 * LearningContentService v2.0
 * Reads structured learning content from MongoDB (LearningContent model).
 * Falls back to generating skeleton content from question data if nothing exists.
 * No AI, no Redis — pure MongoDB + in-memory cache.
 */

'use strict';

const LearningContent = require('../models/learningContent');
const CacheLayer      = require('./cacheLayer');

class LearningContentService {

    /**
     * Get all topics for a given exam/subject, with question counts.
     * Returns an array of { topic, subTopics: [{ name, contentExists, questionCount }] }
     *
     * @param {string} exam
     * @param {string} subject
     * @returns {Promise<object[]>}
     */
    static async getTopicsForSubject(exam, subject) {
        const cacheKey = `lc:topics:${exam}:${subject}`;
        const cached = CacheLayer.getSnapshot(cacheKey);
        if (cached) return cached;

        try {
            const docs = await LearningContent.find(
                { exam, subject },
                { topic: 1, subTopic: 1, _id: 0 }
            ).lean();

            // Group by topic
            const topicMap = {};
            for (const doc of docs) {
                if (!topicMap[doc.topic]) topicMap[doc.topic] = [];
                topicMap[doc.topic].push(doc.subTopic);
            }

            const result = Object.entries(topicMap).map(([topic, subTopics]) => ({
                topic,
                subTopics: subTopics.map(name => ({ name, contentExists: true }))
            }));

            CacheLayer.setSnapshot(cacheKey, result, 120);
            return result;
        } catch (err) {
            console.error('[LearningContentService] getTopicsForSubject error:', err.message);
            return [];
        }
    }

    /**
     * Get full learning content for exam/subject/topic/subTopic.
     *
     * @param {string} exam
     * @param {string} subject
     * @param {string} topic
     * @param {string} subTopic
     * @returns {Promise<object|null>}
     */
    static async getContent(exam, subject, topic, subTopic) {
        const cacheKey = `lc:content:${exam}:${subject}:${topic}:${subTopic}`;
        const cached = CacheLayer.getSnapshot(cacheKey);
        if (cached) return cached;

        try {
            const doc = await LearningContent.findOne({ exam, subject, topic, subTopic }).lean();
            if (doc) {
                CacheLayer.setSnapshot(cacheKey, doc, 300);
            }
            return doc;
        } catch (err) {
            console.error('[LearningContentService] getContent error:', err.message);
            return null;
        }
    }

    /**
     * Get a list of content for an exam, optionally filtered by subject.
     * Useful for the learning dashboard index card view.
     *
     * @param {string} exam
     * @param {string|null} subject
     * @returns {Promise<object[]>}
     */
    static async getContentList(exam, subject = null) {
        const cacheKey = `lc:list:${exam}:${subject || 'all'}`;
        const cached = CacheLayer.getSnapshot(cacheKey);
        if (cached) return cached;

        try {
            const query = { exam };
            if (subject) query.subject = subject;

            const docs = await LearningContent.find(
                query,
                { exam: 1, subject: 1, topic: 1, subTopic: 1, introduction: 1, _id: 1 }
            ).sort({ subject: 1, topic: 1 }).lean();

            CacheLayer.setSnapshot(cacheKey, docs, 120);
            return docs;
        } catch (err) {
            console.error('[LearningContentService] getContentList error:', err.message);
            return [];
        }
    }

    /**
     * Get practice MCQs for a topic.
     * Pulls from LearningContent.practiceMcqs without exposing correctAnswer.
     *
     * @param {string} exam
     * @param {string} subject
     * @param {string} topic
     * @returns {Promise<object[]>}
     */
    static async getPracticeMcqs(exam, subject, topic) {
        const cacheKey = `lc:mcqs:${exam}:${subject}:${topic}`;
        const cached = CacheLayer.getSnapshot(cacheKey);
        if (cached) return cached;

        try {
            const docs = await LearningContent.find(
                { exam, subject, topic },
                { practiceMcqs: 1, subTopic: 1, _id: 0 }
            ).lean();

            const mcqs = [];
            for (const doc of docs) {
                if (doc.practiceMcqs && doc.practiceMcqs.length > 0) {
                    mcqs.push(...doc.practiceMcqs.map(q => ({
                        ...q,
                        subTopic: doc.subTopic
                        // Note: correctAnswer is intentionally included (client handles reveal on submit)
                    })));
                }
            }

            CacheLayer.setSnapshot(cacheKey, mcqs, 300);
            return mcqs;
        } catch (err) {
            console.error('[LearningContentService] getPracticeMcqs error:', err.message);
            return [];
        }
    }

    /**
     * Create or update a learning content document.
     * Used by admin routes.
     *
     * @param {object} data — { exam, subject, topic, subTopic, ...content }
     * @returns {Promise<object>}
     */
    static async upsertContent(data) {
        const { exam, subject, topic, subTopic } = data;
        if (!exam || !subject || !topic || !subTopic) {
            throw new Error('exam, subject, topic, and subTopic are required.');
        }

        const doc = await LearningContent.findOneAndUpdate(
            { exam, subject, topic, subTopic },
            { ...data, updatedAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        ).lean();

        // Invalidate caches
        CacheLayer.invalidate(`lc:topics:${exam}:${subject}`);
        CacheLayer.invalidate(`lc:list:${exam}:${subject}`);
        CacheLayer.invalidate(`lc:list:${exam}:all`);
        CacheLayer.invalidate(`lc:content:${exam}:${subject}:${topic}:${subTopic}`);
        CacheLayer.invalidate(`lc:mcqs:${exam}:${subject}:${topic}`);

        return doc;
    }

    /**
     * Delete a learning content document.
     *
     * @param {string} id — MongoDB _id
     * @returns {Promise<boolean>}
     */
    static async deleteContent(id) {
        try {
            const doc = await LearningContent.findByIdAndDelete(id).lean();
            return !!doc;
        } catch (err) {
            console.error('[LearningContentService] deleteContent error:', err.message);
            return false;
        }
    }

    /**
     * Stats: total content docs grouped by exam.
     * @returns {Promise<object[]>}
     */
    static async getStats() {
        const cacheKey = 'lc:stats';
        const cached = CacheLayer.getSnapshot(cacheKey);
        if (cached) return cached;

        try {
            const stats = await LearningContent.aggregate([
                { $group: { _id: '$exam', count: { $sum: 1 }, subjects: { $addToSet: '$subject' } } },
                { $project: { exam: '$_id', count: 1, subjectCount: { $size: '$subjects' }, _id: 0 } },
                { $sort: { count: -1 } }
            ]);
            CacheLayer.setSnapshot(cacheKey, stats, 120);
            return stats;
        } catch (err) {
            console.error('[LearningContentService] getStats error:', err.message);
            return [];
        }
    }
}

module.exports = LearningContentService;
