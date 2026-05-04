const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

const report = [];

files.forEach(file => {
  const filePath = path.join(dataDir, file);
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const subjectName = data.subject || file.replace('.json', '');
    const questions = data.questions || [];
    const count = questions.length;

    const difficultyDist = { easy: 0, medium: 0, hard: 0 };
    const topics = new Set();
    let duplicateIds = 0;
    const ids = new Set();
    let missingFields = 0;
    let bilingualExplanations = 0;

    questions.forEach(q => {
      // Difficulty
      if (difficultyDist[q.difficulty] !== undefined) {
        difficultyDist[q.difficulty]++;
      }

      // Topic
      if (q.topic) topics.add(q.topic);

      // ID uniqueness
      if (ids.has(q.id)) {
        duplicateIds++;
      } else {
        ids.add(q.id);
      }

      // Quality checks
      const requiredFields = [
        'id', 'subject', 'topic', 'difficulty', 'question_en', 'question_hi',
        'options_en', 'options_hi', 'correctAnswer', 'explanation_en', 'explanation_hi'
      ];
      let missing = false;
      requiredFields.forEach(f => {
        if (q[f] === undefined || q[f] === null || q[f] === '') missing = true;
      });
      if (missing) missingFields++;

      // Bilingual explanations
      if (q.explanation_en && q.explanation_hi && q.explanation_en !== q.explanation_hi) {
         bilingualExplanations++;
      }
    });

    report.push({
      subject: subjectName,
      file: file,
      count: count,
      difficulty: {
        easy: ((difficultyDist.easy / count) * 100).toFixed(1) + '%',
        medium: ((difficultyDist.medium / count) * 100).toFixed(1) + '%',
        hard: ((difficultyDist.hard / count) * 100).toFixed(1) + '%'
      },
      topicsCount: topics.size,
      topics: Array.from(topics).slice(0, 5), // Samples
      duplicateIds,
      missingFields,
      bilingualExplPct: ((bilingualExplanations / count) * 100).toFixed(1) + '%'
    });
  } catch (e) {
    report.push({ file: file, error: e.message });
  }
});

console.log(JSON.stringify(report, null, 2));
