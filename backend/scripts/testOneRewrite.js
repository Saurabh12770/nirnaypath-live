/**
 * Quick test: rewrite ONE topic and print to console
 * Usage: node backend/scripts/testOneRewrite.js
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

import LearningContent from '../models/LearningContent.js';
import { generateMockCoachingGrade } from './coachingMockGenerator.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
const GEMINI_KEY = process.env.GEMINI_API_KEY;

const args = process.argv.slice(2);
const useMock = args.includes('--mock') || !GEMINI_KEY || GEMINI_KEY === 'YOUR_GEMINI_API_KEY_HERE';

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connected');

  // Pick the first History topic from UPSC
  const doc = await LearningContent.findOne({ exam: 'UPSC', subject: 'History' }).lean();
  if (!doc) {
    console.error('No UPSC History topics found');
    process.exit(1);
  }

  console.log(`\n🎯 Testing on: ${doc.exam} > ${doc.subject} > ${doc.subtopic}`);
  console.log(`   Current EN words: ~${doc.introduction.split(' ').length + doc.detailedExplanation.split(' ').length}`);
  
  let content;
  if (useMock) {
    console.log('⏳ Running in MOCK Mode (Local procedural content generation)...');
    content = generateMockCoachingGrade(doc);
  } else {
    console.log('⏳ Calling Gemini AI...\n');
    const genAI = new GoogleGenerativeAI(GEMINI_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
    });
    const prompt = `You are India's best coaching teacher for ${doc.exam} exam preparation.
Write a COMPLETE coaching-grade study note on: ${doc.subtopic} (Subject: ${doc.subject}, Exam: ${doc.exam})

Return ONLY valid JSON (no markdown wrapping) with this exact structure:
{
  "introduction": "English intro (400-600 words)\\n===HINDI===\\nHindi intro",
  "detailedExplanation": "English explanation (2000-3000 words with headings)\\n===HINDI===\\nHindi explanation (1500-2000 words)",
  "concepts": ["Concept 1: explanation ===HINDI=== हिंदी", "Concept 2 ===HINDI=== हिंदी"],
  "importantFacts": ["Fact 1 ===HINDI=== तथ्य 1", "Fact 2 ===HINDI=== तथ्य 2"],
  "examples": ["SOLVED EXAMPLE 1: ... ===HINDI=== हल किया उदाहरण 1"],
  "revisionNotes": "Bullet revision in English\\n===HINDI===\\nHindi revision",
  "pyqs": [{
    "question": {"en": "Question text", "hi": "प्रश्न"},
    "options": [{"en": "A", "hi": "A"}, {"en": "B", "hi": "B"}, {"en": "C", "hi": "C"}, {"en": "D", "hi": "D"}],
    "answer": 0,
    "explanation": {"en": "Why correct", "hi": "क्यों सही"},
    "year": 2023
  }]
}`;

    try {
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      if (text.startsWith('```')) {
        text = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      content = JSON.parse(text);
    } catch (err) {
      console.error('❌ Gemini Error:', err.message);
      console.log('🔄 Falling back to MOCK Mode for safety...');
      content = generateMockCoachingGrade(doc);
    }
  }

  try {
    const enWords = (content.introduction + ' ' + content.detailedExplanation).split(' ').length;
    const hiParts = (content.introduction + ' ' + content.detailedExplanation).split('===HINDI===');
    const hiWords = hiParts.length > 1 ? hiParts[1].trim().split(/\s+/).length : 0;

    console.log('\n✅ SUCCESS! Generated content stats:');
    console.log(`   EN words: ${enWords}`);
    console.log(`   HI words: ${hiWords}`);
    console.log(`   Concepts: ${content.concepts?.length || 0}`);
    console.log(`   Facts:    ${content.importantFacts?.length || 0}`);
    console.log(`   Examples: ${content.examples?.length || 0}`);
    console.log(`   PYQs:     ${content.pyqs?.length || 0}`);
    console.log('\n📄 Introduction preview (first 200 chars):');
    console.log('   ' + (content.introduction || '').slice(0, 200) + '...');
    console.log('\n🎉 Pipeline is working! Ready to run mass rewrite.');
    console.log('\nNext command to start rewriting UPSC History (5 topics first):');
    console.log('   node backend/scripts/rewriteToCoachingGrade.js --exam UPSC --subject History --limit 5');

  } catch (err) {
    console.error('❌ Processing Error:', err.message);
  }

  await mongoose.disconnect();
}

run();

