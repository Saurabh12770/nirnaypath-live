const mongoose = require('mongoose');

const questionTelemetrySchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    questionId: {
        type: String,
        required: true,
        index: true
    },
    selectedOption: { type: String, default: null },
    isCorrect: { type: Boolean, default: false },
    visited: { type: Boolean, default: true },
    markedForReview: { type: Boolean, default: false },
    
    // --- V2 AI Metrics ---
    timeSpentMs: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0 },
    hesitationCount: { type: Number, default: 0 },
    answerChanges: { type: Number, default: 0 },
    firstSeenAt: { type: Date, default: null },
    lastInteractionAt: { type: Date, default: null },
    riskFlags: [{ type: String }],
    clientLatency: { type: Number, default: 0 },
    viewportBlurEvents: { type: Number, default: 0 },

    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Compound index for fast aggregation per session/question
questionTelemetrySchema.index({ sessionId: 1, questionId: 1 });

module.exports = mongoose.model('QuestionTelemetry', questionTelemetrySchema);
