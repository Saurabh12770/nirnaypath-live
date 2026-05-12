const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    exam: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        default: null
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
    timeTaken: {
        type: Number,
        default: 0
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
        question: String,
        question_hi: String,
        selected: Number,
        correct: Number,
        explanation_en: String,
        explanation_hi: String,
        isCorrect: Boolean,
        topic: String,
        topicId: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

testResultSchema.index({ userId: 1 });
testResultSchema.index({ createdAt: -1 });
testResultSchema.index({ userId: 1, createdAt: -1 });
testResultSchema.index({ exam: 1, createdAt: -1 });

const TestResult = mongoose.model('TestResult', testResultSchema);

module.exports = TestResult;
