const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    // Support both old and new formats for maximum compatibility during stabilization
    subjectId: { type: String, lowercase: true, index: true },
    subject: { type: String, lowercase: true, index: true }, // Legacy/Fallback
    
    examId: { type: String, index: true },
    topicId: { type: String, index: true },
    
    text: { type: String }, // Primary question text
    question_en: { type: String }, // Bilingual support
    question_hi: { type: String },
    
    options: [String], // Array of options
    options_en: [String],
    options_hi: [String],
    
    answer: { type: String }, // String answer (e.g. "Newton")
    correctAnswer: { type: Number }, // Index (0-3)
    
    difficulty: { type: String, uppercase: true, default: 'MEDIUM' },
    explanation: String,
    explanation_en: String,
    explanation_hi: String,
    
    createdAt: { type: Date, default: Date.now }
}, { strict: false }); // Set strict: false to allow existing data to be read even if fields vary slightly

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
