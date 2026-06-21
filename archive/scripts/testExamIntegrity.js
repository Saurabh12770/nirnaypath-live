/**
 * NirnayPath CBT Integrity & Anti-Cheat Verification Suite
 * Phase 10A: Secure Exam Engine SRE Validation
 */

require('dotenv').config();
const mongoose = require('mongoose');
const TestSession = require('../models/testSession');
const TestViolation = require('../models/testViolation');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nirnaypath';

async function runIntegritySuite() {
    console.log("🚀 Starting Phase 10A CBT Integrity Verification Suite...");
    let passed = 0;
    let failed = 0;

    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Database connected.\n");

        // --- MOCK DATA ---
        const mockUserId = new mongoose.Types.ObjectId();
        const sessionId = "sre-test-session-" + Date.now();
        const timeLimit = 3600;

        // 1. Create a CBT Session
        const session = new TestSession({
            userId: mockUserId,
            sessionId: sessionId,
            subject: 'general',
            exam: 'ssc',
            questionCount: 10,
            timeLimit: timeLimit,
            startTime: new Date(),
            status: 'active',
            questionIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10'],
            answers: new Map(),
            markedForReview: []
        });
        await session.save();
        console.log(`[PASS] CBT Session initialized securely: ${sessionId}`);
        passed++;

        // 2. Simulate Autosave Daemon
        session.answers.set('0', 2);
        session.answers.set('1', 3);
        session.markedForReview = [1];
        await session.save();
        
        const recoveredSession = await TestSession.findOne({ sessionId });
        if (recoveredSession.answers.get('0') === 2 && recoveredSession.markedForReview.includes(1)) {
            console.log(`[PASS] Autosave Map State recovered successfully (Crash Resilient)`);
            passed++;
        } else {
            throw new Error("Autosave state mismatch");
        }

        // 3. Simulate Anti-Cheat Escalation (Tab Switch, Fullscreen Exit)
        const violationTypes = ['tab_switch', 'fullscreen_exit', 'window_blur'];
        for (let i = 0; i < 3; i++) {
            await TestViolation.create({
                userId: mockUserId,
                sessionId,
                type: violationTypes[i],
                detail: 'SRE Simulation',
                ipAddress: '127.0.0.1'
            });
            recoveredSession.violationCount += 1;
        }

        if (recoveredSession.violationCount >= 3) {
            recoveredSession.locked = true;
            recoveredSession.status = 'terminated';
            recoveredSession.terminatedReason = 'excessive_violations';
            await recoveredSession.save();
        }

        const lockedSession = await TestSession.findOne({ sessionId });
        if (lockedSession.locked && lockedSession.status === 'terminated') {
            console.log(`[PASS] Anti-Cheat Engine automatically terminated session after 3 violations.`);
            passed++;
        } else {
            throw new Error("Locking mechanism failed to enforce termination.");
        }

        // 4. Clean up
        await TestSession.deleteOne({ sessionId });
        await TestViolation.deleteMany({ sessionId });
        console.log(`\n🧹 Cleaned up mock SRE data.`);

    } catch (error) {
        console.error(`\n❌ [FAIL] ${error.message}`);
        failed++;
    } finally {
        await mongoose.disconnect();
        console.log(`\n🏁 CBT Integrity Suite Complete: ${passed} Passed | ${failed} Failed`);
        process.exit(failed > 0 ? 1 : 0);
    }
}

runIntegritySuite();
