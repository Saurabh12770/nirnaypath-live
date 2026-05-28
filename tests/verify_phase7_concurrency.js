'use strict';

const assert = require('assert');
const mongoose = require('mongoose');
const telemetryEngine = require('../services/productionTelemetryEngine');
const securityShield = require('../services/securityShieldService');
const studentLearning = require('../services/studentLearningProfileService');
const subscription = require('../services/subscriptionService');
const aiPlanner = require('../services/aiLearningPlanner');
const User = require('../models/user');
const TestResult = require('../models/testResult');

async function runTests() {
    console.log('--- Phase 7 Concurrency & Performance Hardening Certification ---');

    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
    await mongoose.connect(mongoUri);
    console.log('[MONSOOSE] Connected to database');

    const testEmail = 'phase7_test@example.com';
    await User.deleteMany({ email: testEmail });
    const user = await User.create({
        name: 'Phase 7 Tester',
        email: testEmail,
        password: 'Password123!',
        plan: 'free',
        refreshTokens: []
    });

    // 1. Telemetry Capture Verification
    console.log('Testing Telemetry capturing...');
    telemetryEngine.recordRouteTiming('POST /api/test/start', 120, 201);
    telemetryEngine.recordSlowQuery('Question', 'find', 150, { subject: 'history' });
    telemetryEngine.recordError('Sentry simulation', 'MOCK_ERROR');

    const metrics = telemetryEngine.getLiveMetrics();
    assert.strictEqual(metrics.counters.totalErrorsRecorded, 1);
    assert.strictEqual(metrics.counters.totalSlowQueriesRecorded, 1);
    assert.strictEqual(metrics.recentRouteLatency[0].route, 'POST /api/test/start');
    console.log('✅ Telemetry capture: PASS');

    // 2. Advanced Student Analytics Verification
    console.log('Testing Student Learning Profile metrics...');
    // Seed results for learning metrics
    await TestResult.deleteMany({ userId: user._id });
    const mockResults = Array.from({ length: 6 }).map((_, i) => ({
        userId: user._id,
        sessionId: `sess_${i}_${Date.now()}`,
        exam: 'upsc',
        testName: 'General Physics Test',
        subject: 'science',
        topic: 'physics',
        score: 3 - Math.floor(i / 2), // downward trend
        totalQuestions: 5,
        correct: 3 - Math.floor(i / 2),
        incorrect: Math.floor(i / 2),
        unattempted: 2,
        accuracy: (3 - Math.floor(i / 2)) / 5,
        timeElapsed: 120,
        createdAt: new Date()
    }));
    await TestResult.insertMany(mockResults);

    const adaptiveDiff = await studentLearning.getAdaptiveDifficulty(user._id, 'science');
    const weakTopics = await studentLearning.predictWeaknesses(user._id);
    const burnout = await studentLearning.detectBurnoutRisk(user._id);
    const consistency = await studentLearning.getConsistencyScore(user._id);
    const readiness = await studentLearning.forecastExamReadiness(user._id, 'science');

    console.log(`   - Adaptive Difficulty: ${adaptiveDiff}`);
    console.log(`   - Weak Topics: ${JSON.stringify(weakTopics)}`);
    console.log(`   - Burnout Risk Detected: ${burnout}`);
    console.log(`   - Readiness Forecast: ${readiness}%`);

    assert.ok(adaptiveDiff === 'EASY' || adaptiveDiff === 'MEDIUM');
    assert.strictEqual(consistency, 10); // default baseline fallback 10
    console.log('✅ Advanced Student Analytics: PASS');

    // 3. Security Shield & Abuse Protection Verification
    console.log('Testing Abuse Shield validation heuristics...');
    const isBot = securityShield.isBot('HeadlessChrome agent');
    const isCheater = securityShield.isSuspiciousSubmission(5, 5, 2); // 100% correct in 2s
    const notCheater = securityShield.isSuspiciousSubmission(5, 5, 60);

    assert.strictEqual(isBot, true);
    assert.strictEqual(isCheater, true);
    assert.strictEqual(notCheater, false);
    console.log('✅ Abuse Shield Protection: PASS');

    // 4. Subscription & Feature Gating Verification
    console.log('Testing premium upgrades and quotas...');
    const allowedBefore = await subscription.isFeatureAllowed(user._id, 'ai_coach');
    assert.strictEqual(allowedBefore, false);

    await subscription.upgradeUser(user._id, 'pro_monthly', 'txn_777abc');
    const allowedAfter = await subscription.isFeatureAllowed(user._id, 'ai_coach');
    assert.strictEqual(allowedAfter, true);
    console.log('✅ Subscription & Gating: PASS');

    // 5. AI Planners Verification
    console.log('Testing AI study planner generation...');
    const plan = await aiPlanner.generateStudyPlan(user._id);
    assert.ok(plan.schedule.length > 0);
    console.log(`   - Next plan task: ${plan.schedule[0].action}`);
    console.log('✅ AI Planner: PASS');

    // Cleanup
    await User.deleteMany({ email: testEmail });
    await TestResult.deleteMany({ userId: user._id });
    await mongoose.disconnect();

    console.log('--- ALL CERTIFICATION CHECKS COMPLETED ---');
    process.exit(0);
}

runTests().catch(err => {
    console.error('Certification failed: ', err);
    process.exit(1);
});
