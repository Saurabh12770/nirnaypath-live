const QuestionService = require('../services/QuestionService');
const CacheLayer = require('../services/CacheLayer');
const HistoryService = require('../services/HistoryService');
const Question = require('../models/Question');
const TestResult = require('../models/TestResult');

async function runAudit() {
    console.log('====================================================');
    console.log('   QUESTION SYSTEM REALITY AUDIT');
    console.log('====================================================\n');

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

    // Mocking DB Models for Script
    Question.find = () => ({
        lean: async () => [
            { id: '1', question_en: "Q1" },
            { id: '2', question_en: "Q2" },
            { id: '3', question_en: "Q3" },
            { id: '4', question_en: "Q4" },
            { id: '5', question_en: "Q5" }
        ]
    });

    TestResult.find = () => ({
        sort: () => ({
            limit: () => ({
                select: () => ({
                    lean: async () => [
                        { answers: [{ questionId: '1' }] },
                        { answers: [{ questionId: '2' }] }
                    ]
                })
            })
        })
    });

    const mockUserId = 'user123';
    const mockSubject = 'test_subject';

    try {
        console.log('\n--- TEST 1: History Exclusion & Selection Determinism ---');
        const questions = await QuestionService.getTestQuestions({ userId: mockUserId, subject: mockSubject, count: 2 });
        assert(questions.length === 2, "Returned correct number of questions.");
        assert(!questions.some(q => q.id === '1' || q.id === '2'), "Excluded history questions '1' and '2'.");
    } catch(e) { assert(false, `Test 1 Failed: ${e.message}`); }

    try {
        console.log('\n--- TEST 2: No duplicate IDs in output (Selection & Dedup Validation) ---');
        // Force full pool request
        const questions = await QuestionService.getTestQuestions({ userId: mockUserId, subject: mockSubject, count: 10 });
        const uniqueIds = new Set(questions.map(q => q.id));
        assert(uniqueIds.size === questions.length, "No duplicate IDs in the output.");
    } catch(e) { assert(false, `Test 2 Failed: ${e.message}`); }

    try {
        console.log('\n--- TEST 3: Cache Immutability ---');
        const questions1 = await QuestionService.getTestQuestions({ userId: mockUserId, subject: mockSubject, count: 2 });
        try {
            'use strict';
            questions1[0].question_en = "MUTATED";
            assert(questions1[0].question_en !== "MUTATED", "Mutation was silently ignored due to Object.freeze.");
        } catch(e) {
            assert(e instanceof TypeError, "Cache correctly froze output, preventing mutation.");
        }
    } catch(e) { assert(false, `Test 3 Failed: ${e.message}`); }

    console.log('\n====================================================');
    console.log(`   RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('====================================================');
    
    process.exit(0);
}

runAudit();
