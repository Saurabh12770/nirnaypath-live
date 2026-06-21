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
  
  console.log('--- EXAM + SUBJECT + TOPIC MATCHES ---');
  const results = await questionsCol.aggregate([
    {
      $group: {
        _id: { exam: '$exam', subject: '$subject', topic: '$topic' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.exam': 1, '_id.subject': 1, count: -1 } }
  ]).toArray();

  for (const r of results) {
    console.log(`Exam: ${r._id.exam} | Subject: ${r._id.subject} | Topic: "${r._id.topic}" | Count: ${r.count}`);
  }
  
  await mongoose.disconnect();
}

query().catch(console.error);
