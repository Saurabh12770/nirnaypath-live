import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
const SYLLABUS_DIR = path.resolve(__dirname, '../data/syllabus');

async function testLearnHubContent() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  const lcCol = db.collection('learningcontents');

  console.log('======================================================');
  console.log('  LearnHub API Verification — State PCS & Core Exams');
  console.log('======================================================\n');

  const testCases = [
    // State PCS — the historically broken one (STATE-PCS naming mismatch bug)
    { exam: 'State PCS', subject: 'History', topic: 'Indian History & Culture', label: 'State PCS History' },
    { exam: 'State PCS', subject: 'State GK', topic: 'State History, Art & Culture', label: 'State PCS State GK' },
    { exam: 'State PCS', subject: 'Polity', topic: 'Indian Governance & Administration', label: 'State PCS Polity' },
    // UPSC
    { exam: 'UPSC', subject: 'History', topic: 'Ancient India', label: 'UPSC History' },
    { exam: 'UPSC', subject: 'Geography', topic: 'Indian Geography', label: 'UPSC Geography' },
    // BPSC
    { exam: 'BPSC', subject: 'Bihar Special', topic: 'Bihar History', label: 'BPSC Bihar Special' },
    // SSC CGL
    { exam: 'SSC CGL', subject: 'Mathematics', topic: 'Arithmetic', label: 'SSC CGL Mathematics' },
    { exam: 'SSC CGL', subject: 'Reasoning', topic: 'Verbal Reasoning', label: 'SSC CGL Reasoning' },
    // Banking
    { exam: 'Banking', subject: 'Mathematics', topic: 'Quantitative Aptitude & DI', label: 'Banking Mathematics' },
    // Railway
    { exam: 'Railway', subject: 'Mathematics', topic: 'Arithmetic & Algebra', label: 'Railway Mathematics' },
  ];

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    // Query the learningcontents collection (same logic as learn.js route)
    const count = await lcCol.countDocuments({
      exam: tc.exam,
      subject: tc.subject,
      topic: tc.topic
    });

    if (count > 0) {
      console.log(`✅ PASS  [${tc.label}]: ${count} content docs found for "${tc.exam}" | "${tc.subject}" | "${tc.topic}"`);
      passed++;
    } else {
      console.log(`❌ FAIL  [${tc.label}]: 0 docs — no content for "${tc.exam}" | "${tc.subject}" | "${tc.topic}"`);
      failed++;
    }
  }

  console.log('\n======================================================');
  console.log(`  Results: ${passed} passed, ${failed} failed`);

  // Also check no STATE-PCS orphan documents remain
  console.log('\n--- Checking for orphaned STATE-PCS documents ---');
  const orphanCount = await lcCol.countDocuments({ exam: /STATE.?PCS/i });
  if (orphanCount === 0) {
    console.log('✅ No orphaned STATE-PCS documents found.');
  } else {
    console.log(`⚠️  Found ${orphanCount} documents with exam matching STATE-PCS (check and clean!)`);
    const orphans = await lcCol.find({ exam: /STATE.?PCS/i }).limit(3).toArray();
    orphans.forEach(o => console.log(`   - ID: ${o._id} exam: "${o.exam}" subtopic: "${o.subtopic}"`));
  }

  // Final document counts
  console.log('\n--- Final DB State ---');
  const qCount = await db.collection('questions').countDocuments();
  const lcCount = await lcCol.countDocuments();
  const stateCount = await db.collection('questions').countDocuments({ exam: 'State PCS' });
  console.log(`Questions Total:       ${qCount}`);
  console.log(`LearningContent Total: ${lcCount}`);
  console.log(`State PCS Questions:   ${stateCount}`);

  await mongoose.disconnect();
  console.log('\n======================================================\n');
}

testLearnHubContent().catch(console.error);
