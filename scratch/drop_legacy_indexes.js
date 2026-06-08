'use strict';
const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/nirnaypath';

async function main() {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;

    const collections = ['testsessions', 'testresults', 'users', 'learningcontents'];

    for (const name of collections) {
        try {
            console.log(`\n--- Indexes for ${name} ---`);
            const indexes = await db.collection(name).indexes();
            console.log(JSON.stringify(indexes, null, 2));

            // If index 'sessionId_1' exists on testsessions, drop it
            if (name === 'testsessions') {
                const hasSessionIdIdx = indexes.some(idx => idx.name === 'sessionId_1');
                if (hasSessionIdIdx) {
                    console.log('Dropping legacy index sessionId_1 from testsessions...');
                    await db.collection(name).dropIndex('sessionId_1');
                    console.log('Successfully dropped sessionId_1 index.');
                }
            }
            // If index 'sessionId_1' exists on testresults, drop it
            if (name === 'testresults') {
                const hasSessionIdIdx = indexes.some(idx => idx.name === 'sessionId_1');
                if (hasSessionIdIdx) {
                    console.log('Dropping legacy index sessionId_1 from testresults...');
                    await db.collection(name).dropIndex('sessionId_1');
                    console.log('Successfully dropped sessionId_1 index.');
                }
            }
            // If index 'exam_1_subject_1_topic_1_subTopic_1' exists on learningcontents, drop it
            if (name === 'learningcontents') {
                const hasLegacyIdx = indexes.some(idx => idx.name === 'exam_1_subject_1_topic_1_subTopic_1');
                if (hasLegacyIdx) {
                    console.log('Dropping legacy index exam_1_subject_1_topic_1_subTopic_1 from learningcontents...');
                    await db.collection(name).dropIndex('exam_1_subject_1_topic_1_subTopic_1');
                    console.log('Successfully dropped exam_1_subject_1_topic_1_subTopic_1 index.');
                }
            }
        } catch (e) {
            console.log(`Error processing ${name}:`, e.message);
        }
    }

    await mongoose.connection.close();
}

main().catch(console.error);
