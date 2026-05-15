const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Question = require('./models/question');

async function audit() {
    await mongoose.connect('mongodb://localhost:27017/nirnaypath', { useNewUrlParser: true, useUnifiedTopology: true });
    
    const dbQuestions = await Question.find({}).lean();
    console.log(`Total DB Questions: ${dbQuestions.length}`);

    const idCount = {};
    const textCount = {};

    for (const q of dbQuestions) {
        const id = q.id;
        if (id) {
            idCount[id] = (idCount[id] || 0) + 1;
        }
        const text = q.question_en || q.text || q.question;
        if (text) {
            const norm = text.toLowerCase().trim();
            textCount[norm] = (textCount[norm] || 0) + 1;
        }
    }

    const duplicateIds = Object.entries(idCount).filter(([k, v]) => v > 1);
    const duplicateTexts = Object.entries(textCount).filter(([k, v]) => v > 1);

    console.log(`Duplicate IDs in DB: ${duplicateIds.length}`);
    console.log(`Duplicate Texts in DB: ${duplicateTexts.length}`);

    if (duplicateIds.length > 0) {
        console.log(`Sample duplicate IDs:`, duplicateIds.slice(0, 5));
    }

    process.exit(0);
}

audit().catch(console.error);
