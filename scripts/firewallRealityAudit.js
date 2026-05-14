const QuestionGenerationService = require('../services/questionGenerationService');
const SemanticFirewallService = require('../services/semanticFirewallService');
const ReviewQueueService = require('../services/reviewQueueService');
const fs = require('fs');
const path = require('path');

async function runAudit() {
    console.log('====================================================');
    console.log('   FIREWALL REALITY AUDIT');
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

    // Clean generated folders for testing
    const queueDir = path.join(__dirname, '../generated/review_queue');
    const quarantineDir = path.join(__dirname, '../generated/quarantine');
    if (fs.existsSync(queueDir)) fs.readdirSync(queueDir).forEach(f => fs.unlinkSync(path.join(queueDir, f)));
    if (fs.existsSync(quarantineDir)) fs.readdirSync(quarantineDir).forEach(f => fs.unlinkSync(path.join(quarantineDir, f)));

    // Mock Pool
    const existingBank = [
        {
            id: 'mock-1',
            question_en: "What is the capital of India?",
            question_hi: "भारत की राजधानी क्या है?",
            options_en: ["Delhi", "Mumbai", "Kolkata", "Chennai"],
            options_hi: ["दिल्ली", "मुंबई", "कोलकाता", "चेन्नई"]
        }
    ];

    try {
        console.log('\n--- TEST 1: Exact Duplicate Detection ---');
        const qDuplicate = {
            id: 'new-1',
            question_en: "What is the capital of India?",
            question_hi: "भारत की राजधानी क्या है?",
            options_en: ["Delhi", "Mumbai", "Kolkata", "Chennai"],
            options_hi: ["दिल्ली", "मुंबई", "कोलकाता", "चेन्नई"]
        };
        const check = SemanticFirewallService.detectSemanticDuplicate(qDuplicate, existingBank);
        assert(check.duplicate === true && check.severity === 'HIGH', "Detected exact semantic duplicate correctly.");
    } catch(e) { assert(false, `Test 1 Failed: ${e.message}`); }

    try {
        console.log('\n--- TEST 2: Near Duplicate Detection ---');
        const qNearDup = {
            id: 'new-2',
            question_en: "Which city is the capital of India?", // Reworded
            question_hi: "भारत की राजधानी कौन सा शहर है?",
            options_en: ["Chennai", "Kolkata", "Mumbai", "Delhi"], // Reordered
            options_hi: ["चेन्नई", "कोलकाता", "मुंबई", "दिल्ली"]
        };
        const check = SemanticFirewallService.detectSemanticDuplicate(qNearDup, existingBank);
        assert(check.duplicate === true, `Detected near duplicate correctly (Similarity: ${check.similarity.toFixed(2)})`);
    } catch(e) { assert(false, `Test 2 Failed: ${e.message}`); }

    try {
        console.log('\n--- TEST 3: Diversity Firewall (Spam Detection) ---');
        const batch = Array(6).fill({
            correctAnswer: 0,
            topic: 'Geography',
            question_en: "What is the capital of India?",
            options_en: ["Delhi", "Mumbai", "Kolkata", "Chennai"]
        });
        const divCheck = SemanticFirewallService.enforceQuestionDiversity(batch);
        assert(divCheck.passed === false, "Successfully blocked repetitive batch spam (Answer Index & Topic & Stem)");
    } catch(e) { assert(false, `Test 3 Failed: ${e.message}`); }

    try {
        console.log('\n--- TEST 4: Generation Pipeline Quarantine ---');
        // Force generate batch (Max 4 concepts available in mock, so use 3 to avoid repeated stems)
        const result = QuestionGenerationService.generateQuestionBatch('physics', 'Mechanics', 3);
        assert(result.success === true, `Generation batch created. Error: ${result.error || result.warnings?.join(', ')}`);
        
        // Let's manually trigger a quarantine
        ReviewQueueService.moveToQuarantine({ id: 'bad-q' }, "Manual audit rejection");
        const quarantinedFiles = fs.readdirSync(quarantineDir);
        assert(quarantinedFiles.length >= 1, "Quarantine pipeline safely wrote file to disk.");
    } catch(e) { assert(false, `Test 4 Failed: ${e.message}`); }

    console.log('\n====================================================');
    console.log(`   RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('====================================================');
}

runAudit();
