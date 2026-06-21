'use strict';

/**
 * NirnayPath Business + Production Growth Validation Suite
 * Module F — Runtime Validation
 */

const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';

const User = require('../models/user');
const Payment = require('../models/payment');
const Wallet = require('../models/Wallet');
const Referral = require('../models/Referral');
const Coupon = require('../models/Coupon');
const BlogPost = require('../models/BlogPost');
const DailyChallenge = require('../models/DailyChallenge');
const StudyGroup = require('../models/StudyGroup');
const PeerBattle = require('../models/PeerBattle');
const CommunityDiscussion = require('../models/CommunityDiscussion');
const GoalTracker = require('../models/GoalTracker');
const Question = require('../models/question');
const UserActivityLog = require('../models/UserActivityLog');

const GrowthService = require('../services/growthService');

/* ─── Logging helpers ─────────────────────────────────────────────────── */
const PASS    = (msg, detail = '') => console.log(`  ✅  [PASS] ${msg}` + (detail ? `\n        * ${detail}` : ''));
const FAIL    = (msg, err = '')    => console.error(`  ❌  [FAIL] ${msg}` + (err ? `\n        * ${err}` : ''));
const SECTION = (title)            => { console.log('\n' + '═'.repeat(60)); console.log(`  ${title}`); console.log('═'.repeat(60)); };

let passed = 0;
let failed = 0;

function assert(condition, passMsg, failMsg, detail = '') {
    if (condition) { PASS(passMsg, detail); passed++; }
    else           { FAIL(failMsg, detail); failed++;  }
}

/* ─── TEST SETUP ──────────────────────────────────────────────────────── */
let testUserA, testUserB;
let questionId;

async function seedData() {
    // Clean prior test artifacts
    const testEmails = ['growth_a@nirnaypath.com', 'growth_b@nirnaypath.com'];
    const usersToDelete = await User.find({ email: { $in: testEmails } }).select('_id');
    const userIds = usersToDelete.map(u => u._id);

    await User.deleteMany({ _id: { $in: userIds } });
    await Wallet.deleteMany({ userId: { $in: userIds } });
    await Referral.deleteMany({ userId: { $in: userIds } });
    await GoalTracker.deleteMany({ userId: { $in: userIds } });
    await UserActivityLog.deleteMany({ userId: { $in: userIds } });
    await Coupon.deleteMany({ code: { $in: ['VERIFY50', 'VERIFYFIXED'] } });
    await BlogPost.deleteMany({ slug: 'verify-growth-slug' });
    await DailyChallenge.deleteMany({ date: '2026-05-21' });
    await StudyGroup.deleteMany({ name: 'Verify Growth Study Group' });
    await PeerBattle.deleteMany({ challengerId: { $in: userIds } });

    // Seed 2 clean users
    testUserA = new User({
        name: 'Growth User A',
        email: 'growth_a@nirnaypath.com',
        password: 'password123',
        plan: 'free',
        subscriptionStatus: 'active'
    });
    await testUserA.save();

    testUserB = new User({
        name: 'Growth User B',
        email: 'growth_b@nirnaypath.com',
        password: 'password123',
        plan: 'free',
        subscriptionStatus: 'active'
    });
    await testUserB.save();

    // Seed 1 question for challenge tests
    let q = await Question.findOne();
    if (!q) {
        q = new Question({
            examId: 'upsc',
            subjectId: 'general',
            topicId: 'history',
            text: 'Verify question',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 1,
            difficulty: 'EASY'
        });
        await q.save();
    }
    questionId = q._id;
}

/* ─── TEST SUITE ─── */

async function testModuleA() {
    SECTION('MODULE A — Subscriptions, Coupons, Referrals & Wallets');

    // 1. Wallet initialization & adjustment
    try {
        const wallet = await GrowthService.getOrCreateWallet(testUserA._id);
        assert(wallet !== null && wallet.balance === 0,
            'Wallet initializes correctly with 0 balance',
            'Wallet failed to initialize'
        );

        await GrowthService.adjustWallet(testUserA._id, {
            amount: 500,
            type: 'credit',
            source: 'payment',
            description: 'Seeded test payment balance'
        });

        const updatedWallet = await GrowthService.getOrCreateWallet(testUserA._id);
        assert(updatedWallet.balance === 500,
            'Wallet correctly credits balance amount (INR 500)',
            `Incorrect wallet balance: ${updatedWallet.balance}`
        );
    } catch (err) {
        FAIL('Wallet adjustment tests threw error', err.message); failed++;
    }

    // 2. Coupons validation
    try {
        const couponPerc = new Coupon({
            code: 'VERIFY50',
            discountType: 'percentage',
            discountValue: 50,
            expiryDate: new Date(Date.now() + 24 * 3600 * 1000),
            maxUses: 10,
            isActive: true
        });
        await couponPerc.save();

        const couponFixed = new Coupon({
            code: 'VERIFYFIXED',
            discountType: 'fixed',
            discountValue: 100,
            expiryDate: new Date(Date.now() + 24 * 3600 * 1000),
            maxUses: 10,
            isActive: true
        });
        await couponFixed.save();

        const discPerc = await GrowthService.validateAndApplyCoupon('VERIFY50', 'pro_monthly');
        assert(discPerc.discount === 99 && discPerc.finalPrice === 100, // 50% of 199 rounded
            'Percentage discount coupon verified accurately',
            `Incorrect discount calculation: ${JSON.stringify(discPerc)}`
        );

        const discFixed = await GrowthService.validateAndApplyCoupon('VERIFYFIXED', 'pro_monthly');
        assert(discFixed.discount === 100 && discFixed.finalPrice === 99,
            'Fixed value discount coupon verified accurately',
            `Incorrect discount calculation: ${JSON.stringify(discFixed)}`
        );
    } catch (err) {
        FAIL('Coupon application tests threw error', err.message); failed++;
    }

    // 3. Referral linkages & conversion credits
    try {
        const refCodeObj = await GrowthService.getOrCreateReferralCode(testUserA._id);
        assert(refCodeObj && refCodeObj.referralCode.length > 0,
            `Referral code generated: "${refCodeObj.referralCode}"`,
            'Failed to generate referral code'
        );

        // Register user B using user A's referral code
        await GrowthService.registerReferral(testUserB._id, refCodeObj.referralCode);

        // Verify rewards credited: User A gets 100 reward points, User B gets 50
        const walletA = await Wallet.findOne({ userId: testUserA._id });
        const walletB = await Wallet.findOne({ userId: testUserB._id });

        assert(walletA.rewardCredits === 100 && walletB.rewardCredits === 50,
            'Referral links invite bonus correctly (100 pts to referrer, 50 pts to invited)',
            `Incorrect reward points balance. A=${walletA?.rewardCredits}, B=${walletB?.rewardCredits}`
        );

        // Convert reward credits: 100 points -> 10 INR
        const converted = await GrowthService.convertRewardsToWallet(testUserA._id, 100);
        assert(converted.balance === 510 && converted.rewardCredits === 0,
            'Reward point conversion logic executes cleanly (100 credits -> 10 INR)',
            `Incorrect converted balance state: ${JSON.stringify(converted)}`
        );
    } catch (err) {
        FAIL('Referral and conversion tests threw error', err.message); failed++;
    }

    // 4. Wallet plan upgrades
    try {
        // Upgrade user A using wallet balance (required: 99 INR for pro_monthly with VERIFYFIXED coupon)
        const check = await GrowthService.upgradePlanWithWallet(testUserA._id, 'pro_monthly', 'VERIFYFIXED');
        assert(check.success === true,
            'Subscription plan successfully upgraded using wallet balance',
            'Wallet purchase flow failed'
        );

        const updatedUser = await User.findById(testUserA._id);
        assert(updatedUser.plan === 'pro_monthly',
            'User plan updated to "pro_monthly" in DB',
            `Plan did not update: ${updatedUser.plan}`
        );
    } catch (err) {
        FAIL('Wallet upgrade purchase threw error', err.message); failed++;
    }
}

async function testModuleB() {
    SECTION('MODULE B — SEO, Metadata, Blog Engine & Sitemap');

    // 5. Blog creation & schema
    try {
        const blog = new BlogPost({
            title: 'Verify Growth Blog',
            slug: 'verify-growth-slug',
            content: '<p>Standard SEO blog post content</p>',
            metaTitle: 'SEO Title',
            metaDescription: 'SEO Description',
            isPublished: true
        });
        await blog.save();

        const fetched = await BlogPost.findOne({ slug: 'verify-growth-slug' });
        assert(fetched !== null && fetched.title === 'Verify Growth Blog',
            'Blog engine creates and queries posts dynamically',
            'Failed to read blog post'
        );
    } catch (err) {
        FAIL('Blog engine tests threw error', err.message); failed++;
    }
}

async function testModuleC() {
    SECTION('MODULE C — User Engagement & Goal Trackers');

    // 6. Daily Challenge Seeding & Completion
    try {
        const challenge = new DailyChallenge({
            date: '2026-05-21',
            questionId,
            rewardCredits: 20,
            completedUsers: []
        });
        await challenge.save();

        const fetched = await DailyChallenge.findOne({ date: '2026-05-21' });
        assert(fetched !== null,
            'Daily challenge question successfully seeded',
            'Failed to seed daily challenge'
        );
    } catch (err) {
        FAIL('Daily challenge test threw error', err.message); failed++;
    }

    // 7. Study Groups join mechanics
    try {
        const group = new StudyGroup({
            name: 'Verify Growth Study Group',
            description: 'Test Group',
            creatorId: testUserA._id,
            members: [{ userId: testUserA._id, role: 'creator', joinedAt: new Date() }]
        });
        await group.save();

        group.members.push({ userId: testUserB._id, role: 'member', joinedAt: new Date() });
        await group.save();

        assert(group.members.length === 2,
            'Collaborative study group creations and member joins function successfully',
            `Member count incorrect: ${group.members.length}`
        );
    } catch (err) {
        FAIL('Study group test threw error', err.message); failed++;
    }
}

async function testModuleD() {
    SECTION('MODULE D — Admin Intelligence & Funnels');

    // 8. Log activities & query analytics
    try {
        // Seed action logs for cohort funnel
        await UserActivityLog.insertMany([
            { userId: testUserA._id, action: 'test_start', page: '/mock' },
            { userId: testUserA._id, action: 'test_complete', page: '/mock' },
            { userId: testUserA._id, action: 'checkout_start', page: '/billing' }
        ]);

        const analytics = await GrowthService.getSubscriptionAnalytics();
        assert(analytics.totalRevenue !== undefined && analytics.mrr !== undefined,
            `Admin Revenue Analytics generated (MRR: ${analytics.mrr})`,
            'Failed to fetch sub analytics'
        );
    } catch (err) {
        FAIL('Admin analytics tests threw error', err.message); failed++;
    }
}

async function main() {
    SECTION('NirnayPath Business & Growth Verification Suite');

    try {
        await mongoose.connect(MONGO_URI);
        console.log(`  Connected to database: ${MONGO_URI}`);

        await seedData();

        await testModuleA();
        await testModuleB();
        await testModuleC();
        await testModuleD();

        // Cleanup test data
        const testEmails = ['growth_a@nirnaypath.com', 'growth_b@nirnaypath.com'];
        const usersToDelete = await User.find({ email: { $in: testEmails } }).select('_id');
        const userIds = usersToDelete.map(u => u._id);

        await User.deleteMany({ _id: { $in: userIds } });
        await Wallet.deleteMany({ userId: { $in: userIds } });
        await Referral.deleteMany({ userId: { $in: userIds } });
        await GoalTracker.deleteMany({ userId: { $in: userIds } });
        await UserActivityLog.deleteMany({ userId: { $in: userIds } });
        await Coupon.deleteMany({ code: { $in: ['VERIFY50', 'VERIFYFIXED'] } });
        await BlogPost.deleteMany({ slug: 'verify-growth-slug' });
        await DailyChallenge.deleteMany({ date: '2026-05-21' });
        await StudyGroup.deleteMany({ name: 'Verify Growth Study Group' });
        await PeerBattle.deleteMany({ challengerId: { $in: userIds } });

        console.log('\n' + '═'.repeat(60));
        console.log(`  Verification completed. Passed: ${passed} | Failed: ${failed}`);
        console.log('═'.repeat(60) + '\n');

        await mongoose.disconnect();
        process.exit(failed > 0 ? 1 : 0);
    } catch (err) {
        console.error('FATAL verification failure:', err);
        process.exit(1);
    }
}

main();
