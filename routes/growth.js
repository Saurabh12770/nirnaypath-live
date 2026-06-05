'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const GrowthService = require('../services/growthService');
const Referral = require('../models/Referral');
const User = require('../models/user');

/**
 * GET /api/growth/wallet
 * Returns current user's wallet balance, reward credits, and transactions list.
 */
router.get('/wallet', auth, async (req, res) => {
    try {
        const wallet = await GrowthService.getOrCreateWallet(req.user._id);
        res.json(wallet);
    } catch (err) {
        console.error('[GROWTH] Get wallet error:', err.message);
        res.status(500).json({ error: 'Failed to retrieve wallet details.' });
    }
});

/**
 * POST /api/growth/wallet/convert
 * Converts a set amount of reward credits into cash wallet balance.
 * Body: { points }
 */
router.post('/wallet/convert', auth, async (req, res) => {
    try {
        const { points } = req.body;
        if (!points || typeof points !== 'number' || points <= 0) {
            return res.status(400).json({ error: 'Valid positive points value is required.' });
        }
        const wallet = await GrowthService.convertRewardsToWallet(req.user._id, points);
        res.json({ message: 'Points converted successfully', wallet });
    } catch (err) {
        console.error('[GROWTH] Convert points error:', err.message);
        res.status(400).json({ error: err.message });
    }
});

/**
 * GET /api/growth/referral
 * Returns user's generated referral code and status of invited users.
 */
router.get('/referral', auth, async (req, res) => {
    try {
        const refDetails = await GrowthService.getOrCreateReferralCode(req.user._id);
        res.json(refDetails);
    } catch (err) {
        console.error('[GROWTH] Get referral details error:', err.message);
        res.status(500).json({ error: 'Failed to retrieve referral details.' });
    }
});

/**
 * POST /api/growth/referral/claim
 * Associates an incoming referral sign-up with a referral code.
 * Body: { code }
 */
router.post('/referral/claim', auth, async (req, res) => {
    try {
        const { code } = req.body;
        if (!code || typeof code !== 'string') {
            return res.status(400).json({ error: 'Referral code is required.' });
        }
        // Phase 6: Sanitise — only accept alphanumeric codes 5-12 chars
        const sanitised = code.trim().toUpperCase();
        if (!/^[A-Z0-9]{5,12}$/.test(sanitised)) {
            return res.status(400).json({ error: 'Invalid referral code format.' });
        }
        const refRecord = await GrowthService.registerReferral(req.user._id, sanitised);
        if (!refRecord) {
            return res.status(400).json({ error: 'Invalid or expired referral code.' });
        }
        res.json({ message: 'Referral registered successfully and reward points distributed.' });
    } catch (err) {
        console.error('[GROWTH] Claim referral error:', err.message);
        res.status(400).json({ error: err.message });
    }
});

/**
 * POST /api/growth/coupon/validate
 * Validates a discount coupon code against a plan.
 * Body: { code, planId }
 */
router.post('/coupon/validate', auth, async (req, res) => {
    try {
        const { code, planId } = req.body;
        if (!code || !planId) {
            return res.status(400).json({ error: 'code and planId are required.' });
        }
        const details = await GrowthService.validateAndApplyCoupon(code, planId);
        res.json(details);
    } catch (err) {
        console.error('[GROWTH] Coupon validate error:', err.message);
        res.status(400).json({ error: err.message });
    }
});

/**
 * POST /api/growth/checkout/wallet
 * Upgrades subscription directly using wallet cash balance.
 * Body: { planId, couponCode }
 */
router.post('/checkout/wallet', auth, async (req, res) => {
    try {
        const { planId, couponCode } = req.body;
        if (!planId) {
            return res.status(400).json({ error: 'planId is required.' });
        }
        const result = await GrowthService.upgradePlanWithWallet(req.user._id, planId, couponCode);
        res.json(result);
    } catch (err) {
        console.error('[GROWTH] Wallet checkout error:', err.message);
        res.status(400).json({ error: err.message });
    }
});

/**
 * GET /api/growth/referrals/leaderboard
 * Ranks users based on successful completed referrals.
 */
router.get('/referrals/leaderboard', auth, async (req, res) => {
    try {
        const leaderboard = await Referral.aggregate([
            { $project: { userId: 1, referralCode: 1, completedCount: {
                $size: {
                    $filter: {
                        input: '$referredUsers',
                        as: 'u',
                        cond: { $eq: ['$$u.status', 'completed'] }
                    }
                }
            }}},
            { $sort: { completedCount: -1 } },
            { $limit: 10 }
        ]);

        // Populate user details
        const populated = await Promise.all(leaderboard.map(async (row) => {
            const user = await User.findById(row.userId).select('name email').lean();
            return {
                userId: row.userId,
                name: user ? user.name : 'Unknown Scholar',
                referralCode: row.referralCode,
                completedReferrals: row.completedCount
            };
        }));

        res.json(populated);
    } catch (err) {
        console.error('[GROWTH] Get referrals leaderboard error:', err.message);
        res.status(500).json({ error: 'Failed to retrieve referral leaderboard.' });
    }
});

/**
 * GET /api/growth/referral/stats
 * Returns the current user's referral statistics.
 */
router.get('/referral/stats', auth, async (req, res) => {
    try {
        const stats = await GrowthService.getReferralStats(req.user._id);
        res.json(stats);
    } catch (err) {
        console.error('[GROWTH] Get referral stats error:', err.message);
        res.status(500).json({ error: 'Failed to retrieve referral stats.' });
    }
});

module.exports = router;
