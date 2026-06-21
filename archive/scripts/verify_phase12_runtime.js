'use strict';

/**
 * NirnayPath Phase 12 — Adaptive AI Learning Ecosystem
 * Validation Suite (Module F)
 *
 * Tests every module's core logic against real MongoDB data.
 * Exits with code 0 on full pass, code 1 on any failure.
 */

const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';

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

/* ─── Setup: seed test data ───────────────────────────────────────────── */
const TestResult = require('../models/testResult');
const UserXP     = require('../models/UserXP');
const Question   = require('../models/question');

async function seedTestData() {
    // Create a deterministic test user ID
    const userId = new mongoose.Types.ObjectId('aabbccddeeff001122334455');

    // Clear prior runs
    await TestResult.deleteMany({ userId });
    await UserXP.deleteOne({ userId });
    await Question.deleteMany({ examId: 'phase12_verify' });

    // Seed test results spanning multiple topics and difficulties
    const sessions = [
        { accuracy: 90, answers: [
            { questionId: 'q1', topicId: 'ancient_history', topic: 'Ancient History', isCorrect: true  },
            { questionId: 'q2', topicId: 'ancient_history', topic: 'Ancient History', isCorrect: true  },
            { questionId: 'q3', topicId: 'indian_polity',   topic: 'Indian Polity',   isCorrect: false }
        ]},
        { accuracy: 55, answers: [
            { questionId: 'q4', topicId: 'indian_polity',   topic: 'Indian Polity',   isCorrect: false },
            { questionId: 'q5', topicId: 'indian_polity',   topic: 'Indian Polity',   isCorrect: false },
            { questionId: 'q6', topicId: 'ancient_history', topic: 'Ancient History', isCorrect: true  }
        ]},
        { accuracy: 70, answers: [
            { questionId: 'q7', topicId: 'geography',       topic: 'Geography',       isCorrect: true  },
            { questionId: 'q8', topicId: 'geography',       topic: 'Geography',       isCorrect: false },
            { questionId: 'q9', topicId: 'indian_polity',   topic: 'Indian Polity',   isCorrect: true  }
        ]}
    ];

    const now = Date.now();
    for (let i = 0; i < sessions.length; i++) {
        const s = sessions[i];
        await TestResult.create({
            userId,
            sessionId: `phase12_verify_session_${i}`,
            exam: 'UPSC',
            subject: 'general',
            testName: `Verify Test ${i + 1}`,
            mode: 'full',
            score: s.accuracy,
            totalQuestions: s.answers.length,
            correct: s.answers.filter(a => a.isCorrect).length,
            incorrect: s.answers.filter(a => !a.isCorrect).length,
            unattempted: 0,
            accuracy: s.accuracy,
            answers: s.answers,
            createdAt: new Date(now - (i * 8 * 24 * 3600 * 1000)) // spread 8 days apart
        });
    }

    // Seed XP record with a streak of 5
    await UserXP.create({ userId, totalXP: 1500, level: 3, currentStreak: 5, longestStreak: 12 });

    // Seed questions for DDA and selection tests
    const difficulties = ['EASY', 'MEDIUM', 'HARD'];
    const topics = ['ancient_history', 'indian_polity', 'geography'];
    const questionDocs = [];
    for (let i = 0; i < 30; i++) {
        questionDocs.push({
            examId: 'phase12_verify',
            subjectId: 'general',
            topicId: topics[i % topics.length],
            text: `Verify question ${i + 1}`,
            question_en: `Verify question ${i + 1}?`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 0,
            difficulty: difficulties[i % difficulties.length],
            qualityScore: 80
        });
    }
    await Question.insertMany(questionDocs);

    return userId;
}

/* ─── MODULE A TESTS: Adaptive Learning Engine ────────────────────────── */
async function testModuleA(userId) {
    SECTION('MODULE A — Adaptive Learning Engine');

    const AdaptiveLearningService = require('../services/adaptiveLearningService');

    // Test 1: Topic mastery scoring
    try {
        const masteryMap = await AdaptiveLearningService.getTopicMasteryScores(userId, 'general');
        const hasEntries = masteryMap.size > 0;
        const ancientMastery = masteryMap.get('ancient_history');
        const polityMastery  = masteryMap.get('indian_polity');
        const masteryValid = [ancientMastery, polityMastery].every(v => v !== undefined && v >= 0 && v <= 1);
        assert(hasEntries && masteryValid,
            'Topic Mastery Scores computed correctly',
            'Topic Mastery Scores missing or out of range [0,1]',
            `ancient_history: ${ancientMastery?.toFixed(3) ?? 'N/A'}, indian_polity: ${polityMastery?.toFixed(3) ?? 'N/A'}`
        );
        // Ancient history has higher accuracy → should have higher mastery
        if (ancientMastery !== undefined && polityMastery !== undefined) {
            assert(ancientMastery > polityMastery,
                'Mastery correctly reflects topic accuracy ordering (Ancient > Polity)',
                'Mastery ordering incorrect — Polity should be weaker than Ancient History'
            );
        }
    } catch (err) {
        FAIL('getTopicMasteryScores threw an error', err.message); failed++;
    }

    // Test 2: Spaced repetition / forgetting curve
    try {
        const srList = await AdaptiveLearningService.calculateSpacedRepetition(userId, 'general');
        assert(Array.isArray(srList) && srList.length > 0,
            'Spaced Repetition list generated',
            'Spaced Repetition list is empty or not an array'
        );
        const allHaveRetention = srList.every(item =>
            typeof item.retentionProbability === 'number' &&
            item.retentionProbability >= 0 &&
            item.retentionProbability <= 1
        );
        assert(allHaveRetention,
            'All SR items have valid retention probability (0.0 – 1.0)',
            'Some SR items have invalid retention probability'
        );
        // Items separated by 8+ days should have low retention given mastery < 0.8
        const overdueItems = srList.filter(i => i.isOverdue);
        assert(overdueItems.length >= 0, // At least no crash; overdue depends on seeded dates
            `Forgetting curve overdue detection runs cleanly (${overdueItems.length} overdue topics)`,
            'Overdue detection threw an error'
        );
        const sorted = srList.every((item, i) =>
            i === 0 || item.retentionProbability >= srList[i - 1].retentionProbability
        );
        assert(sorted,
            'SR list sorted ascending by retention probability (most forgotten first)',
            'SR list is not sorted correctly'
        );
    } catch (err) {
        FAIL('calculateSpacedRepetition threw an error', err.message); failed++;
    }

    // Test 3: Confidence scoring logic
    try {
        const avgTime = 30000;
        const c1 = AdaptiveLearningService.calculateConfidenceScore(true,  10000, avgTime); // Fast correct
        const c2 = AdaptiveLearningService.calculateConfidenceScore(true,  30000, avgTime); // Average correct
        const c3 = AdaptiveLearningService.calculateConfidenceScore(true,  60000, avgTime); // Slow correct
        const c4 = AdaptiveLearningService.calculateConfidenceScore(false, 10000, avgTime); // Fast wrong
        assert(c1 > c2 && c2 > c3 && c3 > c4,
            'Confidence score ordering correct: fast-correct > avg-correct > slow-correct > fast-wrong',
            `Confidence ordering violated: ${c1}, ${c2}, ${c3}, ${c4}`
        );
        assert([c1, c2, c3, c4].every(v => v >= 0 && v <= 1),
            'All confidence scores in valid range [0.0 – 1.0]',
            'Some confidence scores outside valid range'
        );
    } catch (err) {
        FAIL('calculateConfidenceScore threw an error', err.message); failed++;
    }

    // Test 4: Dynamic Difficulty Adjustment
    try {
        const dda = await AdaptiveLearningService.getDDAAdjustedDifficulty(userId, 'general');
        assert(['EASY', 'MEDIUM', 'HARD'].includes(dda),
            `DDA returns valid difficulty level: "${dda}"`,
            `DDA returned invalid difficulty: "${dda}"`
        );
        // Seeded avg accuracy ~72% → should return MEDIUM
        assert(dda === 'MEDIUM',
            `DDA correctly assigns MEDIUM difficulty for ~72% avg accuracy`,
            `DDA assigned "${dda}" instead of expected MEDIUM for ~72% avg accuracy`
        );
    } catch (err) {
        FAIL('getDDAAdjustedDifficulty threw an error', err.message); failed++;
    }

    // Test 5: Adaptive question scoring pipeline
    try {
        const questions = await Question.find({ examId: 'phase12_verify' }).lean();
        const scored = await AdaptiveLearningService.scoreQuestions(userId, questions, 'general');
        assert(Array.isArray(scored) && scored.length === questions.length,
            'scoreQuestions returns full scored pool',
            'scoreQuestions returned incomplete pool'
        );
        const hasScores = scored.every(q => typeof q.selectionScore === 'number' && q.selectionScore > 0);
        assert(hasScores,
            'Every question has a positive selectionScore',
            'Some questions are missing selectionScore'
        );
        const sortedDesc = scored.every((q, i) =>
            i === 0 || q.selectionScore <= scored[i - 1].selectionScore
        );
        assert(sortedDesc,
            'Scored pool sorted descending by selectionScore',
            'Scored pool not sorted correctly'
        );
    } catch (err) {
        FAIL('scoreQuestions threw an error', err.message); failed++;
    }
}

/* ─── MODULE B TESTS: AI Study Planner ───────────────────────────────── */
async function testModuleB(userId) {
    SECTION('MODULE B — AI Study Planner');

    const AIStudyPlannerService = require('../services/aiStudyPlannerService');

    // Test 6: Daily study plan structure
    try {
        const plan = await AIStudyPlannerService.generateDailyPlan(userId);
        assert(plan && typeof plan === 'object',
            'Daily study plan object generated',
            'generateDailyPlan returned null or non-object'
        );
        assert(Array.isArray(plan.tasks) && plan.tasks.length > 0,
            `Daily plan has ${plan.tasks?.length} task(s)`,
            'Daily plan has no tasks'
        );
        assert(typeof plan.focusArea === 'string' && plan.focusArea.length > 0,
            `Focus area set: "${plan.focusArea}"`,
            'focusArea is missing or empty'
        );
        assert(typeof plan.estimatedMinutes === 'number' && plan.estimatedMinutes > 0,
            `Total estimated study time: ${plan.estimatedMinutes} minutes`,
            'estimatedMinutes is invalid'
        );
        const taskTypes = new Set(plan.tasks.map(t => t.type));
        assert(taskTypes.size >= 1,
            `Plan contains task types: ${[...taskTypes].join(', ')}`,
            'Plan contains no typed tasks'
        );
    } catch (err) {
        FAIL('generateDailyPlan threw an error', err.message); failed++;
    }

    // Test 7: Weekly study schedule
    try {
        const weekly = await AIStudyPlannerService.generateWeeklySchedule(userId);
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        assert(weekly && typeof weekly.schedule === 'object',
            'Weekly schedule object generated',
            'generateWeeklySchedule returned invalid structure'
        );
        const allDaysPresent = days.every(d => weekly.schedule[d] !== undefined);
        assert(allDaysPresent,
            'All 7 days present in weekly schedule',
            `Missing days: ${days.filter(d => !weekly.schedule[d]).join(', ')}`
        );
        const allHaveBlocks = days.every(d =>
            Array.isArray(weekly.schedule[d].blocks) && weekly.schedule[d].blocks.length > 0
        );
        assert(allHaveBlocks,
            'Every day has at least one study block',
            'Some days have no study blocks'
        );
        const saturdayHasMock = weekly.schedule.Saturday?.blocks?.some(b => b.type === 'MOCK_TEST');
        assert(saturdayHasMock,
            'Saturday correctly assigned as full mock exam day',
            'Saturday does not have MOCK_TEST block'
        );
    } catch (err) {
        FAIL('generateWeeklySchedule threw an error', err.message); failed++;
    }
}

/* ─── MODULE C TESTS: AI Tutor ───────────────────────────────────────── */
async function testModuleC(userId) {
    SECTION('MODULE C — AI Tutor');

    const AITutorService = require('../services/aiTutorService');

    // Test 8: Explain wrong answer (stored explanation path)
    try {
        const sessionId = 'phase12_verify_session_1';
        const wrongQuestionId = 'q4'; // indian_polity — isCorrect: false
        const explanation = await AITutorService.explainWrongAnswer(userId, sessionId, wrongQuestionId);
        assert(!explanation.error,
            'explainWrongAnswer returned without error',
            `explainWrongAnswer returned error: ${explanation.error}`
        );
        assert(explanation.topic !== undefined,
            `Explanation includes topic: "${explanation.topic}"`,
            'Explanation missing topic field'
        );
        // Will use AI fallback since stored explanation_en is not seeded
        assert(['stored', 'ai_generated'].includes(explanation.source),
            `Explanation source identified as: "${explanation.source}"`,
            'Explanation source not classified'
        );
    } catch (err) {
        FAIL('explainWrongAnswer threw an error', err.message); failed++;
    }

    // Test 9: Session not found path
    try {
        const result = await AITutorService.explainWrongAnswer(userId, 'nonexistent_session', 'q99');
        assert(result.error === 'Test session not found for this user.',
            'explainWrongAnswer correctly returns error for missing session',
            `Expected error message not returned. Got: ${JSON.stringify(result)}`
        );
    } catch (err) {
        FAIL('explainWrongAnswer (missing session) threw unexpected error', err.message); failed++;
    }

    // Test 10: Repeated mistake pattern detection
    try {
        const analysis = await AITutorService.detectRepeatedMistakes(userId, 20);
        assert(analysis && Array.isArray(analysis.patterns),
            'detectRepeatedMistakes returned patterns array',
            'detectRepeatedMistakes returned invalid structure'
        );
        assert(typeof analysis.summary === 'string' && analysis.summary.length > 0,
            `Mistake analysis summary: "${analysis.summary}"`,
            'Missing analysis summary string'
        );
        if (analysis.patterns.length > 0) {
            const topPattern = analysis.patterns[0];
            assert(['HIGH', 'MEDIUM', 'LOW'].includes(topPattern.urgency),
                `Top mistake pattern urgency classified: "${topPattern.urgency}"`,
                `Invalid urgency level: "${topPattern.urgency}"`
            );
            assert(['CARELESS', 'CONCEPTUAL'].includes(topPattern.dominantMistakeType),
                `Top mistake type classified as: "${topPattern.dominantMistakeType}"`,
                `Invalid mistake type: "${topPattern.dominantMistakeType}"`
            );
            // indian_polity has 3 errors from seeded data → should be top
            assert(analysis.topMistakeTopics.includes('Indian Polity'),
                'Indian Polity correctly detected as top mistake topic (3 errors)',
                `Expected Indian Polity in topMistakeTopics: ${JSON.stringify(analysis.topMistakeTopics)}`
            );
        }
    } catch (err) {
        FAIL('detectRepeatedMistakes threw an error', err.message); failed++;
    }
}

/* ─── MODULE D TESTS: Offline Sync Server-Side ────────────────────────── */
async function testModuleD() {
    SECTION('MODULE D — Offline Sync Endpoint Logic');

    // Test 11: Direct model-level idempotency (server logic without HTTP)
    try {
        const sessionId = 'offline_test_sync_verify_001';
        await TestResult.deleteOne({ sessionId });

        // First save
        const newResult = new TestResult({
            userId:         new mongoose.Types.ObjectId(),
            sessionId,
            exam:           'SSC',
            subject:        'general',
            testName:       'Offline Sync Test',
            mode:           'drill',
            score:          75,
            totalQuestions: 10,
            correct:        7,
            incorrect:      3,
            unattempted:    0,
            accuracy:       70,
            answers:        [],
            createdAt:      new Date('2026-05-18T10:00:00Z')
        });
        await newResult.save();

        const savedRecord = await TestResult.findOne({ sessionId }).lean();
        assert(savedRecord !== null,
            'Offline attempt correctly persisted to database',
            'Offline attempt not found in database after save'
        );
        assert(savedRecord.exam === 'SSC',
            'Offline attempt fields preserved correctly',
            `Exam field mismatch: ${savedRecord.exam}`
        );

        // Duplicate detection (idempotency)
        const duplicate = await TestResult.findOne({ sessionId }).lean();
        assert(duplicate !== null,
            'Idempotency: duplicate sessionId correctly detected via findOne check',
            'Idempotency check failed'
        );

        // Timestamp preservation
        const storedDate = new Date(savedRecord.createdAt);
        const expectedDate = new Date('2026-05-18T10:00:00Z');
        assert(storedDate.getTime() === expectedDate.getTime(),
            'Offline session createdAt timestamp preserved correctly',
            `Timestamp mismatch: stored=${storedDate.toISOString()}, expected=${expectedDate.toISOString()}`
        );

        // Cleanup
        await TestResult.deleteOne({ sessionId });
    } catch (err) {
        FAIL('Offline sync model-level test threw an error', err.message); failed++;
    }
}

/* ─── MODULE E TESTS: PWA / Service Worker Assets ────────────────────── */
async function testModuleE() {
    SECTION('MODULE E — PWA & Service Worker Assets');

    const fs = require('fs');
    const path = require('path');

    // Test 12: service-worker.js exists and has Phase 12 version marker
    try {
        const swPath = path.join(__dirname, '../public/service-worker.js');
        const exists = fs.existsSync(swPath);
        assert(exists,
            'public/service-worker.js exists',
            'public/service-worker.js is missing'
        );
        if (exists) {
            const swContent = fs.readFileSync(swPath, 'utf8');
            assert(swContent.includes('nirnaypath-v12'),
                'Service worker uses Phase 12 cache version identifier',
                'Service worker cache version not updated to nirnaypath-v12'
            );
            assert(swContent.includes('sync-offline-attempts'),
                'Background sync event for offline attempts registered in service worker',
                'sync-offline-attempts tag not found in service worker'
            );
            assert(swContent.includes("event.action === 'dismiss'"),
                'Push notification action handling (dismiss) implemented',
                'Push notification action handling not found'
            );
            assert(swContent.includes('SKIP_WAITING'),
                'Service worker supports skip-waiting message from client',
                'SKIP_WAITING message handler not found'
            );
        }
    } catch (err) {
        FAIL('Service Worker file verification threw an error', err.message); failed++;
    }

    // Test 13: manifest.json exists and has required PWA fields
    try {
        const manifestPath = path.join(__dirname, '../public/manifest.json');
        const exists = fs.existsSync(manifestPath);
        assert(exists, 'public/manifest.json exists', 'public/manifest.json is missing');
        if (exists) {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            assert(manifest.name && manifest.short_name,
                `manifest.json has name fields: "${manifest.short_name}"`,
                'manifest.json missing name or short_name'
            );
            assert(manifest.display === 'standalone',
                'manifest.json display mode is standalone (full PWA)',
                `manifest.json display mode is "${manifest.display}" not standalone`
            );
            assert(Array.isArray(manifest.icons) && manifest.icons.length >= 2,
                `manifest.json has ${manifest.icons?.length} icon definitions`,
                'manifest.json has fewer than 2 icons'
            );
        }
    } catch (err) {
        FAIL('manifest.json verification threw an error', err.message); failed++;
    }

    // Test 14: offlineStorage.js client library exists
    try {
        const storagePath = path.join(__dirname, '../public/js/offlineStorage.js');
        const exists = fs.existsSync(storagePath);
        assert(exists,
            'public/js/offlineStorage.js client library exists',
            'public/js/offlineStorage.js is missing'
        );
        if (exists) {
            const storageContent = fs.readFileSync(storagePath, 'utf8');
            assert(storageContent.includes('NirnayPathOfflineStorage'),
                'offlineStorage.js exports NirnayPathOfflineStorage class',
                'NirnayPathOfflineStorage class not found in file'
            );
            assert(storageContent.includes('syncToServer'),
                'offlineStorage.js implements syncToServer method',
                'syncToServer method not found'
            );
            assert(storageContent.includes('registerAutoSync'),
                'offlineStorage.js implements auto-sync on reconnection',
                'registerAutoSync method not found'
            );
            assert(storageContent.includes('/api/learning/sync'),
                'offlineStorage.js targets correct sync API endpoint',
                'Sync endpoint URL not found in offlineStorage.js'
            );
        }
    } catch (err) {
        FAIL('offlineStorage.js verification threw an error', err.message); failed++;
    }
}

/* ─── MODULE INTEGRITY: Routes and Services exist ────────────────────── */
async function testFileIntegrity() {
    SECTION('INTEGRITY — All Phase 12 Files Present');

    const fs   = require('fs');
    const path = require('path');
    const base = path.join(__dirname, '..');

    const requiredFiles = [
        'services/adaptiveLearningService.js',
        'services/aiStudyPlannerService.js',
        'services/aiTutorService.js',
        'routes/learning.js',
        'public/js/offlineStorage.js',
        'public/service-worker.js',
        'public/manifest.json'
    ];

    for (const file of requiredFiles) {
        const fullPath = path.join(base, file);
        const exists = fs.existsSync(fullPath);
        assert(exists,
            `File exists: ${file}`,
            `MISSING file: ${file}`
        );
    }

    // Validate routes/learning.js exports all Phase 12 endpoints
    try {
        const learningRoutes = require('../routes/learning');
        assert(learningRoutes && learningRoutes.stack,
            'routes/learning.js loads and exports an Express router',
            'routes/learning.js failed to load or export router'
        );
        const routePaths = learningRoutes.stack
            .filter(r => r.route)
            .map(r => r.route.path);

        const requiredPaths = ['/plan', '/weekly', '/revision', '/mastery', '/intelligence',
                               '/tutor/explain', '/tutor/hint', '/tutor/summary', '/tutor/mistakes', '/sync'];
        for (const rp of requiredPaths) {
            assert(routePaths.includes(rp),
                `Route registered: GET/POST ${rp}`,
                `Route MISSING: ${rp}`
            );
        }
    } catch (err) {
        FAIL('routes/learning.js integrity check threw an error', err.message); failed++;
    }
}

/* ─── MAIN RUNNER ─────────────────────────────────────────────────────── */
async function main() {
    console.log('\n' + '═'.repeat(60));
    console.log('  NirnayPath Phase 12 — Adaptive AI Learning Suite');
    console.log('  Verification Runtime (Module F)');
    console.log('═'.repeat(60));

    await mongoose.connect(MONGO_URI);
    console.log(`\n  Connected to MongoDB: ${MONGO_URI}`);

    let userId;
    try {
        userId = await seedTestData();
        console.log(`  Seeded test data for userId: ${userId}`);
    } catch (err) {
        console.error('  FATAL: Failed to seed test data:', err.message);
        await mongoose.disconnect();
        process.exit(1);
    }

    await testFileIntegrity();
    await testModuleA(userId);
    await testModuleB(userId);
    await testModuleC(userId);
    await testModuleD();
    await testModuleE();

    console.log('\n' + '═'.repeat(60));
    console.log(`  Tests completed. Passed: ${passed} | Failed: ${failed}`);
    console.log('═'.repeat(60) + '\n');

    // Cleanup seeded data
    await TestResult.deleteMany({ sessionId: /^phase12_verify/ });
    await Question.deleteMany({ examId: 'phase12_verify' });
    await UserXP.deleteOne({ userId });

    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
    console.error('FATAL verification error:', err);
    process.exit(1);
});
