/**
 * Question Service - Simplified v2.0
 */

const QuestionRepository = require('./questionRepository');
const SelectionEngine = require('./selectionEngine');

class QuestionService {
    static async getTestQuestions({ userId, subject, topicId, count }) {
        if (!subject) {
            throw new Error('Subject is required');
        }

        // Fetch valid questions from repo
        const questions = await QuestionRepository.fetchQuestions(subject, topicId);

        // Select count using random shuffle selection engine
        const selected = SelectionEngine.select(questions, count || 20);

        return selected;
    }
}

module.exports = QuestionService;
