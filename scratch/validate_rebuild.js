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

// Subject normalizer (copy of what's in tests.js)
const normalizeSearchCriteria = (exam, subject) => {
  let normalizedExam = exam;
  let normalizedSubject = subject;

  if (exam) {
    const eUpper = exam.toUpperCase().trim();
    if (eUpper === 'UPSC') normalizedExam = 'UPSC';
    else if (eUpper === 'BPSC') normalizedExam = 'BPSC';
    else if (eUpper === 'SSC-CGL' || eUpper === 'SSC CGL') normalizedExam = 'SSC CGL';
    else if (eUpper === 'SSC-CHSL' || eUpper === 'SSC CHSL') normalizedExam = 'SSC CHSL';
    else if (eUpper === 'RAILWAY') normalizedExam = 'Railway';
    else if (eUpper === 'BANKING') normalizedExam = 'Banking';
    else if (eUpper === 'STATE-PCS' || eUpper === 'STATE PCS') normalizedExam = 'State PCS';
  }

  if (subject) {
    const sClean = subject.trim().toLowerCase();
    
    if (sClean.includes('history')) {
      normalizedSubject = 'History';
    } else if (sClean.includes('polity')) {
      normalizedSubject = 'Polity';
    } else if (sClean.includes('geography')) {
      normalizedSubject = 'Geography';
    } else if (sClean.includes('economics') || sClean.includes('economy')) {
      normalizedSubject = 'Economics';
    } else if (sClean.includes('ethics')) {
      normalizedSubject = 'Ethics';
    } else if (sClean.includes('agriculture')) {
      normalizedSubject = 'Agriculture';
    } else if ((sClean.includes('art') && sClean.includes('culture')) || sClean.includes('artculture') || sClean.includes('art-culture')) {
      normalizedSubject = 'Art & Culture';
    } else if (sClean.includes('environment')) {
      normalizedSubject = 'Environment';
    } else if (sClean.includes('general science') || sClean === 'science' || sClean.includes('science & technology') || sClean.includes('chemistry')) {
      normalizedSubject = 'Science';
    } else if (sClean.includes('reasoning') || sClean.includes('intelligence')) {
      normalizedSubject = 'Reasoning';
    } else if (sClean.includes('aptitude') || sClean.includes('quantitative') || sClean.includes('math') || sClean.includes('mathematics')) {
      normalizedSubject = 'Mathematics';
    } else if (sClean.includes('english')) {
      normalizedSubject = 'English';
    } else if (sClean.includes('computer')) {
      normalizedSubject = 'Computer Science';
    } else if (sClean.includes('hindi')) {
      normalizedSubject = 'Hindi';
    } else if (sClean.includes('bihar')) {
      normalizedSubject = 'Bihar Special';
    } else if (sClean.includes('state gk') || sClean.includes('state-gk') || sClean.includes('stategk')) {
      normalizedSubject = 'State GK';
    } else if (sClean.includes('current')) {
      normalizedSubject = 'Current Affairs';
    } else if (sClean.includes('general awareness')) {
      normalizedSubject = 'General Awareness';
    } else if (sClean.includes('police')) {
      normalizedSubject = 'Police Science';
    } else if (sClean.includes('social science') || sClean.includes('social_science')) {
      normalizedSubject = 'Social Science';
    }
  }

  return { exam: normalizedExam, subject: normalizedSubject };
};

async function testEngine() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  const qCol = db.collection('questions');
  const lcCol = db.collection('learningcontents');

  console.log('======================================================');
  console.log('  NirnayPath Rebuild Validation Runner');
  console.log('======================================================\n');

  // Test 1: Subject Mock Test Generation for all supported exams
  const testExams = ['UPSC', 'BPSC', 'SSC CGL', 'Railway', 'State PCS'];
  
  console.log('--- TEST 1: SIMULATING SUBJECT MOCK TESTS ---');
  for (const examId of testExams) {
    // Read syllabus file to get active subjects
    const fileBase = examId.toLowerCase().replace(/\s+/g, '-');
    const syllabusPath = path.join(SYLLABUS_DIR, `${fileBase}.json`);
    if (!fs.existsSync(syllabusPath)) continue;

    const syllabus = JSON.parse(fs.readFileSync(syllabusPath, 'utf8'));
    const subject = syllabus.subjects[0]; // test first subject
    const subjectName = subject.name;

    const { exam: normExam, subject: normSubject } = normalizeSearchCriteria(examId, subjectName);
    console.log(`Exam: "${examId}" ➔ normalized to "${normExam}"`);
    console.log(`Subject: "${subjectName}" ➔ normalized to "${normSubject}"`);

    // Run sample query
    const matchQuery = { exam: normExam, subject: normSubject };
    const sampledQuestions = await qCol.aggregate([
      { $match: matchQuery },
      { $sample: { size: 10 } }
    ]).toArray();

    console.log(`- Retrieved ${sampledQuestions.length} questions`);

    // Check for duplicate question texts in the sampled list
    const questionTexts = sampledQuestions.map(q => q.question.en);
    const uniqueTexts = new Set(questionTexts);
    const dupCount = questionTexts.length - uniqueTexts.size;

    if (dupCount > 0) {
      console.error(`  ❌ ERROR: Found ${dupCount} duplicate questions in simulated test!`);
    } else {
      console.log(`  ✅ SUCCESS: 0 duplicate questions in session.`);
    }
  }

  // Test 2: LearnHub Content coverage check for all syllabus subtopics
  console.log('\n--- TEST 2: CHECKING LEARNHUB CONTENT ACCESSIBILITY & COVERAGE ---');
  const files = fs.readdirSync(SYLLABUS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
  
  let totalSubtopics = 0;
  let missingContentCount = 0;
  
  for (const file of files) {
    const filePath = path.join(SYLLABUS_DIR, file);
    const syllabus = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const exam = syllabus.exam;
    
    console.log(`Checking content coverage for Exam: ${exam}...`);
    for (const subject of syllabus.subjects) {
      const subjectName = subject.name;
      const { exam: normExam, subject: normSubject } = normalizeSearchCriteria(exam, subjectName);

      for (const topic of subject.topics || []) {
        for (const subtopic of topic.subtopics || []) {
          totalSubtopics++;
          
          // Try to look up content using exact string match on compound index
          const content = await lcCol.findOne({
            exam: normExam,
            subject: normSubject,
            topic: topic.name,
            subtopic: subtopic
          });

          if (!content) {
            missingContentCount++;
            if (missingContentCount <= 5) {
              console.log(`  ⚠️ Missing content: ${normExam} | ${normSubject} | ${topic.name} | ${subtopic}`);
            }
          }
        }
      }
    }
  }

  const coverage = ((totalSubtopics - missingContentCount) / totalSubtopics * 100).toFixed(2);
  console.log(`\nCoverage Audit Summary:`);
  console.log(`- Total Subtopics: ${totalSubtopics}`);
  console.log(`- Missing Content: ${missingContentCount}`);
  console.log(`- Content Coverage Rate: ${coverage}%`);

  await mongoose.disconnect();
}

testEngine().catch(console.error);
