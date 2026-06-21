/**
 * NirnayPath 3.0 — Phase 2: Coaching Grade Content Rewriter
 * ==========================================================
 * Uses Gemini AI to rewrite every topic from ~1,600 words → 5,000–8,000 words
 * with coaching-grade depth: PYQs, examples, Hindi parity, revision notes,
 * mnemonics, exam strategy, and conceptual clarity.
 *
 * Usage:
 *   node backend/scripts/rewriteToCoachingGrade.js --exam UPSC --subject History --limit 5
 *   node backend/scripts/rewriteToCoachingGrade.js --exam UPSC --subject Geography
 *   node backend/scripts/rewriteToCoachingGrade.js --exam BPSC
 *   node backend/scripts/rewriteToCoachingGrade.js --all
 *
 * Options:
 *   --exam    Filter by exam name (UPSC, BPSC, SSC CGL, etc.)
 *   --subject Filter by subject
 *   --limit   Max records to process (default: all)
 *   --dry     Dry run — print content to console without saving
 *   --skip    Skip N records (for resuming after interruption)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import LearningContent from '../models/LearningContent.js';
import { generateMockCoachingGrade } from './coachingMockGenerator.js';

// ── CLI Args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const getArg = (name) => {
  const idx = args.indexOf(`--${name}`);
  return idx !== -1 ? args[idx + 1] : null;
};
const hasFlag = (name) => args.includes(`--${name}`);

const EXAM_FILTER    = getArg('exam');
const SUBJECT_FILTER = getArg('subject');
const LIMIT          = parseInt(getArg('limit') || '999999');
const DRY_RUN        = hasFlag('dry');
const SKIP           = parseInt(getArg('skip') || '0');
const ALL            = hasFlag('all');
const MOCK           = hasFlag('mock');

// ── Config ────────────────────────────────────────────────────────────────────

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

const useMock = MOCK || !GEMINI_KEY || GEMINI_KEY === 'YOUR_GEMINI_API_KEY_HERE';

let model;
if (!useMock) {
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  });
}




// Progress tracker file
const PROGRESS_FILE = path.join(__dirname, '../.rewrite_progress.json');

function loadProgress() {
  try {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
  } catch {
    return { done: [], failed: [] };
  }
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

// ── Prompt Builder ────────────────────────────────────────────────────────────

function buildPrompt(doc) {
  const subject = doc.subject;
  const topic = doc.topic;
  const subtopic = doc.subtopic;
  const exam = doc.exam;

  return `You are India's best coaching teacher for ${exam} exam preparation. 
Write a COMPLETE, COACHING-GRADE study note on:

EXAM: ${exam}
SUBJECT: ${subject}  
TOPIC: ${topic}
SUBTOPIC: ${subtopic}

MANDATORY REQUIREMENTS:
- English content: minimum 4000 words (target 5000–6000)
- Hindi content: minimum 3000 words (natural coaching Hindi, NOT Google Translate)
- This should feel like notes from a top IAS/SSC coaching center, NOT a Wikipedia article

OUTPUT FORMAT (return valid JSON only, no markdown wrapping):
{
  "introduction": "<English intro (400-600 words)>\\n===HINDI===\\n<Hindi intro (300-500 words)>",
  "detailedExplanation": "<English detailed explanation (2500-3500 words with headings, sub-headings, bullet points>\\n===HINDI===\\n<Hindi detailed explanation (2000-3000 words)>",
  "concepts": [
    "Key Concept 1: Full explanation in English (50-100 words) ===HINDI=== हिंदी में पूरी व्याख्या",
    "Key Concept 2: Full explanation ===HINDI=== हिंदी व्याख्या",
    "Key Concept 3: Full explanation ===HINDI=== हिंदी व्याख्या",
    "Key Concept 4: Full explanation ===HINDI=== हिंदी व्याख्या",
    "Key Concept 5: Full explanation ===HINDI=== हिंदी व्याख्या"
  ],
  "importantFacts": [
    "Important fact 1 with specific data/dates ===HINDI=== हिंदी में तथ्य",
    "Important fact 2 ===HINDI=== हिंदी",
    "Important fact 3 ===HINDI=== हिंदी",
    "Important fact 4 ===HINDI=== हिंदी",
    "Important fact 5 ===HINDI=== हिंदी",
    "Important fact 6 ===HINDI=== हिंदी",
    "Important fact 7 ===HINDI=== हिंदी"
  ],
  "examples": [
    "SOLVED EXAMPLE 1: State the question clearly. Then show step-by-step solution. ===HINDI=== हल किया गया उदाहरण 1: प्रश्न स्पष्ट करें। फिर चरण-दर-चरण हल दिखाएं।",
    "SOLVED EXAMPLE 2: Another worked example with explanation ===HINDI=== हल किया गया उदाहरण 2",
    "SOLVED EXAMPLE 3: Context-based example from PYQ ===HINDI=== हल किया गया उदाहरण 3",
    "MNEMONIC: A memory trick or acronym to remember this topic ===HINDI=== स्मृति सहायक"
  ],
  "revisionNotes": "<English revision sheet (400-600 words) — bullet points of every must-know fact, formula, date, or term. This is the ONLY thing a student should read 30 minutes before the exam.>\\n===HINDI===\\n<Hindi revision sheet (300-500 words) — same bullet points in Hindi>",
  "pyqs": [
    {
      "question": {
        "en": "Full PYQ question text in English (from actual ${exam} papers if possible, else realistic exam-level)",
        "hi": "पूर्ण प्रश्न हिंदी में"
      },
      "options": [
        { "en": "Option A text", "hi": "विकल्प A" },
        { "en": "Option B text", "hi": "विकल्प B" },
        { "en": "Option C text", "hi": "विकल्प C" },
        { "en": "Option D text", "hi": "विकल्प D" }
      ],
      "answer": 0,
      "explanation": {
        "en": "Detailed explanation why the answer is correct (100-200 words)",
        "hi": "विस्तृत व्याख्या हिंदी में (100-150 शब्द)"
      },
      "year": 2023
    },
    {
      "question": { "en": "Second PYQ question", "hi": "दूसरा प्रश्न" },
      "options": [
        { "en": "A", "hi": "A" }, { "en": "B", "hi": "B" },
        { "en": "C", "hi": "C" }, { "en": "D", "hi": "D" }
      ],
      "answer": 1,
      "explanation": { "en": "Explanation", "hi": "व्याख्या" },
      "year": 2022
    },
    {
      "question": { "en": "Third PYQ question", "hi": "तीसरा प्रश्न" },
      "options": [
        { "en": "A", "hi": "A" }, { "en": "B", "hi": "B" },
        { "en": "C", "hi": "C" }, { "en": "D", "hi": "D" }
      ],
      "answer": 2,
      "explanation": { "en": "Explanation", "hi": "व्याख्या" },
      "year": 2021
    }
  ]
}

CRITICAL RULES:
1. The detailedExplanation MUST include: Background → Core Concepts → Historical/Scientific Context → Key People/Events/Formulas → Analysis → Exam Relevance
2. For History topics: include specific dates, rulers, events, causes, effects, significance
3. For Geography: include maps context, data, climate zones, economic aspects  
4. For Science/Tech: include definitions, mechanisms, applications, current affairs link
5. For Economics: include policies, data, committees, reports
6. Hindi content must be natural coaching-center Hindi (like Drishti IAS, Vajiram style), NOT mechanical translation
7. PYQs must be exam-realistic with 4 options and detailed explanations
8. Revision notes must be scannable bullet points — exactly what a student reads 30 min before exam
9. Return ONLY valid JSON — no markdown, no code blocks, no explanation outside JSON`;
}

// ── AI call with retry ────────────────────────────────────────────────────────

async function generateWithRetry(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      // Strip potential markdown code blocks
      let cleaned = text;
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }

      return JSON.parse(cleaned);
    } catch (err) {
      console.warn(`  ⚠️  Attempt ${i + 1} failed: ${err.message.slice(0, 80)}`);
      if (i < retries - 1) {
        await sleep(3000 * (i + 1));
      } else {
        throw err;
      }
    }
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Count words ───────────────────────────────────────────────────────────────
function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  console.log('\n🚀 NirnayPath 3.0 — Phase 2: Coaching Grade Content Rewriter');
  console.log('='.repeat(60));

  if (DRY_RUN) console.log('🔶 DRY RUN MODE — no data will be saved');
  if (EXAM_FILTER) console.log(`📌 Exam filter: ${EXAM_FILTER}`);
  if (SUBJECT_FILTER) console.log(`📌 Subject filter: ${SUBJECT_FILTER}`);
  if (LIMIT < 999999) console.log(`📌 Limit: ${LIMIT}`);

  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connected\n');

  // Build query
  const query = {};
  if (EXAM_FILTER) query.exam = EXAM_FILTER;
  if (SUBJECT_FILTER) query.subject = SUBJECT_FILTER;

  // Sort by subject then subtopic for consistent ordering
  const docs = await LearningContent.find(query)
    .sort({ exam: 1, subject: 1, subtopic: 1 })
    .lean();

  const progress = loadProgress();
  const doneIds = new Set(progress.done);
  const failedIds = new Set(progress.failed);

  // Filter already done
  const pending = docs
    .filter(d => !doneIds.has(d._id.toString()))
    .slice(SKIP, SKIP + LIMIT);

  console.log(`📦 Total matching: ${docs.length}`);
  console.log(`✅ Already done: ${doneIds.size}`);
  console.log(`🔄 Pending now: ${pending.length}`);
  console.log('');

  let successCount = 0;
  let failCount = 0;
  const startTime = Date.now();

  for (let i = 0; i < pending.length; i++) {
    const doc = pending[i];
    const id = doc._id.toString();
    const eta = i > 0 ? Math.round(((Date.now() - startTime) / i) * (pending.length - i) / 1000 / 60) : '?';
    
    console.log(`[${i + 1}/${pending.length}] ${doc.exam} > ${doc.subject} > ${doc.subtopic}`);
    console.log(`    ETA: ~${eta} min remaining`);

    try {
      let content;
      if (useMock) {
        content = generateMockCoachingGrade(doc);
      } else {
        const prompt = buildPrompt(doc);
        content = await generateWithRetry(prompt);
      }

      // Validate minimum quality
      const enWords = countWords(content.introduction + ' ' + content.detailedExplanation);
      const hiSplit = (content.introduction + ' ' + content.detailedExplanation).split('===HINDI===');
      const hiWords = hiSplit.length > 1 ? countWords(hiSplit.slice(1).join(' ')) : 0;

      console.log(`    ✅ EN: ${enWords} words | HI: ${hiWords} words | PYQs: ${content.pyqs?.length || 0}`);

      if (!DRY_RUN) {
        await LearningContent.findByIdAndUpdate(doc._id, {
          $set: {
            introduction:       content.introduction      || doc.introduction,
            detailedExplanation: content.detailedExplanation || doc.detailedExplanation,
            concepts:           content.concepts          || doc.concepts,
            importantFacts:     content.importantFacts    || doc.importantFacts,
            examples:           content.examples          || doc.examples,
            revisionNotes:      content.revisionNotes     || doc.revisionNotes,
            pyqs:               content.pyqs              || doc.pyqs,
          }
        });
        console.log(`    💾 Saved to database`);

        progress.done.push(id);
        saveProgress(progress);
      } else {
        console.log(`    🔶 DRY RUN — would save ${enWords} EN words`);
      }

      successCount++;

      // Rate limit: 1 request per 3 seconds if using actual Gemini
      if (i < pending.length - 1) {
        await sleep(useMock ? 10 : 3000);
      }

    } catch (err) {
      console.error(`    ❌ FAILED: ${err.message.slice(0, 120)}`);
      failCount++;
      progress.failed.push({ id, subtopic: doc.subtopic, error: err.message.slice(0, 100) });
      saveProgress(progress);
      // Continue to next topic
      await sleep(useMock ? 50 : 5000);
    }

    console.log('');
  }

  await mongoose.disconnect();

  // ── Summary ─────────────────────────────────────────────────────────────────
  const elapsed = Math.round((Date.now() - startTime) / 1000 / 60);
  console.log('='.repeat(60));
  console.log('📊 REWRITE SESSION COMPLETE');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed:  ${failCount}`);
  console.log(`⏱️  Time:   ${elapsed} minutes`);
  console.log('');

  if (failCount > 0) {
    console.log('Failed topics saved to .rewrite_progress.json');
    console.log('Re-run with --skip to retry failed ones.');
  }
}

run().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
