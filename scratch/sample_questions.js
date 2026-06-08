'use strict';
const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/nirnaypath';

async function main() {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;

    console.log('Fetching 5 sample questions...');
    const samples = await db.collection('questions').find().limit(5).toArray();
    
    samples.forEach((q, idx) => {
        console.log(`\n--- Question ${idx + 1} ---`);
        console.log('ID:', q._id);
        console.log('Exam:', q.exam);
        console.log('Subject:', q.subject);
        console.log('Topic:', q.topic);
        console.log('Subtopic:', q.subtopic);
        console.log('Exam Tags:', q.exam_tags);
        console.log('Difficulty:', q.difficulty);
        console.log('Question Text (EN):', q.question?.en || q.question);
    });

    await mongoose.connection.close();
}

main().catch(console.error);
