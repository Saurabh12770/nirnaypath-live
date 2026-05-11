const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    id: { 
        type: String, 
        required: true, 
        unique: true,
        index: true
    },
    subject: { 
        type: String, 
        required: true, 
        lowercase: true,
        index: true
    },
    topic: { 
        type: String, 
        index: true 
    },
    difficulty: { 
        type: String, 
        enum: ['easy', 'medium', 'hard'], 
        index: true 
    },
    exam_tags: {
        type: [String],
        index: true
    },
    question_en: { type: String, required: true },
    question_hi: { type: String },
    options_en: { type: [String], required: true },
    options_hi: { type: [String] },
    correctAnswer: { type: Number, required: true }, // Index (0-3)
    explanation_en: { type: String },
    explanation_hi: { type: String },
    reference: { type: String },
    year_asked: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Compound indexes for common queries
questionSchema.index({ subject: 1, topic: 1 });
questionSchema.index({ subject: 1, difficulty: 1 });
questionSchema.index({ subject: 1, topic: 1, difficulty: 1 });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
