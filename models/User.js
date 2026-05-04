const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    pushSubscription: {
        type: Object,
        default: null
    },
    plan: {
        type: String,
        enum: ['free', 'pro_monthly'],
        default: 'free'
    },
    subscriptionEnd: {
        type: Date,
        default: null
    },
    razorpaySubscriptionId: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    streakCount: {
        type: Number,
        default: 0
    },
    lastActiveDate: {
        type: Date,
        default: null
    },
    badges: [String],
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    chatCount: {
        type: Number,
        default: 0
    },
    lastChatDate: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
