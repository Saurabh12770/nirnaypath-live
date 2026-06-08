import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Question from '../models/Question.js';
import LearningContent from '../models/LearningContent.js';
import TestSession from '../models/TestSession.js';
import TestResult from '../models/TestResult.js';
import Bookmark from '../models/Bookmark.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const QUESTIONS_DIR = path.join(__dirname, '..', '..', 'data', 'questions');

// Define supported exams
const EXAMS = ['UPSC', 'BPSC', 'SSC CGL', 'SSC CHSL', 'Railway', 'Banking', 'State PCS'];

// Maps raw exam tags to supported exams
const mapExamTags = (tags, defaultExam) => {
  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    return [defaultExam];
  }
  const mapped = [];
  for (const tag of tags) {
    const t = tag.toUpperCase();
    if (t.includes('UPSC')) mapped.push('UPSC');
    else if (t.includes('BPSC')) mapped.push('BPSC');
    else if (t.includes('CGL')) mapped.push('SSC CGL');
    else if (t.includes('CHSL')) mapped.push('SSC CHSL');
    else if (t.includes('SSC')) {
      if (!mapped.includes('SSC CGL')) mapped.push('SSC CGL');
      if (!mapped.includes('SSC CHSL')) mapped.push('SSC CHSL');
    }
    else if (t.includes('RAILWAY') || t.includes('RRB')) mapped.push('Railway');
    else if (t.includes('BANK') || t.includes('IBPS') || t.includes('SBI')) mapped.push('Banking');
    else if (t.includes('PCS') || t.includes('STATE')) mapped.push('State PCS');
  }
  return mapped.length > 0 ? mapped : [defaultExam];
};

const seed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
    console.log(`Connecting to database: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Database connected successfully.');

    // Clear existing data
    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Question.deleteMany({});
    await LearningContent.deleteMany({});
    await TestSession.deleteMany({});
    await TestResult.deleteMany({});
    await Bookmark.deleteMany({});
    console.log('Collections cleared.');

    // 1. Seed Users
    console.log('Seeding users...');
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@nirnaypath.local',
      password: 'adminpassword123',
      role: 'admin',
    });
    const student = await User.create({
      name: 'Saurabh Kumar',
      email: 'student@nirnaypath.local',
      password: 'studentpassword123',
      role: 'student',
    });
    console.log(`Users seeded. Admin: ${admin.email}, Student: ${student.email}`);

    // 2. Seed Questions
    console.log('Scanning questions files...');
    if (!fs.existsSync(QUESTIONS_DIR)) {
      throw new Error(`Questions directory not found: ${QUESTIONS_DIR}`);
    }

    const files = fs.readdirSync(QUESTIONS_DIR).filter(f => f.endsWith('.json') && f !== 'test.json');
    console.log(`Found ${files.length} question files to process.`);

    let totalSaved = 0;

    for (const file of files) {
      console.log(`Processing file: ${file}`);
      const filePath = path.join(QUESTIONS_DIR, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      let data;
      try {
        data = JSON.parse(fileContent);
      } catch (err) {
        console.error(`Error parsing JSON in ${file}: ${err.message}`);
        continue;
      }

      // Check if file is list or object
      const rawQuestions = Array.isArray(data) ? data : data.questions;
      if (!rawQuestions || !Array.isArray(rawQuestions)) {
        console.log(`No questions found in ${file}. Skipping.`);
        continue;
      }

      // Determine default exam and subject from filename
      const subjectName = file.replace('.json', '');
      const defaultSubject = subjectName.charAt(0).toUpperCase() + subjectName.slice(1);
      
      // Determine default exam
      let defaultExam = 'SSC CGL';
      if (['chemistry', 'science', 'environment', 'geography', 'polity', 'economics', 'history'].includes(subjectName)) {
        defaultExam = 'UPSC';
      } else if (['bihar'].includes(subjectName)) {
        defaultExam = 'BPSC';
      } else if (['police_science'].includes(subjectName)) {
        defaultExam = 'State PCS';
      } else if (['math', 'reasoning', 'english', 'aptitude'].includes(subjectName)) {
        defaultExam = 'SSC CGL';
      }

      const bulkQuestions = [];

      for (const item of rawQuestions) {
        let qEn = '';
        let qHi = '';

        // 1. Parse Question Text
        if (item.question_en) {
          qEn = item.question_en;
          qHi = item.question_hi || '';
        } else if (typeof item.question === 'object' && item.question !== null) {
          qEn = item.question.en || '';
          qHi = item.question.hi || '';
        } else if (typeof item.question === 'string') {
          qEn = item.question;
          qHi = item.question_hi || '';
        }

        if (!qEn && !qHi) continue;

        // 2. Parse Options
        let options = [];
        if (item.options_en && Array.isArray(item.options_en)) {
          const optsEn = item.options_en;
          const optsHi = item.options_hi || [];
          const maxLen = Math.max(optsEn.length, optsHi.length);
          for (let i = 0; i < maxLen; i++) {
            options.push({
              en: optsEn[i] || '',
              hi: optsHi[i] || '',
            });
          }
        } else if (Array.isArray(item.options)) {
          if (item.options.length > 0) {
            const firstOpt = item.options[0];
            if (typeof firstOpt === 'object' && firstOpt !== null) {
              if (firstOpt.text && typeof firstOpt.text === 'object') {
                options = item.options.map(o => ({
                  en: o.text.en || '',
                  hi: o.text.hi || ''
                }));
              } else {
                options = item.options.map(o => ({
                  en: o.en || '',
                  hi: o.hi || ''
                }));
              }
            } else if (typeof firstOpt === 'string') {
              const optsEn = item.options;
              const optsHi = item.options_hi || [];
              const maxLen = Math.max(optsEn.length, optsHi.length);
              for (let i = 0; i < maxLen; i++) {
                options.push({
                  en: optsEn[i] || '',
                  hi: optsHi[i] || '',
                });
              }
            }
          }
        }

        // 3. Parse Explanation
        let expEn = '';
        let expHi = '';
        if (item.explanation_en) {
          expEn = item.explanation_en;
          expHi = item.explanation_hi || '';
        } else if (typeof item.explanation === 'object' && item.explanation !== null) {
          expEn = item.explanation.en || '';
          expHi = item.explanation.hi || '';
        } else if (typeof item.explanation === 'string') {
          expEn = item.explanation;
          expHi = item.explanation_hi || '';
        }

        // 4. Parse Correct Answer Index
        let answerIndex = 0;
        if (typeof item.correctAnswer === 'number') {
          answerIndex = item.correctAnswer;
        } else if (typeof item.correct_answer === 'string') {
          const idx = options.findIndex(o => o.en === item.correct_answer || o.hi === item.correct_answer);
          if (idx !== -1) {
            answerIndex = idx;
          } else {
            const code = item.correct_answer.toLowerCase();
            if (code === 'a' || code === '0') answerIndex = 0;
            else if (code === 'b' || code === '1') answerIndex = 1;
            else if (code === 'c' || code === '2') answerIndex = 2;
            else if (code === 'd' || code === '3') answerIndex = 3;
          }
        } else if (typeof item.correct_answer === 'number') {
          answerIndex = item.correct_answer;
        }

        // Map exams
        const questionExams = mapExamTags(item.exam_tags, defaultExam);

        for (const exam of questionExams) {
          bulkQuestions.push({
            exam,
            subject: item.subject || defaultSubject,
            topic: item.topic || 'General',
            subtopic: item.subtopic || item.topic || 'General Introduction',
            difficulty: ['easy', 'medium', 'hard'].includes((item.difficulty || 'medium').toLowerCase()) ? (item.difficulty || 'medium').toLowerCase() : 'medium',
            question: {
              en: qEn,
              hi: qHi,
            },
            options,
            answer: answerIndex,
            explanation: {
              en: expEn,
              hi: expHi,
            },
          });
        }
      }

      if (bulkQuestions.length > 0) {
        // Chunk inserts to avoid memory overflow for large files
        const chunkSize = 2000;
        for (let i = 0; i < bulkQuestions.length; i += chunkSize) {
          const chunk = bulkQuestions.slice(i, i + chunkSize);
          await Question.insertMany(chunk);
        }
        totalSaved += bulkQuestions.length;
        console.log(`Saved ${bulkQuestions.length} normalized questions from ${file}.`);
      }
    }

    console.log(`Questions seeding complete. Total inserted records: ${totalSaved}`);

    // 3. Seed Sample Learning Content (UPSC, BPSC, SSC CGL)
    console.log('Seeding sample learning content...');

    const sampleContent = [
      {
        exam: 'UPSC',
        subject: 'History',
        topic: 'Ancient India',
        subtopic: 'Indus Valley Civilization',
        introduction: 'The Indus Valley Civilization (IVC), also known as the Harappan Civilization, was a Bronze Age civilization in the northwestern regions of South Asia, lasting from 3300 BCE to 1300 BCE.',
        detailedExplanation: '### Origin and Expansion\nFirst discovered in 1921 at Harappa in the Punjab region and then in 1922 at Mohenjo-daro near the Indus River. The civilization extended from Balochistan in the west to western Uttar Pradesh in the east.\n\n### Town Planning and Architecture\nOne of the most remarkable features of the Indus Valley Civilization was its advanced urban planning. Cities were divided into a Citadel (for administrative buildings) and a Lower Town (for housing). Streets were laid out in a grid pattern crossing at right angles.\n\n### Drainage System\nEvery house was connected to a street drain, covered with stone slabs or bricks, exhibiting a high standard of sanitary hygiene.',
        concepts: [
          'Grid Pattern Town Layout',
          'Standardized Burnt Clay Bricks (4:2:1 ratio)',
          'Citadel vs Lower Town Structure'
        ],
        importantFacts: [
          'Great Bath was located at Mohenjo-daro, used for ritual bathing.',
          'Dockyard was discovered at Lothal, Gujarat, confirming maritime trade.',
          'Steatite seals featuring Pashupati (proto-Shiva) and Mother Goddess images.'
        ],
        examples: [
          'Trade relations with Mesopotamia and Persia.',
          'Unique drainage systems in houses showing high civic consciousness.'
        ],
        tables: [
          {
            title: 'Important Harappan Sites and Key Finds',
            headers: ['Site Name', 'Location', 'Archaeologist', 'Major Discoveries'],
            rows: [
              ['Harappa', 'Punjab (Pakistan)', 'Daya Ram Sahni (1921)', 'Granaries, Bronze sculpture of dancer'],
              ['Mohenjo-daro', 'Sindh (Pakistan)', 'R.D. Banerjee (1922)', 'Great Bath, Bearded Priest statue, Pashupati Seal'],
              ['Lothal', 'Gujarat (India)', 'S.R. Rao (1954)', 'Dockyard, Rice husk, Double burial']
            ]
          }
        ],
        revisionNotes: 'Remember: IVC was a Bronze Age civilization. Script is pictographic and remains undeciphered. Major exports included cotton and terracotta products. It declined around 1900 BCE due to climate change, drying of rivers, or flooding.',
        pyqs: [
          {
            question: {
              en: 'Which of the following Harappan sites is famous for its water management system?',
              hi: 'निम्नलिखित में से कौन सा हड़प्पा स्थल अपनी जल प्रबंधन प्रणाली के लिए प्रसिद्ध है?'
            },
            options: [
              { en: 'Lothal', hi: 'लोथल' },
              { en: 'Dholavira', hi: 'धोलावीरा' },
              { en: 'Harappa', hi: 'हड़प्पा' },
              { en: 'Kalibangan', hi: 'कालीबंगा' }
            ],
            answer: 1,
            explanation: {
              en: 'Dholavira is known for its unique water harvesting system and storm water drainage reservoirs.',
              hi: 'धोलावीरा अपनी अनूठी जल संचयन प्रणाली और तूफान जल निकासी जलाशयों के लिए जाना जाता है।'
            },
            year: 2021
          }
        ],
        relatedTopics: [
          { exam: 'UPSC', subject: 'History', topic: 'Ancient India', subtopic: 'Vedic Period' }
        ]
      },
      {
        exam: 'BPSC',
        subject: 'Bihar Special',
        topic: 'Bihar History',
        subtopic: 'Ancient Bihar',
        introduction: 'Bihar was the cradle of India’s most powerful empires in antiquity, serving as the center of politics, culture, and learning in the subcontinent.',
        detailedExplanation: '### Mahajanapadas of Bihar\nOut of the 16 Mahajanapadas mentioned in Buddhist texts, three were located in Bihar: Magadha, Anga, and Vajji (the world\'s first republic at Vaishali).\n\n### Rise of Magadha Empire\nMagadha rose to prominence under dynasties like Haryanka (Bimbisara, Ajatashatru), Shishunaga, Nanda, and Maurya. Rajgir was the initial capital, later shifted to Pataliputra (modern Patna).',
        concepts: [
          'Republican governance of Vajji Sangha',
          'Patronage of Buddhism and Jainism'
        ],
        importantFacts: [
          'Gautama Buddha attained enlightenment at Bodh Gaya under the Bodhi tree.',
          'Lord Mahavira attained Nirvana at Pawapuri.',
          'Nalanda University was founded by Kumargupta I of the Gupta Dynasty.'
        ],
        examples: [
          'The Ashokan Pillars found in Lauriya Nandangarh, Bihar.'
        ],
        tables: [
          {
            title: 'Buddhist Councils held in Bihar',
            headers: ['Council', 'Location', 'Patron King', 'President'],
            rows: [
              ['First Council', 'Rajgriha', 'Ajatashatru', 'Mahakashyapa'],
              ['Second Council', 'Vaishali', 'Kalashoka', 'Sabakami'],
              ['Third Council', 'Pataliputra', 'Ashoka', 'Moggaliputta Tissa']
            ]
          }
        ],
        revisionNotes: 'BPSC GK Focus: Ajatashatru built the fort of Rajgir. Patliputra was founded by Udayin.',
        pyqs: [
          {
            question: {
              en: 'Where was the first Buddhist Council held?',
              hi: 'प्रथम बौद्ध संगीति कहाँ आयोजित की गई थी?'
            },
            options: [
              { en: 'Vaishali', hi: 'वैशाली' },
              { en: 'Pataliputra', hi: 'पाटलिपुत्र' },
              { en: 'Rajgriha', hi: 'राजगृह' },
              { en: 'Nalanda', hi: 'नालंदा' }
            ],
            answer: 2,
            explanation: {
              en: 'The first Buddhist Council was held in Rajgriha (Rajgir) immediately after Buddha\'s death under Ajatashatru\'s patronage.',
              hi: 'बुद्ध की मृत्यु के तुरंत बाद अजातशत्रु के संरक्षण में राजगृह (राजगीर) में प्रथम बौद्ध संगीति आयोजित की गई थी।'
            },
            year: 2018
          }
        ]
      }
    ];

    // Seed sample content
    for (const contentItem of sampleContent) {
      // Find matching practice MCQs to link to this content
      const practiceQuestions = await Question.find({
        exam: contentItem.exam,
        subject: contentItem.subject,
        topic: contentItem.topic,
        subtopic: contentItem.subtopic
      }).limit(5);

      contentItem.practiceMcqs = practiceQuestions.map(q => q._id);
      await LearningContent.create(contentItem);
    }
    console.log('Sample learning content seeded successfully.');

    await mongoose.disconnect();
    console.log('Database disconnected. Seeding completed successfully.');
  } catch (error) {
    console.error(`Error seeding database: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

seed();
