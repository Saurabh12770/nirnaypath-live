import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';

async function list() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  const indexes = await db.collection('learningcontents').indexes();
  console.log('Indexes on learningcontents:');
  console.log(JSON.stringify(indexes, null, 2));
  await mongoose.disconnect();
}
list();
