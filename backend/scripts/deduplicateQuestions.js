/**
 * DEDUPLICATION SCRIPT — NirnayPath 3.0
 * Removes duplicate questions by question.en text.
 * Keeps the FIRST inserted document (lowest _id), deletes all subsequent duplicates.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';

async function deduplicate() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  const col = db.collection('questions');

  console.log('Counting total questions before dedup...');
  const beforeCount = await col.countDocuments();
  console.log(`Before: ${beforeCount} documents`);

  console.log('Finding duplicates by question.en text...');

  // Find all duplicate groups — keep the first _id (oldest), get IDs of all duplicates to delete
  const pipeline = [
    {
      $group: {
        _id: '$question.en',
        ids: { $push: '$_id' },
        count: { $sum: 1 }
      }
    },
    {
      $match: { count: { $gt: 1 } }
    }
  ];

  const duplicateGroups = await col.aggregate(pipeline, { allowDiskUse: true }).toArray();
  console.log(`Found ${duplicateGroups.length} groups with duplicate question texts`);

  // Build list of IDs to delete (all except first in each group)
  const idsToDelete = [];
  for (const group of duplicateGroups) {
    // Keep ids[0], delete the rest
    const toDelete = group.ids.slice(1);
    idsToDelete.push(...toDelete);
  }

  console.log(`Deleting ${idsToDelete.length} duplicate documents...`);

  // Delete in batches of 1000 to avoid timeout
  let deleted = 0;
  const batchSize = 1000;
  for (let i = 0; i < idsToDelete.length; i += batchSize) {
    const batch = idsToDelete.slice(i, i + batchSize);
    const result = await col.deleteMany({ _id: { $in: batch } });
    deleted += result.deletedCount;
    process.stdout.write(`\r  Deleted: ${deleted} / ${idsToDelete.length}`);
  }

  console.log(`\n✅ Deleted ${deleted} duplicate documents`);

  const afterCount = await col.countDocuments();
  console.log(`After: ${afterCount} documents`);
  console.log(`Reduction: ${beforeCount - afterCount} documents removed`);

  await mongoose.disconnect();
  console.log('Done.');
}

deduplicate().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
