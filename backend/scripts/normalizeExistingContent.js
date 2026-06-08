import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';

const MAPPINGS = [
  // UPSC History
  {
    find: { exam: 'UPSC', subtopic: 'Indus Valley Civilization' },
    update: { subtopic: 'Indus Valley Civilization — Trade, Religion & Decline' }
  },
  {
    find: { exam: 'UPSC', subtopic: 'Vedic Period' },
    update: { subtopic: 'Vedic Age — Early Vedic Period (Rigvedic)' }
  },
  {
    find: { exam: 'UPSC', subtopic: 'Maurya Empire' },
    update: { subtopic: 'Ashokan Edicts & Dhamma' }
  },
  {
    find: { exam: 'UPSC', subtopic: 'Gupta Empire' },
    update: { subtopic: 'Gupta Empire — Political History' }
  },
  {
    find: { exam: 'UPSC', subtopic: 'Delhi Sultanate' },
    update: { subtopic: 'Delhi Sultanate — Slave Dynasty' }
  },
  {
    find: { exam: 'UPSC', subtopic: 'Revolt of 1857' },
    update: { subtopic: 'Revolt of 1857 — Causes, Spread & Aftermath' }
  },
  {
    find: { exam: 'UPSC', subtopic: 'Partition of Bengal and Swadeshi Movement' },
    update: { subtopic: 'Partition of Bengal 1905 & Swadeshi Movement' }
  },
  // UPSC Polity
  {
    find: { exam: 'UPSC', subtopic: 'Preamble' },
    update: { subject: 'Polity', topic: 'Indian Constitution', subtopic: 'Salient Features of Indian Constitution' }
  },
  {
    find: { exam: 'UPSC', subtopic: 'Preamble of the Constitution' },
    update: { subject: 'Polity', topic: 'Indian Constitution', subtopic: 'Preamble of the Indian Constitution' }
  },
  {
    find: { exam: 'UPSC', subtopic: 'Fundamental Rights (Part III)' },
    update: { subject: 'Polity', topic: 'Indian Constitution', subtopic: 'Right to Equality (Articles 14–18)' }
  },
  {
    find: { exam: 'UPSC', subtopic: 'Directive Principles of State Policy (Part IV)' },
    update: { subject: 'Polity', topic: 'Indian Constitution', subtopic: 'Directive Principles of State Policy (DPSP)' }
  },
  // UPSC Geography
  {
    find: { exam: 'UPSC', subtopic: 'Physical Divisions of India' },
    update: { subject: 'Geography', topic: 'Indian Geography', subtopic: 'Himalayas — Formation, Divisions & Passes' }
  },
  // BPSC Special
  {
    find: { exam: 'BPSC', subtopic: 'Ancient Bihar' },
    update: { subject: 'Bihar Special', topic: 'Bihar History', subtopic: 'Buddhist & Jain Heritage in Bihar' }
  },
  {
    find: { exam: 'BPSC', subtopic: 'Ancient Bihar (Mahajanapadas & Magadha)' },
    update: { subject: 'Bihar Special', topic: 'Bihar History', subtopic: 'Ancient Bihar — Magadha Empire & Pataliputra' }
  },
  {
    find: { exam: 'BPSC', subtopic: 'River Systems of Bihar' },
    update: { subject: 'Bihar Special', topic: 'Bihar Geography', subtopic: 'Rivers of Bihar — Ganga, Gandak, Koshi, Son' }
  },
  {
    find: { exam: 'BPSC', subtopic: 'Bihar Legislative Assembly & State Government' },
    update: { subject: 'Bihar Special', topic: 'Bihar Polity & Governance', subtopic: 'Bihar Legislative Assembly — Structure & Functions' }
  },
  {
    find: { exam: 'BPSC', subtopic: 'Freedom Struggle in Bihar — Champaran to 1947' },
    update: { subject: 'Bihar Special', topic: 'Bihar History', subtopic: 'Freedom Movement in Bihar — Key Figures' }
  },
  {
    find: { exam: 'BPSC', subtopic: 'Magadha Empire & Mahajanapadas' },
    update: { subject: 'History', topic: 'Ancient India', subtopic: 'Mahajanapadas & Magadha' }
  },
  // SSC CGL
  {
    find: { exam: 'SSC CGL', subtopic: 'Number System' },
    update: { subject: 'Math', topic: 'Arithmetic Ability', subtopic: 'Number System — HCF, LCM, Divisibility' }
  },
  {
    find: { exam: 'SSC CGL', subtopic: 'Simple & Compound Interest' },
    update: { subject: 'Quantitative Aptitude', topic: 'Arithmetic', subtopic: 'Simple Interest' }
  },
  {
    find: { exam: 'SSC CGL', subtopic: 'Active and Passive Voice' },
    update: { subject: 'English Language', topic: 'Grammar', subtopic: 'Active & Passive Voice' }
  },
  {
    find: { exam: 'SSC CGL', subtopic: 'Constitutional Bodies — CAG, UPSC, Election Commission' },
    update: { subject: 'General Awareness', topic: 'Polity & Constitution', subtopic: 'Constitutional Bodies & Statutory Bodies' }
  },
  // Railway
  {
    find: { exam: 'Railway', subtopic: 'Indian Railway System Overview' },
    update: { subject: 'General Awareness', topic: 'GK & Current Events', subtopic: 'Indian Railways History, Facts and Statistics' }
  },
  {
    find: { exam: 'Railway', subtopic: 'HCF and LCM — Methods & Applications' },
    update: { subject: 'Mathematics', topic: 'Arithmetic & Algebra', subtopic: 'LCM and HCF' }
  },
  // Banking
  {
    find: { exam: 'Banking', subtopic: 'Reserve Bank of India (RBI) & Monetary Policy' },
    update: { subject: 'General Awareness', topic: 'Banking & Financial Awareness', subtopic: 'RBI Structure, Functions, and Monetary Policy' }
  },
  {
    find: { exam: 'Banking', subtopic: 'Syllogisms & Logical Deduction' },
    update: { subject: 'Reasoning', topic: 'Logical & Analytical Reasoning', subtopic: 'Syllogism (Only/Few concepts)' }
  },
  {
    find: { exam: 'Banking', subtopic: 'Bar Graphs, Line Charts & Pie Charts' },
    update: { subject: 'Math', topic: 'Quantitative Aptitude & DI', subtopic: 'Data Interpretation (Table, Bar, Line, Pie, Mixed & Caselets)' }
  },
  {
    find: { exam: 'Banking', subtopic: 'Types of Bank Accounts & Banking Products' },
    update: { subject: 'General Awareness', topic: 'Banking & Financial Awareness', subtopic: 'Banking Terminology and Instruments (Cheques, DD, Bills)' }
  },
  // State PCS
  {
    find: { exam: 'State PCS', subtopic: 'Vijayanagara Empire — Administration & Culture' },
    update: { subject: 'History', topic: 'Indian History & Culture', subtopic: 'Marathas and Southern Dynasties' }
  },
  {
    find: { exam: 'State PCS', subtopic: 'GST — Structure & Implementation' },
    update: { subject: 'Economics', topic: 'Socio-Economic Development', subtopic: 'Fiscal Policy, Taxation, and Union Budget' }
  },
  {
    find: { exam: 'State PCS', subtopic: 'Artificial Intelligence — Concepts & Applications' },
    update: { subject: 'Science', topic: 'General Science & Tech', subtopic: 'Information Technology, Computer Science & AI Applications' }
  },
  // SSC CHSL
  {
    find: { exam: 'SSC CHSL', subtopic: 'Parliament — Structure & Functions' },
    update: { subject: 'General Awareness', topic: 'General Knowledge', subtopic: 'Indian Constitution & Polity' }
  },
  {
    find: { exam: 'SSC CHSL', subtopic: 'Acids, Bases & Salts' },
    update: { subject: 'General Awareness', topic: 'General Knowledge', subtopic: 'Chemistry Basics' }
  }
];

async function normalize() {
  console.log(`🔌 Connecting to: ${MONGO_URI}`);
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected.\n');

  const db = mongoose.connection.db;
  const collection = db.collection('learningcontents');

  // Delete duplicates first to avoid unique key index collisions
  console.log('🧹 Removing duplicates/unwanted documents...');
  // Newton's Laws of Motion in Railway: Physics Basics covers it.
  const del1 = await collection.deleteOne({ exam: 'Railway', subtopic: "Newton's Laws of Motion" });
  console.log(`- Deleted Newton's Laws of Motion Railway doc: ${del1.deletedCount}`);

  let updatedCount = 0;
  for (const map of MAPPINGS) {
    try {
      const existing = await collection.findOne(map.find);
      if (existing) {
        // Check if there is already a document with the target subtopic to avoid collision
        const targetSubtopic = map.update.subtopic || map.find.subtopic;
        const collision = await collection.findOne({ subtopic: targetSubtopic });
        if (collision && collision._id.toString() !== existing._id.toString()) {
          console.log(`⚠️ Collision detected for subtopic "${targetSubtopic}". Removing old duplicate...`);
          await collection.deleteOne({ _id: existing._id });
          continue;
        }

        await collection.updateOne(
          { _id: existing._id },
          { $set: map.update }
        );
        console.log(`✅ Normalized: ${map.find.exam} | "${map.find.subtopic}" ➔ "${targetSubtopic}"`);
        updatedCount++;
      }
    } catch (err) {
      console.error(`❌ Error updating ${map.find.subtopic}: ${err.message}`);
    }
  }

  console.log(`\n📊 MIGRATION COMPLETE | Updated: ${updatedCount} documents.`);
  await mongoose.disconnect();
  console.log('🔌 Disconnected.');
}

normalize().catch(console.error);
