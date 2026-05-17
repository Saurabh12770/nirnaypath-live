const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    exam: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    testName: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        enum: ['full', 'drill', 'section'],
        default: 'full'
    },
    modeValue: {
        type: String,
        default: null
    },
    score: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    correct: {
        type: Number,
        required: true
    },
    incorrect: {
        type: Number,
        required: true
    },
    unattempted: {
        type: Number,
        required: true
    },
    accuracy: {
        type: Number,
        required: true
    },
    answers: [{
        questionId: String,
        userAnswer: String,
        correctAnswer: mongoose.Schema.Types.Mixed,
        isCorrect: Boolean,
        topic: String,
        topicId: String,
        explanation_en: String,
        explanation_hi: String,
        selected: mongoose.Schema.Types.Mixed,
        correct: mongoose.Schema.Types.Mixed,
        question_en: String,
        question_hi: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

testResultSchema.index({ userId: 1 });
testResultSchema.index({ createdAt: -1 });
testResultSchema.index({ exam: 1, createdAt: -1 });

const TestResult = mongoose.model('TestResult', testResultSchema);

module.exports = TestResult;
