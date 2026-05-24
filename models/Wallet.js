'use strict';
const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    source: {
        type: String,
        enum: ['payment', 'referral', 'reward', 'upgrade', 'refund'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    rewardCredits: {
        type: Number,
        default: 0,
        min: 0
    },
    transactions: [walletTransactionSchema]
}, { timestamps: true });

// userId is already unique and indexed inline.

module.exports = mongoose.model('Wallet', walletSchema);
