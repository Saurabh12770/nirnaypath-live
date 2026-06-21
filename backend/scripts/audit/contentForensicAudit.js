/**
 * NirnayPath 3.0 — Phase 1: Content Forensic Audit
 * ===================================================
 * DO NOT MODIFY ANY DATA. Read-only audit.
 *
 * Analyzes every record in `learningcontents`:
 *  1. Total topics
 *  2. Average words per topic (EN + HI separately)
 *  3. Topics with < 500 / 1000 / 2000 / 3000 words (EN)
 *  4. Topics with no Hindi content
 *  5. Topics with no PYQs
 *  6. Topics with no solved examples
 *  7. Topics with no revision notes
 *  8. Per-exam quality breakdown
 *  9. Word count distribution histogram
 * 10. Top 20 shortest (worst) topics listed
 * 11. Coaching Grade classification (A/B/C/D) per record
 *
 * Run: node backend/scripts/audit/contentForensicAudit.js
 */

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

// ── helpers ──────────────────────────────────────────────────────────────────

function splitLang(text) {
  if (!text) return { en: '', hi: '' };
  const idx = text.indexOf('===HINDI===');
  if (idx === -1) return { en: text.trim(), hi: '' };
  return {
    en: text.slice(0, idx).trim(),
    hi: text.slice(idx + 11).trim(),
  };
}

function wordCount(text) {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

// Extract Hindi text from arrays like concepts[], importantFacts[], examples[]
// Each item is: "English text ===HINDI=== हिंदी पाठ"
function arrayHindiContent(arr) {
  if (!arr || !arr.length) return '';
  return arr.map(item => {
    const { hi } = splitLang(item);
    return hi;
  }).join(' ').trim();
}

function gradeRecord(enWords, hasPYQs, hasExamples, hasRevision, hasHindi) {
  // Grade D – placeholder
  if (enWords < 200) return 'D';
  // Grade A – coaching grade
  if (enWords >= 3000 && hasPYQs && hasExamples && hasRevision && hasHindi) return 'A';
  // Grade B – usable
  if (enWords >= 1500 && (hasPYQs || hasExamples)) return 'B';
  // Grade C – needs work
  return 'C';
}

// ── main ─────────────────────────────────────────────────────────────────────

async function run() {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
  console.log(`\n🔍 NirnayPath 3.0 — Phase 1: Content Forensic Audit`);
  console.log(`   Connecting to: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);
  console.log(`   ✅ Connected. Starting audit...\n`);

  // Raw query — no model needed
  const db = mongoose.connection.db;
  const col = db.collection('learningcontents');
  const total = await col.countDocuments();
  console.log(`   📦 Total records in learningcontents: ${total}`);

  const cursor = col.find({});

  // Accumulators
  let totalEnWords = 0;
  let totalHiWords = 0;
  let records = []; // lightweight summary per record

  const examStats = {}; // per-exam breakdown

  for await (const doc of cursor) {

    // --- Parse fields ---
    const intro = splitLang(doc.introduction || '');
    const detail = splitLang(doc.detailedExplanation || '');
    const revision = splitLang(doc.revisionNotes || '');

    const enText = intro.en + ' ' + detail.en;
    const hiText = intro.hi + ' ' + detail.hi;

    // Examples, facts, concepts may embed hindi via ===HINDI===
    const examplesHi = arrayHindiContent(doc.examples);
    const factsHi = arrayHindiContent(doc.importantFacts);
    const conceptsHi = arrayHindiContent(doc.concepts);

    const fullHiText = hiText + ' ' + examplesHi + ' ' + factsHi + ' ' + conceptsHi + ' ' + revision.hi;

    const enWords = wordCount(enText);
    const hiWords = wordCount(fullHiText);

    totalEnWords += enWords;
    totalHiWords += hiWords;

    // Flags
    const hasPYQs = Array.isArray(doc.pyqs) && doc.pyqs.length > 0;
    const hasExamples = Array.isArray(doc.examples) && doc.examples.length > 0;
    const hasRevision = !!(doc.revisionNotes && doc.revisionNotes.trim().length > 10);
    const hasConcepts = Array.isArray(doc.concepts) && doc.concepts.length > 0;
    const hasTables = Array.isArray(doc.tables) && doc.tables.length > 0;
    const hasHindi = hiWords > 50;
    const hasHindiPYQs = hasPYQs && doc.pyqs.some(q => q.question?.hi && q.question.hi.length > 10);

    const grade = gradeRecord(enWords, hasPYQs, hasExamples, hasRevision, hasHindi);

    const exam = doc.exam || 'Unknown';
    if (!examStats[exam]) {
      examStats[exam] = {
        count: 0, totalEnWords: 0, totalHiWords: 0,
        noPYQs: 0, noExamples: 0, noRevision: 0, noHindi: 0, noHindiPYQs: 0,
        grades: { A: 0, B: 0, C: 0, D: 0 },
        below500: 0, below1000: 0, below2000: 0, below3000: 0,
      };
    }
    const ex = examStats[exam];
    ex.count++;
    ex.totalEnWords += enWords;
    ex.totalHiWords += hiWords;
    if (!hasPYQs) ex.noPYQs++;
    if (!hasExamples) ex.noExamples++;
    if (!hasRevision) ex.noRevision++;
    if (!hasHindi) ex.noHindi++;
    if (!hasHindiPYQs) ex.noHindiPYQs++;
    ex.grades[grade]++;
    if (enWords < 500) ex.below500++;
    if (enWords < 1000) ex.below1000++;
    if (enWords < 2000) ex.below2000++;
    if (enWords < 3000) ex.below3000++;

    records.push({
      _id: doc._id.toString(),
      exam,
      subject: doc.subject,
      topic: doc.topic,
      subtopic: doc.subtopic,
      enWords,
      hiWords,
      hasPYQs,
      hasExamples,
      hasRevision,
      hasConcepts,
      hasTables,
      hasHindi,
      hasHindiPYQs,
      grade,
      pyqCount: doc.pyqs?.length || 0,
      exampleCount: doc.examples?.length || 0,
      factCount: doc.importantFacts?.length || 0,
    });
  }

  await mongoose.disconnect();

  // ── compute global stats ─────────────────────────────────────────────────
  const n = records.length;
  const avgEnWords = Math.round(totalEnWords / n);
  const avgHiWords = Math.round(totalHiWords / n);

  const noPYQs       = records.filter(r => !r.hasPYQs).length;
  const noExamples   = records.filter(r => !r.hasExamples).length;
  const noRevision   = records.filter(r => !r.hasRevision).length;
  const noHindi      = records.filter(r => !r.hasHindi).length;
  const noHindiPYQs  = records.filter(r => !r.hasHindiPYQs).length;
  const noConcepts   = records.filter(r => !r.hasConcepts).length;
  const noTables     = records.filter(r => !r.hasTables).length;

  const below500  = records.filter(r => r.enWords < 500).length;
  const below1000 = records.filter(r => r.enWords < 1000).length;
  const below2000 = records.filter(r => r.enWords < 2000).length;
  const below3000 = records.filter(r => r.enWords < 3000).length;
  const above3000 = records.filter(r => r.enWords >= 3000).length;
  const above5000 = records.filter(r => r.enWords >= 5000).length;

  const gradeA = records.filter(r => r.grade === 'A').length;
  const gradeB = records.filter(r => r.grade === 'B').length;
  const gradeC = records.filter(r => r.grade === 'C').length;
  const gradeD = records.filter(r => r.grade === 'D').length;

  // Top 20 shortest (worst) records
  const worst20 = [...records].sort((a, b) => a.enWords - b.enWords).slice(0, 20);

  // ── Word count histogram ──────────────────────────────────────────────────
  const buckets = {
    '0–99':   records.filter(r => r.enWords < 100).length,
    '100–499': records.filter(r => r.enWords >= 100 && r.enWords < 500).length,
    '500–999': records.filter(r => r.enWords >= 500 && r.enWords < 1000).length,
    '1000–1999': records.filter(r => r.enWords >= 1000 && r.enWords < 2000).length,
    '2000–2999': records.filter(r => r.enWords >= 2000 && r.enWords < 3000).length,
    '3000–4999': records.filter(r => r.enWords >= 3000 && r.enWords < 5000).length,
    '5000–9999': records.filter(r => r.enWords >= 5000 && r.enWords < 10000).length,
    '10000+': records.filter(r => r.enWords >= 10000).length,
  };

  // ── Build Report ─────────────────────────────────────────────────────────
  const lines = [];
  const p = (...args) => lines.push(args.join(''));

  p('# NirnayPath 3.0 — Phase 1: Content Forensic Audit Report');
  p('Generated: ', new Date().toISOString());
  p();
  p('---');
  p();
  p('## EXECUTIVE SUMMARY');
  p();
  p('| Metric | Value |');
  p('|--------|-------|');
  p(`| Total records audited | **${n}** |`);
  p(`| Average EN words / topic | **${avgEnWords}** |`);
  p(`| Average HI words / topic | **${avgHiWords}** |`);
  p(`| Topics with < 500 EN words | **${below500}** (${pct(below500,n)}%) ❌ |`);
  p(`| Topics with < 1000 EN words | **${below1000}** (${pct(below1000,n)}%) |`);
  p(`| Topics with < 2000 EN words | **${below2000}** (${pct(below2000,n)}%) |`);
  p(`| Topics with < 3000 EN words | **${below3000}** (${pct(below3000,n)}%) |`);
  p(`| Topics with ≥ 3000 EN words | **${above3000}** (${pct(above3000,n)}%) |`);
  p(`| Topics with ≥ 5000 EN words | **${above5000}** (${pct(above5000,n)}%) |`);
  p();
  p('---');
  p();
  p('## CONTENT GAPS');
  p();
  p('| Gap Type | Count | % |');
  p('|----------|-------|---|');
  p(`| No Hindi content (< 50 words) | **${noHindi}** | ${pct(noHindi,n)}% |`);
  p(`| No PYQs | **${noPYQs}** | ${pct(noPYQs,n)}% |`);
  p(`| No Hindi PYQs | **${noHindiPYQs}** | ${pct(noHindiPYQs,n)}% |`);
  p(`| No solved examples | **${noExamples}** | ${pct(noExamples,n)}% |`);
  p(`| No revision notes | **${noRevision}** | ${pct(noRevision,n)}% |`);
  p(`| No concepts/key terms | **${noConcepts}** | ${pct(noConcepts,n)}% |`);
  p(`| No reference tables | **${noTables}** | ${pct(noTables,n)}% |`);
  p();
  p('---');
  p();
  p('## COACHING GRADE CLASSIFICATION');
  p();
  p('| Grade | Criteria | Count | % |');
  p('|-------|----------|-------|---|');
  p(`| 🟢 A — Coaching Grade | EN≥3000 + PYQs + Examples + Revision + Hindi | **${gradeA}** | ${pct(gradeA,n)}% |`);
  p(`| 🟡 B — Usable | EN≥1500 + (PYQs or Examples) | **${gradeB}** | ${pct(gradeB,n)}% |`);
  p(`| 🟠 C — Needs Rewrite | EN≥200 but missing key sections | **${gradeC}** | ${pct(gradeC,n)}% |`);
  p(`| 🔴 D — Placeholder | EN < 200 words | **${gradeD}** | ${pct(gradeD,n)}% |`);
  p();
  p('---');
  p();
  p('## WORD COUNT DISTRIBUTION');
  p();
  p('| Word Range | Count | % | Bar |');
  p('|-----------|-------|---|-----|');
  for (const [range, cnt] of Object.entries(buckets)) {
    const bar = '█'.repeat(Math.round(cnt / n * 40));
    p(`| ${range} | ${cnt} | ${pct(cnt,n)}% | ${bar} |`);
  }
  p();
  p('---');
  p();
  p('## PER-EXAM BREAKDOWN');
  p();
  for (const [exam, ex] of Object.entries(examStats)) {
    p(`### ${exam} (${ex.count} topics)`);
    p();
    p('| Metric | Value |');
    p('|--------|-------|');
    p(`| Avg EN words | ${Math.round(ex.totalEnWords / ex.count)} |`);
    p(`| Avg HI words | ${Math.round(ex.totalHiWords / ex.count)} |`);
    p(`| Grade A | ${ex.grades.A} (${pct(ex.grades.A,ex.count)}%) |`);
    p(`| Grade B | ${ex.grades.B} (${pct(ex.grades.B,ex.count)}%) |`);
    p(`| Grade C | ${ex.grades.C} (${pct(ex.grades.C,ex.count)}%) |`);
    p(`| Grade D | ${ex.grades.D} (${pct(ex.grades.D,ex.count)}%) |`);
    p(`| No Hindi | ${ex.noHindi} (${pct(ex.noHindi,ex.count)}%) |`);
    p(`| No PYQs | ${ex.noPYQs} (${pct(ex.noPYQs,ex.count)}%) |`);
    p(`| No Examples | ${ex.noExamples} (${pct(ex.noExamples,ex.count)}%) |`);
    p(`| No Revision | ${ex.noRevision} (${pct(ex.noRevision,ex.count)}%) |`);
    p(`| < 500 words | ${ex.below500} |`);
    p(`| < 1000 words | ${ex.below1000} |`);
    p(`| < 2000 words | ${ex.below2000} |`);
    p(`| < 3000 words | ${ex.below3000} |`);
    p();
  }
  p('---');
  p();
  p('## TOP 20 WORST TOPICS (Shortest EN content)');
  p();
  p('| Rank | Exam | Subject | Topic | Subtopic | EN Words | HI Words | Grade | PYQs | Examples |');
  p('|------|------|---------|-------|----------|----------|----------|-------|------|----------|');
  worst20.forEach((r, i) => {
    p(`| ${i+1} | ${r.exam} | ${r.subject} | ${r.topic} | ${r.subtopic} | ${r.enWords} | ${r.hiWords} | ${r.grade} | ${r.pyqCount} | ${r.exampleCount} |`);
  });
  p();
  p('---');
  p();
  p('## FULL RECORD LIST (all topics, sorted by EN word count ASC)');
  p();
  p('| Exam | Subject | Subtopic | EN Words | HI Words | Grade | PYQs | Ex | Rev | Hindi |');
  p('|------|---------|----------|----------|----------|-------|------|----|-----|-------|');
  const sorted = [...records].sort((a, b) => a.enWords - b.enWords);
  for (const r of sorted) {
    p(`| ${r.exam} | ${r.subject} | ${r.subtopic} | ${r.enWords} | ${r.hiWords} | ${r.grade} | ${r.pyqCount} | ${r.exampleCount} | ${r.hasRevision?'✅':'❌'} | ${r.hasHindi?'✅':'❌'} |`);
  }
  p();
  p('---');
  p();
  p('## WHAT NEEDS TO BE DONE');
  p();
  p(`- **Delete or rewrite Grade D** (${gradeD} records, < 200 words EN)`);
  p(`- **Rewrite Grade C to coaching-grade** (${gradeC} records)`);
  p(`- **Add Hindi content** to ${noHindi} topics (${pct(noHindi,n)}%)`);
  p(`- **Add PYQs** to ${noPYQs} topics`);
  p(`- **Add solved examples** to ${noExamples} topics`);
  p(`- **Add revision notes** to ${noRevision} topics`);
  p(`- **Target per topic**: 5,000–10,000 EN words + Hindi parity`);
  p();
  p('---');
  p();
  p('*This is a read-only forensic report. No data was modified.*');

  const reportPath = path.join(__dirname, '../../../CONTENT_FORENSIC_AUDIT.md');
  fs.writeFileSync(reportPath, lines.join('\n'));
  console.log(`\n✅ Report saved to: CONTENT_FORENSIC_AUDIT.md`);
  console.log(`\n========== QUICK SUMMARY ==========`);
  console.log(`Total topics:   ${n}`);
  console.log(`Avg EN words:   ${avgEnWords}`);
  console.log(`Avg HI words:   ${avgHiWords}`);
  console.log(`Grade A (🟢):   ${gradeA} (${pct(gradeA,n)}%)`);
  console.log(`Grade B (🟡):   ${gradeB} (${pct(gradeB,n)}%)`);
  console.log(`Grade C (🟠):   ${gradeC} (${pct(gradeC,n)}%)`);
  console.log(`Grade D (🔴):   ${gradeD} (${pct(gradeD,n)}%)`);
  console.log(`No Hindi:       ${noHindi} (${pct(noHindi,n)}%)`);
  console.log(`No PYQs:        ${noPYQs} (${pct(noPYQs,n)}%)`);
  console.log(`No Examples:    ${noExamples} (${pct(noExamples,n)}%)`);
  console.log(`No Revision:    ${noRevision} (${pct(noRevision,n)}%)`);
  console.log(`< 2000 words:   ${below2000} (${pct(below2000,n)}%)`);
  console.log(`≥ 3000 words:   ${above3000} (${pct(above3000,n)}%)`);
  console.log(`====================================\n`);
}

function pct(a, b) {
  if (!b) return 0;
  return Math.round(a / b * 100);
}

run().catch(err => {
  console.error('[AUDIT ERROR]', err.message);
  process.exit(1);
});
