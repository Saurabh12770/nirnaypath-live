'use strict';
const mongoose = require('mongoose');

const dailyChallengeSchema = new mongoose.Schema({
    date: {
        type: String, // YYYY-MM-DD
        required: true,
        unique: true,
        index: true
    },
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
    },
    rewardCredits: {
        type: Number,
        default: 20
    },
    completedUsers: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        completedAt: {
            type: Date,
            default: Date.now
        }
    }]
});

// date is already unique and indexed inline.

module.exports = mongoose.model('DailyChallenge', dailyChallengeSchema);
