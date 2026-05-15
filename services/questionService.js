/**
 * Question Service Layer (Phase 2)
 * SINGLE entry point for question delivery.
 */

const QuestionPipeline = require('../core/questionPipeline');

class QuestionService {
    static async getTestQuestions({ userId, subject, topicId, count }) {
        if (!subject) {
            throw new Error('Subject is required');
        }

        // Orchestrate full pipeline via central core pipeline.
        // No direct data mutation or selection logic here.
        return await QuestionPipeline.execute({ userId, subject, topicId, count });
    }
}

module.exports = QuestionService;
