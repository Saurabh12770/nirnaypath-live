import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';

async function query() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  const questionsCol = db.collection('questions');
  
  console.log('--- SUBJECT COUNTS FOR UPSC ---');
  const upscSubjects = await questionsCol.aggregate([
    { $match: { exam: 'UPSC' } },
    { $group: { _id: '$subject', count: { $sum: 1 } } }
  ]).toArray();
  console.log(upscSubjects);
  
  console.log('\n--- TOPIC SAMPLES FOR UPSC HISTORY/POLITY ---');
  const sampleTopics = await questionsCol.aggregate([
    { $match: { exam: 'UPSC', subject: { $in: ['history', 'Polity'] } } },
    { $group: { _id: { subject: '$subject', topic: '$topic' }, count: { $sum: 1 } } },
    { $limit: 10 }
  ]).toArray();
  console.log(sampleTopics);

  console.log('\n--- SUBJECT COUNTS FOR BPSC ---');
  const bpscSubjects = await questionsCol.aggregate([
    { $match: { exam: 'BPSC' } },
    { $group: { _id: '$subject', count: { $sum: 1 } } }
  ]).toArray();
  console.log(bpscSubjects);

  await mongoose.disconnect();
}

query().catch(console.error);
