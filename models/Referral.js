'use strict';
const mongoose = require('mongoose');

const referredUserSchema = new mongoose.Schema({
    referredUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    rewardGranted: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const referralSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    referralCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },
    referredUsers: [referredUserSchema]
}, { timestamps: true });

// Referral code and userId are already indexed via fields inline definition.

module.exports = mongoose.model('Referral', referralSchema);
