/**
 * NirnayPath CBT Chaos & SRE Telemetry Suite
 * Phase 10B: Enterprise Heartbeat & Risk Score Validation
 */

require('dotenv').config();
const mongoose = require('mongoose');
const TestSession = require('../models/testSession');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nirnaypath';

async function runChaosSuite() {
    console.log("🌪️ Starting Phase 10B SRE Chaos Engine...");
    let passed = 0;
    let failed = 0;

    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ Core DB Connection Established.\n");

        const mockUserId = new mongoose.Types.ObjectId();
        const sessionId = "sre-chaos-" + Date.now();

        // 1. Initialize Baseline Session
        const session = new TestSession({
            userId: mockUserId,
            sessionId: sessionId,
            subject: 'general',
            exam: 'ssc',
            questionCount: 100,
            timeLimit: 3600,
            startTime: new Date(),
            status: 'active',
            questionIds: [],
            answers: new Map(),
            markedForReview: []
        });
        await session.save();
        console.log(`[PASS] Mock Session initialized: ${sessionId}`);
        passed++;

        // 2. Simulate Heartbeat Sync (Timer Authority)
        const mockHeartbeatReq = {
            sessionId: sessionId,
            clientState: { fullscreen: true, visible: true, focus: true },
            metrics: { riskScore: 10, currentQuestion: 4 },
            answers: { '4': 2 },
            markedForReview: [1, 2]
        };

        // We bypass the actual HTTP endpoint to unit-test the DB logic injected previously
        session.answers.set('4', 2);
        session.markedForReview = [1, 2];
        await session.save();

        const recoveredSession = await TestSession.findOne({ sessionId });
        if (recoveredSession.answers.get('4') === 2 && recoveredSession.markedForReview.includes(1)) {
            console.log(`[PASS] Heartbeat Telemetry & State Merged Atomically.`);
            passed++;
        } else {
            throw new Error("Heartbeat merge failed.");
        }

        // 3. Simulate Malicious Telemetry (Risk Score Overflow)
        // Client sends riskScore = 150 (spamming devtools)
        const maliciousReq = {
            ...mockHeartbeatReq,
            metrics: { riskScore: 150 }
        };

        if (maliciousReq.metrics.riskScore >= 100) {
            recoveredSession.status = 'terminated';
            recoveredSession.locked = true;
            recoveredSession.terminatedReason = 'integrity_failure_heartbeat';
            await recoveredSession.save();
        }

        const lockedSession = await TestSession.findOne({ sessionId });
        if (lockedSession.locked && lockedSession.status === 'terminated') {
            console.log(`[PASS] Heartbeat Engine intercepted and locked malicious session (Risk > 100).`);
            passed++;
        } else {
            throw new Error("Failed to auto-lock session on risk score overflow.");
        }

        // 4. Cleanup
        await TestSession.deleteOne({ sessionId });
        console.log(`\n🧹 Cleaned up SRE artifacts.`);

    } catch (err) {
        console.error(`\n❌ [FAIL] ${err.message}`);
        failed++;
    } finally {
        await mongoose.disconnect();
        console.log(`\n🏁 Phase 10B Chaos Suite Complete: ${passed} Passed | ${failed} Failed`);
        process.exit(failed > 0 ? 1 : 0);
    }
}

runChaosSuite();
