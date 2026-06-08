import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';

async function list() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  const collection = db.collection('learningcontents');
  const docs = await collection.find({}).toArray();
  console.log(`Total docs: ${docs.length}`);
  for (const doc of docs) {
    console.log(`- Exam: ${doc.exam} | Subject: ${doc.subject} | Topic: ${doc.topic} | Subtopic: "${doc.subtopic}"`);
  }
  await mongoose.disconnect();
}
list();
