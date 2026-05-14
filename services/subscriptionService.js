const User = require('../models/user');
const Payment = require('../models/payment');
const plans = require('../config/plans');
const emailService = require('./emailService');

/**
 * Subscription Intelligence Service
 * Handles plan transitions, expiry logic, and billing events
 */
const SubscriptionService = {
    /**
     * Process a successful payment and upgrade user
     */
    async fulfillOrder(userId, paymentData, planId) {
        const plan = plans[planId];
        if (!plan) throw new Error('Invalid plan for fulfillment');

        const expiry = new Date();
        expiry.setDate(expiry.getDate() + plan.durationDays);

        const mongoose = require('mongoose');
        const session = await mongoose.startSession();
        
        try {
            await session.withTransaction(async () => {
                // 1. Create/Update Payment Record
                await Payment.findOneAndUpdate(
                    { razorpay_payment_id: paymentData.razorpay_payment_id },
                    {
                        userId,
                        planId,
                        amount: plan.price,
                        currency: plan.currency || 'INR',
                        razorpay_order_id: paymentData.razorpay_order_id,
                        razorpay_signature: paymentData.razorpay_signature,
                        status: 'success',
                        metadata: { fulfilledAt: new Date() }
                    },
                    { upsert: true, session }
                );

                // 2. Upgrade User
                const user = await User.findByIdAndUpdate(userId, {
                    plan: planId,
                    subscriptionStatus: 'active',
                    subscriptionEnd: expiry,
                    razorpayOrderId: paymentData.razorpay_order_id
                }, { session, new: true });

                // 3. Trigger Email (Background)
                emailService.sendEmail(user.email, 'PAYMENT_SUCCESS', {
                    name: user.name,
                    planName: plan.name,
                    amount: plan.price,
                    expiryDate: expiry.toLocaleDateString()
                }).catch(err => console.error('[SubscriptionService] Email failed:', err));
            });
            
            console.log(`[SubscriptionService] Fulfillment successful for User: ${userId}`);
            return true;
        } catch (error) {
            console.error('[SubscriptionService] Fulfillment error:', error);
            throw error;
        } finally {
            session.endSession();
        }
    },

    /**
     * Handle Webhook events from Razorpay
     */
    async handleWebhook(event, payload) {
        console.log(`[SubscriptionService] Webhook received: ${event}`);
        
        switch (event) {
            case 'payment.captured':
                // Already handled by fulfillment usually, but safe fallback
                break;
            case 'subscription.cancelled':
                const subId = payload.subscription.entity.id;
                await User.findOneAndUpdate(
                    { razorpaySubscriptionId: subId },
                    { subscriptionStatus: 'cancelled' }
                );
                break;
            // Add more cases as needed
        }
    },

    /**
     * Check and expire subscriptions (to be called by cron)
     */
    async checkExpirations() {
        const now = new Date();
        const expiredUsers = await User.find({
            plan: { $ne: 'free' },
            subscriptionEnd: { $lt: now },
            subscriptionStatus: 'active'
        });

        for (const user of expiredUsers) {
            user.subscriptionStatus = 'expired';
            user.plan = 'free'; // Downgrade
            await user.save();
            
            emailService.sendEmail(user.email, 'SUBSCRIPTION_EXPIRED', {
                name: user.name
            }).catch(e => {});
        }
        
        return expiredUsers.length;
    }
};

module.exports = SubscriptionService;
