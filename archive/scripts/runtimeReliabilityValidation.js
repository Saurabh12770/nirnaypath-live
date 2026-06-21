/**
 * NirnayPath Runtime Reliability Validation Suite
 * FAANG-Level Automated Integrity Testing
 */

const mongoose = require('mongoose');
const path = require('path');
const { QuestionSelectionService } = require('../utils/questionSelectionService');
const QuestionIntegrityService = require('../utils/questionIntegrityService');
const { normalizeQuestion } = require('../utils/questionNormalizer');
const { getCachedData, setCachedData } = require('../middleware/cache');
const TestResult = require('../models/testResult');

async function runTests() {
    console.log('🚀 Starting Reliability Validation Suite...\n');
    let passed = 0;
    let failed = 0;

    const assert = (condition, message) => {
        if (condition) {
            console.log(`✅ [PASS] ${message}`);
            passed++;
        } else {
            console.error(`❌ [FAIL] ${message}`);
            failed++;
        }
    };

    try {
        // Mock User & Subject
        const userId = new mongoose.Types.ObjectId();
        const subject = 'history';

        // 1. SESSION DEDUP TEST
        const pool = [
            { _id: '1', text: 'Q1', options: ['A','B','C','D'], answer: 0 },
            { id: '1', text: 'Q1 Duplicate', options: ['A','B','C','D'], answer: 0 },
            { questionId: '1', text: 'Q1 Triple', options: ['A','B','C','D'], answer: 0 },
            { _id: '2', text: 'Q2', options: ['A','B','C','D'], answer: 1 }
        ];
        
        const selected = await QuestionSelectionService.select(pool, 5, { userId, subject });
        assert(selected.length === 2, 'Session dedup should collapse 3 variations of ID:1 into one.');
        
        const ids = selected.map(q => QuestionIntegrityService.normalizeId(q));
        assert(new Set(ids).size === selected.length, 'All selected questions must have unique normalized IDs.');

        // 2. HISTORY EXCLUSION TEST (Simulated)
        // We'll mock TestResult.find to return some IDs
        const originalFind = TestResult.find;
        TestResult.find = () => ({
            sort: () => ({
                limit: () => ({
                    select: () => ({
                        lean: () => Promise.resolve([
                            { answers: [{ questionId: '1' }] }
                        ])
                    })
                })
            })
        });

        const freshPool = [
            { _id: '1', text: 'Seen Q1', options: ['A','B','C','D'], answer: 0 },
            { _id: '3', text: 'Fresh Q3', options: ['A','B','C','D'], answer: 0 }
        ];
        const selectedHistory = await QuestionSelectionService.select(freshPool, 1, { userId, subject });
        assert(selectedHistory.length > 0 && selectedHistory[0]._id === '3', 'Selection engine must prioritize fresh questions over seen ones.');
        
        TestResult.find = originalFind; // Restore

        // 3. NORMALIZATION HARDENING TEST
        const malformed = {
            question_en: 'Test Q',
            options: { '0': 'A', '1': 'B' }, // Missing 2 options
            answer: 'A'
        };
        const normalized = normalizeQuestion(malformed);
        assert(normalized.options_en.length === 4, 'Normalizer must ensure exactly 4 options.');
        assert(normalized.correctAnswer === 0, 'Normalizer must map string answer "A" to index 0.');
        assert(normalized.question_hi === 'Test Q', 'Normalizer must fallback question_hi to question_en.');

        // 4. CACHE IMMUTABILITY TEST
        const cacheKey = 'test_pool';
        const originalArray = [{ id: 1 }, { id: 2 }];
        await setCachedData(cacheKey, originalArray, 60);
        
        const retrieved = await getCachedData(cacheKey);
        retrieved.push({ id: 3 }); // Attempt mutation
        
        const secondRetrieve = await getCachedData(cacheKey);
        assert(secondRetrieve.length === 2, 'Cache must be immutable (returning clones).');

        // 5. SELECTION ENGINE CENTRALIZATION (Trace check)
        // Manual check of Math.random usages
        const fs = require('fs');
        const files = ['routes/test.js', 'routes/drills.js', 'routes/section.js'];
        let leakedRandom = false;
        files.forEach(f => {
            const content = fs.readFileSync(path.join(__dirname, '../', f), 'utf-8');
            if (content.includes('sort(() => Math.random()')) leakedRandom = true;
        });
        assert(!leakedRandom, 'No route-level manual randomization found.');

        console.log(`\n--- FINAL SCORE: ${passed} Passed, ${failed} Failed ---`);
        process.exit(failed > 0 ? 1 : 0);

    } catch (err) {
        console.error('Validation Suite Crashed:', err);
        process.exit(1);
    }
}

// Connect to DB for real history checks
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath')
    .then(runTests)
    .catch(err => {
        console.error('DB Connection Failed:', err);
        process.exit(1);
    });
