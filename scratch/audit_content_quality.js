import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';

// Inline schema definitions
const pyqSchema = new mongoose.Schema({
  question: { en: String, hi: String },
  options: [{ en: String, hi: String }],
  answer: Number,
  explanation: { en: String, hi: String },
  year: Number
});

const learningContentSchema = new mongoose.Schema({
  exam: String,
  subject: String,
  topic: String,
  subtopic: String,
  introduction: String,
  detailedExplanation: String,
  concepts: [String],
  importantFacts: [String],
  examples: [String],
  tables: [mongoose.Schema.Types.Mixed],
  revisionNotes: String,
  pyqs: [pyqSchema],
  practiceMcqs: [mongoose.Schema.Types.ObjectId]
});

const questionSchema = new mongoose.Schema({
  exam: String,
  subject: String,
  topic: String,
  subtopic: String,
  difficulty: String,
  question: { en: String, hi: String },
  options: [{ en: String, hi: String }],
  answer: Number,
  explanation: { en: String, hi: String }
});

const LearningContent = mongoose.models.LearningContent || mongoose.model('LearningContent', learningContentSchema, 'learningcontents');
const Question = mongoose.models.Question || mongoose.model('Question', questionSchema, 'questions');

async function runAudit() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB.');

  const totalContent = await LearningContent.countDocuments({});
  console.log(`\n📚 Total LearningContent Documents: ${totalContent}`);

  // 1. Audit LearningContent Quality
  const contents = await LearningContent.find({}).lean();
  let shortExplanations = [];
  let missingHindiPyqs = [];
  let invalidAnswerPyqs = [];
  let lowFactCount = [];
  let noTables = [];

  for (const doc of contents) {
    // Check detailed explanation length
    const words = (doc.detailedExplanation || '').split(/\s+/).length;
    if (words < 150) {
      shortExplanations.push({ id: doc._id, exam: doc.exam, subtopic: doc.subtopic, words });
    }

    // Check facts count
    if (!doc.importantFacts || doc.importantFacts.length < 3) {
      lowFactCount.push({ id: doc._id, exam: doc.exam, subtopic: doc.subtopic, count: doc.importantFacts ? doc.importantFacts.length : 0 });
    }

    // Check tables
    if (!doc.tables || doc.tables.length === 0) {
      noTables.push({ id: doc._id, exam: doc.exam, subtopic: doc.subtopic });
    }

    // Check PYQs quality
    if (doc.pyqs) {
      doc.pyqs.forEach((pyq, idx) => {
        if (!pyq.question.hi || !pyq.explanation.hi) {
          missingHindiPyqs.push({ id: doc._id, exam: doc.exam, subtopic: doc.subtopic, pyqIndex: idx });
        }
        if (pyq.answer < 0 || pyq.answer > 3 || pyq.answer === undefined) {
          invalidAnswerPyqs.push({ id: doc._id, exam: doc.exam, subtopic: doc.subtopic, pyqIndex: idx, answer: pyq.answer });
        }
      });
    }
  }

  console.log(`- Short explanations (<150 words): ${shortExplanations.length}`);
  console.log(`- Low fact count (<3 facts): ${lowFactCount.length}`);
  console.log(`- Missing tables: ${noTables.length}`);
  console.log(`- PYQs with missing Hindi translations: ${missingHindiPyqs.length}`);
  console.log(`- PYQs with invalid answer indices: ${invalidAnswerPyqs.length}`);

  // 2. Audit Question Quality
  const totalQuestions = await Question.countDocuments({});
  console.log(`\n❓ Total Questions: ${totalQuestions}`);

  // Count difficulty distribution
  const easyCount = await Question.countDocuments({ difficulty: 'easy' });
  const mediumCount = await Question.countDocuments({ difficulty: 'medium' });
  const hardCount = await Question.countDocuments({ difficulty: 'hard' });
  console.log(`- Easy: ${easyCount} (${((easyCount/totalQuestions)*100).toFixed(1)}%)`);
  console.log(`- Medium: ${mediumCount} (${((mediumCount/totalQuestions)*100).toFixed(1)}%)`);
  console.log(`- Hard: ${hardCount} (${((hardCount/totalQuestions)*100).toFixed(1)}%)`);

  // Scan a subset for duplicates and invalid answers to calculate quality statistics
  console.log('\nScanning 10,000 questions for duplicate texts & structural issues...');
  const sampleQuestions = await Question.find({}).limit(10000).lean();
  const seenTexts = new Set();
  let duplicateCount = 0;
  let missingExplanationCount = 0;
  let invalidAnswerIdx = 0;

  for (const q of sampleQuestions) {
    const textEn = q.question.en ? q.question.en.trim().toLowerCase() : '';
    if (seenTexts.has(textEn)) {
      duplicateCount++;
    } else if (textEn) {
      seenTexts.add(textEn);
    }

    if (!q.explanation || (!q.explanation.en && !q.explanation.hi)) {
      missingExplanationCount++;
    }

    if (q.answer < 0 || q.answer > 3 || q.answer === undefined) {
      invalidAnswerIdx++;
    }
  }

  console.log(`- Sample size: 10,000`);
  console.log(`- Duplicate question texts in sample: ${duplicateCount} (${((duplicateCount/10000)*100).toFixed(1)}%)`);
  console.log(`- Missing explanation in sample: ${missingExplanationCount} (${((missingExplanationCount/10000)*100).toFixed(1)}%)`);
  console.log(`- Invalid answer index in sample: ${invalidAnswerIdx}`);

  await mongoose.disconnect();
  console.log('\nDisconnected.');
}

runAudit();
