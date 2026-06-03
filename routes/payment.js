const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const User = require('../models/user');
const Payment = require('../models/payment');
const plans = require('../config/plans');
const SubscriptionService = require('../services/subscriptionService');

let razorpay = null;
try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    } else {
        console.warn('[Payment] RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing. Payments disabled.');
    }
} catch (e) {
    console.error('[Payment] Error initializing Razorpay:', e.message);
}

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

        if (!razorpay) {
            return res.status(500).json({ error: 'Payment gateway not configured' });
        }
        
        const CircuitBreakerService = require('../services/circuitBreakerService');
        const order = await CircuitBreakerService.wrapOperation('razorpay', async () => {
            return await razorpay.orders.create(options);
        });
        
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
 * =========================
 * PHASE 5 — Hardened Razorpay Webhook Handler.
 *
 * Fixes:
 *  1. HMAC computed over req.rawBody (raw bytes) — not JSON.stringify(body)
 *     which can differ due to key ordering or encoding.
 *  2. Timestamp validation — rejects events older than 5 minutes.
 *  3. Idempotency — skips processing if event_id was already handled.
 *  4. Secret guard — 500 if webhook secret not configured.
 */
router.post('/webhook', async (req, res) => {
    try {
        // --- Guard: secret must be configured ---
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) {
            console.error('[Payment][Webhook] RAZORPAY_WEBHOOK_SECRET is not set!');
            return res.status(500).send('Webhook secret not configured');
        }

        const signature = req.headers['x-razorpay-signature'];
        if (!signature) {
            console.warn('[Payment][Webhook] Missing x-razorpay-signature header');
            return res.status(400).send('Missing signature');
        }

        // --- FIX: HMAC over raw body bytes, not JSON.stringify ---
        const rawBody = req.rawBody;
        if (!rawBody || rawBody.length === 0) {
            console.error('[Payment][Webhook] req.rawBody is empty — raw body middleware not applied');
            return res.status(400).send('Empty body');
        }

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(rawBody) // raw Buffer — exact bytes Razorpay signed
            .digest('hex');

        // Constant-time comparison to prevent timing attacks
        const sigBuffer = Buffer.from(signature, 'hex');
        const expBuffer = Buffer.from(expectedSignature, 'hex');
        const signatureValid = sigBuffer.length === expBuffer.length &&
            crypto.timingSafeEqual(sigBuffer, expBuffer);

        if (!signatureValid) {
            console.warn(`[Payment][Webhook][SECURITY] Invalid signature. Possible replay or forgery.`);
            return res.status(400).send('Invalid webhook signature');
        }

        const { event, payload } = req.body;

        // --- Timestamp validation: reject events older than 5 minutes ---
        const eventTime = req.body.created_at; // Unix timestamp from Razorpay
        if (eventTime) {
            const ageSeconds = Math.floor(Date.now() / 1000) - eventTime;
            if (ageSeconds > 300) { // 5 minutes
                console.warn(`[Payment][Webhook] Stale event rejected: age=${ageSeconds}s event=${event}`);
                return res.status(400).send('Stale webhook event');
            }
        }

        // --- Idempotency: skip if this payment_id was already processed ---
        if (event === 'payment.captured') {
            const payment = payload?.payment?.entity;
            if (!payment) {
                return res.status(400).send('Malformed payment payload');
            }

            const userId = payment.notes?.userId;
            const planId = payment.notes?.planId;

            if (!userId || !planId) {
                console.error('[Payment][Webhook] Missing userId or planId in payment notes');
                return res.status(400).send('Incomplete payment notes');
            }

            // Idempotency check
            const existingPayment = await Payment.findOne({
                razorpay_payment_id: payment.id,
                status: 'success'
            });

            if (existingPayment) {
                console.log(`[Payment][Webhook] Idempotency: payment ${payment.id} already fulfilled. Skipping.`);
                return res.status(200).send('OK');
            }

            await SubscriptionService.fulfillOrder(userId, {
                razorpay_order_id:  payment.order_id,
                razorpay_payment_id: payment.id,
                razorpay_signature:  'webhook_verified'
            }, planId);

            console.log(`[Payment][Webhook] Fulfilled: user=${userId} plan=${planId} payment=${payment.id}`);
        }

        await SubscriptionService.handleWebhook(event, payload);
        res.status(200).send('OK');

    } catch (error) {
        console.error('[Payment][Webhook] Error:', error.message, error.stack);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
