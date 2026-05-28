'use strict';

const User = require('../models/user');

class SubscriptionService {
    /**
     * Checks if a user has access to a specific locked premium feature.
     */
    async isFeatureAllowed(userId, featureKey) {
        const user = await User.findById(userId).lean();
        if (!user) return false;

        const isPremium = user.plan && user.plan !== 'free';

        // Free users cannot access "advanced_analytics", "ai_coach", or "unlimited_tests"
        if (['advanced_analytics', 'ai_coach', 'unlimited_tests'].includes(featureKey)) {
            return !!isPremium;
        }

        return true;
    }

    /**
     * Idempotently upgrades a user's subscription.
     */
    async upgradeUser(userId, planName, transactionId) {
        if (!userId || !planName) throw new Error('Missing upgrade credentials');

        // Verify/deduplicate the upgrade using optimistic locking or transaction tracking
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        // Prevent redundant payments
        if (user.plan === planName && user.refreshTokens.includes(transactionId)) {
            return user;
        }

        user.plan = planName;
        // Store txn key inside transient array as simple idempotency validation
        if (transactionId) {
            user.refreshTokens = [...(user.refreshTokens || []), transactionId].slice(-5);
        }

        await user.save();
        return user;
    }

    /**
     * Processes downgrades safely.
     */
    async downgradeUser(userId) {
        return await User.findByIdAndUpdate(userId, { plan: 'free' }, { new: true });
    }
}

module.exports = new SubscriptionService();
