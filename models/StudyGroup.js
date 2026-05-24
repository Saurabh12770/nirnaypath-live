'use strict';
const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['creator', 'admin', 'member'],
        default: 'member'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const studyGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [memberSchema],
    targetXP: {
        type: Number,
        default: 10000 // Weekly target XP for group
    },
    currentXP: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// name is already unique.

module.exports = mongoose.model('StudyGroup', studyGroupSchema);
