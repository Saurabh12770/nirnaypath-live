const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Payment = require('../models/Payment');
const plans = require('../config/plans');
const SubscriptionService = require('../services/subscriptionService');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * POST /api/payment/create-order
 * Enterprise-grade order initiation with price locking
 */
router.post('/create-order', auth, async (req, res) => {
    try {
        const { planId } = req.body;
        const plan = plans[planId];
        
        if (!plan || plan.price === 0) {
            return res.status(400).json({ error: 'Invalid plan selected' });
        }

        // Check if user already has an active plan
        if (req.user.plan !== 'free' && req.user.subscriptionEnd > new Date()) {
            return res.status(400).json({ error: 'You already have an active subscription' });
        }

        const options = {
            amount: plan.price * 100, // INR in paise
            currency: plan.currency || 'INR',
            receipt: `np_${req.user._id}_${Date.now()}`,
            notes: {
                planId: planId,
                userId: req.user._id.toString(),
                env: process.env.NODE_ENV || 'development'
            }
        };

        const order = await razorpay.orders.create(options);
        
        // Log pending payment for reconciliation
        const payment = new Payment({
            userId: req.user._id,
            planId: planId,
            amount: plan.price,
            razorpay_order_id: order.id,
            razorpay_payment_id: 'pending_' + order.id,
            razorpay_signature: 'pending',
            status: 'pending'
        });
        await payment.save();

        res.json({
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.error('[Payment] Order Creation Error:', error.message);
        if (error.message.includes('key_id')) {
            return res.status(500).json({ 
                error: 'Razorpay configuration error', 
                message: 'Admin has not configured payment keys.' 
            });
        }
        res.status(500).json({ error: 'Failed to initiate payment: ' + error.message });
    }
});

/**
 * POST /api/payment/verify
 * Secure HMAC-based payment verification
 */
router.post('/verify', auth, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

        // 1. Signature Verification
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) throw new Error('Razorpay Secret missing in environment');

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            console.warn(`[Payment] Invalid signature detected for Order: ${razorpay_order_id}`);
            return res.status(400).json({ error: 'Security verification failed. Fraud attempt logged.' });
        }

        // 2. Fulfillment via SubscriptionService
        await SubscriptionService.fulfillOrder(req.user._id, {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        }, planId);

        res.json({ success: true, message: 'Welcome to NirnayPath Pro!' });
    } catch (error) {
        console.error('[Payment] Verification Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/payment/webhook
 * Razorpay Webhook Handler for asynchronous fulfillment
 */
router.post('/webhook', async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (expectedSignature !== signature) {
            return res.status(400).send('Invalid webhook signature');
        }

        const { event, payload } = req.body;
        
        // Handle "payment.captured" as a fallback fulfillment
        if (event === 'payment.captured') {
            const payment = payload.payment.entity;
            const userId = payment.notes.userId;
            const planId = payment.notes.planId;

            // Check if already fulfilled to avoid double processing
            const existingPayment = await Payment.findOne({ razorpay_payment_id: payment.id });
            if (!existingPayment || existingPayment.status !== 'success') {
                await SubscriptionService.fulfillOrder(userId, {
                    razorpay_order_id: payment.order_id,
                    razorpay_payment_id: payment.id,
                    razorpay_signature: 'webhook_verified'
                }, planId);
            }
        }

        await SubscriptionService.handleWebhook(event, payload);
        res.status(200).send('OK');
    } catch (error) {
        console.error('[Payment] Webhook Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
