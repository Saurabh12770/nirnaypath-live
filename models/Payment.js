const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    planId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    razorpay_payment_id: {
        type: String,
        required: true,
        unique: true // Idempotency protection
    },
    razorpay_order_id: {
        type: String,
        required: true
    },
    razorpay_signature: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed', 'refunded'],
        default: 'pending'
    },
    metadata: {
        type: Object,
        default: {}
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

paymentSchema.index({ razorpay_order_id: 1 });
paymentSchema.index({ userId: 1, createdAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
