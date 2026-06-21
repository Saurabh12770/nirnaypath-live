import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';

async function main() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  console.log('--- DISTINCT SUBJECTS IN QUESTIONS ---');
  const qCol = db.collection('questions');
  const qSubjects = await qCol.distinct('subject');
  for (const s of qSubjects) {
    const count = await qCol.countDocuments({ subject: s });
    console.log(`- "${s}": ${count} documents`);
  }

  console.log('\n--- DISTINCT SUBJECTS IN LEARNINGCONTENTS ---');
  const lcCol = db.collection('learningcontents');
  const lcSubjects = await lcCol.distinct('subject');
  for (const s of lcSubjects) {
    const count = await lcCol.countDocuments({ subject: s });
    console.log(`- "${s}": ${count} documents`);
  }

  await mongoose.disconnect();
}

main().catch(console.error);
