const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Payment = require('../models/Payment');
const plans = require('../config/plans');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

// Create Order for a plan
router.post('/create-order', auth, async (req, res) => {
    try {
        const { planId } = req.body;
        const plan = plans[planId];
        
        if (!plan || plan.price === 0) {
            return res.status(400).json({ error: 'Invalid plan selected' });
        }

        const options = {
            amount: plan.price * 100, // in paise
            currency: plan.currency || 'INR',
            receipt: `receipt_${req.user._id}_${Date.now()}`,
            notes: {
                planId: planId,
                userId: req.user._id.toString()
            }
        };

        const order = await razorpay.orders.create(options);
        res.json({
            order_id: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (error) {
        console.error('Payment order error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Verify Payment and Update Plan
router.post('/verify', auth, async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature === razorpay_signature) {
            // Payment verified
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30); // 30 days validity

            const plan = plans[planId];
            const mongoose = require('mongoose');
            const session = await mongoose.startSession();
            
            try {
                await session.withTransaction(async () => {
                    // Save Payment Record
                    const payment = new Payment({
                        userId: req.user._id,
                        planId: planId,
                        amount: plan.price,
                        currency: plan.currency || 'INR',
                        razorpay_payment_id: razorpay_payment_id,
                        razorpay_order_id: razorpay_order_id,
                        status: 'success'
                    });
                    await payment.save({ session });

                    await User.findByIdAndUpdate(req.user._id, {
                        plan: planId,
                        subscriptionEnd: expiry,
                        razorpaySubscriptionId: razorpay_payment_id
                    }, { session });
                });
                
                await session.endSession();
                console.log('[Payment] Transaction successful');
                res.json({ success: true, message: 'Plan upgraded successfully!' });
            } catch (err) {
                await session.endSession();
                console.warn('[Payment] Transaction failed or not supported, falling back to sequential updates:', err.message);
                
                // Fallback to sequential operations
                const payment = new Payment({
                    userId: req.user._id,
                    planId: planId,
                    amount: plan.price,
                    currency: plan.currency || 'INR',
                    razorpay_payment_id: razorpay_payment_id,
                    razorpay_order_id: razorpay_order_id,
                    status: 'success'
                });
                await payment.save();

                await User.findByIdAndUpdate(req.user._id, {
                    plan: planId,
                    subscriptionEnd: expiry,
                    razorpaySubscriptionId: razorpay_payment_id
                });

                res.json({ success: true, message: 'Plan upgraded successfully (Sequential Fallback)!' });
            }
        } else {
            res.status(400).json({ error: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
