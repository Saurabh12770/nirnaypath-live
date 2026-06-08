import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import Question from '../backend/models/Question.js';
import LearningContent from '../backend/models/LearningContent.js';

dotenv.config();

const SYLLABUS_DIR = path.resolve('data/syllabus');

async function runAudit() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
    console.log(`Connecting to database: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected.');

    const files = fs.readdirSync(SYLLABUS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
    const reportData = {};

    for (const file of files) {
      const examId = file.replace('.json', '');
      const raw = fs.readFileSync(path.join(SYLLABUS_DIR, file), 'utf-8');
      const data = JSON.parse(raw);
      const examName = data.exam;

      console.log(`Auditing exam: ${examName}`);

      let subjectsCount = 0;
      let topicsCount = 0;
      let subtopicsCount = 0;
      let subtopicsList = [];

      if (data.subjects) {
        subjectsCount = data.subjects.length;
        data.subjects.forEach(subj => {
          if (subj.topics) {
            topicsCount += subj.topics.length;
            subj.topics.forEach(top => {
              if (top.subtopics) {
                subtopicsCount += top.subtopics.length;
                top.subtopics.forEach(sub => {
                  subtopicsList.push({
                    subject: subj.name,
                    topic: top.name,
                    subtopic: sub
                  });
                });
              }
            });
          }
        });
      }

      const totalQuestions = await Question.countDocuments({ exam: new RegExp(`^${examName}$`, 'i') });
      const totalNotes = await LearningContent.countDocuments({ exam: new RegExp(`^${examName}$`, 'i') });

      let coveredSubtopicsCount = 0;
      let totalPyqsCount = 0;

      for (const item of subtopicsList) {
        const content = await LearningContent.findOne({
          exam: new RegExp(`^${examName}$`, 'i'),
          subtopic: new RegExp(`^${item.subtopic}$`, 'i')
        });

        if (content) {
          coveredSubtopicsCount++;
          if (content.pyqs) {
            totalPyqsCount += content.pyqs.length;
          }
        }
      }

      const coveragePercent = subtopicsCount > 0 ? (coveredSubtopicsCount / subtopicsCount) * 100 : 0;

      reportData[examName] = {
        subjects: subjectsCount,
        topics: topicsCount,
        subtopics: subtopicsCount,
        notes: totalNotes,
        pyqs: totalPyqsCount,
        mcqs: totalQuestions,
        coveragePercent: parseFloat(coveragePercent.toFixed(1))
      };
    }

    console.log('\n=== AUDIT RESULTS ===');
    console.log(JSON.stringify(reportData, null, 2));

    await mongoose.disconnect();
    console.log('Done.');
  } catch (err) {
    console.error(err);
  }
}

runAudit();
