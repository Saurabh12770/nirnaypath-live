const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Question = require('../models/question');
const DedupEngine = require('../services/dedupEngine');

async function run() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nirnaypath');
    const subject = 'english';
    const subLower = subject.toLowerCase().trim();
    
    let pool = await Question.find({ 
        $or: [{ subjectId: subLower }, { subject: subLower }] 
    }).lean();
    
    const dataPath = path.join(__dirname, `../data/${subLower}.json`);
    if (fs.existsSync(dataPath)) {
        const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        const subQuestions = Array.isArray(rawData) ? rawData : (rawData.questions || []);
        pool.push(...subQuestions);
    }

    const duplicateGroups = [];
    const seenEnTexts = new Map();
    const seenHiTexts = new Map();
    const finalUnique = [];

    for (const q of pool) {
        const id = String(q._id || q.id || q.questionId || 'UNKNOWN').trim();
        const textEn = DedupEngine.normalizeText(q.question_en || q.text || '');
        const textHi = DedupEngine.normalizeText(q.question_hi || '');

        let isDuplicate = false;
        let groupEn = null;
        let groupHi = null;

        if (textEn && seenEnTexts.has(textEn)) {
            isDuplicate = true;
            groupEn = seenEnTexts.get(textEn);
        } else if (textHi && seenHiTexts.has(textHi)) {
            isDuplicate = true;
            groupHi = seenHiTexts.get(textHi);
        }

        if (isDuplicate) {
            const conflict = groupEn || groupHi;
            duplicateGroups.push({
                originalId: conflict.id,
                duplicateId: id,
                snippet: (q.question_en || q.text || q.question_hi || '').substring(0, 100)
            });
        } else {
            if (textEn) seenEnTexts.set(textEn, { id, q });
            if (textHi) seenHiTexts.set(textHi, { id, q });
            finalUnique.push(q);
        }
    }

    console.log({
        totalQuestions: pool.length,
        uniqueQuestions: finalUnique.length,
        duplicatesFound: duplicateGroups.length,
        duplicateGroups: duplicateGroups.slice(0, 3) // show first 3 for brevity
    });
    process.exit(0);
}
run();
