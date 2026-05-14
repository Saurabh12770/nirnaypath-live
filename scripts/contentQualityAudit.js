/**
 * contentQualityAudit.js — Phase 11
 * Run from server/ directory:  node scripts/contentQualityAudit.js
 *
 * Uses native MongoDB driver (no Mongoose) to avoid model-buffering
 * timeouts when the server is already running.
 */

'use strict';

// ── Resolve node_modules from the server directory ───────────────────────────
const serverDir = __dirname.endsWith('scripts')
    ? require('path').join(__dirname, '..')          // running from server/scripts
    : __dirname;                                      // already in server/

require('dotenv').config({ path: require('path').join(serverDir, '.env') });

const { MongoClient } = require('mongodb');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────────────
const MONGO_URI   = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
const REPORT_PATH = path.join(serverDir, '..', 'content_quality_report.json');

function md5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function runAudit() {
    const client = new MongoClient(MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
    });

    try {
        console.log('🔍  Phase 11 — Content Quality Audit');
        console.log(`📡  Connecting to ${MONGO_URI} ...`);
        await client.connect();
        const db  = client.db();
        const col = db.collection('questions');

        const total = await col.estimatedDocumentCount();
        console.log(`📊  Total questions in DB: ${total.toLocaleString()}`);

        // ── Metrics accumulators ──────────────────────────────────────────────
        const metrics = {
            total,
            duplicates:       0,
            weakExplanation:  0,
            missingEn:        0,
            missingHi:        0,
            malformedOptions: 0,
            reviewRequired:   0,
            difficulty: { EASY: 0, MEDIUM: 0, HARD: 0, OTHER: 0 },
            subjects: {},
            topics: {},
        };

        const seenHashes = new Set();
        let processed = 0;

        // ── Streaming cursor (low memory) ─────────────────────────────────────
        const cursor = col.find({}, {
            projection: {
                question_en: 1, question_hi: 1, text: 1,
                options_en: 1, options_hi: 1, options: 1,
                explanation_en: 1, explanation: 1,
                difficulty: 1,
                subjectId: 1, subject: 1,
                topicId: 1,
            }
        }).batchSize(500);

        for await (const q of cursor) {
            processed++;
            if (processed % 10000 === 0) {
                process.stdout.write(`\r   ⚙️  ${processed.toLocaleString()} processed …`);
            }

            const enText = (q.question_en || q.text || '').trim();
            const hiText = (q.question_hi  || '').trim();
            const expl   = (q.explanation_en || q.explanation || '').trim();
            const optEn  = q.options_en || q.options || [];
            const optHi  = q.options_hi || [];
            const diff   = (q.difficulty || 'MEDIUM').toUpperCase();
            const subj   = q.subjectId || q.subject || 'unknown';
            const topic  = q.topicId   || 'none';

            // Duplicate detection via MD5
            if (enText) {
                const h = md5(enText.toLowerCase());
                if (seenHashes.has(h)) metrics.duplicates++;
                else seenHashes.add(h);
            } else {
                metrics.missingEn++;
            }

            // Missing Hindi
            if (!hiText || optHi.length === 0) metrics.missingHi++;

            // Weak explanation
            if (expl.length < 50) metrics.weakExplanation++;

            // Malformed options
            if (optEn.length < 2 || optEn.some(o => !o || String(o).trim() === '')) {
                metrics.malformedOptions++;
            }

            // Difficulty bucketing
            if (['EASY', 'MEDIUM', 'HARD'].includes(diff)) metrics.difficulty[diff]++;
            else metrics.difficulty.OTHER++;

            // Subject & topic tallies
            metrics.subjects[subj] = (metrics.subjects[subj] || 0) + 1;
            metrics.topics[topic]  = (metrics.topics[topic]  || 0) + 1;

            // Quality score (simple, 0-100)
            let score = 100;
            if (!hiText || optHi.length === 0) score -= 30;
            if (expl.length < 50)              score -= 15;
            if (optEn.length < 4)              score -= 10;
            if (!q.subjectId || !q.topicId)   score -= 20;
            if (score < 70) metrics.reviewRequired++;
        }

        process.stdout.write('\n');

        // ── Build report ──────────────────────────────────────────────────────
        const pct = n => processed ? ((n / processed) * 100).toFixed(2) + '%' : '0%';

        const report = {
            timestamp:             new Date().toISOString(),
            totalAudited:          processed,
            duplicates:            { count: metrics.duplicates,       pct: pct(metrics.duplicates)       },
            missingEnglish:        { count: metrics.missingEn,        pct: pct(metrics.missingEn)        },
            missingHindi:          { count: metrics.missingHi,        pct: pct(metrics.missingHi)        },
            weakExplanation:       { count: metrics.weakExplanation,  pct: pct(metrics.weakExplanation)  },
            malformedOptions:      { count: metrics.malformedOptions, pct: pct(metrics.malformedOptions) },
            reviewRequired:        { count: metrics.reviewRequired,   pct: pct(metrics.reviewRequired)   },
            difficultyDistribution: metrics.difficulty,
            uniqueSubjects:        Object.keys(metrics.subjects).length,
            uniqueTopics:          Object.keys(metrics.topics).length,
            topSubjects: Object.entries(metrics.subjects)
                .sort((a, b) => b[1] - a[1]).slice(0, 20)
                .map(([subj, count]) => ({ subj, count })),
        };

        // ── Console report ────────────────────────────────────────────────────
        console.log('\n════════════════════════════════════════════════════');
        console.log('   PHASE 11 — CONTENT QUALITY AUDIT REPORT');
        console.log('════════════════════════════════════════════════════');
        console.log(`   Total Audited           : ${processed.toLocaleString()}`);
        console.log(`   Exact Duplicates        : ${report.duplicates.count.toLocaleString()} (${report.duplicates.pct})`);
        console.log(`   Missing English Text    : ${report.missingEnglish.count.toLocaleString()} (${report.missingEnglish.pct})`);
        console.log(`   Missing Hindi Trans.    : ${report.missingHindi.count.toLocaleString()} (${report.missingHindi.pct})`);
        console.log(`   Weak Explanation (<50c) : ${report.weakExplanation.count.toLocaleString()} (${report.weakExplanation.pct})`);
        console.log(`   Malformed Options       : ${report.malformedOptions.count.toLocaleString()} (${report.malformedOptions.pct})`);
        console.log(`   Review Required (<70pts): ${report.reviewRequired.count.toLocaleString()} (${report.reviewRequired.pct})`);
        console.log(`   Difficulty EASY/MED/HARD: ${metrics.difficulty.EASY} / ${metrics.difficulty.MEDIUM} / ${metrics.difficulty.HARD}`);
        console.log(`   Unique Subjects         : ${report.uniqueSubjects}`);
        console.log(`   Unique Topics           : ${report.uniqueTopics}`);
        console.log('════════════════════════════════════════════════════\n');
        console.log('   Top Subjects by volume:');
        report.topSubjects.forEach(s => console.log(`     ${s.subj.padEnd(35)} ${s.count}`));
        console.log('');

        fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
        console.log(`✅  Full report saved → ${REPORT_PATH}`);

    } catch (err) {
        console.error('\n❌  Audit failed:', err.message);
        console.error(err.stack);
        process.exit(1);
    } finally {
        await client.close();
    }
}

runAudit();
