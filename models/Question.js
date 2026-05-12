const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    id: { type: String, index: true },
    subject: { type: String, lowercase: true, index: true },
    subjectId: { type: String, lowercase: true, index: true },
    examId: { type: String, lowercase: true, index: true },
    topic: { type: String, index: true },
    topicId: { type: String, index: true },
    difficulty: { type: String, index: true },
    exam_tags: { type: [String], index: true },
    examLevel: { type: [String], index: true },
    
    // Support multiple field names for question text
    text: { type: String },
    question: { type: String },
    question_en: { type: String },
    question_hi: { type: String },
    
    // Support multiple field names for options
    options: { type: [String] },
    options_en: { type: [String] },
    options_hi: { type: [String] },
    
    // Support multiple field names for answers
    answer: { type: mongoose.Schema.Types.Mixed },
    correctAnswer: { type: mongoose.Schema.Types.Mixed },
    
    explanation: { type: String },
    explanation_en: { type: String },
    explanation_hi: { type: String },
    
    reference: { type: String },
    year_asked: { type: String },
    createdAt: { type: Date, default: Date.now }
}, { strict: false });

// Compound indexes for common queries
questionSchema.index({ subject: 1, topic: 1 });
questionSchema.index({ subjectId: 1, topicId: 1 });
questionSchema.index({ subject: 1, difficulty: 1 });
questionSchema.index({ subjectId: 1, difficulty: 1 });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
