/**
 * NirnayPath Subject Bank Forensic Audit Script
 * Checks all JSON files for data integrity, duplicates, and malformations.
 */

const fs = require('fs');
const path = require('path');
const { normalizeQuestion } = require('../utils/questionNormalizer');

const DATA_DIR = path.join(__dirname, '../data');
const subjects = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));

const report = {
    timestamp: new Date().toISOString(),
    totalSubjects: subjects.length,
    overall: {
        totalQuestions: 0,
        duplicates: 0,
        invalid: 0,
        missingHindi: 0,
        missingExplanation: 0,
        malformedOptions: 0
    },
    subjectBreakdown: {}
};

subjects.forEach(file => {
    const subjectName = file.replace('.json', '');
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));
    const questions = Array.isArray(data) ? data : (data.questions || []);
    
    const stats = {
        count: questions.length,
        duplicates: 0,
        invalid: 0,
        missingHindi: 0,
        missingExplanation: 0,
        malformedOptions: 0,
        topics: new Set(),
        difficulties: { easy: 0, medium: 0, hard: 0 }
    };

    const seenIds = new Set();
    const seenTexts = new Set();

    questions.forEach(q => {
        const normalized = normalizeQuestion(q);
        
        // 1. ID Duplication
        const id = normalized.id;
        if (seenIds.has(id)) stats.duplicates++;
        seenIds.add(id);

        // 2. Content Duplication
        const text = normalized.question_en.toLowerCase().trim();
        if (seenTexts.has(text)) stats.duplicates++;
        seenTexts.add(text);

        // 3. Invalid Marking
        if (normalized.isInvalid) stats.invalid++;

        // 4. Missing Content
        if (!q.question_hi && !q.questionHindi) stats.missingHindi++;
        if (!q.explanation_en && !q.explanation) stats.missingExplanation++;
        
        // 5. Options Check
        if (normalized.options_en.length < 4 || new Set(normalized.options_en).size < 4) stats.malformedOptions++;

        // 6. Balance Check
        stats.topics.add(normalized.topic);
        const diff = normalized.difficulty.toLowerCase();
        if (stats.difficulties[diff] !== undefined) stats.difficulties[diff]++;
    });

    report.overall.totalQuestions += stats.count;
    report.overall.duplicates += stats.duplicates;
    report.overall.invalid += stats.invalid;
    report.overall.missingHindi += stats.missingHindi;
    report.overall.missingExplanation += stats.missingExplanation;
    report.overall.malformedOptions += stats.malformedOptions;

    report.subjectBreakdown[subjectName] = {
        count: stats.count,
        duplicates: stats.duplicates,
        invalid: stats.invalid,
        missingHindi: stats.missingHindi,
        missingExplanation: stats.missingExplanation,
        malformedOptions: stats.malformedOptions,
        topicCount: stats.topics.size,
        difficultyBalance: stats.difficulties
    };
});

// Save report
const reportPath = path.join(__dirname, '../artifacts/bank_audit_report.json');
if (!fs.existsSync(path.join(__dirname, '../artifacts'))) fs.mkdirSync(path.join(__dirname, '../artifacts'));
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

console.log('--- NIRNAYPATH BANK AUDIT COMPLETE ---');
console.log(`Total Questions: ${report.overall.totalQuestions}`);
console.log(`Duplicates Found: ${report.overall.duplicates}`);
console.log(`Invalid Found: ${report.overall.invalid}`);
console.log(`Missing Hindi: ${report.overall.missingHindi}`);
console.log(`Missing Explanation: ${report.overall.missingExplanation}`);
console.log(`Report saved to: artifacts/bank_audit_report.json`);
