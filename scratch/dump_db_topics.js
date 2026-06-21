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
  
  const results = await questionsCol.aggregate([
    {
      $group: {
        _id: { exam: '$exam', subject: '$subject' },
        topics: { $addToSet: '$topic' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.exam': 1, '_id.subject': 1 } }
  ]).toArray();

  for (const r of results) {
    console.log(`Exam: ${r._id.exam} | Subject: ${r._id.subject} | Count: ${r.count}`);
    console.log(`Topics: ${JSON.stringify(r.topics)}`);
    console.log('-'.repeat(40));
  }
  
  await mongoose.disconnect();
}

query().catch(console.error);
