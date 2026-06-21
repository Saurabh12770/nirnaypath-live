import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';

const normalizeSearchCriteria = (exam, subject) => {
  let normalizedExam = exam;
  let normalizedSubject = subject;

  if (exam) {
    const eUpper = exam.toUpperCase().trim();
    if (eUpper === 'UPSC') normalizedExam = 'UPSC';
    else if (eUpper === 'BPSC') normalizedExam = 'BPSC';
    else if (eUpper === 'SSC-CGL' || eUpper === 'SSC CGL') normalizedExam = 'SSC CGL';
    else if (eUpper === 'SSC-CHSL' || eUpper === 'SSC CHSL') normalizedExam = 'SSC CHSL';
    else if (eUpper === 'RAILWAY') normalizedExam = 'Railway';
    else if (eUpper === 'BANKING') normalizedExam = 'Banking';
    else if (eUpper === 'STATE-PCS' || eUpper === 'STATE PCS') normalizedExam = 'State PCS';
  }

  if (subject) {
    const sClean = subject.trim().toLowerCase();
    
    if (sClean.includes('history')) {
      normalizedSubject = 'history';
    } else if (sClean.includes('polity')) {
      normalizedSubject = 'Polity';
    } else if (sClean.includes('geography')) {
      normalizedSubject = 'Geography';
    } else if (sClean.includes('economics') || sClean === 'economy') {
      normalizedSubject = 'Economics';
    } else if (sClean.includes('environment')) {
      normalizedSubject = 'Environment';
    } else if (sClean.includes('general science') || sClean === 'science') {
      normalizedSubject = 'Science';
    } else if (sClean.includes('reasoning') || sClean.includes('intelligence')) {
      normalizedSubject = 'Reasoning';
    } else if (sClean.includes('aptitude') || sClean.includes('quantitative')) {
      normalizedSubject = 'Aptitude';
    } else if (sClean.includes('english')) {
      normalizedSubject = 'English';
    }
  }

  return { exam: normalizedExam, subject: normalizedSubject };
};

async function testSimulate(exam, subject, topic) {
  const db = mongoose.connection.db;
  const questionsCol = db.collection('questions');
  
  const { exam: normExam, subject: normSubject } = normalizeSearchCriteria(exam, subject);
  
  // 1. Strict Query
  const matchQuery = { exam: normExam, subject: normSubject, topic: topic };
  let questions = await questionsCol.aggregate([
    { $match: matchQuery },
    { $sample: { size: 10 } }
  ]).toArray();
  
  console.log(`\nSimulation: exam="${exam}", subject="${subject}", topic="${topic}"`);
  console.log(`- Strict Query matching [${JSON.stringify(matchQuery)}]: Found ${questions.length} questions`);
  
  if (questions.length === 0) {
    // 2. Fuzzy fallback
    console.log(`- Strict query found 0. Running fuzzy fallback...`);
    const fallbackQuery = {
      exam: new RegExp(`^${exam.replace(/[-_]/g, '[-\\s_]?')}$`, 'i')
    };
    
    if (subject) {
      const cleanSub = subject.replace(/General|Intelligence|Comprehension|Quantitative|&/gi, '').trim();
      fallbackQuery.subject = new RegExp(cleanSub, 'i');
    }
    
    if (topic) {
      const keywords = topic.split(/[\s&,—_\-\/]+/).filter(k => k.length > 3 && !/^(about|and|or|the|with|for|from|into|onto|upon)$/i.test(k));
      if (keywords.length > 0) {
        const regexStr = keywords.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
        fallbackQuery.topic = new RegExp(regexStr, 'i');
      } else {
        fallbackQuery.topic = new RegExp(`^${topic}$`, 'i');
      }
    }
    
    questions = await questionsCol.aggregate([
      { $match: fallbackQuery },
      { $sample: { size: 10 } }
    ]).toArray();
    
    console.log(`- Fuzzy fallback query matching [${JSON.stringify(fallbackQuery)}]: Found ${questions.length} questions`);
  }
}

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB.');
  
  // Test cases that used to fail due to topic title mismatch
  await testSimulate('UPSC', 'Polity', 'Indian Constitution');
  await testSimulate('UPSC', 'Polity', 'Parliament & Legislature');
  await testSimulate('BPSC', 'history', 'Ancient Bihar — Magadha Empire & Pataliputra');
  
  await mongoose.disconnect();
}

run().catch(console.error);
