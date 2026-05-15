const mongoose = require('mongoose');

const questionReservationSchema = new mongoose.Schema({
    questionId: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['RESERVED', 'COMMITTED', 'EXPIRED'],
        default: 'RESERVED'
    },
    lockVersion: {
        type: Number,
        default: 1
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: { expires: '120s' } // TTL indexing for auto-cleanup
    }
});

// Compound index for atomic uniqueness per user/question
questionReservationSchema.index({ userId: 1, questionId: 1 }, { unique: true });

const QuestionReservation = mongoose.model('QuestionReservation', questionReservationSchema);

module.exports = QuestionReservation;
