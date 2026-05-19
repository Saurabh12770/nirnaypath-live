const mongoose = require('mongoose');

const testSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    subject: {
        type: String,
        required: true
    },
    exam: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        default: null
    },
    questionCount: {
        type: Number,
        required: true
    },
    timeLimit: {
        type: Number, // In seconds
        required: true
    },
    startTime: {
        type: Date,
        default: Date.now,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'submitted', 'expired', 'terminated'],
        default: 'active'
    },
    questionIds: [{
        type: String, // Can be MongoDB _id or JSON id string
        required: true
    }],
    violations: [{
        violationType: { 
            type: String, 
            enum: ['tab_switch', 'window_blur', 'devtools_detected', 'clipboard_usage', 'fullscreen_exit', 'shortcut_usage', 'multiple_tabs'] 
        },
        timestamp: { type: Date, default: Date.now },
        userAgent: String,
        ip: String
    }],
    violationCount: {
        type: Number,
        default: 0
    },
    locked: {
        type: Boolean,
        default: false
    },
    terminatedReason: {
        type: String,
        default: null
    },
    answers: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    markedForReview: [{
        type: Number
    }],
    
    // --- PHASE 11 V2 FIELDS (OPTIONAL / BACKWARD COMPATIBLE) ---
    telemetryVersion: { type: Number, default: 1 },
    telemetryBufferId: { type: String, default: null },
    fraudProbabilityScore: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0 },
    panicScore: { type: Number, default: 0 },
    carelessMistakeIndex: { type: Number, default: 0 },
    adaptiveDifficulty: { type: Number, default: 0 },
    irtTheta: { type: Number, default: 0 },
    heartbeatVersion: { type: Number, default: 1 },
    analyticsProcessed: { type: Boolean, default: false },
    // -----------------------------------------------------------

    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // Automatically delete sessions older than 24 hours
    }
});

testSessionSchema.index({ userId: 1, status: 1 });
testSessionSchema.index({ sessionId: 1, status: 1 });

module.exports = mongoose.model('TestSession', testSessionSchema);
