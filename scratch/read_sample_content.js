import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';

const learningContentSchema = new mongoose.Schema({
  exam: String,
  subject: String,
  topic: String,
  subtopic: String,
  introduction: String,
  detailedExplanation: String,
  concepts: [String],
  importantFacts: [String],
  revisionNotes: String,
  pyqs: [mongoose.Schema.Types.Mixed]
});

const LearningContent = mongoose.models.LearningContent || mongoose.model('LearningContent', learningContentSchema, 'learningcontents');

async function readSample() {
  await mongoose.connect(MONGO_URI);
  
  // Find a UPSC History doc
  const upscHist = await LearningContent.findOne({ exam: 'UPSC', subject: /history/i });
  console.log('\n=== SAMPLE UPSC HISTORY ===');
  if (upscHist) {
    console.log(`Subtopic: ${upscHist.subtopic}`);
    console.log(`Introduction length: ${upscHist.introduction.split(/\s+/).length} words`);
    console.log(`Detailed explanation length: ${upscHist.detailedExplanation.split(/\s+/).length} words`);
    console.log(`Concepts: ${JSON.stringify(upscHist.concepts)}`);
    console.log(`Facts count: ${upscHist.importantFacts.length}`);
    console.log(`Detailed explanation snippet:\n${upscHist.detailedExplanation.substring(0, 400)}...\n`);
  }

  // Find a BPSC Special doc
  const bpscSpec = await LearningContent.findOne({ exam: 'BPSC', subject: /special/i });
  console.log('=== SAMPLE BPSC BIHAR SPECIAL ===');
  if (bpscSpec) {
    console.log(`Subtopic: ${bpscSpec.subtopic}`);
    console.log(`Detailed explanation snippet:\n${bpscSpec.detailedExplanation.substring(0, 400)}...\n`);
  }

  // Find a Banking Math/Reasoning doc
  const bankMath = await LearningContent.findOne({ exam: 'Banking', subject: /math|reasoning/i });
  console.log('=== SAMPLE BANKING MATH/REASONING ===');
  if (bankMath) {
    console.log(`Subtopic: ${bankMath.subtopic}`);
    console.log(`Detailed explanation snippet:\n${bankMath.detailedExplanation.substring(0, 400)}...\n`);
  }

  await mongoose.disconnect();
}

readSample();
