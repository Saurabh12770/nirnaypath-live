'use strict';

/**
 * NirnayPath — Phase 10 Gamification, Leaderboard & AI Recommendation Test Suite
 * ============================================================================
 * Run: node tests/phase10_gamification_suite.js
 */

const assert = require('assert');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../models/user');
const UserXP = require('../models/UserXP');
const TestResult = require('../models/testResult');
const Notification = require('../models/Notification');
const XPService = require('../services/xpService');
const AchievementService = require('../services/achievementService');
const notificationService = require('../services/notificationService');
const RecommendationService = require('../services/recommendationService');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`  ✅  ${name}`);
        passed++;
    } catch (err) {
        console.error(`  ❌  ${name}`);
        console.error(`      ${err.message}`);
        failed++;
    }
}

async function testAsync(name, fn) {
    try {
        await fn();
        console.log(`  ✅  ${name}`);
        passed++;
    } catch (err) {
        console.error(`  ❌  ${name}`);
        console.error(`      ${err.message}`);
        failed++;
    }
}

async function main() {
    console.log('\n======================================================');
    console.log('  Running NirnayPath Phase 10 Integration Test Suite  ');
    console.log('======================================================');

    // Connect to database
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
    try {
        await mongoose.connect(mongoUri);
        console.log(`Connected to MongoDB for testing at: ${mongoUri}`);
    } catch (err) {
        console.error('Failed to connect to MongoDB. Skipping database integration tests.');
        process.exit(1);
    }

    // ── Cleanup Test Data first ───────────────────────────────────────
    const testEmail = 'phase10_test_user@nirnaypath.com';
    const testPeerEmail1 = 'phase10_peer1@nirnaypath.com';
    const testPeerEmail2 = 'phase10_peer2@nirnaypath.com';

    await User.deleteMany({ email: { $in: [testEmail, testPeerEmail1, testPeerEmail2] } });
    
    // Create test user
    const testUser = await User.create({
        name: 'Phase 10 Test Student',
        email: testEmail,
        password: 'Password123!',
        role: 'user',
        isActive: true,
        streakCount: 3,
        lastActiveDate: new Date()
    });

    const peerUser1 = await User.create({
        name: 'Peer Student One',
        email: testPeerEmail1,
        password: 'Password123!',
        role: 'user',
        isActive: true
    });

    const peerUser2 = await User.create({
        name: 'Peer Student Two',
        email: testPeerEmail2,
        password: 'Password123!',
        role: 'user',
        isActive: true
    });

    // Cleanup models for these userIds
    const userIds = [testUser._id, peerUser1._id, peerUser2._id];
    await UserXP.deleteMany({ userId: { $in: userIds } });
    await TestResult.deleteMany({ userId: { $in: userIds } });
    await Notification.deleteMany({ userId: { $in: userIds } });

    // ── 1. XP and Leveling Engine Tests ──────────────────────────────────
    console.log('\n[TEST GROUP 1] XP and Leveling Engine');

    test('XP static helpers calculate thresholds correctly', () => {
        // Level 1 threshold should be 500
        const th1 = UserXP.getLevelThreshold(1);
        assert.strictEqual(th1, 500);

        // Level 2 threshold is 500 * 1.2 = 600
        const th2 = UserXP.getLevelThreshold(2);
        assert.strictEqual(th2, 600);

        // Level calculation
        const lvl1 = UserXP.computeLevel(100);
        assert.strictEqual(lvl1, 1);

        const lvl2 = UserXP.computeLevel(550);
        assert.strictEqual(lvl2, 2);

        const lvl3 = UserXP.computeLevel(1150); // 500 + 600 = 1100 threshold for lvl 3
        assert.strictEqual(lvl3, 3);
    });

    await testAsync('XPService fetches/creates XP record with correct defaults', async () => {
        const xpRecord = await XPService.getOrCreate(testUser._id);
        assert.ok(xpRecord);
        assert.strictEqual(xpRecord.totalXP, 0);
        assert.strictEqual(xpRecord.level, 1);
        assert.strictEqual(xpRecord.currentStreak, 0);
    });

    await testAsync('XPService awards XP for test completion', async () => {
        const testResultMock = {
            _id: new mongoose.Types.ObjectId(),
            score: 80,
            totalQuestions: 10,
            correctAnswers: 8,
            accuracy: 80,
            timeTaken: 120,
            subject: 'math',
            mode: 'test',
            sessionId: 'test_session_456'
        };

        const awards = await XPService.awardForTestSubmit(testUser._id, testResultMock);
        
        // Base test completion = 50 XP
        // Accuracy 80% = 100 XP
        // Daily first-test = 30 XP
        // Total = 50 + 100 + 30 = 180 XP
        const xpRecord = await XPService.getOrCreate(testUser._id);
        assert.strictEqual(xpRecord.totalXP, 180);
        assert.strictEqual(xpRecord.level, 1); // 180 < 500, still level 1
        assert.strictEqual(awards.length, 3); // 3 separate awards: completion, accuracy, first-test
        assert.strictEqual(awards[0].xp, 50);
    });

    await testAsync('XPService prevents duplicate XP awards for the same action', async () => {
        // Attempting to award XP for the same testResult again should be blocked by deduplication
        const testResultMock = {
            _id: new mongoose.Types.ObjectId(),
            score: 80,
            totalQuestions: 10,
            correctAnswers: 8,
            accuracy: 80,
            timeTaken: 120,
            subject: 'math',
            mode: 'test',
            sessionId: 'test_session_789'
        };

        // First award
        await XPService.awardForTestSubmit(testUser._id, testResultMock);
        const xpRecordAfter1 = await UserXP.findOne({ userId: testUser._id }).lean();

        // Second award with identical mock
        const awards = await XPService.awardForTestSubmit(testUser._id, testResultMock);
        const xpRecordAfter2 = await UserXP.findOne({ userId: testUser._id }).lean();

        assert.strictEqual(awards.length, 0, 'Should not award duplicate XP');
        assert.strictEqual(xpRecordAfter1.totalXP, xpRecordAfter2.totalXP);
    });

    await testAsync('XPService triggers Level Up when thresholds are crossed', async () => {
        // Current XP is 360 (180 + 180). Awarding 300 XP (streak_14) should cross the 500 XP mark and trigger Level 2
        const awards = await XPService.award(testUser._id, 'streak_14', { streakCount: 14 });
        
        const updatedRecord = await XPService.getOrCreate(testUser._id);
        assert.strictEqual(updatedRecord.level, 2);
        assert.strictEqual(updatedRecord.totalXP, 630);
        assert.ok(awards.levelUp, 'Should trigger levelUp: true');
        assert.strictEqual(awards.level, 2);
    });

    // ── 2. Badge & Achievement Engine Tests ──────────────────────────────
    console.log('\n[TEST GROUP 2] Badge & Achievement Engine');

    await testAsync('AchievementService evaluates and awards achievements', async () => {
        const testResultMock = {
            score: 95,
            accuracy: 95,
            subject: 'history'
        };

        // Evaluate achievements for a score of 95 (should unlock First Step & Sharpshooter)
        const unlocked = await AchievementService.evaluateAfterTest(testUser._id, testResultMock, 1, 1);
        
        assert.ok(unlocked.length > 0);
        const hasFirstSteps = unlocked.some(a => a.id === 'test_1');
        const hasSharpshooter = unlocked.some(a => a.id === 'accuracy_90');
        assert.ok(hasFirstSteps, 'Should unlock First Step achievement');
        assert.ok(hasSharpshooter, 'Should unlock Sharpshooter achievement');

        // Check persistent UserXP record
        const xpRecord = await UserXP.findOne({ userId: testUser._id }).lean();
        assert.ok(xpRecord.achievements.length >= 2);
    });

    await testAsync('AchievementService prevents duplicate achievement awards', async () => {
        const testResultMock = {
            score: 95,
            accuracy: 95,
            subject: 'history'
        };

        // Re-evaluate (already unlocked in previous test)
        const unlocked = await AchievementService.evaluateAfterTest(testUser._id, testResultMock, 2, 2);
        assert.strictEqual(unlocked.length, 0, 'Should not unlock already rewarded achievements');
    });

    // ── 3. Notification Engine Tests ─────────────────────────────────────
    console.log('\n[TEST GROUP 3] Notification Engine');

    await testAsync('NotificationService sends, retrieves and marks notifications read', async () => {
        const title = 'Test Alert';
        const message = 'Your test alert works!';
        
        const notif = await notificationService.send(testUser._id, {
            title,
            message,
            type: 'system'
        });

        assert.ok(notif);
        assert.strictEqual(notif.title, title);
        assert.strictEqual(notif.isRead, false);

        // Fetch unread count
        const unreadCount = await notificationService.getUnreadCount(testUser._id);
        assert.ok(unreadCount >= 1);

        // Mark read
        await notificationService.markRead(testUser._id, notif._id);
        const updatedNotif = await Notification.findById(notif._id).lean();
        assert.strictEqual(updatedNotif.isRead, true);
    });

    // ── 4. AI Recommendation Engine Tests ─────────────────────────────────
    console.log('\n[TEST GROUP 4] AI Recommendation Engine');

    await testAsync('RecommendationService generates recommendations based on real data', async () => {
        // Insert 3 test results for 'history' with low accuracy to trigger weak topic recommendations
        const resultsMock = [
            {
                userId: testUser._id,
                subject: 'history',
                score: 30,
                accuracy: 30,
                correct: 1,
                incorrect: 2,
                unattempted: 0,
                totalQuestions: 3,
                testName: 'History Mock Test 1',
                exam: 'bpsc',
                sessionId: 'hist_sess_1',
                answers: [
                    { topicId: 'mughals', topic: 'Mughals', isCorrect: false },
                    { topicId: 'mughals', topic: 'Mughals', isCorrect: false },
                    { topicId: 'mughals', topic: 'Mughals', isCorrect: true }
                ],
                timeTaken: 60,
                createdAt: new Date()
            },
            {
                userId: testUser._id,
                subject: 'history',
                score: 40,
                accuracy: 40,
                correct: 1,
                incorrect: 2,
                unattempted: 0,
                totalQuestions: 3,
                testName: 'History Mock Test 2',
                exam: 'bpsc',
                sessionId: 'hist_sess_2',
                answers: [
                    { topicId: 'mughals', topic: 'Mughals', isCorrect: false },
                    { topicId: 'mughals', topic: 'Mughals', isCorrect: true },
                    { topicId: 'mughals', topic: 'Mughals', isCorrect: false }
                ],
                timeTaken: 70,
                createdAt: new Date(Date.now() - 86400000)
            },
            {
                userId: testUser._id,
                subject: 'history',
                score: 35,
                accuracy: 35,
                correct: 1,
                incorrect: 2,
                unattempted: 0,
                totalQuestions: 3,
                testName: 'History Mock Test 3',
                exam: 'bpsc',
                sessionId: 'hist_sess_3',
                answers: [
                    { topicId: 'mughals', topic: 'Mughals', isCorrect: false },
                    { topicId: 'mughals', topic: 'Mughals', isCorrect: false },
                    { topicId: 'mughals', topic: 'Mughals', isCorrect: false }
                ],
                timeTaken: 80,
                createdAt: new Date(Date.now() - 172800000)
            }
        ];

        await TestResult.create(resultsMock);

        const recs = await RecommendationService.generate(testUser._id);
        
        assert.ok(recs);
        assert.strictEqual(recs.profile.testsAnalysed, 3);
        
        // Should identify 'mughals' as a weak topic
        const weakMughals = recs.weakTopics.find(t => t.topicId === 'mughals');
        assert.ok(weakMughals, 'Should identify "mughals" as a weak topic');
        assert.ok(weakMughals.accuracy < 60);

        // Should suggest next test drill on mughals
        const suggestion = recs.nextTest.find(t => t.type === 'drill' && t.topic === 'mughals');
        assert.ok(suggestion, 'Should suggest drill on weak topic "mughals"');
    });

    // ── 5. Leaderboard Engine Tests ───────────────────────────────────────
    console.log('\n[TEST GROUP 5] Leaderboard Engine');

    await testAsync('Leaderboard retrieves and ranks with tie-handling', async () => {
        // Set up XP for peer users
        await UserXP.create({ userId: peerUser1._id, totalXP: 1000, level: 5 });
        await UserXP.create({ userId: peerUser2._id, totalXP: 1000, level: 5 });
        
        // Query global leaderboard logic directly from routes helper or test logic
        // We'll mimic the rank computation logic here
        const activeUsersXP = await UserXP.find({ userId: { $in: userIds } })
            .populate('userId', 'name')
            .sort({ totalXP: -1 })
            .lean();

        const baseList = activeUsersXP.map(item => ({
            userId: item.userId._id,
            userName: item.userId.name,
            totalXP: item.totalXP
        }));

        // Compute rankings
        let currentRank = 1;
        let usersAtRank = 0;
        let prevScore = null;

        const rankedList = baseList.map((item, index) => {
            const score = item.totalXP || 0;
            if (prevScore !== null && score < prevScore) {
                currentRank += usersAtRank;
                usersAtRank = 1;
            } else {
                usersAtRank++;
            }
            prevScore = score;
            return {
                userId: item.userId,
                score: score,
                rank: currentRank
            };
        });

        // Peers have 1000 XP each, testUser has 660 XP
        // Peer 1 & Peer 2 should have Rank 1 (Tied)
        // testUser should have Rank 3 (Standard competition ranking: 1, 1, 3)
        const rankPeer1 = rankedList.find(r => String(r.userId) === String(peerUser1._id)).rank;
        const rankPeer2 = rankedList.find(r => String(r.userId) === String(peerUser2._id)).rank;
        const rankTestUser = rankedList.find(r => String(r.userId) === String(testUser._id)).rank;

        assert.strictEqual(rankPeer1, 1);
        assert.strictEqual(rankPeer2, 1);
        assert.strictEqual(rankTestUser, 3, 'Tie handling must use standard competition ranking');
    });

    // ── Cleanup Test Data ─────────────────────────────────────────────
    await User.deleteMany({ email: { $in: [testEmail, testPeerEmail1, testPeerEmail2] } });
    await UserXP.deleteMany({ userId: { $in: userIds } });
    await TestResult.deleteMany({ userId: { $in: userIds } });
    await Notification.deleteMany({ userId: { $in: userIds } });

    // Close Connection
    await mongoose.disconnect();

    console.log('\n========================================');
    console.log(`  Tests passed: ${passed}`);
    console.log(`  Tests failed: ${failed}`);
    console.log('========================================\n');

    if (failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

main().catch(err => {
    console.error('Test Suite crashed:', err);
    process.exit(1);
});
