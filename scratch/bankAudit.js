const fs = require('fs');
const path = require('path');

const dataPath = path.resolve(__dirname, '../data/computerscience.json');
console.log(`🔍 Starting Forensic Audit for: ${dataPath}`);

if (!fs.existsSync(dataPath)) {
    console.error(`❌ Error: Question bank file does not exist at: ${dataPath}`);
    process.exit(1);
}

let data;
try {
    const raw = fs.readFileSync(dataPath, 'utf8');
    data = JSON.parse(raw);
    console.log(`✅ File parsed successfully as JSON.`);
} catch (err) {
    console.error(`❌ Error parsing JSON: ${err.message}`);
    process.exit(1);
}

// 1. Top-Level Structure Verification
if (data.subject !== "Computer Science") {
    console.error(`❌ Error: Subject mismatch. Expected 'Computer Science', got '${data.subject}'`);
    process.exit(1);
}
if (data.count !== 5000) {
    console.error(`❌ Error: Declared count mismatch. Expected 5000, got ${data.count}`);
    process.exit(1);
}
if (!Array.isArray(data.questions)) {
    console.error(`❌ Error: 'questions' field must be an array.`);
    process.exit(1);
}

const questions = data.questions;
console.log(`📋 Question Array Size: ${questions.length}`);

if (questions.length !== 5000) {
    console.error(`❌ Error: Found ${questions.length} questions in array, but exactly 5000 is required.`);
    process.exit(1);
}

// 2. Comprehensive Question Loop Audits
const idSet = new Set();
const enSet = new Set();
const hiSet = new Set();
const difficulties = { easy: 0, medium: 0, hard: 0 };
let errors = 0;

questions.forEach((q, idx) => {
    const qNum = idx + 1;

    // Check presence of essential fields
    const requiredFields = [
        'id', 'subject', 'topic', 'difficulty', 'question_en', 'question_hi',
        'options_en', 'options_hi', 'correctAnswer', 'explanation_en', 'explanation_hi',
        'exam_tags', 'reference', 'year_asked'
    ];

    requiredFields.forEach(field => {
        if (q[field] === undefined || q[field] === null) {
            console.error(`❌ Q${qNum}: Missing required field '${field}'`);
            errors++;
        }
    });

    if (q.id) {
        if (!/^COMP-\d{4}$/.test(q.id)) {
            console.error(`❌ Q${qNum}: Invalid ID format: '${q.id}'. Expected COMP-XXXX.`);
            errors++;
        }
        if (idSet.has(q.id)) {
            console.error(`❌ Q${qNum}: Duplicate ID detected: '${q.id}'`);
            errors++;
        }
        idSet.add(q.id);
    }

    if (q.subject !== "Computer Science") {
        console.error(`❌ Q${qNum}: Subject is not 'Computer Science', got '${q.subject}'`);
        errors++;
    }

    if (q.difficulty) {
        if (!['easy', 'medium', 'hard'].includes(q.difficulty)) {
            console.error(`❌ Q${qNum}: Invalid difficulty tag: '${q.difficulty}'`);
            errors++;
        } else {
            difficulties[q.difficulty]++;
        }
    }

    // Question content checks
    if (q.question_en) {
        const trimmed = q.question_en.trim();
        if (trimmed.length < 15) {
            console.error(`❌ Q${qNum}: English question text is too short: '${trimmed}'`);
            errors++;
        }
        const norm = trimmed.toLowerCase();
        if (enSet.has(norm)) {
            console.error(`❌ Q${qNum}: Duplicate English question text detected: '${trimmed.slice(0, 60)}...'`);
            errors++;
        }
        enSet.add(norm);
    }

    if (q.question_hi) {
        const trimmed = q.question_hi.trim();
        if (trimmed.length < 15) {
            console.error(`❌ Q${qNum}: Hindi question text is too short: '${trimmed}'`);
            errors++;
        }
        const norm = trimmed.toLowerCase();
        if (hiSet.has(norm)) {
            console.error(`❌ Q${qNum}: Duplicate Hindi question text detected: '${trimmed.slice(0, 60)}...'`);
            errors++;
        }
        hiSet.add(norm);
    }

    // Options checks
    if (Array.isArray(q.options_en)) {
        if (q.options_en.length !== 4) {
            console.error(`❌ Q${qNum}: 'options_en' does not have exactly 4 items.`);
            errors++;
        }
        const uniqOpts = new Set(q.options_en.map(o => o.trim().toLowerCase()));
        if (uniqOpts.size !== 4) {
            console.error(`❌ Q${qNum}: Duplicate option values in 'options_en': [${q.options_en.join(' | ')}]`);
            errors++;
        }
    }
    if (Array.isArray(q.options_hi)) {
        if (q.options_hi.length !== 4) {
            console.error(`❌ Q${qNum}: 'options_hi' does not have exactly 4 items.`);
            errors++;
        }
        const uniqOpts = new Set(q.options_hi.map(o => o.trim().toLowerCase()));
        if (uniqOpts.size !== 4) {
            console.error(`❌ Q${qNum}: Duplicate option values in 'options_hi': [${q.options_hi.join(' | ')}]`);
            errors++;
        }
    }

    // Correct Answer index check
    if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
        console.error(`❌ Q${qNum}: Invalid correctAnswer index: '${q.correctAnswer}'. Must be an integer 0 to 3.`);
        errors++;
    }

    // Explanation checks
    if (q.explanation_en) {
        if (q.explanation_en.length < 100) {
            console.error(`❌ Q${qNum}: English explanation is too short (${q.explanation_en.length} chars).`);
            errors++;
        }
    }
    if (q.explanation_hi) {
        if (q.explanation_hi.length < 100) {
            console.error(`❌ Q${qNum}: Hindi explanation is too short (${q.explanation_hi.length} chars).`);
            errors++;
        }
    }
});

// 3. Difficulty Distribution verification
console.log(`\n📊 Difficulty Distribution Stats:`);
console.log(`   - Easy:   ${difficulties.easy} (Target: 1000 / 20.0%)`);
console.log(`   - Medium: ${difficulties.medium} (Target: 2250 / 45.0%)`);
console.log(`   - Hard:   ${difficulties.hard} (Target: 1750 / 35.0%)`);

if (difficulties.easy !== 1000) {
    console.error(`❌ Error: Easy count is ${difficulties.easy}, but must be exactly 1000.`);
    errors++;
}
if (difficulties.medium !== 2250) {
    console.error(`❌ Error: Medium count is ${difficulties.medium}, but must be exactly 2250.`);
    errors++;
}
if (difficulties.hard !== 1750) {
    console.error(`❌ Error: Hard count is ${difficulties.hard}, but must be exactly 1750.`);
    errors++;
}

// 4. Duplicate checks count confirmation
if (idSet.size !== 5000) {
    console.error(`❌ Error: Unique IDs count is ${idSet.size}, but must be exactly 5000.`);
    errors++;
}
if (enSet.size !== 5000) {
    console.error(`❌ Error: Unique English questions is ${enSet.size}, but must be exactly 5000 (100% uniqueness required).`);
    errors++;
}
if (hiSet.size !== 5000) {
    console.error(`❌ Error: Unique Hindi questions is ${hiSet.size}, but must be exactly 5000 (100% uniqueness required).`);
    errors++;
}

console.log(`\n🔍 Audit Summary:`);
if (errors === 0) {
    console.log(`🏆 SUCCESS: 0 errors found! The question bank is 100% compliant, unique, bilingually complete, and balanced.`);
    process.exit(0);
} else {
    console.error(`💥 FAILURE: ${errors} errors found in the question bank. Please fix them.`);
    process.exit(1);
}
