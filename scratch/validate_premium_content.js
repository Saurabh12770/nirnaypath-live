import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = 'mongodb://localhost:27017/nirnaypath';

async function validate() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const contentCol = db.collection('learningcontents');
  const count = await contentCol.countDocuments();
  console.log(`\n📚 Total Seeded LearningContent Docs: ${count}`);

  // Query a sample from different subjects
  const samples = await contentCol.find({
    $or: [
      { subject: /history/i },
      { subject: /math/i },
      { subject: /polity/i },
      { subject: /reasoning/i }
    ]
  }).limit(10).toArray();

  let failedTests = 0;

  for (const doc of samples) {
    console.log(`\n--------------------------------------------------`);
    console.log(`📝 Auditing: ${doc.exam} | ${doc.subject} | ${doc.subtopic}`);

    // Test 1: ===HINDI=== Delimiter Presence
    if (!doc.detailedExplanation.includes('===HINDI===')) {
      console.error(`❌ Test 1 Failed: detailedExplanation does not contain ===HINDI=== delimiter.`);
      failedTests++;
      continue;
    }
    console.log(`✅ Test 1 Passed: ===HINDI=== delimiter present.`);

    const parts = doc.detailedExplanation.split('===HINDI===');
    const englishText = parts[0];
    const hindiText = parts[1];

    // Test 2: Check 13 sections in English part
    const requiredSections = [
      'Overview', 'Definition', 'Core Concepts', 'Detailed Theory', 'Examples',
      'Solved Examples', 'Exam Relevance', 'PYQ Analysis', 'Practice Questions',
      'Revision Notes', 'Memory Tricks', 'Common Mistakes', 'Quick Revision Sheet'
    ];

    let missingEn = [];
    for (const sec of requiredSections) {
      if (!englishText.includes(sec)) {
        missingEn.push(sec);
      }
    }

    if (missingEn.length > 0) {
      console.error(`❌ Test 2 Failed: English detailedExplanation is missing sections: ${missingEn.join(', ')}`);
      failedTests++;
    } else {
      console.log(`✅ Test 2 Passed: English contains all 13 required sections.`);
    }

    // Test 3: Check 13 sections in Hindi part
    const requiredSectionsHi = [
      'अवलोकन', 'परिभाषा', 'मुख्य अवधारणा', 'विस्तृत सिद्धांत', 'उदाहरण',
      'हल किए गए उदाहरण', 'परीक्षा प्रासंगिकता', 'पीवाईक्यू विश्लेषण', 'अभ्यास प्रश्न',
      'पुनरावलोकन नोट्स', 'स्मरण रखने के सूत्र', 'सामान्य गलतियाँ', 'त्वरित पुनरावलोकन शीट'
    ];

    let missingHi = [];
    for (const sec of requiredSectionsHi) {
      // Allow matches on substrings for flexibility (e.g. 'मुख्य अवधारणाएँ')
      const reg = new RegExp(sec.substring(0, 5), 'i');
      if (!reg.test(hindiText)) {
        missingHi.push(sec);
      }
    }

    if (missingHi.length > 0) {
      console.error(`❌ Test 3 Failed: Hindi detailedExplanation is missing sections: ${missingHi.join(', ')}`);
      failedTests++;
    } else {
      console.log(`✅ Test 3 Passed: Hindi contains all 13 required sections.`);
    }

    // Test 4: Subject relevance - check that Math topics do not discuss unrelated terms
    if (doc.subject.toLowerCase().includes('math') || doc.subject.toLowerCase().includes('quant')) {
      if (doc.subtopic.toLowerCase().includes('interpretation') && (englishText.includes('Simple Interest') || englishText.includes('Time & Work'))) {
        console.warn(`⚠️ Warning: Math DI topic contains unrelated math topics.`);
      } else {
        console.log(`✅ Test 4 Passed: Topic-specific math validation.`);
      }
    }
  }

  console.log(`\n==================================================`);
  if (failedTests === 0) {
    console.log(`🎉 ALL DATABASE CONTENT INTEGRITY CHECKS PASSED SUCCESSFULLY!`);
  } else {
    console.error(`❌ ${failedTests} CHECKS FAILED.`);
  }
  console.log(`==================================================\n`);

  await mongoose.disconnect();
}

validate().catch(console.error);
