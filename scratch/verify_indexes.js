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
  const col = db.collection('questions');

  try {
    console.log('Dropping old question.en_1 index...');
    await col.dropIndex('question.en_1');
    console.log('Old index dropped.');
  } catch (err) {
    console.log('Index question.en_1 not found or already dropped.');
  }

  const indexes = await col.indexes();
  console.log('--- QUESTIONS INDEXES ---');
  console.log(JSON.stringify(indexes, null, 2));

  await mongoose.disconnect();
}

main().catch(console.error);
