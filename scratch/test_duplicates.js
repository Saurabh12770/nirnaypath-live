const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/computerscience.json');
if (!fs.existsSync(dataPath)) {
    console.log('File does not exist!');
    process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const questions = data.questions || [];

console.log('Total Questions:', questions.length);

const uniqueEn = new Set();
const uniqueHi = new Set();

questions.forEach(q => {
    if (q.question_en) uniqueEn.add(q.question_en.trim().toLowerCase());
    if (q.question_hi) uniqueHi.add(q.question_hi.trim().toLowerCase());
});

console.log('Unique English Questions:', uniqueEn.size);
console.log('Unique Hindi Questions:', uniqueHi.size);

if (questions.length > 0) {
    console.log('\nSample Questions (First 5):');
    questions.slice(0, 5).forEach((q, idx) => {
        console.log(`\n--- Question ${idx + 1} (${q.id}) ---`);
        console.log('EN:', q.question_en);
        console.log('HI:', q.question_hi);
        console.log('Options EN:', q.options_en);
        console.log('Explanation EN:', q.explanation_en);
    });
}
