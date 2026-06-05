'use strict';
const mongoose = require('mongoose');
const MONGO_URI = 'mongodb://localhost:27017/nirnaypath';

async function main() {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;

    const collections = ['users', 'testsessions', 'testresults'];
    const queries = {
        users: { email: 'admin@nirnaypath.local' },
        testsessions: { sessionId: 'test-session-id-123' },
        testresults: { userId: new mongoose.Types.ObjectId() }
    };

    const output = {};

    for (const col of collections) {
        const colRef = db.collection(col);
        const plan = await colRef.find(queries[col]).explain('executionStats');
        output[col] = {
            winningStage: plan.queryPlanner?.winningPlan?.stage || 
                          plan.queryPlanner?.winningPlan?.inputStage?.stage || 'UNKNOWN',
            indexName: plan.queryPlanner?.winningPlan?.inputStage?.indexName || 'None',
            totalKeysExamined: plan.executionStats?.totalKeysExamined || 0,
            totalDocsExamined: plan.executionStats?.totalDocsExamined || 0,
            executionTimeMillis: plan.executionStats?.executionTimeMillis || 0
        };
    }

    console.log(JSON.stringify(output, null, 2));
    await mongoose.connection.close();
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
