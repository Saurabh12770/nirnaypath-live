'use strict';

const assert = require('assert');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user');
const TestSession = require('../models/testSession');
const TestResult = require('../models/testResult');
const Question = require('../models/question');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;
const JWT_SECRET = process.env.JWT_SECRET || "10c16af3ac3ec10f7bac51fb6d3d4aae4185648615bb70c2237abbf7aefe678987c0abf84910907efa9693a948509c62";

async function runVerification() {
    console.log('🏁 STARTING TEST RELIABILITY & STABILITY VERIFICATION...');

    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // 1. Setup Test User and Questions
    const testEmail = `sre_reliability_${crypto.randomBytes(3).toString('hex')}@example.com`;
    const user = await User.create({
        name: 'SRE Tester',
        email: testEmail,
        password: 'Password123!',
        plan: 'free',
        refreshTokens: []
    });

    // Ensure at least some science questions exist in the DB for /api/test/start
    const hasQuestions = await Question.findOne({ subject: 'science' });
    if (!hasQuestions) {
        await Question.create({
            id: 'sci-q1',
            subject: 'science',
            question_en: 'What is water?',
            options_en: ['H2O', 'CO2', 'O2', 'N2'],
            correctAnswer: 0
        });
    }

    const token = jwt.sign({ id: user._id.toString(), role: 'student' }, JWT_SECRET, { expiresIn: '1h' });
    console.log('✓ Test user registered & signed in');

    // ── TEST 1: Parallel Starts & Single Active Session Enforcement ──
    console.log('\n--- [TEST 1] Starting Parallel /start Requests ---');
    
    // Fire two start requests concurrently
    const startReqs = Array.from({ length: 2 }).map(() =>
        fetch(`${BASE_URL}/api/test/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                subject: 'science',
                count: 5,
                timeLimit: 300,
                exam: 'General'
            })
        })
    );

    const startResponses = await Promise.all(startReqs);
    assert.ok(startResponses.some(res => res.status === 201), 'At least one session must be successfully created');
    
    const startData = await Promise.all(startResponses.map(res => res.json()));
    const sessionIds = startData.map(d => d.sessionId).filter(Boolean);
    console.log(`✓ Concurrent session IDs created: ${sessionIds.join(', ')}`);

    // Verify in database that only ONE session is active
    const activeSessions = await TestSession.find({ userId: user._id, status: 'active' });
    console.log(`✓ Active sessions count in database: ${activeSessions.length}`);
    assert.strictEqual(activeSessions.length, 1, 'Only one session must remain active at any time');

    const activeSessionId = activeSessions[0].sessionId;
    const expiredSessionId = sessionIds.find(id => id !== activeSessionId);
    console.log(`✓ Authority active session: ${activeSessionId}`);
    if (expiredSessionId) {
        const expiredSession = await TestSession.findOne({ sessionId: expiredSessionId });
        console.log(`✓ Previous session ${expiredSessionId} correctly deactivated status: ${expiredSession.status}`);
        assert.strictEqual(expiredSession.status, 'expired', 'Previous session should be automatically expired');
    }

    // ── TEST 2: Concurrent Submissions Idempotency ──
    console.log('\n--- [TEST 2] Starting Concurrent Submissions ---');
    const answersPayload = {
        sessionId: activeSessionId,
        exam: 'General',
        subject: 'science',
        testName: 'General Science Test',
        score: 1,
        totalQuestions: 1,
        correct: 1,
        incorrect: 0,
        unattempted: 0,
        accuracy: 100,
        answers: [{ questionId: 'sci-q1', userAnswer: '0' }],
        mode: 'full'
    };

    // Fire 2 concurrent submit requests
    const submitReqs = Array.from({ length: 2 }).map(() =>
        fetch(`${BASE_URL}/api/test/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(answersPayload)
        })
    );

    const submitResponses = await Promise.all(submitReqs);
    console.log(`✓ Submit Response 1: status=${submitResponses[0].status}`);
    console.log(`✓ Submit Response 2: status=${submitResponses[1].status}`);

    const submitData = await Promise.all(submitResponses.map(res => res.json()));
    assert.strictEqual(submitResponses[0].status, 201, 'First submit request must succeed with 201 Created');
    assert.strictEqual(submitResponses[1].status, 200, 'Duplicate concurrent submit request must poll & succeed with 200 OK');
    assert.ok(submitData[1].resultId, 'Duplicate submit response must return the result ID');

    // ── TEST 3: Heartbeat on Inactive Session Rejected ──
    console.log('\n--- [TEST 3] Heartbeat on Submitted Session ---');
    const heartbeatRes = await fetch(`${BASE_URL}/api/test/heartbeat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            sessionId: activeSessionId,
            metrics: { riskScore: 0 }
        })
    });
    console.log(`✓ Heartbeat response: status=${heartbeatRes.status}`);
    assert.strictEqual(heartbeatRes.status, 403, 'Heartbeat to submitted session must return 403 Forbidden');

    // Cleanup
    await User.deleteMany({ email: testEmail });
    await TestSession.deleteMany({ userId: user._id });
    await TestResult.deleteMany({ userId: user._id });
    await mongoose.disconnect();
    
    console.log('\n🎉 ALL SRE RELIABILITY VERIFICATION CHECKS PASSED SUCCESSFULLY!');
    process.exit(0);
}

runVerification().catch(err => {
    console.error('❌ Verification failed:', err);
    process.exit(1);
});
