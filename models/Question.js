const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    subject: { type: String, required: true, lowercase: true, index: true },
    topic: { type: String, index: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    question_en: { type: String, required: true },
    question_hi: { type: String, required: true },
    options_en: [String],
    options_hi: [String],
    correctAnswer: { type: Number, required: true }, // Index 0-3
    explanation_en: String,
    explanation_hi: String,
    exam_tags: [String],
    reference: String,
    year_asked: String,
    createdAt: { type: Date, default: Date.now }
});

// Compound index for random subject sampling
questionSchema.index({ subject: 1, difficulty: 1 });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
