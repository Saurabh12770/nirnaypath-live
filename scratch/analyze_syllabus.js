import fs from 'fs';
import path from 'path';

const SYLLABUS_DIR = path.resolve('data/syllabus');

function analyze() {
  const files = fs.readdirSync(SYLLABUS_DIR).filter(f => f.endsWith('.json') && f !== 'index.json');
  const allSubtopics = {};
  let totalSubtopics = 0;

  for (const file of files) {
    const raw = fs.readFileSync(path.join(SYLLABUS_DIR, file), 'utf-8');
    const data = JSON.parse(raw);
    const examName = data.exam;
    
    if (data.subjects) {
      data.subjects.forEach(subj => {
        if (subj.topics) {
          subj.topics.forEach(top => {
            if (top.subtopics) {
              top.subtopics.forEach(sub => {
                totalSubtopics++;
                const key = sub.toLowerCase().trim();
                if (!allSubtopics[key]) {
                  allSubtopics[key] = [];
                }
                allSubtopics[key].push({
                  exam: examName,
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
  }

  console.log(`Total subtopics found in syllabus files: ${totalSubtopics}`);
  console.log(`Unique subtopic names (lowercase): ${Object.keys(allSubtopics).length}`);

  const duplicates = Object.entries(allSubtopics).filter(([k, v]) => v.length > 1);
  console.log(`\nDuplicate subtopic names across exams: ${duplicates.length}`);
  
  if (duplicates.length > 0) {
    console.log('Sample duplicates:');
    duplicates.slice(0, 10).forEach(([name, occurrences]) => {
      console.log(`- "${name}":`);
      occurrences.forEach(o => {
        console.log(`  * Exam: ${o.exam} | Subject: ${o.subject} | Topic: ${o.topic}`);
      });
    });
  }
}

analyze();
