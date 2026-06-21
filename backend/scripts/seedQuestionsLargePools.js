import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
import Question from '../models/Question.js';

const QUESTIONS_DIR = path.resolve(__dirname, '../../data/questions');

async function seed() {
  console.log('\n======================================================');
  console.log('  LARGE POOL QUESTIONS SEEDER (BPSC, Banking, SSC CHSL)');
  console.log('======================================================\n');

  console.log(`🔌 Connecting to: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected.\n');

  // Helper function to extract question text & options from JSON item
  function parseQuestionItem(item, defaultSubject) {
    let qEn = '';
    let qHi = '';

    if (item.question_en) {
      qEn = item.question_en;
      qHi = item.question_hi || '';
    } else if (typeof item.question === 'object' && item.question !== null) {
      qEn = item.question.en || '';
      qHi = item.question.hi || '';
    } else if (typeof item.question === 'string') {
      qEn = item.question;
      qHi = item.question_hi || '';
    }

    if (!qEn && !qHi) return null;

    let options = [];
    if (item.options_en && Array.isArray(item.options_en)) {
      const optsEn = item.options_en;
      const optsHi = item.options_hi || [];
      const maxLen = Math.max(optsEn.length, optsHi.length);
      for (let i = 0; i < maxLen; i++) {
        options.push({
          en: optsEn[i] || '',
          hi: optsHi[i] || '',
        });
      }
    } else if (Array.isArray(item.options)) {
      if (item.options.length > 0) {
        const firstOpt = item.options[0];
        if (typeof firstOpt === 'object' && firstOpt !== null) {
          if (firstOpt.text && typeof firstOpt.text === 'object') {
            options = item.options.map(o => ({
              en: o.text.en || '',
              hi: o.text.hi || ''
            }));
          } else {
            options = item.options.map(o => ({
              en: o.en || '',
              hi: o.hi || ''
            }));
          }
        } else if (typeof firstOpt === 'string') {
          const optsEn = item.options;
          const optsHi = item.options_hi || [];
          const maxLen = Math.max(optsEn.length, optsHi.length);
          for (let i = 0; i < maxLen; i++) {
            options.push({
              en: optsEn[i] || '',
              hi: optsHi[i] || '',
            });
          }
        }
      }
    }

    let expEn = '';
    let expHi = '';
    if (item.explanation_en) {
      expEn = item.explanation_en;
      expHi = item.explanation_hi || '';
    } else if (typeof item.explanation === 'object' && item.explanation !== null) {
      expEn = item.explanation.en || '';
      expHi = item.explanation.hi || '';
    } else if (typeof item.explanation === 'string') {
      expEn = item.explanation;
      expHi = item.explanation_hi || '';
    }

    let answerIndex = 0;
    if (typeof item.correctAnswer === 'number') {
      answerIndex = item.correctAnswer;
    } else if (typeof item.correct_answer === 'string') {
      const idx = options.findIndex(o => o.en === item.correct_answer || o.hi === item.correct_answer);
      if (idx !== -1) {
        answerIndex = idx;
      } else {
        const code = item.correct_answer.toLowerCase();
        if (code === 'a' || code === '0') answerIndex = 0;
        else if (code === 'b' || code === '1') answerIndex = 1;
        else if (code === 'c' || code === '2') answerIndex = 2;
        else if (code === 'd' || code === '3') answerIndex = 3;
      }
    } else if (typeof item.correct_answer === 'number') {
      answerIndex = item.correct_answer;
    }

    return {
      subject: item.subject || defaultSubject,
      topic: item.topic || 'General',
      subtopic: item.subtopic || item.topic || 'General Introduction',
      difficulty: ['easy', 'medium', 'hard'].includes((item.difficulty || 'medium').toLowerCase()) ? (item.difficulty || 'medium').toLowerCase() : 'medium',
      question: { en: qEn, hi: qHi },
      options,
      answer: answerIndex,
      explanation: { en: expEn, hi: expHi }
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // 1. SEED BPSC BIHAR-SPECIAL QUESTIONS (Target: 1,500+ Questions)
  // ═══════════════════════════════════════════════════════════════════
  console.log('📖 Processing BPSC Bihar Special questions...');
  const bpscExist = await Question.find({ exam: 'BPSC' }, { 'question.en': 1 }).lean();
  const bpscSet = new Set(bpscExist.map(q => q.question.en.trim()));
  console.log(`ℹ️ Existing BPSC questions in DB: ${bpscSet.size}`);

  const biharFilePath = path.join(QUESTIONS_DIR, 'bihar.json');
  if (fs.existsSync(biharFilePath)) {
    const biharData = JSON.parse(fs.readFileSync(biharFilePath, 'utf-8'));
    const biharRaw = Array.isArray(biharData) ? biharData : biharData.questions;
    console.log(`🔍 Total questions found in bihar.json: ${biharRaw.length}`);

    const bpscInsert = [];
    for (const item of biharRaw) {
      const parsed = parseQuestionItem(item, 'Bihar Special');
      if (!parsed) continue;

      if (!bpscSet.has(parsed.question.en.trim())) {
        bpscInsert.push({
          exam: 'BPSC',
          ...parsed
        });
      }
    }

    console.log(`📈 Uncovered BPSC questions to insert: ${bpscInsert.length}`);
    if (bpscInsert.length > 0) {
      // Limit to 2000 questions to avoid huge DB size but satisfy "1,000+ questions"
      const limitToSeed = bpscInsert.slice(0, 2000);
      const chunkSize = 500;
      for (let i = 0; i < limitToSeed.length; i += chunkSize) {
        await Question.insertMany(limitToSeed.slice(i, i + chunkSize));
      }
      console.log(`✅ Seeded ${limitToSeed.length} questions for BPSC.`);
    }
  } else {
    console.warn('⚠️ bihar.json not found in data/questions/');
  }

  // ═══════════════════════════════════════════════════════════════════
  // 2. SEED SSC CHSL QUESTIONS (Target: 1,200+ Questions)
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n📖 Processing SSC CHSL mock questions...');
  const chslExist = await Question.find({ exam: 'SSC CHSL' }, { 'question.en': 1 }).lean();
  const chslSet = new Set(chslExist.map(q => q.question.en.trim()));
  console.log(`ℹ️ Existing SSC CHSL questions in DB: ${chslSet.size}`);

  const chslFiles = [
    { file: 'math.json', subject: 'Math' },
    { file: 'reasoning.json', subject: 'Reasoning' },
    { file: 'english.json', subject: 'English' },
    { file: 'general_awareness.json', subject: 'General Awareness' }
  ];

  const chslInsert = [];
  for (const { file, subject } of chslFiles) {
    const filePath = path.join(QUESTIONS_DIR, file);
    if (!fs.existsSync(filePath)) continue;

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const raw = Array.isArray(data) ? data : data.questions;
    console.log(`🔍 Processing ${file} (found ${raw.length} questions)...`);

    let countAddedFromFile = 0;
    for (const item of raw) {
      if (countAddedFromFile >= 350) break; // 350 per subject = 1,400 total

      const parsed = parseQuestionItem(item, subject);
      if (!parsed) continue;

      if (!chslSet.has(parsed.question.en.trim())) {
        chslInsert.push({
          exam: 'SSC CHSL',
          ...parsed
        });
        countAddedFromFile++;
      }
    }
  }

  console.log(`📈 Uncovered SSC CHSL questions to insert: ${chslInsert.length}`);
  if (chslInsert.length > 0) {
    const chunkSize = 500;
    for (let i = 0; i < chslInsert.length; i += chunkSize) {
      await Question.insertMany(chslInsert.slice(i, i + chunkSize));
    }
    console.log(`✅ Seeded ${chslInsert.length} questions for SSC CHSL.`);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 3. SEED BANKING QUESTIONS (Target: 1,200+ Questions)
  // ═══════════════════════════════════════════════════════════════════
  console.log('\n📖 Processing Banking questions...');
  const bankingExist = await Question.find({ exam: 'Banking' }, { 'question.en': 1 }).lean();
  const bankingSet = new Set(bankingExist.map(q => q.question.en.trim()));
  console.log(`ℹ️ Existing Banking questions in DB: ${bankingSet.size}`);

  const bankingFiles = [
    { file: 'math.json', subject: 'Math' },
    { file: 'reasoning.json', subject: 'Reasoning' },
    { file: 'english.json', subject: 'English' }
  ];

  const bankingInsert = [];
  for (const { file, subject } of bankingFiles) {
    const filePath = path.join(QUESTIONS_DIR, file);
    if (!fs.existsSync(filePath)) continue;

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const raw = Array.isArray(data) ? data : data.questions;
    console.log(`🔍 Processing ${file} (found ${raw.length} questions)...`);

    let countAddedFromFile = 0;
    for (const item of raw) {
      if (countAddedFromFile >= 450) break; // 450 per subject = 1,350 total

      const parsed = parseQuestionItem(item, subject);
      if (!parsed) continue;

      if (!bankingSet.has(parsed.question.en.trim())) {
        bankingInsert.push({
          exam: 'Banking',
          ...parsed
        });
        countAddedFromFile++;
      }
    }
  }

  console.log(`📈 Uncovered Banking questions to insert: ${bankingInsert.length}`);
  if (bankingInsert.length > 0) {
    const chunkSize = 500;
    for (let i = 0; i < bankingInsert.length; i += chunkSize) {
      await Question.insertMany(bankingInsert.slice(i, i + chunkSize));
    }
    console.log(`✅ Seeded ${bankingInsert.length} questions for Banking.`);
  }

  console.log('\n======================================================');
  console.log('  🎉 ALL LARGE POOL SEEDINGS COMPLETE!');
  console.log('======================================================\n');

  await mongoose.disconnect();
  console.log('🔌 Disconnected.');
}

seed().catch(console.error);
