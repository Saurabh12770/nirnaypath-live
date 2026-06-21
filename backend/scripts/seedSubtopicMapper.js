// Optimized Subtopic Question Mapper
// Resolves normalization gaps by finding, copying, and re-tagging relevant questions
// to match the exact syllabus subtopic names. Uses a high-performance in-memory cache.

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

const STOP_WORDS = new Set([
  'and', 'or', 'the', 'in', 'of', 'for', 'with', 'by', 'a', 'an', 'to', 'from', 'at', 'on', 'its', 'their', 'about',
  'concept', 'concepts', 'basics', 'introduction', 'overview', 'theory', 'study', 'system', 'systems', 'type', 'types',
  'structure', 'classification', 'analysis', 'state', 'gk', 'general', 'awareness', 'subject', 'topic', 'subtopic',
  'exam', 'test', 'question', 'questions', 'key', 'figures', 'major', 'important', 'various', 'basic', 'fundamental',
  'and/or', 'etc', 'etc.', 'age', 'period', 'aspects', 'features', 'salient', 'characteristics', 'practice', 'set',
  'mock', 'paper', 'papers', 'level'
]);

function getKeywords(subtopic, topic) {
  const mainPart = subtopic.split(/—|-|:|&|\(|\)/)[0].trim();
  const words = `${mainPart} ${topic}`
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOP_WORDS.has(w));
  return [...new Set(words)];
}

function getSubjectRegex(syllabusSubject) {
  const s = syllabusSubject.toLowerCase().trim();
  if (s.includes('math') || s.includes('quant') || s.includes('arithmetic')) {
    return /math|quantitative|aptitude|arithmetic/i;
  }
  if (s.includes('reasoning') || s.includes('intelligence') || s.includes('logic')) {
    return /reasoning|intelligence|logic|aptitude/i;
  }
  if (s.includes('english')) {
    return /english/i;
  }
  if (s.includes('history')) {
    return /history/i;
  }
  if (s.includes('geography')) {
    return /geography/i;
  }
  if (s.includes('polity') || s.includes('constitution')) {
    return /polity|constitution/i;
  }
  if (s.includes('economy') || s.includes('economics')) {
    return /economy|economics/i;
  }
  if (s.includes('science') || s.includes('technology') || s.includes('tech') || s.includes('env') || s.includes('ecology')) {
    return /science|technology|tech|environment|ecology|biology|physics|chemistry/i;
  }
  if (s.includes('special') || s.includes('gk') || s.includes('general awareness') || s.includes('general knowledge')) {
    return /special|gk|awareness|knowledge|current|general/i;
  }
  return new RegExp(syllabusSubject, 'i');
}

async function runMapper() {
  console.log('\n======================================================');
  console.log('  🔍 SYLLABUS SUBTOPIC AUTO-NORMALIZATION MAPPER');
  console.log('======================================================\n');

  console.log(`🔌 Connecting to: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected.\n');

  const syllabusDir = path.resolve(__dirname, '../../data/syllabus');
  const files = fs.readdirSync(syllabusDir).filter(f => f.endsWith('.json') && f !== 'index.json');

  const insertChunkLimit = 1000;
  let insertQueue = [];
  let totalInserted = 0;

  for (const file of files) {
    const raw = fs.readFileSync(path.join(syllabusDir, file), 'utf-8');
    const data = JSON.parse(raw);
    const examName = data.exam;

    console.log(`📖 Processing Exam: ${examName}...`);

    // 1. Pre-fetch and cache existing questions by uppercase subtopic key to avoid heavy DB queries in loop
    console.log('   📦 Building prefix-matching question cache...');
    const allQ = await Question.find({ exam: examName }, { subtopic: 1, question: 1, options: 1, answer: 1, explanation: 1, difficulty: 1, subject: 1, topic: 1 }).lean();
    const qCache = {};
    for (const q of allQ) {
      const key = q.subtopic.trim().toUpperCase();
      if (!qCache[key]) qCache[key] = [];
      qCache[key].push(q);
    }
    console.log(`   ✅ Cache loaded with ${allQ.length} questions.`);

    // 2. Identify missing subtopics from the expanded syllabus
    const existingSubtopics = await Question.distinct('subtopic', { exam: examName });
    const existingSet = new Set(existingSubtopics.map(s => s.trim().toUpperCase()));

    let totalSubtopics = 0;
    let mappedCount = 0;
    let skippedCount = 0;

    if (data.subjects) {
      for (const subj of data.subjects) {
        if (!subj.topics) continue;
        for (const topic of subj.topics) {
          if (!topic.subtopics) continue;
          for (const sub of topic.subtopics) {
            totalSubtopics++;
            const key = sub.trim().toUpperCase();

            // Skip if questions are already registered with this exact subtopic name
            if (existingSet.has(key)) {
              skippedCount++;
              continue;
            }

            // Extract base subtopic name before " — Part"
            const baseSubtopic = sub.split(' — Part ')[0].trim();
            const baseKey = baseSubtopic.toUpperCase();

            const questionsFound = [];
            const seenTexts = new Set();

            function addQuestions(qs) {
              for (const q of qs) {
                const textKey = q.question.en.trim().toLowerCase();
                if (!seenTexts.has(textKey)) {
                  seenTexts.add(textKey);
                  questionsFound.push(q);
                  if (questionsFound.length >= 2) return true; // Target 2 questions per subtopic part
                }
              }
              return false;
            }

            // Target base subtopic cache first
            if (qCache[baseKey]) {
              addQuestions(qCache[baseKey]);
            }

            // Fallback: search general keywords in cache if base subtopic had no questions
            if (questionsFound.length < 2) {
              const keywords = getKeywords(sub, topic.name);
              if (keywords.length > 0) {
                const regex = new RegExp(keywords.join('|'), 'i');
                const matchedCacheKeys = Object.keys(qCache).filter(k => regex.test(k));
                for (const k of matchedCacheKeys) {
                  if (addQuestions(qCache[k])) break;
                }
              }
            }

            // Final fallback: fallback to database queries (rarely hit)
            if (questionsFound.length < 2) {
              const subjectRegex = getSubjectRegex(subj.name);
              const results = await Question.find({
                exam: examName,
                subject: subjectRegex
              }).limit(5).lean();
              addQuestions(results);
            }

            // Queue the documents for insertion
            for (const q of questionsFound) {
              insertQueue.push({
                exam: examName,
                subject: subj.name,
                topic: topic.name,
                subtopic: sub,
                difficulty: q.difficulty || 'medium',
                question: {
                  en: q.question.en,
                  hi: q.question.hi || ''
                },
                options: q.options.map(o => ({
                  en: o.en,
                  hi: o.hi || ''
                })),
                answer: q.answer,
                explanation: {
                  en: q.explanation?.en || '',
                  hi: q.explanation?.hi || ''
                }
              });

              if (insertQueue.length >= insertChunkLimit) {
                await Question.insertMany(insertQueue);
                totalInserted += insertQueue.length;
                insertQueue = [];
              }
            }
            mappedCount++;
          }
        }
      }
    }

    console.log(`✨ Exam ${examName} processing complete.`);
    console.log(`   Total syllabus subtopics: ${totalSubtopics}`);
    console.log(`   Previously covered: ${skippedCount}`);
    console.log(`   Newly mapped: ${mappedCount}`);
    console.log('');
  }

  // Insert any remaining in queue
  if (insertQueue.length > 0) {
    await Question.insertMany(insertQueue);
    totalInserted += insertQueue.length;
  }

  await mongoose.disconnect();
  console.log('🔌 Disconnected.');
  console.log('\n======================================================');
  console.log(`  🎉 AUTO-NORMALIZATION MAPPING COMPLETE! Seeded ${totalInserted} questions.`);
  console.log('======================================================\n');
}

runMapper().catch(console.error);
