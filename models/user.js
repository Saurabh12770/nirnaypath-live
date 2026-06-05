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
        lowercase: true,
        index: true,
        validate: {
            validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
            message: 'Invalid email format'
        }
    },
    password: {
        type: String,
        required: true,
        select: false,   // SECURITY: never returned in queries unless explicitly selected
        minlength: [8, 'Password must be at least 8 characters']
    },
    pushSubscription: {
        type: Object,
        default: null
    },
    plan: {
        type: String,
        enum: ['free', 'pro_monthly', 'pro_yearly'],
        default: 'free'
    },
    subscriptionStatus: {
        type: String,
        enum: ['active', 'expired', 'cancelled', 'grace_period'],
        default: 'active'
    },
    subscriptionEnd: {
        type: Date,
        default: null
    },
    paymentProvider: {
        type: String,
        enum: ['razorpay', 'stripe', 'manual'],
        default: 'razorpay'
    },
    razorpaySubscriptionId: {
        type: String,
        default: null
    },
    razorpayOrderId: {
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
    refreshTokens: [String],
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
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    // Per-user mutex for concurrent /start prevention (TTL-backed distributed lock)
    testStartLock: { type: String, default: null },
    testStartLockExpiry: { type: Date, default: null },
    referralCodeUsed: { type: String, default: null },
    processedPayments: { type: [String], default: [] }
});

userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1 });
// Phase 11 — Production compound indexes
userSchema.index({ isActive: 1, role: 1 });              // Admin user listing
userSchema.index({ plan: 1, subscriptionStatus: 1 });    // Subscription queries
userSchema.index({ subscriptionEnd: 1 }, { sparse: true }); // Expiry sweeper
userSchema.index({ lastActiveDate: -1 });                // Streak crons

const User = mongoose.model('User', userSchema);

module.exports = User;
