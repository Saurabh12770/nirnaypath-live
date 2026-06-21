import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';

const QUESTION_MAPS = [
  { from: 'history', to: 'History' },
  { from: 'General Science', to: 'Science' },
  { from: 'Chemistry', to: 'Science' },
  { from: 'Math', to: 'Mathematics' },
  { from: 'Aptitude', to: 'Mathematics' },
  { from: 'English Aptitude', to: 'English' },
  { from: 'Police_science', to: 'Police Science' },
  { from: 'Social_science', to: 'Social Science' }
];

const LC_MAPS = [
  { from: 'Aptitude', to: 'Mathematics' },
  { from: 'Math', to: 'Mathematics' },
  { from: 'Quantitative Aptitude', to: 'Mathematics' },
  { from: 'English Language', to: 'English' },
  { from: 'Environment & Ecology', to: 'Environment' },
  { from: 'General Intelligence & Reasoning', to: 'Reasoning' },
  { from: 'General Science', to: 'Science' },
  { from: 'Science & Technology', to: 'Science' },
  { from: 'Current Affairs & General Awareness', to: 'Current Affairs' }
];

async function normalize() {
  console.log(`🔌 Connecting to: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected.\n');

  const db = mongoose.connection.db;
  const qCol = db.collection('questions');
  const lcCol = db.collection('learningcontents');

  console.log('--- NORMALIZING QUESTIONS SUBJECTS ---');
  for (const mapping of QUESTION_MAPS) {
    const res = await qCol.updateMany(
      { subject: mapping.from },
      { $set: { subject: mapping.to } }
    );
    console.log(`- Changed "${mapping.from}" ➔ "${mapping.to}": ${res.modifiedCount} docs updated`);
  }

  console.log('\n--- NORMALIZING LEARNINGCONTENTS SUBJECTS ---');
  for (const mapping of LC_MAPS) {
    const res = await lcCol.updateMany(
      { subject: mapping.from },
      { $set: { subject: mapping.to } }
    );
    console.log(`- Changed "${mapping.from}" ➔ "${mapping.to}": ${res.modifiedCount} docs updated`);
  }

  // De-duplicate any collision in learningcontents
  console.log('\n--- DEDUPLICATING COLLIDING LEARNING CONTENTS ---');
  const pipeline = [
    {
      $group: {
        _id: { exam: '$exam', subject: '$subject', topic: '$topic', subtopic: '$subtopic' },
        ids: { $push: '$_id' },
        count: { $sum: 1 }
      }
    },
    {
      $match: { count: { $gt: 1 } }
    }
  ];

  const duplicates = await lcCol.aggregate(pipeline).toArray();
  console.log(`Found ${duplicates.length} duplicate learning content keys after normalization`);

  let deletedCount = 0;
  for (const group of duplicates) {
    // Keep the first document, delete the rest
    const idsToDelete = group.ids.slice(1);
    const delRes = await lcCol.deleteMany({ _id: { $in: idsToDelete } });
    deletedCount += delRes.deletedCount;
  }
  console.log(`Deleted ${deletedCount} duplicate learning content documents.`);

  await mongoose.disconnect();
  console.log('\n🔌 Disconnected. Done.');
}

normalize().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});
