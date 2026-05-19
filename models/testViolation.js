'use strict';

/**
 * TestViolation Model — Phase 4 Anti-Cheat
 * =========================================
 * Persists every integrity violation event with full audit trail.
 * Sessions are auto-locked after threshold violations.
 */

const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: [
            'tab_switch',
            'window_blur',
            'copy_paste',
            'right_click',
            'devtools_open',
            'fullscreen_exit',
            'multiple_sessions',
            'time_anomaly',
            'other'
        ]
    },
    detail: {
        type: String,
        default: ''
    },
    ipAddress: {
        type: String,
        default: ''
    },
    userAgent: {
        type: String,
        default: ''
    },

    // --- PHASE 11 V2 FIELDS ---
    confidenceThreshold: { type: Number, default: 0 },
    networkGraphId: { type: String, default: null },
    fraudScoreWeight: { type: Number, default: 0 },
    isAIConfirmed: { type: Boolean, default: false },
    // --------------------------

    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

violationSchema.index({ sessionId: 1, type: 1 });

module.exports = mongoose.model('TestViolation', violationSchema);
