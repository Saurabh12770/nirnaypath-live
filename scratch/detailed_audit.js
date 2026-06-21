import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';

async function audit() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const exams = ['UPSC', 'BPSC', 'State PCS', 'SSC CGL', 'SSC CHSL', 'Railway', 'Banking'];

  console.log('\n======================================================');
  console.log('  📊 NIRNAYPATH RECORD & DENSITY AUDIT');
  console.log('======================================================\n');

  for (const exam of exams) {
    // 1. LearningContent count
    const lcCount = await db.collection('learningcontents').countDocuments({ exam });

    // 2. Question count
    const qCount = await db.collection('questions').countDocuments({ exam });

    // 3. Topics and Subtopics counts in LearningContent
    const distinctTopicsLc = await db.collection('learningcontents').distinct('topic', { exam });
    const distinctSubtopicsLc = await db.collection('learningcontents').distinct('subtopic', { exam });

    // 4. Topics and Subtopics counts in Questions
    const distinctTopicsQ = await db.collection('questions').distinct('topic', { exam });
    const distinctSubtopicsQ = await db.collection('questions').distinct('subtopic', { exam });

    // Union of topics and subtopics across content & questions to get the complete count
    const allTopics = new Set([...distinctTopicsLc, ...distinctTopicsQ]);
    const allSubtopics = new Set([...distinctSubtopicsLc, ...distinctSubtopicsQ]);

    // Calculate content density
    const subtopicCount = distinctSubtopicsLc.length; // Number of unique syllabus subtopics covered in learning content
    const density = subtopicCount > 0 ? (lcCount / subtopicCount).toFixed(2) : '0.00';

    console.log(`📌 EXAM: ${exam}`);
    console.log(`   - Learning Content Records: ${lcCount}`);
    console.log(`   - Total Questions (MCQs):   ${qCount}`);
    console.log(`   - Unique Topics (DB):       ${allTopics.size}`);
    console.log(`   - Unique Subtopics (DB):    ${allSubtopics.size}`);
    console.log(`   - Syllabus Subtopics (LC):  ${subtopicCount}`);
    console.log(`   - Current Content Density:  ${density} (Target: 15+)`);
    console.log('');
  }

  await mongoose.disconnect();
}

audit().catch(console.error);
