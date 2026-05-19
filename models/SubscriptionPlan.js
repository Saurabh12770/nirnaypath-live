const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
    planId: { type: String, required: true, unique: true }, // e.g. 'ind_pro', 'inst_university'
    name: { type: String, required: true },
    tier: { type: String, enum: ['free', 'pro', 'elite', 'coaching', 'university', 'enterprise'], required: true },
    targetAudience: { type: String, enum: ['individual', 'institution'], required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    billingCycle: { type: String, enum: ['monthly', 'yearly', 'lifetime'], required: true },
    features: {
        usageQuotas: {
            maxStudents: { type: Number, default: 1 }, 
            maxExamsPerMonth: { type: Number, default: 10 },
            storageGB: { type: Number, default: 0 }
        },
        attemptLimits: {
            mockTests: { type: Number, default: 5 },
            practiceQuestions: { type: Number, default: 100 }
        },
        unlocks: {
            aiAnalytics: { type: Boolean, default: false },
            adaptiveTesting: { type: Boolean, default: false },
            premiumRankingVisibility: { type: Boolean, default: false },
            institutionalAnalytics: { type: Boolean, default: false },
            whiteLabeling: { type: Boolean, default: false }
        }
    },
    razorpayPlanId: { type: String },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// SRE / Scale: Indexing
subscriptionPlanSchema.index({ targetAudience: 1, isActive: 1 });
subscriptionPlanSchema.index({ tier: 1 });

subscriptionPlanSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
