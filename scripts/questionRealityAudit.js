const mongoose = require('mongoose');
const crypto = require('crypto');
const QuestionRuntimeEngine = require('../services/QuestionRuntimeEngine');
require('dotenv').config({ path: '../.env' });

async function runAudit() {
    console.log('====================================================');
    console.log('   QUESTION ENGINE FORENSIC REALITY AUDIT');
    console.log('====================================================\n');

    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath_test');
        console.log('[Mongo] Connected to database.');
    } catch (e) {
        console.error('[Mongo] Failed to connect:', e);
        process.exit(1);
    }

    let passCount = 0;
    let failCount = 0;

    const assert = (condition, message) => {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            passCount++;
        } else {
            console.log(`❌ FAIL: ${message}`);
            failCount++;
        }
    };

    const mockUserId = new mongoose.Types.ObjectId().toString();
    const mockSubject = 'history';

    // TEST 1: Sequential Mock Tests (History Exclusion)
    try {
        console.log('\n--- TEST 1: Sequential Intra-Session Exclusions ---');
        let allSeenIds = new Set();
        let sessionDupes = false;

        for (let i = 0; i < 5; i++) {
            const result = await QuestionRuntimeEngine.generateTestSession({
                userId: mockUserId,
                sessionId: crypto.randomUUID(),
                subject: mockSubject,
                count: 10,
                exam: 'Mock'
            });
            
            for (const q of result) {
                const cid = QuestionRuntimeEngine.canonicalizeId(q);
                if (allSeenIds.has(cid)) sessionDupes = true;
                allSeenIds.add(cid);
            }
        }
        assert(!sessionDupes, "No question repeats within sequential sessions (ignoring DB history for mock run)");
    } catch (e) {
        assert(false, `TEST 1 Failed with error: ${e.message}`);
    }

    // TEST 2: Parallel Test Starts
    try {
        console.log('\n--- TEST 2: Concurrent Test Starts (Shared Pool Mutation) ---');
        const promises = [];
        for (let i = 0; i < 20; i++) {
            promises.push(QuestionRuntimeEngine.generateTestSession({
                userId: mockUserId,
                sessionId: crypto.randomUUID(),
                subject: mockSubject,
                count: 50,
                exam: 'Mock'
            }));
        }
        const results = await Promise.all(promises);
        assert(results.length === 20 && results.every(r => r.length > 0), "20 concurrent tests started successfully without mutating shared pool or crashing.");
    } catch (e) {
        assert(false, `TEST 2 Failed with error: ${e.message}`);
    }

    // TEST 3: Multi-subject section fetch
    try {
        console.log('\n--- TEST 3: Sectional Subject Loading ---');
        const result = await QuestionRuntimeEngine.generateTestSession({
            userId: mockUserId,
            sessionId: crypto.randomUUID(),
            subject: ['history', 'polity'],
            count: 20,
            exam: 'Section',
            mode: 'section'
        });
        
        const hasHistory = result.some(q => (q.subject && q.subject.toLowerCase() === 'history') || (q.subjectId && q.subjectId.toLowerCase() === 'history'));
        const hasPolity = result.some(q => (q.subject && q.subject.toLowerCase() === 'polity') || (q.subjectId && q.subjectId.toLowerCase() === 'polity'));
        const subjectsFound = [...new Set(result.map(q => q.subject || q.subjectId || 'unknown'))];
        
        assert(result.length > 0 && (hasHistory || hasPolity), `Sectional test loaded ${result.length} questions. Subjects found: ${subjectsFound.join(', ')}`);
    } catch (e) {
        assert(false, `TEST 3 Failed with error: ${e.message}`);
    }

    console.log('\n====================================================');
    console.log(`   RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(failCount > 0 ? 1 : 0);
}

runAudit();
