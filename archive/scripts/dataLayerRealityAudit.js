const fs = require('fs');
const path = require('path');
const QuestionRepository = require('../services/questionRepository');
const CacheCoordinatorService = require('../services/cacheCoordinatorService');

async function runAudit() {
    console.log('====================================================');
    console.log('   DATA LAYER REALITY AUDIT');
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

    const Question = require('../models/question');
    Question.find = () => ({ lean: async () => [] });
    Question.updateOne = async () => ({ nModified: 1 });

    const mockSubject = 'test_layer';
    const dataDir = path.join(__dirname, '../data');
    const masterFile = path.join(dataDir, `${mockSubject}.json`);

    fs.writeFileSync(masterFile, JSON.stringify([
        { id: '1', subject: mockSubject, question_en: "Q1", topic: 'algebra' },
        { id: '2', subject: mockSubject, question_en: "Q2", topic: 'geometry' }
    ]));

    try {
        console.log('\n--- TEST 1 & 2: Repository Load & Fallback ---');
        // Will fallback to JSON because Mongo is empty in this mock context (or not connected)
        const questions = await QuestionRepository.getQuestions({ subject: mockSubject });
        assert(questions.length === 2, "Repository successfully loaded questions from fallback.");
    } catch(e) { assert(false, `Test 1 Failed: ${e.message}`); }

    try {
        console.log('\n--- TEST 3: Cache Immutability ---');
        const q1 = await QuestionRepository.getQuestions({ subject: mockSubject });
        q1[0].question_en = "MUTATED";
        
        const q2 = await QuestionRepository.getQuestions({ subject: mockSubject });
        assert(q2[0].question_en === "Q1", "Cache correctly returns immutable deep clones, preventing mutation leak.");
    } catch(e) { assert(false, `Test 3 Failed: ${e.message}`); }

    try {
        console.log('\n--- TEST 4: Runtime Filtering ---');
        const filtered = await QuestionRepository.getQuestions({ subject: mockSubject, topic: 'geometry' });
        assert(filtered.length === 1 && filtered[0].id === '2', "Repository correctly applies topic filters.");
    } catch(e) { assert(false, `Test 4 Failed: ${e.message}`); }

    try {
        console.log('\n--- TEST 5: Exclude IDs Filter ---');
        const filtered = await QuestionRepository.getQuestions({ subject: mockSubject, excludeIds: ['1'] });
        assert(filtered.length === 1 && filtered[0].id === '2', "Repository correctly excludes IDs.");
    } catch(e) { assert(false, `Test 5 Failed: ${e.message}`); }

    try {
        console.log('\n--- TEST 6: Drift Detection / Cache Invalidation ---');
        // If we append, it should invalidate the cache
        await QuestionRepository.appendQuestions(mockSubject, [{ id: '3', subject: mockSubject, question_en: "Q3" }]);
        
        const newQs = await QuestionRepository.getQuestions({ subject: mockSubject });
        assert(newQs.length === 3, "Append correctly invalidated cache and returned new data.");
    } catch(e) { assert(false, `Test 6 Failed: ${e.message}`); }

    // Cleanup
    if (fs.existsSync(masterFile)) fs.unlinkSync(masterFile);

    console.log('\n====================================================');
    console.log(`   RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('====================================================');
    
    // Explicitly exit to prevent mongoose hanging if it was used
    process.exit(0);
}

runAudit();
