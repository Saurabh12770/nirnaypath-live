const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

function validate() {
    console.log("--- Question Bank Validation Report ---");
    let totalIssues = 0;

    files.forEach(file => {
        const filePath = path.join(DATA_DIR, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const questions = data.questions || [];
        const subject = data.subject || file;

        let issues = [];
        const ids = new Set();
        const diffCount = { easy: 0, medium: 0, hard: 0 };

        questions.forEach((q, idx) => {
            // Check required fields
            const required = ['id', 'question_en', 'question_hi', 'options_en', 'options_hi', 'correctAnswer', 'explanation_en', 'explanation_hi'];
            required.forEach(f => {
                if (q[f] === undefined || q[f] === null || q[f] === '') issues.push(`Q[${idx}] missing ${f}`);
            });

            // Check ID uniqueness
            if (ids.has(q.id)) issues.push(`Duplicate ID: ${q.id}`);
            else ids.add(q.id);

            // Check difficulty
            if (diffCount[q.difficulty] !== undefined) diffCount[q.difficulty]++;

            // Check options count
            if (q.options_en?.length !== 4 || q.options_hi?.length !== 4) {
                issues.push(`Q[${q.id}] does not have 4 options`);
            }

            // Check bilingual consistency (simplified)
            if (q.question_en && q.question_hi && q.question_en === q.question_hi) {
                issues.push(`Q[${q.id}] has identical EN/HI question text (potential translation error)`);
            }
        });

        const count = questions.length;
        const ePct = ((diffCount.easy / count) * 100).toFixed(1);
        const mPct = ((diffCount.medium / count) * 100).toFixed(1);
        const hPct = ((diffCount.hard / count) * 100).toFixed(1);

        console.log(`\nSubject: ${subject}`);
        console.log(`Total Questions: ${count}`);
        console.log(`Difficulty Dist: Easy ${ePct}%, Medium ${mPct}%, Hard ${hPct}%`);
        
        if (issues.length > 0) {
            console.log(`Issues Found: ${issues.length}`);
            issues.slice(0, 5).forEach(msg => console.log(` - ${msg}`));
            if (issues.length > 5) console.log(` ... and ${issues.length - 5} more.`);
            totalIssues += issues.length;
        } else {
            console.log("Status: PERFECT");
        }
    });

    console.log(`\nValidation complete. Total subjects audited: ${files.length}. Total issues: ${totalIssues}.`);
}

validate();
