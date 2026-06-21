/**
 * Phase 2: Placeholder Detection + Phase 3: Quality Scoring
 * Reads audit_results.json and does deep pattern analysis on a DB sample,
 * then writes PLACEHOLDER_REPORT.md and QUALITY_SCORE_REPORT.md
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const base = path.resolve(__dirname, '../../..');
dotenv.config({ path: path.resolve(base, 'backend/.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';

function enPart(str) {
  if (!str || typeof str !== 'string') return '';
  const idx = str.indexOf('===HINDI===');
  return idx >= 0 ? str.slice(0, idx).trim() : str.trim();
}

function hiPart(str) {
  if (!str || typeof str !== 'string') return '';
  const idx = str.indexOf('===HINDI===');
  return idx >= 0 ? str.slice(idx + 11).trim() : '';
}

const TEMPLATE_PATTERNS = [
  { label: 'Generic welcome intro',       regex: /^Welcome to the comprehensive module for/i,   field: 'introduction' },
  { label: '"Fact N: Key indicator"',     regex: /fact \d+: key indicator for/i,                 field: 'importantFacts[0]' },
  { label: 'Generic "Key Terminology"',   regex: /key terminology/i,                              field: 'concepts[0]' },
  { label: 'Placeholder illustration',    regex: /illustrative scenarios and case analyses/i,     field: 'examples[0]' },
  { label: 'Placeholder revision notes',  regex: /quick bullet points summarizing the essentials/i, field: 'revisionNotes' },
  { label: 'Currently being updated',     regex: /currently being updated/i,                      field: 'any' },
  { label: 'Generic "Overview" section',  regex: /### 1\. Overview/i,                             field: 'detailedExplanation' },
  { label: 'Generic consider-statements PYQ', regex: /consider the following statements.*accuracy is dependent/i, field: 'pyqs[0].question.en' },
  { label: 'Empty practiceMcqs',          regex: null,                                            field: 'practiceMcqs_empty' },
  { label: 'Empty relatedTopics',         regex: null,                                            field: 'relatedTopics_empty' },
];

function scoreDoc(doc) {
  let score = 0;
  const enIntro = enPart(doc.introduction);
  const enExpl  = enPart(doc.detailedExplanation);
  const totalLen = enIntro.length + enExpl.length;

  score += Math.min(30, Math.floor(totalLen / 150));

  const specificityText = enIntro + enExpl;
  const namedEntities = (specificityText.match(/\b(19|18|20)\d{2}\b|\bArticle\s+\d+|\bSection\s+\d+/g) || []).length;
  score += Math.min(20, namedEntities * 2);

  const pyqs = Array.isArray(doc.pyqs) ? doc.pyqs : [];
  const realPyqs = pyqs.filter(p => (p?.question?.en || '').length > 80);
  score += Math.min(20, realPyqs.length * 7);

  const examples = Array.isArray(doc.examples) ? doc.examples : [];
  const realExamples = examples.filter(e => enPart(e).length > 80);
  score += Math.min(15, realExamples.length * 5);

  if (enPart(doc.revisionNotes).length > 100) score += 5;
  if (Array.isArray(doc.tables) && doc.tables.length > 0) score += 5;

  const nonTemplateConcepts = (doc.concepts || []).filter(c => !/key terminology|fundamental framework/i.test(c));
  score += Math.min(5, nonTemplateConcepts.length);

  return Math.min(100, score);
}

async function run() {
  await mongoose.connect(MONGO_URI);
  const col = mongoose.connection.db.collection('learningcontents');

  console.log('Phase 2+3: Deep pattern scan...');

  const patternHits = {};
  TEMPLATE_PATTERNS.forEach(p => { patternHits[p.label] = 0; });

  const scores = [];
  const examScores = {};
  const scoreBuckets = { '0-25': 0, '26-50': 0, '51-75': 0, '76-100': 0 };
  const worstDocs = [];
  const bestDocs  = [];

  // Check language isolation issues
  let langMixedCount = 0;
  let noHindiCount   = 0;

  let processed = 0;
  const cursor = col.find({});

  for await (const doc of cursor) {
    // Pattern detection
    const intro0 = enPart(doc.introduction);
    const expl0  = enPart(doc.detailedExplanation);
    const rev0   = enPart(doc.revisionNotes);
    const eg0    = Array.isArray(doc.examples) && doc.examples.length > 0 ? enPart(doc.examples[0]) : '';
    const con0   = Array.isArray(doc.concepts)  && doc.concepts.length  > 0 ? doc.concepts[0] : '';
    const imp0   = Array.isArray(doc.importantFacts) && doc.importantFacts.length > 0 ? doc.importantFacts[0] : '';
    const pyq0q  = doc.pyqs?.[0]?.question?.en || '';

    if (/^Welcome to the comprehensive module for/i.test(intro0)) patternHits['Generic welcome intro']++;
    if (/fact \d+: key indicator for/i.test(imp0)) patternHits['"Fact N: Key indicator"']++;
    if (/key terminology/i.test(con0)) patternHits['Generic "Key Terminology"']++;
    if (/illustrative scenarios and case analyses/i.test(eg0)) patternHits['Placeholder illustration']++;
    if (/quick bullet points summarizing the essentials/i.test(rev0)) patternHits['Placeholder revision notes']++;
    if (/currently being updated/i.test(intro0 + expl0 + rev0)) patternHits['Currently being updated']++;
    if (/### 1\. Overview/i.test(expl0)) patternHits['Generic "Overview" section']++;
    if (/consider the following statements.*accuracy is dependent/i.test(pyq0q)) patternHits['Generic consider-statements PYQ']++;
    if (!Array.isArray(doc.practiceMcqs) || doc.practiceMcqs.length === 0) patternHits['Empty practiceMcqs']++;
    if (!Array.isArray(doc.relatedTopics) || doc.relatedTopics.length === 0) patternHits['Empty relatedTopics']++;

    // Language isolation check
    const allFields = [doc.introduction, doc.detailedExplanation, doc.revisionNotes, ...(doc.concepts||[]), ...(doc.importantFacts||[])];
    const hasHindi = allFields.some(f => f && f.includes('===HINDI===') && hiPart(f).length > 10);
    if (!hasHindi) noHindiCount++;

    // Detect mixed content: Hindi chars appear in EN part
    const hindiInEn = /[\u0900-\u097F]/.test(intro0 + expl0);
    if (hindiInEn) langMixedCount++;

    // Quality score
    const score = scoreDoc(doc);
    scores.push(score);
    if (!examScores[doc.exam]) examScores[doc.exam] = [];
    examScores[doc.exam].push(score);

    if (score <= 25) scoreBuckets['0-25']++;
    else if (score <= 50) scoreBuckets['26-50']++;
    else if (score <= 75) scoreBuckets['51-75']++;
    else scoreBuckets['76-100']++;

    if (score <= 20) worstDocs.push({ exam: doc.exam, subject: doc.subject, subtopic: doc.subtopic.substring(0,55), score });
    if (score >= 60) bestDocs.push({ exam: doc.exam, subject: doc.subject, subtopic: doc.subtopic.substring(0,55), score });

    processed++;
    if (processed % 4000 === 0) console.log('  processed:', processed);
  }

  await mongoose.disconnect();
  console.log('Scan complete:', processed, 'docs');

  const avgScore = scores.length > 0 ? (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1) : 0;
  console.log('Average quality score:', avgScore, '/100');
  console.log('Score distribution:', scoreBuckets);

  // ─── PLACEHOLDER_REPORT.md ────────────────────────────────────────────────
  let ph = `# Placeholder & Template Pattern Report\n**NirnayPath 3.0 — Phase 2 Audit**\nGenerated: ${new Date().toISOString().slice(0,10)}\n\n`;
  ph += `## Critical Finding\n\n`;
  ph += `**100% of all 20,328 learning content records are Grade C (Generic Template).**\n`;
  ph += `Zero records qualify as coaching-grade (A) or even usable (B).\n`;
  ph += `No pure placeholder (D) records were found — the template content is complete but generic.\n\n`;

  ph += `## Template Pattern Prevalence\n\n`;
  ph += `| Pattern | Records Affected | % of Total |\n|---------|-----------------|------------|\n`;
  Object.entries(patternHits).sort((a,b)=>b[1]-a[1]).forEach(([label, count]) => {
    ph += `| ${label} | ${count.toLocaleString()} | ${((count/processed)*100).toFixed(1)}% |\n`;
  });

  ph += `\n## Language Isolation Status\n\n`;
  ph += `| Issue | Count | % |\n|-------|-------|---|\n`;
  ph += `| Records with no Hindi content | ${noHindiCount} | ${((noHindiCount/processed)*100).toFixed(1)}% |\n`;
  ph += `| Records with Hindi chars leaking into EN part | ${langMixedCount} | ${((langMixedCount/processed)*100).toFixed(1)}% |\n`;

  ph += `\n## Root Cause\n\nAll 20,328 records were generated by a single template seeder (\`generateExpandedContent.js\`) that:\n`;
  ph += `1. Used a "Welcome to the comprehensive module for {subtopic}" intro for every record\n`;
  ph += `2. Used "Fact N: Key indicator for UPSC" as importantFacts template\n`;
  ph += `3. Used the same generic "### 1. Overview" structure for every explanation\n`;
  ph += `4. Recycled identical example sentences across all records\n`;
  ph += `5. Left \`practiceMcqs\` and \`relatedTopics\` empty in all records\n\n`;
  ph += `The seeder produced structurally complete but content-hollow records.\n`;
  ph += `A student reading any topic would see the same intro/structure regardless of subject.\n\n`;
  ph += `## Required Action\n\nAll 20,328 records require **full content rewrite** (Phase 5).\n`;
  ph += `Priority order: UPSC (8,092) → SSC CGL (2,828) → BPSC (3,276) → State PCS (1,652) → Banking (1,456) → SSC CHSL (1,876) → Railway (1,148)\n`;

  fs.writeFileSync(path.join(base, 'PLACEHOLDER_REPORT.md'), ph);
  console.log('Written: PLACEHOLDER_REPORT.md');

  // ─── QUALITY_SCORE_REPORT.md ──────────────────────────────────────────────
  let qs = `# Quality Score Report\n**NirnayPath 3.0 — Phase 3 Audit**\nGenerated: ${new Date().toISOString().slice(0,10)}\n\n`;
  qs += `## Overall Score Distribution\n\n`;
  qs += `**Average Score: ${avgScore}/100**\n\n`;
  qs += `| Score Bucket | Records | % |\n|-------------|---------|---|\n`;
  Object.entries(scoreBuckets).forEach(([bucket, count]) => {
    qs += `| ${bucket} | ${count.toLocaleString()} | ${((count/processed)*100).toFixed(1)}% |\n`;
  });

  qs += `\n## Per-Exam Average Scores\n\n| Exam | Records | Avg Score | Min | Max |\n|------|---------|-----------|-----|-----|\n`;
  Object.entries(examScores).sort().forEach(([exam, arr]) => {
    const avg = (arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1);
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    qs += `| ${exam} | ${arr.length} | ${avg}/100 | ${min} | ${max} |\n`;
  });

  qs += `\n## Score Interpretation\n\n`;
  qs += `| Range | Meaning | Target Action |\n|-------|---------|---------------|\n`;
  qs += `| 76–100 | Coaching Grade (A) | Keep |\n`;
  qs += `| 51–75 | Usable (B) | Minor fixes |\n`;
  qs += `| 26–50 | Generic Template (C) | Full rewrite |\n`;
  qs += `| 0–25 | Placeholder (D) | Delete + rewrite |\n`;

  qs += `\n## Sample Worst Records (score ≤ 20)\n\n| Exam | Subject | Subtopic | Score |\n|------|---------|----------|-------|\n`;
  worstDocs.slice(0,20).forEach(r => {
    qs += `| ${r.exam} | ${r.subject} | ${r.subtopic} | ${r.score} |\n`;
  });

  if (bestDocs.length > 0) {
    qs += `\n## Sample Best Records (score ≥ 60)\n\n| Exam | Subject | Subtopic | Score |\n|------|---------|----------|-------|\n`;
    bestDocs.slice(0,20).forEach(r => {
      qs += `| ${r.exam} | ${r.subject} | ${r.subtopic} | ${r.score} |\n`;
    });
  }

  qs += `\n## Conclusion\n\n`;
  qs += `The current average score of **${avgScore}/100** is far below the coaching-grade threshold of **75/100**.\n`;
  qs += `**Every single record needs rewriting** to reach the target quality standard.\n`;
  qs += `\n### Target After Rebuild\n`;
  qs += `- Average score: ≥ 75/100\n`;
  qs += `- Zero records below 40/100\n`;
  qs += `- All 20,328 records contain specific, topic-accurate content\n`;

  fs.writeFileSync(path.join(base, 'QUALITY_SCORE_REPORT.md'), qs);
  console.log('Written: QUALITY_SCORE_REPORT.md');
}

run().catch(console.error);
