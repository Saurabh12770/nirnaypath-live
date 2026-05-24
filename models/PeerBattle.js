'use strict';
const mongoose = require('mongoose');

const peerBattleSchema = new mongoose.Schema({
    challengerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    opponentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'completed', 'declined'],
        default: 'pending'
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    challengerScore: {
        type: Number,
        default: 0
    },
    opponentScore: {
        type: Number,
        default: 0
    },
    winnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, { timestamps: true });

peerBattleSchema.index({ challengerId: 1, status: 1 });
peerBattleSchema.index({ opponentId: 1, status: 1 });

module.exports = mongoose.model('PeerBattle', peerBattleSchema);
