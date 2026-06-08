/**
 * NirnayPath 3.0 — Content Migration Script
 * Fixes Batch 1 & 2 docs that were stored with wrong field names.
 * Maps: notes → introduction + detailedExplanation
 *       facts → importantFacts
 *       pyqs (string format) → pyqs (correct bilingual format with numeric answer index)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';

async function migrate() {
  console.log(`\n🔌 Connecting to: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected.\n');

  const db = mongoose.connection.db;
  const collection = db.collection('learningcontents');

  // Find all docs that have 'notes' field (old format) but no 'introduction'
  const oldDocs = await collection.find({
    notes: { $exists: true },
    introduction: { $exists: false },
  }).toArray();

  console.log(`📋 Found ${oldDocs.length} docs to migrate (old 'notes' field format)\n`);

  let migrated = 0;
  let errors = 0;

  for (const doc of oldDocs) {
    try {
      const notes = doc.notes || '';

      // Split notes into introduction (first ~2 sentences) and detailedExplanation (all)
      const firstNewline = notes.indexOf('\n\n');
      const introduction = firstNewline > 0
        ? notes.substring(0, firstNewline).replace(/^#+\s*/m, '').trim()
        : notes.substring(0, Math.min(300, notes.length)).trim();

      // Convert pyqs from string format to proper bilingual format
      const convertedPyqs = (doc.pyqs || []).map((q) => {
        if (q.question && typeof q.question === 'string') {
          // Old format: question is a string, options is array of strings, answer is a string
          const answerIndex = (q.options || []).findIndex(
            (opt) => opt === q.answer || opt?.en === q.answer
          );
          return {
            question: { en: q.question, hi: '' },
            options: (q.options || []).map((opt) => ({
              en: typeof opt === 'string' ? opt : (opt.en || ''),
              hi: '',
            })),
            answer: answerIndex >= 0 ? answerIndex : 0,
            explanation: { en: q.explanation || '', hi: '' },
            year: parseInt(q.year) || 2020,
          };
        }
        // Already correct format — leave as is
        return q;
      });

      await collection.updateOne(
        { _id: doc._id },
        {
          $set: {
            introduction: introduction || `Introduction to ${doc.subtopic}.`,
            detailedExplanation: notes,
            importantFacts: doc.facts || [],
            pyqs: convertedPyqs,
          },
          $unset: {
            notes: '',
            facts: '',
            language: '',
          },
        }
      );

      migrated++;
      process.stdout.write(`  ✅ Migrated: ${doc.exam} | ${doc.subtopic?.substring(0, 50)}\n`);
    } catch (err) {
      errors++;
      process.stdout.write(`  ❌ Error on ${doc.subtopic}: ${err.message}\n`);
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`📊 MIGRATION COMPLETE | Migrated: ${migrated} | Errors: ${errors}`);
  console.log(`${'═'.repeat(60)}\n`);

  await mongoose.disconnect();
  console.log('✅ Done.');
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err.message);
  process.exit(1);
});
