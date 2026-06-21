import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';

// ─── Grade Classification Rules ─────────────────────────────────────────────

const PLACEHOLDER_TRIGGERS = [
  { key: 'currently_being_updated', test: (doc) => anyField(doc, /currently being updated/i) },
  { key: 'exam_relevant_points',    test: (doc) => arrayContains(doc.importantFacts, /exam-relevant points for/i) },
  { key: 'quick_bullet_summary',   test: (doc) => anyField(doc, /quick bullet points summarizing the essentials/i) },
  { key: 'illustrative_scenarios', test: (doc) => arrayContains(doc.examples, /illustrative scenarios and case analyses/i) },
  { key: 'fundamental_framework',  test: (doc) => arrayContains(doc.concepts, /fundamental framework/i) },
  { key: 'key_terminology',        test: (doc) => arrayContains(doc.concepts, /key terminology/i) },
  { key: 'intro_too_short',        test: (doc) => enPart(doc.introduction).length < 150 },
];

const TEMPLATE_TRIGGERS = [
  { key: 'welcome_intro',     test: (doc) => enPart(doc.introduction).startsWith('Welcome to the comprehensive module for') },
  { key: 'generic_overview',  test: (doc) => /### 1\. Overview\nAncient Indian History covers/i.test(enPart(doc.detailedExplanation)) },
  { key: 'fact_key_indicator',test: (doc) => arrayContains(doc.importantFacts, /fact \d+: key indicator for/i) },
  { key: 'generic_pyq',       test: (doc) => pyqIsGeneric(doc.pyqs) },
  { key: 'content_too_short', test: (doc) => (enPart(doc.introduction).length + enPart(doc.detailedExplanation).length) < 1500 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function enPart(str) {
  if (!str || typeof str !== 'string') return '';
  const idx = str.indexOf('===HINDI===');
  return idx >= 0 ? str.slice(0, idx).trim() : str.trim();
}

function anyField(doc, regex) {
  const fields = ['introduction', 'detailedExplanation', 'revisionNotes'];
  return fields.some(f => doc[f] && regex.test(doc[f]));
}

function arrayContains(arr, regex) {
  if (!Array.isArray(arr)) return false;
  return arr.some(item => typeof item === 'string' && regex.test(item));
}

function pyqIsGeneric(pyqs) {
  if (!Array.isArray(pyqs) || pyqs.length === 0) return true;
  const q = pyqs[0]?.question?.en || '';
  return q.length < 50 || /consider the following statements.*accuracy is dependent/i.test(q);
}

function classify(doc) {
  const dTriggers = PLACEHOLDER_TRIGGERS.filter(t => t.test(doc));
  if (dTriggers.length > 0) return { grade: 'D', triggers: dTriggers.map(t => t.key) };

  const cTriggers = TEMPLATE_TRIGGERS.filter(t => t.test(doc));
  if (cTriggers.length >= 2) return { grade: 'C', triggers: cTriggers.map(t => t.key) };

  // Score to distinguish B vs A
  const enLen = enPart(doc.introduction).length + enPart(doc.detailedExplanation).length;
  const hasRealExamples = Array.isArray(doc.examples) && doc.examples.length >= 3;
  const hasRealPyqs = Array.isArray(doc.pyqs) && doc.pyqs.length > 0 && !pyqIsGeneric(doc.pyqs);
  const hasTables = Array.isArray(doc.tables) && doc.tables.length > 0;
  const hasRevision = enPart(doc.revisionNotes).length > 100;

  const aScore = [enLen > 3000, hasRealExamples, hasRealPyqs, hasTables, hasRevision].filter(Boolean).length;
  if (aScore >= 4) return { grade: 'A', triggers: [] };
  if (aScore >= 2) return { grade: 'B', triggers: [] };
  return { grade: 'C', triggers: cTriggers.map(t => t.key) };
}

// ─── Quality Score ────────────────────────────────────────────────────────────

function scoreDoc(doc) {
  let score = 0;
  const enIntro = enPart(doc.introduction);
  const enExpl = enPart(doc.detailedExplanation);
  const totalLen = enIntro.length + enExpl.length;

  // Content depth (0-30)
  score += Math.min(30, Math.floor(totalLen / 150));

  // Specificity via named entities - proper nouns, years, article numbers (0-20)
  const specificityText = enIntro + enExpl;
  const namedEntities = (specificityText.match(/\b(19|18|20)\d{2}\b|\bArticle\s+\d+|\bSection\s+\d+|\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g) || []).length;
  score += Math.min(20, namedEntities * 2);

  // PYQ quality (0-20)
  const pyqs = Array.isArray(doc.pyqs) ? doc.pyqs : [];
  const realPyqs = pyqs.filter(p => (p?.question?.en || '').length > 60 && !pyqIsGeneric({pyqs: [p]}));
  score += Math.min(20, realPyqs.length * 7);

  // Examples (0-15)
  const examples = Array.isArray(doc.examples) ? doc.examples : [];
  const realExamples = examples.filter(e => enPart(e).length > 80);
  score += Math.min(15, realExamples.length * 5);

  // Revision + tables (0-10)
  if (enPart(doc.revisionNotes).length > 100) score += 5;
  if (Array.isArray(doc.tables) && doc.tables.length > 0) score += 5;

  // Concepts + facts (0-5)
  const nonTemplateConcepts = (doc.concepts || []).filter(c => !/key terminology|fundamental framework/i.test(c));
  score += Math.min(5, nonTemplateConcepts.length);

  return Math.min(100, score);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  await mongoose.connect(MONGO_URI);
  const col = mongoose.connection.db.collection('learningcontents');

  console.log('Scanning 20,328 records...');

  const grades = { A: [], B: [], C: [], D: [] };
  const triggerCounts = {};
  const examGrades = {};
  let processed = 0;

  const cursor = col.find({});
  for await (const doc of cursor) {
    const { grade, triggers } = classify(doc);
    const score = scoreDoc(doc);

    const rec = {
      _id: doc._id.toString(),
      exam: doc.exam,
      subject: doc.subject,
      topic: doc.topic,
      subtopic: doc.subtopic,
      score,
      triggers
    };
    grades[grade].push(rec);

    triggers.forEach(t => { triggerCounts[t] = (triggerCounts[t] || 0) + 1; });

    if (!examGrades[doc.exam]) examGrades[doc.exam] = { A: 0, B: 0, C: 0, D: 0, totalScore: 0, count: 0 };
    examGrades[doc.exam][grade]++;
    examGrades[doc.exam].totalScore += score;
    examGrades[doc.exam].count++;

    processed++;
    if (processed % 2000 === 0) console.log('  processed:', processed);
  }

  await mongoose.disconnect();

  const total = processed;
  console.log(`\nClassification complete. Total: ${total}`);
  console.log(`  A (Coaching Grade): ${grades.A.length} (${pct(grades.A.length, total)}%)`);
  console.log(`  B (Usable):         ${grades.B.length} (${pct(grades.B.length, total)}%)`);
  console.log(`  C (Generic):        ${grades.C.length} (${pct(grades.C.length, total)}%)`);
  console.log(`  D (Placeholder):    ${grades.D.length} (${pct(grades.D.length, total)}%)`);

  // Write JSON results for Phase 2 & 3 scripts to consume
  const base = path.resolve(__dirname, '../../..');
  const scratchDir = path.join(base, 'scratch');
  fs.mkdirSync(scratchDir, { recursive: true });
  fs.writeFileSync(path.join(scratchDir, 'audit_results.json'),
    JSON.stringify({ grades, triggerCounts, examGrades, total }, null, 2));

  // Write CLASSIFICATION_REPORT.md
  let md = `# Content Classification Report\n**NirnayPath 3.0 — Phase 1 Audit**\nGenerated: ${new Date().toISOString().slice(0,10)}\n\n`;
  md += `## Summary\n\n| Grade | Count | % | Description |\n|-------|-------|---|-------------|\n`;
  md += `| A | ${grades.A.length} | ${pct(grades.A.length,total)}% | Coaching Grade |\n`;
  md += `| B | ${grades.B.length} | ${pct(grades.B.length,total)}% | Usable |\n`;
  md += `| C | ${grades.C.length} | ${pct(grades.C.length,total)}% | Generic Template |\n`;
  md += `| D | ${grades.D.length} | ${pct(grades.D.length,total)}% | Placeholder/Garbage |\n`;
  md += `| **Total** | **${total}** | 100% | |\n\n`;

  md += `## Per-Exam Breakdown\n\n| Exam | A | B | C | D | Avg Score |\n|------|---|---|---|---|----------|\n`;
  Object.entries(examGrades).sort().forEach(([exam, eg]) => {
    const avg = eg.count > 0 ? Math.round(eg.totalScore / eg.count) : 0;
    md += `| ${exam} | ${eg.A} | ${eg.B} | ${eg.C} | ${eg.D} | ${avg}/100 |\n`;
  });

  md += `\n## Trigger Frequency (Grade D & C reasons)\n\n| Trigger | Count |\n|---------|-------|\n`;
  Object.entries(triggerCounts).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => {
    md += `| ${k} | ${v} |\n`;
  });

  md += `\n## Grade D Records (first 50 shown)\n\n| Exam | Subject | Subtopic | Triggers |\n|------|---------|----------|----------|\n`;
  grades.D.slice(0,50).forEach(r => {
    md += `| ${r.exam} | ${r.subject} | ${r.subtopic.substring(0,60)} | ${r.triggers.join(', ')} |\n`;
  });
  if (grades.D.length > 50) md += `\n_...and ${grades.D.length - 50} more Grade D records (see audit_results.json)_\n`;

  md += `\n## Grade C Records (first 50 shown)\n\n| Exam | Subject | Subtopic | Score | Triggers |\n|------|---------|----------|-------|----------|\n`;
  grades.C.slice(0,50).forEach(r => {
    md += `| ${r.exam} | ${r.subject} | ${r.subtopic.substring(0,55)} | ${r.score} | ${r.triggers.join(', ')} |\n`;
  });
  if (grades.C.length > 50) md += `\n_...and ${grades.C.length - 50} more Grade C records (see audit_results.json)_\n`;

  fs.writeFileSync(path.join(base, 'CLASSIFICATION_REPORT.md'), md);
  console.log('\nWritten: CLASSIFICATION_REPORT.md');
  console.log('Written: scratch/audit_results.json');
}

function pct(n, total) { return total > 0 ? ((n/total)*100).toFixed(1) : '0.0'; }

run().catch(console.error);
