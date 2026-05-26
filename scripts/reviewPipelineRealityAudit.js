const fs = require('fs');
const path = require('path');
const ContentApprovalService = require('../services/contentApprovalService');
const ReviewQueueService = require('../services/reviewQueueService');

async function runAudit() {
    console.log('====================================================');
    console.log('   REVIEW PIPELINE REALITY AUDIT');
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
    const dataDir = path.join(__dirname, '../data');
    const backupDir = path.join(__dirname, '../backups/question_banks');

    if (fs.existsSync(queueDir)) fs.readdirSync(queueDir).forEach(f => fs.unlinkSync(path.join(queueDir, f)));
    if (fs.existsSync(quarantineDir)) fs.readdirSync(quarantineDir).forEach(f => fs.unlinkSync(path.join(quarantineDir, f)));
    
    // Create a mock master bank
    const mockSubject = 'test_audit';
    const masterFile = path.join(dataDir, `${mockSubject}.json`);
    fs.writeFileSync(masterFile, JSON.stringify([
        { id: '1', question_en: "Mock Question 1", options_en: ["A", "B", "C", "D"] }
    ]));

    // 1. Create a mock batch in the queue
    const batchId = 'batch_123';
    await ReviewQueueService.enqueueForReview({
        metadata: { generationId: batchId, subject: mockSubject, topic: 'Test' },
        questions: [
            {
                id: '2',
                subject: mockSubject,
                topic: 'Test',
                difficulty: 'EASY',
                question_en: "Valid Question?",
                question_hi: "मान्य प्रश्न?",
                options_en: ["A", "B", "C", "D"],
                options_hi: ["क", "ख", "ग", "घ"],
                correctAnswer: 1,
                explanation_en: "This is a completely valid explanation that is long enough.",
                explanation_hi: "यह एक पूरी तरह से मान्य स्पष्टीकरण है जो काफी लंबा है।"
            }
        ]
    });

    try {
        console.log('\n--- TEST 1: Pending queue loads correctly ---');
        const stats = await ReviewQueueService.auditReviewQueue();
        assert(stats.pendingBatches === 1, "Queue successfully loaded pending batch.");
    } catch(e) { assert(false, `Test 1 Failed: ${e.message}`); }

    let backupIdToRestore;

    try {
        console.log('\n--- TEST 2 & 8: Approve pipeline validates and appends atomically ---');
        const queueFile = path.join(queueDir, `${mockSubject}_${batchId}.json`);
        const batch = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
        
        // Mock the mongo sync to succeed for the test
        const originalMongoSync = ContentApprovalService.syncApprovedQuestionsToMongo;
        ContentApprovalService.syncApprovedQuestionsToMongo = async () => ({ success: true, insertedCount: 1 });
        
        const result = await ContentApprovalService.executeApprovalPipeline(batchId, batch, 'admin1');
        assert(result.success === true, "Pipeline approved valid batch.");
        
        // Restore mongo sync
        ContentApprovalService.syncApprovedQuestionsToMongo = originalMongoSync;

        // Verify JSON is appended
        const updatedBank = JSON.parse(fs.readFileSync(masterFile, 'utf8'));
        assert(updatedBank.length === 2, "Atomic append wrote to JSON master bank safely.");
        
        backupIdToRestore = result.backupId;
    } catch(e) { assert(false, `Test 2 Failed: ${e.message}`); }

    try {
        console.log('\n--- TEST 3: Corrupt batch rejected ---');
        const badBatchId = 'batch_456';
        await ReviewQueueService.enqueueForReview({
            metadata: { generationId: badBatchId, subject: mockSubject, topic: 'Test' },
            questions: [
                {
                    id: '3',
                    // Missing required fields
                    question_en: "Invalid Question?"
                }
            ]
        });
        
        const queueFile = path.join(queueDir, `${mockSubject}_${badBatchId}.json`);
        const batch = JSON.parse(fs.readFileSync(queueFile, 'utf8'));
        
        const result = await ContentApprovalService.executeApprovalPipeline(badBatchId, batch, 'admin1');
        assert(result.success === false, "Pipeline correctly rejected corrupt batch.");
    } catch(e) { assert(false, `Test 3 Failed: ${e.message}`); }

    try {
        console.log('\n--- TEST 4: Rollback restores banks ---');
        const rollbackResult = ContentApprovalService.rollbackApproval(backupIdToRestore);
        assert(rollbackResult.success === true, "Rollback successfully swapped atomic backup.");
        
        const rolledBackBank = JSON.parse(fs.readFileSync(masterFile, 'utf8'));
        assert(rolledBackBank.length === 1, `Bank length restored to original state. (Found: ${rolledBackBank.length}, expected 1)`);
    } catch(e) { assert(false, `Test 4 Failed: ${e.message}`); }

    // Cleanup
    if (fs.existsSync(masterFile)) fs.unlinkSync(masterFile);

    console.log('\n====================================================');
    console.log(`   RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
    console.log('====================================================');
}

runAudit();
