const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: {
        type: String,
        unique: true,
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

    // --- PHASE 11 V2 FIELDS ---
    fraudProbabilityScore: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0 },
    normalizedScore: { type: Number, default: null },
    allIndiaRank: { type: Number, default: null },
    stateRank: { type: Number, default: null },
    categoryRank: { type: Number, default: null },
    irtThetaFinal: { type: Number, default: null },
    timeTaken: { type: Number, default: 0 },
    // --------------------------

    createdAt: {
        type: Date,
        default: Date.now
    }
});

testResultSchema.index({ userId: 1 });
testResultSchema.index({ createdAt: -1 });
testResultSchema.index({ exam: 1, createdAt: -1 });
// Phase 11 — Compound indexes for production query patterns
testResultSchema.index({ userId: 1, createdAt: -1 });          // User history queries
testResultSchema.index({ userId: 1, subject: 1, createdAt: -1 }); // Per-subject analytics
testResultSchema.index({ userId: 1, exam: 1, createdAt: -1 }); // Exam-scoped history
testResultSchema.index({ subject: 1, score: -1 });              // Subject leaderboard
testResultSchema.index({ exam: 1, score: -1, createdAt: -1 }); // Exam rank + recent
testResultSchema.index({ fraudProbabilityScore: 1 }, { sparse: true }); // Anti-cheat queries
testResultSchema.index({ subject: 1, createdAt: -1, timeTaken: 1, fraudProbabilityScore: 1 }); // Optimized subject leaderboard queries

const TestResult = mongoose.model('TestResult', testResultSchema);

module.exports = TestResult;
