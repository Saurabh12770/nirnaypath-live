import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';

async function runAudit() {
  console.log('Connecting to database...');
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;
  const col = db.collection('learningcontents');

  const currentCount = await col.countDocuments();
  console.log(`Current records in database: ${currentCount}`);

  // Load syllabus files from data/syllabus
  const syllabusDir = path.resolve(__dirname, '../../data/syllabus');
  const files = fs.readdirSync(syllabusDir).filter(f => f.endsWith('.json') && f !== 'index.json');

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

  const syllabusMap = new Map();
  let totalTargetRecords = 0;
  const canonicalTopics = new Set();
  const canonicalSubtopics = new Set();

  console.log('Loading syllabus files...');
  for (const file of files) {
    const filePath = path.join(syllabusDir, file);
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const exam = content.exam;
    if (!exam) continue;

    if (!syllabusMap.has(exam)) {
      syllabusMap.set(exam, []);
    }

    const subjects = content.subjects || [];
    for (const sub of subjects) {
      const subjectName = sub.name;
      const dbSubjectName = LC_MAPS[subjectName] || subjectName;
      const topics = sub.topics || [];
      for (const topic of topics) {
        const topicName = topic.name;
        canonicalTopics.add(`${exam}|${dbSubjectName.toLowerCase()}|${topicName}`);
        const subtopics = topic.subtopics || [];
        for (const subtopic of subtopics) {
          totalTargetRecords++;
          canonicalSubtopics.add(`${exam}|${dbSubjectName.toLowerCase()}|${topicName}|${subtopic}`);
          syllabusMap.get(exam).push({
            subject: dbSubjectName,
            topic: topicName,
            subtopic: subtopic
          });
        }
      }
    }
  }

  console.log(`Target records from syllabus: ${totalTargetRecords}`);

  // Retrieve all records from DB
  console.log('Fetching database records...');
  const dbRecords = await col.find({}, {
    projection: {
      exam: 1,
      subject: 1,
      topic: 1,
      subtopic: 1,
      introduction: 1,
      detailedExplanation: 1,
      concepts: 1,
      importantFacts: 1,
      examples: 1,
      tables: 1,
      revisionNotes: 1,
      pyqs: 1,
      practiceMcqs: 1
    }
  }).toArray();

  console.log(`Retrieved ${dbRecords.length} records from DB. Processing...`);

  // Analyze records
  let matchedCount = 0;
  let unmatchedCount = 0;
  const unmatchedList = [];
  const mergeMapping = {}; // key: Target Subtopic ID -> list of DB records
  let potentialDataLossCount = 0;
  const dataLossDetails = [];

  // Helper to extract base subtopic name
  // Standard format: "Prehistoric India & Stone Age — Part 1: Detailed Introduction"
  // Let's strip the " — Part \d+..." suffix
  function getBaseSubtopic(subtopicName) {
    // Matches " — Part 1: ..." or " - Part 1: ..." or " — Part 1" or " - Part 1"
    const regex = /\s*[\u2014-]\s*Part\s+\d+.*$/i;
    return subtopicName.replace(regex, '').trim();
  }

  for (const record of dbRecords) {
    const exam = record.exam;
    const subject = record.subject;
    const topic = record.topic;
    const dbSubtopic = record.subtopic;
    const baseSubtopic = getBaseSubtopic(dbSubtopic);

    // Look for a match in canonical subtopics
    // Try absolute case-insensitive match
    const key = `${exam}|${subject.toLowerCase()}|${topic}|${baseSubtopic}`;
    
    // We also support variations if exact key is not found
    let matchedKey = null;
    if (canonicalSubtopics.has(key)) {
      matchedKey = key;
    } else {
      // Look for case-insensitive or close matches in canonical set
      for (const canonicalKey of canonicalSubtopics) {
        if (canonicalKey.toLowerCase() === key.toLowerCase()) {
          matchedKey = canonicalKey;
          break;
        }
      }
    }

    if (matchedKey) {
      matchedCount++;
      if (!mergeMapping[matchedKey]) {
        mergeMapping[matchedKey] = [];
      }
      mergeMapping[matchedKey].push(record);
    } else {
      unmatchedCount++;
      unmatchedList.push({
        id: record._id,
        exam,
        subject,
        topic,
        subtopic: dbSubtopic,
        baseSubtopic
      });
    }
  }

  console.log(`Matched: ${matchedCount}, Unmatched: ${unmatchedCount}`);

  // Analyze Merge Mapping for Potential Data Loss
  // Data loss occurs if parts 2-28 contain non-trivial data that we might overwrite,
  // or if we fail to merge arrays of concepts, importantFacts, examples, tables, pyqs, practiceMcqs.
  const mergeKeys = Object.keys(mergeMapping);
  
  // Let's inspect some of the merged records to see what they contain
  for (const key of mergeKeys) {
    const records = mergeMapping[key];
    const targetSubtopicName = key.split('|')[3];
    
    // Check if there are multiple parts
    if (records.length > 1) {
      // Check for potential duplicate questions or differences
      const pyqQuestions = new Set();
      let totalPyqs = 0;
      let uniquePyqsCount = 0;
      
      const facts = new Set();
      let totalFacts = 0;

      const examples = new Set();
      let totalExamples = 0;

      for (const r of records) {
        if (r.pyqs && r.pyqs.length > 0) {
          totalPyqs += r.pyqs.length;
          for (const p of r.pyqs) {
            const qText = p.question?.en || '';
            pyqQuestions.add(qText.toLowerCase().trim());
          }
        }
        if (r.importantFacts && r.importantFacts.length > 0) {
          totalFacts += r.importantFacts.length;
          for (const f of r.importantFacts) {
            facts.add(f.toLowerCase().trim());
          }
        }
        if (r.examples && r.examples.length > 0) {
          totalExamples += r.examples.length;
          for (const e of r.examples) {
            examples.add(e.toLowerCase().trim());
          }
        }
      }

      uniquePyqsCount = pyqQuestions.size;
      const duplicatePyqs = totalPyqs - uniquePyqsCount;
      const duplicateFacts = totalFacts - facts.size;
      const duplicateExamples = totalExamples - examples.size;

      // Check for detailedExplanation contents in parts other than 1-5
      // If parts > 5 have detailedExplanation length > 500 characters and contain unique text,
      // it might contain content that isn't captured by concatenating parts 2-5.
      // Wait, let's see. If we do union of all, we don't lose them, but if we don't merge them, we lose them.
      let ignoredTextLength = 0;
      for (const r of records) {
        const partMatch = r.subtopic.match(/Part\s+(\d+)/i);
        if (partMatch) {
          const partNum = parseInt(partMatch[1], 10);
          if (partNum > 5) {
            const explanation = r.detailedExplanation || '';
            // Strip out common templates like "currently being updated" or "Fact N: Key indicator"
            if (explanation.length > 300 && 
                !explanation.includes('currently being updated') &&
                !explanation.includes('Overview') && 
                !explanation.includes('Core Academic Material')) {
              ignoredTextLength += explanation.length;
            }
          }
        }
      }

      if (duplicatePyqs > 0 || duplicateFacts > 0 || duplicateExamples > 0 || ignoredTextLength > 0) {
        potentialDataLossCount++;
        dataLossDetails.push({
          target: key,
          recordsCount: records.length,
          duplicatePyqs,
          duplicateFacts,
          duplicateExamples,
          ignoredTextLength
        });
      }
    }
  }

  // Generate Report
  const reportPath = path.resolve(__dirname, '../../CONTENT_CONSOLIDATION_REPORT.md');
  
  let reportMd = `# Content Consolidation Audit Report\n`;
  reportMd += `Generated on: ${new Date().toISOString()}\n\n`;
  reportMd += `## Executive Summary\n\n`;
  reportMd += `| Metric | Count |\n`;
  reportMd += `|---|---|\n`;
  reportMd += `| **Current Record Count (DB)** | ${currentCount} |\n`;
  reportMd += `| **Target Record Count (Syllabus)** | ${totalTargetRecords} |\n`;
  reportMd += `| **Matched Records** | ${matchedCount} |\n`;
  reportMd += `| **Unmatched Records** | ${unmatchedCount} |\n`;
  reportMd += `| **Potential Consolidation Ratio** | ~${(currentCount / totalTargetRecords).toFixed(1)}:1 |\n\n`;

  reportMd += `## Potential Data Loss Analysis\n\n`;
  reportMd += `Data loss is minimized by using a **union-and-deduplicate** strategy for lists (PYQs, Facts, Examples, Tables). However, there are potential areas of concern:\n\n`;
  reportMd += `1. **Detailed Explanations in Parts 6–28**: If a subtopic has non-template detailed explanation in parts > 5, this content might be omitted if we only merge parts 2–5. We analyzed these and found **${dataLossDetails.reduce((acc, d) => acc + (d.ignoredTextLength > 0 ? 1 : 0), 0)}** subtopics with non-trivial text in later parts.\n`;
  reportMd += `2. **Duplicate PYQs**: We detected **${dataLossDetails.reduce((acc, d) => acc + d.duplicatePyqs, 0)}** duplicate PYQ questions across different parts. Merging will clean this up without actual data loss.\n`;
  reportMd += `3. **Duplicate Facts/Examples**: We detected **${dataLossDetails.reduce((acc, d) => acc + d.duplicateFacts, 0)}** duplicate facts and **${dataLossDetails.reduce((acc, d) => acc + d.duplicateExamples, 0)}** duplicate examples across parts, which will be deduped during merge.\n\n`;

  reportMd += `### Sample of Subtopics with Potential Data Loss Details\n\n`;
  reportMd += `| Target Subtopic | Parts Count | Duplicate PYQs | Duplicate Facts | Ignored Text Length (Parts 6-28) |\n`;
  reportMd += `|---|---|---|---|---|\n`;
  
  // Show top 15 records
  const sortedLoss = dataLossDetails.sort((a,b) => b.ignoredTextLength - a.ignoredTextLength).slice(0, 15);
  for (const d of sortedLoss) {
    const parts = d.target.split('|');
    const display = `${parts[0]} > ${parts[1]} > ${parts[2]} > **${parts[3]}**`;
    reportMd += `| ${display} | ${d.recordsCount} | ${d.duplicatePyqs} | ${d.duplicateFacts} | ${d.ignoredTextLength} chars |\n`;
  }
  
  if (dataLossDetails.length > 15) {
    reportMd += `| *And ${dataLossDetails.length - 15} more subtopics...* | | | | |\n`;
  }

  reportMd += `\n## Unmatched Records (Orphans)\n\n`;
  reportMd += `These records in the database do not match any subtopic in the newly restored syllabus files. They will be **archived or deleted** during consolidation.\n\n`;
  reportMd += `Total unmatched records: **${unmatchedCount}**\n\n`;
  if (unmatchedCount > 0) {
    reportMd += `| DB Subtopic Name | Exam | Subject | Topic |\n`;
    reportMd += `|---|---|---|---|\n`;
    for (const u of unmatchedList.slice(0, 20)) {
      reportMd += `| ${u.subtopic} | ${u.exam} | ${u.subject} | ${u.topic} |\n`;
    }
    if (unmatchedCount > 20) {
      reportMd += `| *And ${unmatchedCount - 20} more unmatched records...* | | | |\n`;
    }
  } else {
    reportMd += `No unmatched records found. All DB records successfully mapped to the syllabus.\n`;
  }

  reportMd += `\n## Sample Merge Mapping\n\n`;
  reportMd += `Here is how the 28 parts will map into 1 canonical topic:\n\n`;
  
  let mapCount = 0;
  for (const key of mergeKeys) {
    if (mapCount >= 5) break;
    const records = mergeMapping[key];
    const parts = key.split('|');
    reportMd += `### ${parts[0]} — ${parts[1]} — ${parts[2]} — ${parts[3]}\n`;
    reportMd += `Consolidating **${records.length}** records:\n`;
    for (const r of records.slice(0, 5)) {
      reportMd += `- \`${r.subtopic}\` (ID: \`${r._id}\`)\n`;
    }
    if (records.length > 5) {
      reportMd += `- ... and ${records.length - 5} more parts.\n`;
    }
    reportMd += `\n`;
    mapCount++;
  }

  fs.writeFileSync(reportPath, reportMd);
  console.log(`Report generated successfully at: ${reportPath}`);

  await mongoose.disconnect();
}

runAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
