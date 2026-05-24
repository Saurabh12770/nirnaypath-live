'use strict';
const mongoose = require('mongoose');

const userActivityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    action: {
        type: String, // 'page_view', 'click', 'test_start', 'test_complete', 'checkout_start', 'checkout_complete'
        required: true,
        index: true
    },
    page: {
        type: String,
        required: true
    },
    x: {
        type: Number,
        default: 0
    },
    y: {
        type: Number,
        default: 0
    },
    metadata: {
        type: Object,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

userActivityLogSchema.index({ createdAt: -1 });
userActivityLogSchema.index({ userId: 1, action: 1 });

module.exports = mongoose.model('UserActivityLog', userActivityLogSchema);
