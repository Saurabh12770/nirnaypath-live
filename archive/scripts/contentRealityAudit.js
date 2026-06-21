const fs = require('fs');
const path = require('path');
const SemanticDedupService = require('../services/semanticDedupService');
const QuestionQualityService = require('../services/questionQualityService');
const ContentRepairService = require('../services/contentRepairService');

const DATA_DIR = path.join(__dirname, '../data');
const REPORT_FILE = path.join(__dirname, '../logs/content_reconstruction_report.json');

async function runAudit() {
    console.log('====================================================');
    console.log('   PHASE 3: CONTENT REALITY AUDIT');
    console.log('====================================================\n');

    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
    
    const report = {
        totalQuestions: 0,
        totalSubjects: files.length,
        exactDuplicates: 0,
        semanticDuplicates: 0,
        weakExplanations: 0,
        malformedQuestions: 0,
        missingHindi: 0,
        fakeHindi: 0,
        weakTopics: 0,
        weakSubjects: 0,
        subjectCoverage: {},
        difficultyDistribution: { EASY: 0, MEDIUM: 0, HARD: 0 },
        qualityDistribution: { HIGH: 0, MEDIUM: 0, LOW: 0 },
        semanticClusters: 0,
        reconstructionRecommendations: []
    };

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

    const globalFingerprints = new Map();

    for (const file of files) {
        const subject = file.replace('.json', '');
        const rawData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
        const questions = Array.isArray(rawData) ? rawData : rawData.questions || [];
        
        report.subjectCoverage[subject] = questions.length;
        report.totalQuestions += questions.length;

        if (questions.length < 5000) {
            report.weakSubjects++;
            report.reconstructionRecommendations.push(`Subject '${subject}' has only ${questions.length} questions (requires >= 5000).`);
        }

        const dedupResult = SemanticDedupService.detectSemanticDuplicates(questions);
        report.semanticDuplicates += dedupResult.duplicates.length;
        report.semanticClusters += dedupResult.duplicates.length > 0 ? 1 : 0;

        for (const q of questions) {
            // Repair
            const { repaired } = ContentRepairService.repair(q);
            
            // Score
            const { qualityScore, qualityFlags } = QuestionQualityService.score(repaired);
            
            // Update Dist
            const diff = (repaired.difficulty || 'MEDIUM').toUpperCase();
            if (report.difficultyDistribution[diff] !== undefined) {
                report.difficultyDistribution[diff]++;
            }

            if (qualityScore >= 80) report.qualityDistribution.HIGH++;
            else if (qualityScore >= 50) report.qualityDistribution.MEDIUM++;
            else report.qualityDistribution.LOW++;

            // Flags
            if (qualityFlags.includes('MISSING_HI_TRANSLATION')) report.missingHindi++;
            if (qualityFlags.includes('EN_COPIED_TO_HI')) report.fakeHindi++;
            if (qualityFlags.includes('WEAK_EXPLANATION') || qualityFlags.includes('MISSING_EXPLANATION')) report.weakExplanations++;
            if (qualityFlags.includes('INVALID_OPTION_COUNT') || qualityFlags.includes('EMPTY_OPTION')) report.malformedQuestions++;

            // Global Semantic Deduplication Check
            const fingerprint = SemanticDedupService.getSemanticFingerprint(repaired);
            if (fingerprint) {
                if (globalFingerprints.has(fingerprint)) {
                    report.exactDuplicates++; // Across entire platform
                } else {
                    globalFingerprints.set(fingerprint, true);
                }
            }
        }
    }

    fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));

    // Assertions
    console.log('\n--- EXECUTING VALIDATIONS ---');
    assert(report.exactDuplicates === 0, `No exact global duplicates (Found: ${report.exactDuplicates})`);
    assert(report.semanticDuplicates < report.totalQuestions * 0.01, `Semantic duplicates below 1% threshold (Found: ${report.semanticDuplicates})`);
    assert(report.missingHindi === 0, `All questions have bilingual text (Missing: ${report.missingHindi})`);
    assert(report.weakSubjects === 0, `All subjects have >= 5000 questions (Weak: ${report.weakSubjects})`);
    assert(report.malformedQuestions === 0, `No malformed metadata/options (Malformed: ${report.malformedQuestions})`);

    console.log('\n====================================================');
    console.log(`   RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
    console.log(`   Report saved to: server/logs/content_reconstruction_report.json`);
    console.log('====================================================');

    process.exit(failCount > 0 ? 1 : 0);
}

runAudit();
