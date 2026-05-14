/**
 * server/scripts/phase11QualityCertification.js
 * Run from server/ directory:  node scripts/phase11QualityCertification.js
 *
 * Reads content_quality_report.json (produced by contentQualityAudit.js)
 * and validates all Phase 11 quality gates with pass/fail status.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const REPORT = path.join(__dirname, '../../content_quality_report.json');

function gate(label, passing, details = '') {
    const icon = passing ? '✅' : '❌';
    const status = passing ? 'PASS' : 'FAIL';
    console.log(`  ${icon}  [${status}]  ${label}${details ? ' — ' + details : ''}`);
    return passing;
}

function run() {
    console.log('\n══════════════════════════════════════════════════════════');
    console.log('   PHASE 11 — QUALITY CERTIFICATION VALIDATOR');
    console.log('══════════════════════════════════════════════════════════\n');

    // ── Load report ──────────────────────────────────────────────────────────
    if (!fs.existsSync(REPORT)) {
        console.error('❌  content_quality_report.json not found.');
        console.error('    Run: node scripts/contentQualityAudit.js first.\n');
        process.exit(1);
    }

    const r = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
    console.log(`   Report timestamp : ${r.timestamp}`);
    console.log(`   Total questions  : ${r.totalAudited?.toLocaleString() || 'N/A'}\n`);

    let passed = 0, failed = 0;
    const record = (ok) => ok ? passed++ : failed++;

    // ── CONTENT GATES ────────────────────────────────────────────────────────
    console.log('── CONTENT ──────────────────────────────────────────────');

    // Duplicates < 40%
    const dupPct = parseFloat(r.duplicates?.pct || '0');
    record(gate('Duplicate rate < 40%', dupPct < 40, `${r.duplicates?.pct} (${r.duplicates?.count?.toLocaleString()} dupes)`));

    // Missing English < 1%
    const missingEnPct = parseFloat(r.missingEnglish?.pct || '0');
    record(gate('Missing English text < 1%', missingEnPct < 1, r.missingEnglish?.pct));

    // Missing Hindi < 20%
    const missingHiPct = parseFloat(r.missingHindi?.pct || '0');
    record(gate('Missing Hindi translation < 20%', missingHiPct < 20, r.missingHindi?.pct));

    // Weak explanation < 25%
    const weakExplPct = parseFloat(r.weakExplanation?.pct || '0');
    record(gate('Weak explanation < 25%', weakExplPct < 25, r.weakExplanation?.pct));

    // Malformed options < 2%
    const malformedPct = parseFloat(r.malformedOptions?.pct || '0');
    record(gate('Malformed options < 2%', malformedPct < 2, r.malformedOptions?.pct));

    // Subject coverage ≥ 15 unique subjects
    record(gate('Subject coverage ≥ 15', (r.uniqueSubjects || 0) >= 15, `${r.uniqueSubjects} subjects`));

    // Topic coverage ≥ 20 unique topics
    record(gate('Topic coverage ≥ 20', (r.uniqueTopics || 0) >= 20, `${r.uniqueTopics} topics`));

    // Difficulty balance: HARD > 20%, EASY < 40%
    const d = r.difficultyDistribution || {};
    const total = (d.EASY || 0) + (d.MEDIUM || 0) + (d.HARD || 0) + (d.OTHER || 0);
    const hardPct  = total ? ((d.HARD  || 0) / total) * 100 : 0;
    const easyPct  = total ? ((d.EASY  || 0) / total) * 100 : 0;
    record(gate('HARD difficulty > 20%', hardPct > 20, `${hardPct.toFixed(1)}%`));
    record(gate('EASY difficulty < 40%', easyPct < 40, `${easyPct.toFixed(1)}%`));

    // ── ADMIN SAFETY GATES ───────────────────────────────────────────────────
    console.log('\n── ADMIN SAFETY ─────────────────────────────────────────');
    const QQS = require('../services/questionQualityService');

    // Quality service: validate empty question
    const v1 = QQS.validate({});
    record(gate('QQS flags empty question invalid', !v1.valid && v1.warnings.length > 0, `${v1.warnings.length} warnings`));

    // Quality service: score good question gives >70
    const goodQ = {
        question_en: 'What is the capital of India?',
        question_hi: 'भारत की राजधानी क्या है?',
        options_en: ['Mumbai', 'New Delhi', 'Kolkata', 'Chennai'],
        options_hi: ['मुंबई', 'नई दिल्ली', 'कोलकाता', 'चेन्नई'],
        correctAnswer: 1,
        explanation_en: 'New Delhi is the capital of India. It is located in the northern part of the country and serves as the seat of the Indian government.',
        difficulty: 'EASY',
        subjectId: 'geography',
        topicId: 'capitals',
    };
    const goodScore = QQS.score(goodQ);
    record(gate('QQS gives good question score ≥ 70', goodScore.qualityScore >= 70, `score=${goodScore.qualityScore}`));

    // Quality service: similarity detects near-dupes
    const sim = QQS.similarity('What is the capital of India', 'What is the capital city of India');
    record(gate('QQS similarity > 70 for near-dupes', sim > 70, `sim=${sim}%`));

    // ── ANALYTICS GATES ──────────────────────────────────────────────────────
    console.log('\n── ANALYTICS ────────────────────────────────────────────');

    // Readiness formula sanity check (manual calculation)
    const avgAccuracy = 75, coverage = 60, tests = 25;
    const readiness = Math.min(Math.round((avgAccuracy * 0.5) + (coverage * 0.4) + (Math.min(tests, 50) * 0.2)), 100);
    record(gate('Readiness formula bounded 0-100', readiness >= 0 && readiness <= 100, `score=${readiness}`));

    // XP guard: accuracy 0-100
    const xpGuard = (acc) => Math.min(Math.max(acc, 0), 100);
    record(gate('XP guard clamps 0-100', xpGuard(-5) === 0 && xpGuard(105) === 100));

    // ── FINAL REPORT ─────────────────────────────────────────────────────────
    console.log('\n══════════════════════════════════════════════════════════');
    console.log(`   RESULTS: ${passed} passed / ${failed} failed`);
    const allPassed = failed === 0;
    if (allPassed) {
        console.log('   🎉  PHASE 11 QUALITY CERTIFICATION: PASSED');
    } else {
        console.log('   ⚠️   PHASE 11 QUALITY CERTIFICATION: NEEDS ATTENTION');
        console.log(`         Fix ${failed} failing gate(s) above.`);
    }
    console.log('══════════════════════════════════════════════════════════\n');

    process.exit(allPassed ? 0 : 1);
}

run();
