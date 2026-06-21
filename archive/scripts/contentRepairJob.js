const fs = require('fs');
const path = require('path');
const SemanticDedupService = require('../services/semanticDedupService');
const ContentRepairService = require('../services/contentRepairService');

const DATA_DIR = path.join(__dirname, '../data');

async function runRepair() {
    console.log('====================================================');
    console.log('   PHASE 3: CONTENT REPAIR & DEDUP JOB');
    console.log('====================================================\n');

    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    const globalFingerprints = new Map();
    let totalRemoved = 0;
    let totalRepaired = 0;

    for (const file of files) {
        const filePath = path.join(DATA_DIR, file);
        const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const isArray = Array.isArray(rawData);
        const questions = isArray ? rawData : rawData.questions || [];
        
        const finalQuestions = [];
        let fileRemoved = 0;
        let fileRepaired = 0;

        for (const q of questions) {
            // 1. Repair
            const { repaired, wasRepaired } = ContentRepairService.repair(q);
            if (wasRepaired) fileRepaired++;

            // 2. Dedup globally
            const fingerprint = SemanticDedupService.getSemanticFingerprint(repaired);
            if (!fingerprint) {
                // Malformed text, drop it
                fileRemoved++;
                continue;
            }

            if (globalFingerprints.has(fingerprint)) {
                fileRemoved++;
                continue; // Skip semantic duplicate
            }

            globalFingerprints.set(fingerprint, true);
            finalQuestions.push(repaired);
        }

        // Save back
        if (isArray) {
            fs.writeFileSync(filePath, JSON.stringify(finalQuestions, null, 2));
        } else {
            rawData.questions = finalQuestions;
            fs.writeFileSync(filePath, JSON.stringify(rawData, null, 2));
        }

        console.log(`[${file}] Repaired: ${fileRepaired}, Removed Duplicates: ${fileRemoved}, Final Pool: ${finalQuestions.length}`);
        totalRemoved += fileRemoved;
        totalRepaired += fileRepaired;
    }

    console.log('\n====================================================');
    console.log(`   JOB COMPLETE. Total Repaired: ${totalRepaired}, Total Removed: ${totalRemoved}`);
    console.log('====================================================');
}

runRepair();
