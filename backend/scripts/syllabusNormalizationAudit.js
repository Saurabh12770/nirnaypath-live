// Syllabus Normalization Audit Script
// Verifies that every syllabus entry in data/syllabus/*.json is represented in the DB

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
import LearningContent from '../models/LearningContent.js';
import Question from '../models/Question.js';

async function normalize() {
  console.log('🔌 Connecting...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected.\n');

  const syllabusDir = path.resolve(__dirname, '../../data/syllabus');
  const files = fs.readdirSync(syllabusDir).filter(f => f.endsWith('.json') && f !== 'index.json');

  const report = {};

  for (const file of files) {
    const raw = fs.readFileSync(path.join(syllabusDir, file), 'utf-8');
    const data = JSON.parse(raw);
    const examName = data.exam;

    const syllabusSubtopics = [];
    if (data.subjects) {
      for (const subj of data.subjects) {
        if (!subj.topics) continue;
        for (const topic of subj.topics) {
          if (!topic.subtopics) continue;
          for (const sub of topic.subtopics) {
            syllabusSubtopics.push({
              subject: subj.name,
              topic: topic.name,
              subtopic: sub
            });
          }
        }
      }
    }

    // Check which are in DB
    const dbContent = await LearningContent.find({ exam: examName }, { subtopic: 1 }).lean();
    const dbContentSet = new Set(dbContent.map(d => d.subtopic.trim().toUpperCase()));

    const dbQuestions = await Question.distinct('subtopic', { exam: examName });
    const dbQSet = new Set(dbQuestions.map(s => s.trim().toUpperCase()));

    const notInContent = [];
    const notInQuestions = [];

    for (const item of syllabusSubtopics) {
      const key = item.subtopic.trim().toUpperCase();
      if (!dbContentSet.has(key)) notInContent.push(item.subtopic);
      if (!dbQSet.has(key)) notInQuestions.push(item.subtopic);
    }

    report[examName] = {
      totalSyllabusSubtopics: syllabusSubtopics.length,
      coveredInLearningContent: dbContent.length,
      subtopicsMissingFromContent: notInContent.length,
      subtopicsMissingFromQuestions: notInQuestions.length,
      missingContentList: notInContent.slice(0, 10), // Only show first 10
      missingQuestionsList: notInQuestions.slice(0, 10)
    };

    const status = notInContent.length === 0 && notInQuestions.length === 0 ? '✅ FULL MATCH' : '⚠️ GAPS FOUND';
    console.log(`📚 ${examName}: ${status}`);
    console.log(`   Syllabus: ${syllabusSubtopics.length} subtopics`);
    console.log(`   DB Content: ${dbContent.length} docs | Missing from content: ${notInContent.length}`);
    console.log(`   DB Questions: ${dbQuestions.length} distinct subtopics | Missing from questions: ${notInQuestions.length}`);
    if (notInContent.length > 0) {
      console.log(`   Missing Content (first 5): ${notInContent.slice(0, 5).join(', ')}`);
    }
    if (notInQuestions.length > 0) {
      console.log(`   Missing Questions (first 5): ${notInQuestions.slice(0, 5).join(', ')}`);
    }
    console.log('');
  }

  console.log('\n=== FULL NORMALIZATION REPORT ===');
  console.log(JSON.stringify(report, null, 2));

  await mongoose.disconnect();
  console.log('\n🔌 Disconnected.');
}

normalize().catch(console.error);
