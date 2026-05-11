const Question = require('../models/Question');

/**
 * Load questions from MongoDB (Legacy wrapper for backward compatibility)
 * @param {string} subject Subject name
 * @returns {Promise<Array>} Array of questions
 */
async function loadQuestions(subject) {
    try {
        console.log(`[loader] Fetching questions from MongoDB for subject: ${subject}`);
        
        // Fetch all questions for the subject
        const questions = await Question.find({ subject: subject.toLowerCase() }).lean();
        
        console.log(`[loader] Found ${questions.length} questions in MongoDB.`);
        
        return questions;
    } catch (error) {
        console.error(`[questionLoader] Error fetching from MongoDB for ${subject}:`, error.message);
        return [];
    }
}

module.exports = {
    loadQuestions
};
