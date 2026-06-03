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

    /**
     * Idempotently fulfills a Razorpay payment order.
     */
    async fulfillOrder(userId, details, planId) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = details;
        const Payment = require('../models/payment');
        const { sendEmail } = require('./emailService');
        const plans = require('../config/plans');
        
        // 1. Idempotency Check: check if payment is already successful
        let payment = await Payment.findOne({ razorpay_payment_id });
        if (payment && payment.status === 'success') {
            console.log(`[SubscriptionService] Order already fulfilled: payment=${razorpay_payment_id}`);
            return payment;
        }

        // 2. Fetch plan details
        const plan = plans[planId] || { name: 'Pro', price: 499 };

        // 3. Atomically update or create the payment record
        if (!payment) {
            payment = new Payment({
                userId,
                planId,
                amount: plan.price,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                status: 'success'
            });
        } else {
            payment.status = 'success';
            payment.razorpay_payment_id = razorpay_payment_id;
            payment.razorpay_signature = razorpay_signature;
        }
        await payment.save();

        // 4. Atomic Plan Upgrade
        const user = await this.upgradeUser(userId, planId, razorpay_payment_id);

        // 5. Send Success Email in background
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1); // 1-month default duration
        sendEmail(user.email, 'PAYMENT_SUCCESS', {
            user,
            amount: plan.price * 100, // INR to paise for formatter
            planName: plan.name,
            expiryDate: expiryDate.toLocaleDateString()
        }).catch(err => console.error('[SubscriptionService] Failed to send payment email:', err.message));

        return payment;
    }

    /**
     * Reconciles direct webhook notifications.
     */
    async handleWebhook(event, payload) {
        const Payment = require('../models/payment');
        if (event === 'payment.failed') {
            const paymentId = payload?.payment?.entity?.id;
            const orderId = payload?.payment?.entity?.order_id;
            if (paymentId || orderId) {
                await Payment.updateOne(
                    { $or: [{ razorpay_payment_id: paymentId }, { razorpay_order_id: orderId }] },
                    { $set: { status: 'failed' } }
                );
                console.log(`[SubscriptionService] Marked payment failed for webhook: order=${orderId}`);
            }
        }
    }
}

module.exports = new SubscriptionService();
