'use strict';
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true,
        index: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    expiryDate: {
        type: Date,
        required: true
    },
    maxUses: {
        type: Number,
        default: 100
    },
    usesCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

couponSchema.index({ code: 1, isActive: 1, expiryDate: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
