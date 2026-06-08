import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// ─── Models (inline to avoid import path issues) ──────────────────────────────

const questionSchema = new mongoose.Schema({
  exam: String, subject: String, topic: String, subTopic: String,
  question: String, options: [String], answer: String,
  difficulty: String, year: String, language: String,
});
const Question = mongoose.models.Question || mongoose.model('Question', questionSchema, 'questions');

const learningSchema = new mongoose.Schema({
  exam: String, subject: String, topic: String, subtopic: String,
  notes: String, facts: [String], tables: [Object], pyqs: [Object],
});
const LearningContent = mongoose.models.LearningContent || mongoose.model('LearningContent', learningSchema, 'learningcontents');

// ─── Syllabus walker ──────────────────────────────────────────────────────────

function walkSyllabus(data) {
  let subjects = 0, topics = 0, subtopics = 0;
  const subtopicList = [];

  if (!data.subjects) return { subjects, topics, subtopics, subtopicList };

  for (const subj of data.subjects) {
    subjects++;
    if (!subj.topics) continue;
    for (const topic of subj.topics) {
      topics++;
      if (!topic.subtopics) continue;
      for (const sub of topic.subtopics) {
        subtopics++;
        subtopicList.push({ subject: subj.name, topic: topic.name, subtopic: sub });
      }
    }
  }

  return { subjects, topics, subtopics, subtopicList };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function runAudit() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
  console.log(`\n🔌 Connecting to: ${mongoUri}`);
  await mongoose.connect(mongoUri);
  console.log('✅ Connected.\n');

  const syllabusDir = path.resolve(__dirname, '../../data/syllabus');
  const files = fs.readdirSync(syllabusDir)
    .filter(f => f.endsWith('.json') && f !== 'index.json');

  const report = {};

  for (const file of files) {
    const examId = file.replace('.json', '');
    const raw = fs.readFileSync(path.join(syllabusDir, file), 'utf-8');
    const data = JSON.parse(raw);
    const examName = data.exam || examId;

    process.stdout.write(`📚 Auditing: ${examName} ... `);

    const { subjects, topics, subtopics, subtopicList } = walkSyllabus(data);

    // Count MCQs — try both exact name and pattern
    const mcqs = await Question.countDocuments({
      exam: { $regex: new RegExp(`^${examName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });

    // Count LearningContent docs for this exam
    const noteDocs = await LearningContent.countDocuments({
      exam: { $regex: new RegExp(`^${examName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });

    // Per-subtopic coverage
    let coveredSubtopics = 0;
    let totalPyqs = 0;

    for (const item of subtopicList) {
      const content = await LearningContent.findOne({
        exam: { $regex: new RegExp(`^${examName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        subtopic: { $regex: new RegExp(`^${item.subtopic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      }).lean();

      if (content) {
        coveredSubtopics++;
        totalPyqs += (content.pyqs || []).length;
      }
    }

    const coveragePct = subtopics > 0
      ? parseFloat(((coveredSubtopics / subtopics) * 100).toFixed(1))
      : 0;

    report[examName] = {
      examId,
      subjects,
      topics,
      subtopics,
      coveredSubtopics,
      coveragePct,
      notes: noteDocs,
      pyqs: totalPyqs,
      mcqs,
    };

    console.log(`${coveredSubtopics}/${subtopics} subtopics (${coveragePct}%) | MCQs: ${mcqs} | Notes: ${noteDocs} | PYQs: ${totalPyqs}`);
  }

  console.log('\n\n=== FINAL AUDIT RESULTS (JSON) ===');
  console.log(JSON.stringify(report, null, 2));

  await mongoose.disconnect();
  console.log('\n✅ Audit complete.');
}

runAudit().catch(err => {
  console.error('❌ Audit failed:', err.message);
  process.exit(1);
});
