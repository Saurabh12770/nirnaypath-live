import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';

const LC_MAPS = {
  'Aptitude': 'Mathematics',
  'Math': 'Mathematics',
  'Quantitative Aptitude': 'Mathematics',
  'English Language': 'English',
  'Environment & Ecology': 'Environment',
  'General Intelligence & Reasoning': 'Reasoning',
  'General Science': 'Science',
  'Science & Technology': 'Science',
  'Current Affairs & General Awareness': 'Current Affairs'
};

async function executeConsolidation() {
  console.log('🔌 Connecting to database...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Database connected.');

  const db = mongoose.connection.db;
  const col = db.collection('learningcontents');

  const beforeCount = await col.countDocuments();
  console.log(`Total database records before consolidation: ${beforeCount}`);

  // Load syllabus files to get canonical list of subtopics
  const syllabusDir = path.resolve(__dirname, '../../data/syllabus');
  const files = fs.readdirSync(syllabusDir).filter(f => f.endsWith('.json') && f !== 'index.json');

  const canonicalSubtopics = new Set();
  for (const file of files) {
    const raw = fs.readFileSync(path.join(syllabusDir, file), 'utf-8');
    const data = JSON.parse(raw);
    const exam = data.exam;
    if (!exam || !data.subjects) continue;

    for (const subj of data.subjects) {
      const dbSubject = LC_MAPS[subj.name] || subj.name;
      if (!subj.topics) continue;
      for (const topic of subj.topics) {
        for (const sub of topic.subtopics || []) {
          canonicalSubtopics.add(`${exam}|${dbSubject.toLowerCase()}|${topic.name}|${sub}`);
        }
      }
    }
  }

  console.log(`Loaded ${canonicalSubtopics.size} canonical target subtopics from syllabus files.`);

  // Retrieve all records from DB
  console.log('Fetching database records for consolidation...');
  const dbRecords = await col.find({}).toArray();
  console.log(`Loaded ${dbRecords.length} documents from collection.`);

  // Group records by base subtopic key
  const groups = {};
  
  function getBaseSubtopic(subtopicName) {
    const regex = /\s*[\u2014-]\s*Part\s+\d+.*$/i;
    return subtopicName.replace(regex, '').trim();
  }

  for (const record of dbRecords) {
    const exam = record.exam;
    const subject = record.subject;
    const topic = record.topic;
    const subtopic = record.subtopic;
    const baseSubtopic = getBaseSubtopic(subtopic);

    const key = `${exam}|${subject.toLowerCase()}|${topic}|${baseSubtopic}`;
    
    // Find canonical key
    let matchedKey = null;
    if (canonicalSubtopics.has(key)) {
      matchedKey = key;
    } else {
      for (const canonicalKey of canonicalSubtopics) {
        if (canonicalKey.toLowerCase() === key.toLowerCase()) {
          matchedKey = canonicalKey;
          break;
        }
      }
    }

    if (matchedKey) {
      if (!groups[matchedKey]) {
        groups[matchedKey] = [];
      }
      groups[matchedKey].push(record);
    } else {
      // If it doesn't match any canonical key, we keep it as is (or it's an orphan)
      console.log(`⚠️ Unmatched record: ${exam} | ${subject} | ${topic} | ${subtopic}`);
    }
  }

  const groupKeys = Object.keys(groups);
  console.log(`Grouped database records into ${groupKeys.length} subtopic consolidation groups.`);

  let consolidatedCount = 0;
  let deletedCount = 0;

  for (const key of groupKeys) {
    const records = groups[key];
    if (records.length <= 1) {
      // Already consolidated or only 1 record exists
      continue;
    }

    const parts = key.split('|');
    const targetSubtopicName = parts[3];

    // Find Part 1 or choose the one with the smallest ID / Part number
    let part1Record = records.find(r => r.subtopic.match(/Part\s+1:/i));
    if (!part1Record) {
      part1Record = records[0];
    }

    // Sort records by part number to ensure correct concatenation order
    const getPartNumber = (r) => {
      const match = r.subtopic.match(/Part\s+(\d+)/i);
      return match ? parseInt(match[1], 10) : 999;
    };
    records.sort((a, b) => getPartNumber(a) - getPartNumber(b));

    // 1. Merge detailedExplanation (Parts 2-5)
    const partsToConcat = records.filter(r => {
      const num = getPartNumber(r);
      return num >= 2 && num <= 5;
    });

    let mergedDetailedExplanation = '';
    if (partsToConcat.length > 0) {
      const mergedEn = partsToConcat.map(p => p.detailedExplanation.split('===HINDI===')[0] || '').join('\n\n');
      const mergedHi = partsToConcat.map(p => p.detailedExplanation.split('===HINDI===')[1] || '').join('\n\n');
      mergedDetailedExplanation = `${mergedEn.trim()}\n\n===HINDI===\n\n${mergedHi.trim()}`;
    } else {
      // Fallback: use Part 1 detailed explanation if no parts 2-5
      mergedDetailedExplanation = part1Record.detailedExplanation;
    }

    // 2. Merge arrays (union + deduplicate)
    const mergeStringArrays = (fieldName) => {
      const set = new Set();
      for (const r of records) {
        if (r[fieldName] && Array.isArray(r[fieldName])) {
          for (const item of r[fieldName]) {
            if (item) set.add(item.trim());
          }
        }
      }
      return Array.from(set);
    };

    const mergedConcepts = mergeStringArrays('concepts');
    const mergedImportantFacts = mergeStringArrays('importantFacts');
    const mergedExamples = mergeStringArrays('examples');

    // 3. Merge tables (dedupe by title)
    const mergedTables = [];
    const seenTableTitles = new Set();
    for (const r of records) {
      if (r.tables && Array.isArray(r.tables)) {
        for (const t of r.tables) {
          const title = (t.title || '').trim().toLowerCase();
          if (title && !seenTableTitles.has(title)) {
            seenTableTitles.add(title);
            mergedTables.push(t);
          }
        }
      }
    }

    // 4. Merge PYQs (dedupe by English question text)
    const mergedPyqs = [];
    const seenPyqs = new Set();
    for (const r of records) {
      if (r.pyqs && Array.isArray(r.pyqs)) {
        for (const q of r.pyqs) {
          const qText = (q.question?.en || '').trim().toLowerCase();
          if (qText && !seenPyqs.has(qText)) {
            seenPyqs.add(qText);
            mergedPyqs.push(q);
          }
        }
      }
    }

    // 5. Merge Practice MCQs
    const mergedPracticeMcqs = [];
    const seenMcqs = new Set();
    for (const r of records) {
      if (r.practiceMcqs && Array.isArray(r.practiceMcqs)) {
        for (const qId of r.practiceMcqs) {
          const qIdStr = qId.toString();
          if (!seenMcqs.has(qIdStr)) {
            seenMcqs.add(qIdStr);
            mergedPracticeMcqs.push(qId);
          }
        }
      }
    }

    // 6. Merge Related Topics
    const mergedRelated = [];
    const seenRelated = new Set();
    for (const r of records) {
      if (r.relatedTopics && Array.isArray(r.relatedTopics)) {
        for (const rel of r.relatedTopics) {
          const relKey = `${rel.exam}|${rel.subject}|${rel.topic}|${rel.subtopic}`.toLowerCase();
          if (!seenRelated.has(relKey)) {
            seenRelated.add(relKey);
            mergedRelated.push(rel);
          }
        }
      }
    }

    // 7. Get revision notes from Part 10 or fallback
    const part10 = records.find(r => getPartNumber(r) === 10);
    const mergedRevisionNotes = part10?.revisionNotes || part1Record.revisionNotes || '';

    // Update Part 1 record with consolidated data and rename subtopic to target canonical subtopic
    await col.updateOne(
      { _id: part1Record._id },
      {
        $set: {
          subtopic: targetSubtopicName,
          detailedExplanation: mergedDetailedExplanation,
          concepts: mergedConcepts,
          importantFacts: mergedImportantFacts,
          examples: mergedExamples,
          tables: mergedTables,
          pyqs: mergedPyqs,
          practiceMcqs: mergedPracticeMcqs,
          relatedTopics: mergedRelated,
          revisionNotes: mergedRevisionNotes
        }
      }
    );

    // Delete all other parts (records in group except the part1Record)
    const otherIds = records
      .filter(r => r._id.toString() !== part1Record._id.toString())
      .map(r => r._id);
    
    if (otherIds.length > 0) {
      const delResult = await col.deleteMany({ _id: { $in: otherIds } });
      deletedCount += delResult.deletedCount;
    }

    consolidatedCount++;
  }

  const afterCount = await col.countDocuments();
  console.log('\n======================================================');
  console.log(`  🎉 CONSOLIDATION COMPLETE!`);
  console.log(`  Total subtopics consolidated: ${consolidatedCount}`);
  console.log(`  Total duplicate part records deleted: ${deletedCount}`);
  console.log(`  Records in database after: ${afterCount}`);
  console.log('======================================================\n');

  await mongoose.disconnect();
}

executeConsolidation().catch(err => {
  console.error('CONSOLIDATION ERROR:', err);
  process.exit(1);
});
