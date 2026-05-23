'use strict';

const mongoose = require('mongoose');
const User = require('../models/user');
const Payment = require('../models/payment');
const Wallet = require('../models/Wallet');
const Referral = require('../models/Referral');
const Coupon = require('../models/Coupon');
const plans = require('../config/plans');

class GrowthService {

    /**
     * Get or create a wallet for a user
     */
    static async getOrCreateWallet(userId) {
        let wallet = await Wallet.findOne({ userId });
        if (!wallet) {
            wallet = new Wallet({
                userId,
                balance: 0,
                rewardCredits: 0,
                transactions: []
            });
            await wallet.save();
        }
        return wallet;
    }

    /**
     * Modify wallet balance or reward credits
     */
    static async adjustWallet(userId, { amount = 0, rewardCredits = 0, type, source, description }) {
        const wallet = await this.getOrCreateWallet(userId);

        if (amount !== 0) {
            if (type === 'credit') {
                wallet.balance += amount;
            } else if (type === 'debit') {
                if (wallet.balance < amount) {
                    throw new Error('Insufficient wallet balance');
                }
                wallet.balance -= amount;
            }
            wallet.transactions.push({
                amount: Math.abs(amount),
                type,
                source,
                description
            });
        }

        if (rewardCredits !== 0) {
            wallet.rewardCredits = Math.max(0, wallet.rewardCredits + rewardCredits);
            wallet.transactions.push({
                amount: Math.abs(rewardCredits),
                type: rewardCredits > 0 ? 'credit' : 'debit',
                source: 'reward',
                description: `Reward points adjust: ${description}`
            });
        }

        await wallet.save();
        return wallet;
    }

    /**
     * Get or create referral details for a user
     */
    static async getOrCreateReferralCode(userId) {
        let ref = await Referral.findOne({ userId });
        if (!ref) {
            // Generate a random 8-character unique alphanumeric code
            const user = await User.findById(userId);
            const prefix = user && user.name ? user.name.slice(0, 3).toUpperCase() : 'NP';
            const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
            const code = `${prefix}${randomStr}`;

            ref = new Referral({
                userId,
                referralCode: code,
                referredUsers: []
            });
            await ref.save();
        }
        return ref;
    }

    /**
     * Handle user signing up with a referral code.
     * Records the user link. Reward is granted once the referred user joins (or completes their first test).
     */
    static async registerReferral(referredUserId, referralCode) {
        if (!referralCode) return null;

        const referrerRecord = await Referral.findOne({ referralCode: referralCode.toUpperCase() });
        if (!referrerRecord) {
            console.warn(`[Referral] Referral code ${referralCode} not found.`);
            return null;
        }

        if (referrerRecord.userId.toString() === referredUserId.toString()) {
            throw new Error('You cannot refer yourself.');
        }

        // Check if user already referred
        const alreadyReferred = referrerRecord.referredUsers.some(
            u => u.referredUserId.toString() === referredUserId.toString()
        );

        if (!alreadyReferred) {
            referrerRecord.referredUsers.push({
                referredUserId,
                status: 'pending',
                joinedAt: new Date(),
                rewardGranted: false
            });
            await referrerRecord.save();

            // Auto-complete immediately on join to grant reward credits
            await this.completeReferralReward(referrerRecord.userId, referredUserId);
        }

        return referrerRecord;
    }

    /**
     * Mark referral as completed and distribute credits.
     * Credits 100 reward credits to referrer, 50 to referred.
     */
    static async completeReferralReward(referrerUserId, referredUserId) {
        const refRecord = await Referral.findOne({ userId: referrerUserId });
        if (!refRecord) return;

        const refUserObj = refRecord.referredUsers.find(
            u => u.referredUserId.toString() === referredUserId.toString()
        );

        if (refUserObj && !refUserObj.rewardGranted) {
            refUserObj.status = 'completed';
            refUserObj.rewardGranted = true;
            await refRecord.save();

            // Referrer gets 100 reward credits
            await this.adjustWallet(referrerUserId, {
                rewardCredits: 100,
                amount: 0,
                type: 'credit',
                source: 'referral',
                description: 'Earned referral credits for inviting friend'
            });

            // Referred user gets 50 reward credits
            await this.adjustWallet(referredUserId, {
                rewardCredits: 50,
                amount: 0,
                type: 'credit',
                source: 'referral',
                description: 'Sign-up bonus using referral code'
            });
        }
    }

    /**
     * Convert user reward points into actual wallet balance.
     * Conversion rate: 10 Reward credits = 1 INR
     */
    static async convertRewardsToWallet(userId, pointsToConvert) {
        const wallet = await this.getOrCreateWallet(userId);
        if (wallet.rewardCredits < pointsToConvert) {
            throw new Error('Insufficient reward credits');
        }

        const cashValue = Math.floor(pointsToConvert / 10);
        if (cashValue <= 0) {
            throw new Error('Minimum conversion requires at least 10 credits');
        }

        wallet.rewardCredits -= pointsToConvert;
        wallet.balance += cashValue;
        wallet.transactions.push({
            amount: cashValue,
            type: 'credit',
            source: 'reward',
            description: `Converted ${pointsToConvert} reward credits to wallet balance`
        });

        await wallet.save();
        return wallet;
    }

    /**
     * Apply coupon and return discounted price
     */
    static async validateAndApplyCoupon(couponCode, planId) {
        const plan = plans[planId];
        if (!plan) throw new Error('Invalid plan selected');

        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
        if (!coupon) {
            throw new Error('Coupon is invalid or inactive');
        }

        if (coupon.expiryDate < new Date()) {
            throw new Error('Coupon has expired');
        }

        if (coupon.usesCount >= coupon.maxUses) {
            throw new Error('Coupon usage limit reached');
        }

        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = Math.floor((plan.price * coupon.discountValue) / 100);
        } else if (coupon.discountType === 'fixed') {
            discount = coupon.discountValue;
        }

        const finalPrice = Math.max(0, plan.price - discount);

        return {
            couponCode: coupon.code,
            originalPrice: plan.price,
            discount,
            finalPrice
        };
    }

    /**
     * Upgrade user plan directly using wallet balance (e.g. credits-based buy).
     */
    static async upgradePlanWithWallet(userId, planId, couponCode = null) {
        const plan = plans[planId];
        if (!plan) throw new Error('Invalid plan');

        let cost = plan.price;
        let discount = 0;

        if (couponCode) {
            const couponResult = await this.validateAndApplyCoupon(couponCode, planId);
            cost = couponResult.finalPrice;
            discount = couponResult.discount;
        }

        const wallet = await this.getOrCreateWallet(userId);
        if (wallet.balance < cost) {
            throw new Error(`Insufficient wallet balance. Required: INR ${cost}, Available: INR ${wallet.balance}`);
        }

        // Deduct from wallet
        await this.adjustWallet(userId, {
            amount: cost,
            rewardCredits: 0,
            type: 'debit',
            source: 'upgrade',
            description: `Upgraded to ${plan.name} subscription`
        });

        // Fulfill subscription
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + plan.durationDays);

        await User.findByIdAndUpdate(userId, {
            plan: planId,
            subscriptionStatus: 'active',
            subscriptionEnd: expiry
        });

        // Increment coupon count if used
        if (couponCode) {
            await Coupon.findOneAndUpdate({ code: couponCode.toUpperCase() }, { $inc: { usesCount: 1 } });
        }

        // Record a mock payment to preserve ledger integration
        const payment = new Payment({
            userId,
            planId,
            amount: cost,
            razorpay_payment_id: `wallet_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            razorpay_order_id: `wallet_order_${Date.now()}`,
            razorpay_signature: 'wallet_checkout',
            status: 'success',
            metadata: { paidByWallet: true, discount }
        });
        await payment.save();

        return { success: true, newPlan: planId, expiryDate: expiry };
    }

    /**
     * Fetch subscription metrics for admin dashboard
     */
    static async getSubscriptionAnalytics() {
        const [totalRevenueResult, activeSubs, planCounts] = await Promise.all([
            Payment.aggregate([
                { $match: { status: 'success' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            User.countDocuments({ plan: { $ne: 'free' }, subscriptionStatus: 'active' }),
            User.aggregate([
                { $group: { _id: '$plan', count: { $sum: 1 } } }
            ])
        ]);

        const totalRevenue = totalRevenueResult[0]?.total || 0;

        // Estimate MRR (Monthly Recurring Revenue)
        const paymentsLastMonth = await Payment.aggregate([
            {
                $match: {
                    status: 'success',
                    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 3600 * 1000) }
                }
            },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const mrr = paymentsLastMonth[0]?.total || 0;

        return {
            totalRevenue,
            mrr,
            activeSubscriptions: activeSubs,
            planDistribution: planCounts.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {})
        };
    }
}

module.exports = GrowthService;
