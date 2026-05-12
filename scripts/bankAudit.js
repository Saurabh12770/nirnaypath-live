/**
 * scripts/bankAudit.js
 * Phase 3: Question Bank Completeness & Quality Audit Tool
 *
 * Usage: node scripts/bankAudit.js
 * Usage: node scripts/bankAudit.js --subject history
 * Usage: node scripts/bankAudit.js --json  (outputs JSON report)
 *
 * Reports per subject:
 *   - Total questions, valid, invalid, repaired
 *   - Difficulty distribution (easy/medium/hard)
 *   - Topic coverage and topic question counts
 *   - Bilingual completeness (en+hi)
 *   - Explanation coverage
 *   - Duplicate question ID detection
 *   - Target gap (how many questions needed to reach 5000)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { normalizeBank } = require('../utils/questionNormalizer');

const DATA_DIR = path.join(__dirname, '../data');
const TARGET_PER_SUBJECT = 5000;

const DIFFICULTY_TARGETS = {
    easy:   { min: 0.20, label: '20% Easy   (9th-10th level)' },
    medium: { min: 0.45, label: '45% Medium (11th-12th level)' },
    hard:   { min: 0.35, label: '35% Hard   (UPSC level)' }
};

function auditSubject(file) {
    const filePath = path.join(DATA_DIR, file);
    const subject = file.replace('.json', '');
    let raw = [];

    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(content);
        raw = Array.isArray(parsed) ? parsed : (parsed.questions || []);
    } catch (e) {
        return { subject, error: e.message };
    }

    const { valid, invalid, stats } = normalizeBank(raw);

    // Difficulty distribution
    const diffCount = { easy: 0, medium: 0, hard: 0, unknown: 0 };
    valid.forEach(q => {
        const d = (q.difficulty || 'unknown').toLowerCase();
        diffCount[d] = (diffCount[d] || 0) + 1;
    });

    // Topic coverage
    const topicMap = {};
    valid.forEach(q => {
        const t = q.topic || 'Unknown';
        topicMap[t] = (topicMap[t] || 0) + 1;
    });

    // Bilingual completeness
    let missingHi = 0, missingExplEn = 0, missingExplHi = 0;
    valid.forEach(q => {
        if (!q.question_hi || q.question_hi === q.question_en) missingHi++;
        if (!q.explanation_en) missingExplEn++;
        if (!q.explanation_hi || q.explanation_hi === q.explanation_en) missingExplHi++;
    });

    // Duplicate ID detection
    const idSeen = new Set();
    let dupIds = 0;
    valid.forEach(q => {
        const id = String(q.id || q._id || '');
        if (id && idSeen.has(id)) dupIds++;
        idSeen.add(id);
    });

    const gap = Math.max(0, TARGET_PER_SUBJECT - valid.length);
    const diffPct = d => valid.length ? ((diffCount[d] || 0) / valid.length * 100).toFixed(1) : '0.0';
    const topicsCount = Object.keys(topicMap).length;

    return {
        subject,
        total: raw.length,
        valid: valid.length,
        invalid: invalid.length,
        repaired: stats.repaired,
        intactRate: stats.intactRate,
        targetGap: gap,
        targetMet: gap === 0,
        difficulty: {
            easy: `${diffCount.easy} (${diffPct('easy')}%)`,
            medium: `${diffCount.medium} (${diffPct('medium')}%)`,
            hard: `${diffCount.hard} (${diffPct('hard')}%)`,
            unknown: diffCount.unknown
        },
        diffTargetMet: {
            easy: parseFloat(diffPct('easy')) >= 20,
            medium: parseFloat(diffPct('medium')) >= 45,
            hard: parseFloat(diffPct('hard')) >= 35
        },
        bilingual: {
            missingHindi: missingHi,
            missingExplanationEn: missingExplEn,
            missingExplanationHi: missingExplHi,
            bilingualComplete: missingHi === 0 && missingExplHi === 0
        },
        topics: {
            count: topicsCount,
            distribution: Object.entries(topicMap)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .reduce((acc, [t, n]) => { acc[t] = n; return acc; }, {})
        },
        duplicateIds: dupIds,
        invalidSamples: invalid.slice(0, 3).map(q => ({
            index: q._rawIndex,
            reason: q.invalidReason,
            id: q.id || q._id || 'N/A'
        }))
    };
}

function formatReport(results) {
    const totalValid = results.reduce((s, r) => s + (r.valid || 0), 0);
    const totalInvalid = results.reduce((s, r) => s + (r.invalid || 0), 0);
    const totalGap = results.reduce((s, r) => s + (r.targetGap || 0), 0);

    let out = '';
    out += `\n${'═'.repeat(70)}\n`;
    out += ` NIRNAYPATH — QUESTION BANK AUDIT REPORT\n`;
    out += ` Generated: ${new Date().toISOString()}\n`;
    out += `${'═'.repeat(70)}\n\n`;
    out += ` GLOBAL SUMMARY\n`;
    out += ` Total valid questions  : ${totalValid.toLocaleString()}\n`;
    out += ` Total invalid filtered : ${totalInvalid.toLocaleString()}\n`;
    out += ` Total gap to 5000/sub  : ${totalGap.toLocaleString()}\n\n`;

    results.forEach(r => {
        if (r.error) {
            out += `\n ❌ ${r.subject}: ERROR — ${r.error}\n`;
            return;
        }
        const statusIcon = r.targetMet ? '✅' : (r.valid >= 2500 ? '⚠️ ' : '❌');
        out += `${'-'.repeat(70)}\n`;
        out += ` ${statusIcon} ${r.subject.toUpperCase()}\n`;
        out += `    Valid/Total    : ${r.valid.toLocaleString()} / ${r.total.toLocaleString()} `;
        out += `(intact ${r.intactRate}, ${r.invalid} invalid, ${r.repaired} repaired)\n`;
        out += `    Target Gap     : ${r.targetGap > 0 ? `NEED +${r.targetGap.toLocaleString()} more` : 'TARGET MET ✓'}\n`;
        out += `    Difficulty     : Easy ${r.difficulty.easy} | `;
        out += `Med ${r.difficulty.medium} | Hard ${r.difficulty.hard}\n`;
        out += `    Topics         : ${r.topics.count} topics covered\n`;
        out += `    Bilingual      : `;
        if (r.bilingual.bilingualComplete) {
            out += `Fully bilingual ✓\n`;
        } else {
            out += `Missing Hindi q=${r.bilingual.missingHindi} `;
            out += `ExplEN=${r.bilingual.missingExplanationEn} `;
            out += `ExplHI=${r.bilingual.missingExplanationHi}\n`;
        }
        if (r.duplicateIds > 0) {
            out += `    ⚠️  Duplicate IDs: ${r.duplicateIds}\n`;
        }
        if (r.invalidSamples.length > 0) {
            out += `    Invalid Samples:\n`;
            r.invalidSamples.forEach(s => {
                out += `      [idx ${s.index}] ID:${s.id} → ${s.reason}\n`;
            });
        }
    });

    out += `${'═'.repeat(70)}\n`;
    return out;
}

// ── Main ──────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const specificSubject = args.includes('--subject')
    ? args[args.indexOf('--subject') + 1]
    : null;

let files;
try {
    files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
} catch (e) {
    console.error('Cannot read data directory:', e.message);
    process.exit(1);
}

if (specificSubject) {
    files = files.filter(f => f.startsWith(specificSubject));
}

if (files.length === 0) {
    console.error('No matching JSON files found in data/');
    process.exit(1);
}

const results = files.map(f => auditSubject(f));

if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
} else {
    console.log(formatReport(results));
}
