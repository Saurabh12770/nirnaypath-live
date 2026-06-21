import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const learningSchema = new mongoose.Schema({
  exam: String, subject: String, topic: String, subtopic: String,
  notes: String, facts: [String], tables: [Object], pyqs: [Object],
});
const LearningContent = mongoose.models.LearningContent || mongoose.model('LearningContent', learningSchema, 'learningcontents');

function walkSyllabus(data) {
  const subtopicList = [];
  if (!data.subjects) return subtopicList;
  for (const subj of data.subjects) {
    if (!subj.topics) continue;
    for (const topic of subj.topics) {
      if (!topic.subtopics) continue;
      for (const sub of topic.subtopics) {
        subtopicList.push({ subject: subj.name, topic: topic.name, subtopic: sub });
      }
    }
  }
  return subtopicList;
}

async function findMissing() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
  await mongoose.connect(mongoUri);

  const syllabusDir = path.resolve(__dirname, '../data/syllabus');
  const files = fs.readdirSync(syllabusDir)
    .filter(f => f.endsWith('.json') && f !== 'index.json');

  for (const file of files) {
    const examId = file.replace('.json', '');
    const raw = fs.readFileSync(path.join(syllabusDir, file), 'utf-8');
    const data = JSON.parse(raw);
    const examName = data.exam || examId;
    const subtopicList = walkSyllabus(data);

    const missing = [];
    for (const item of subtopicList) {
      const content = await LearningContent.findOne({
        exam: { $regex: new RegExp(`^${examName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        subtopic: { $regex: new RegExp(`^${item.subtopic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      }).lean();

      if (!content) {
        missing.push(item);
      }
    }

    if (missing.length > 0) {
      console.log(`\n❌ ${examName} (${missing.length} missing subtopics):`);
      missing.forEach(m => {
        console.log(`  - [${m.subject}] [${m.topic}] -> ${m.subtopic}`);
      });
    } else {
      console.log(`\n✅ ${examName} is 100% complete!`);
    }
  }

  await mongoose.disconnect();
}

findMissing().catch(console.error);
