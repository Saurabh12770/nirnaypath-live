const mongoose = require('mongoose');

const liveResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    liveSessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LiveSession',
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    answers: {
        type: Map,
        of: String // questionId -> selectedOption
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

liveResultSchema.index({ liveSessionId: 1, score: -1 });
liveResultSchema.index({ userId: 1, liveSessionId: 1 }, { unique: true });

module.exports = mongoose.model('LiveResult', liveResultSchema);
