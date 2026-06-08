'use strict';
const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/nirnaypath';

async function main() {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;

    console.log('\n--- COLLECTION COUNTS ---');
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    for (const name of collectionNames) {
        const count = await db.collection(name).countDocuments();
        console.log(`${name}: ${count} documents`);
    }

    console.log('\n--- QUESTIONS COLLECTION INDEXES ---');
    const questionIndexes = await db.collection('questions').indexes();
    console.log(JSON.stringify(questionIndexes, null, 2));

    console.log('\n--- QUESTIONS EXPLAIN PLAN & LATENCY ---');
    // We will query with exam, subject, topic, subtopic and run explain plan
    const query = {
        exam: 'state-pcs',
        subject: 'General Studies',
        topic: 'Indian Polity',
        subtopic: 'Preamble'
    };
    
    const startTime = Date.now();
    const plan = await db.collection('questions').find(query).explain('executionStats');
    const endTime = Date.now();
    
    console.log(`Query Latency (Explain execution): ${endTime - startTime} ms`);
    console.log(`Winning Stage: ${plan.queryPlanner?.winningPlan?.stage || 'UNKNOWN'}`);
    console.log(`Winning Stage Input: ${JSON.stringify(plan.queryPlanner?.winningPlan?.inputStage || {}, null, 2)}`);
    console.log(`Total Keys Examined: ${plan.executionStats?.totalKeysExamined}`);
    console.log(`Total Docs Examined: ${plan.executionStats?.totalDocsExamined}`);
    console.log(`Execution Time Millis (Engine): ${plan.executionStats?.executionTimeMillis} ms`);

    await mongoose.connection.close();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
