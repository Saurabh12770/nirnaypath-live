'use strict';
const mongoose = require('mongoose');

const goalTrackerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    dailyMockGoal: {
        type: Number,
        default: 1 // 1 mock test per day default
    },
    dailyMockCount: {
        type: Number,
        default: 0
    },
    dailyMinutesGoal: {
        type: Number,
        default: 30 // 30 minutes study per day default
    },
    dailyMinutesCount: {
        type: Number,
        default: 0
    },
    currentStreak: {
        type: Number,
        default: 0
    },
    longestStreak: {
        type: Number,
        default: 0
    },
    lastActiveDate: {
        type: String, // YYYY-MM-DD
        default: null
    }
}, { timestamps: true });

// userId is already unique and indexed inline.

module.exports = mongoose.model('GoalTracker', goalTrackerSchema);
