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
        enum: ['active', 'submitted', 'expired'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // Automatically delete sessions older than 24 hours
    }
});

module.exports = mongoose.model('TestSession', testSessionSchema);
