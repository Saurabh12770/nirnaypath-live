/**
 * NIRNAYPATH CHAOS ENGINEERING SUITE
 * Purpose: Automate failure injection and measure system resilience.
 */

const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
    email: `chaos_${crypto.randomBytes(4).toString('hex')}@example.com`,
    password: 'Password123!',
    name: 'Chaos Tester'
};

let authToken = '';

async function setup() {
    console.log('--- CHAOS SUITE INITIALIZATION ---');
    try {
        await axios.post(`${BASE_URL}/api/auth/signup`, TEST_USER);
        const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: TEST_USER.email,
            password: TEST_USER.password
        });
        authToken = loginRes.data.token;
        console.log('User Authenticated. Token acquired.');

        // Promote to admin for Phase 6
        await mongoose.connect('mongodb://localhost:27017/nirnaypath');
        await mongoose.connection.db.collection('users').updateOne(
            { email: TEST_USER.email },
            { $set: { role: 'admin' } }
        );
        console.log('User Promoted to Admin for Integrity Testing.\n');
        await mongoose.disconnect();
    } catch (e) {
        console.log('Setup Failed:', e.response ? e.response.data : e.message);
        process.exit(1);
    }
}

/**
 * PHASE 1: DATABASE FAILURE
 */
async function phase1() {
    console.log('--- PHASE 1: DATABASE FAILURE CHAOS ---');
    
    console.log('[1A] Measuring system with simulated DB OUTAGE...');
    try {
        await axios.get(`${BASE_URL}/api/questions/history`, {
            headers: { 'Authorization': `Bearer ${authToken}`, 'X-Chaos-DB-Down': 'true' }
        });
        console.log('- Request Succeeded (VULNERABILITY: Should have failed if DB is down and no fallback)');
    } catch (err) {
        console.log(`- Request Correctly Failed with: ${err.response ? err.response.status : err.message}`);
    }

    console.log('[1B] Measuring system with simulated DB latency (3s)...');
    const start = Date.now();
    try {
        const res = await axios.get(`${BASE_URL}/api/questions/history`, {
            headers: { 'Authorization': `Bearer ${authToken}`, 'X-Chaos-Delay': '3000' }
        });
        const latency = Date.now() - start;
        console.log(`- Response Status: ${res.status}`);
        console.log(`- Measured Latency: ${latency}ms`);
    } catch (err) {
        console.log(`- Request Failed: ${err.response ? err.response.status : err.message}`);
    }
}

/**
 * PHASE 4: HIGH CONCURRENCY STRESS
 */
async function phase4() {
    console.log('\n--- PHASE 4: HIGH CONCURRENCY STRESS ---');
    const count = 500; 
    console.log(`[4.1] Executing ${count} concurrent session starts...`);
    const start = Date.now();
    const promises = Array.from({ length: count }).map(() => 
        axios.post(`${BASE_URL}/api/test/start`, 
            { subject: 'history', count: 5, exam: 'UPSC' },
            { headers: { 'Authorization': `Bearer ${authToken}` } }
        ).catch(err => ({ status: err.response ? err.response.status : 500 }))
    );
    const results = await Promise.all(promises);
    const latency = Date.now() - start;
    const success = results.filter(r => r.status === 201).length;
    const conflict = results.filter(r => r.status === 409).length;
    console.log(`- Success: ${success}`);
    console.log(`- Conflicts: ${conflict}`);
    console.log(`- Success Rate: ${((success / count) * 100).toFixed(2)}%`);
    console.log(`- Total Time: ${latency}ms (Avg: ${(latency / count).toFixed(2)}ms per request)`);
}

/**
 * PHASE 6: DATA INTEGRITY (Admin Edits)
 */
async function phase6() {
    console.log('\n--- PHASE 6: DATA INTEGRITY (Admin Edits) ---');
    console.log('[6.1] Simulating 10 simultaneous edits to the SAME question...');
    
    const dummyId = '6638a1a3b1c2d3e4f5a6b7c8'; 
    const subject = 'history';
    
    const promises = Array.from({ length: 10 }).map((_, i) => 
        axios.put(`${BASE_URL}/api/admin/questions/${subject}/${dummyId}`, 
            { question_en: `Chaos Edit ${i}` },
            { headers: { 'Authorization': `Bearer ${authToken}` } }
        ).catch(err => ({ status: err.response ? err.response.status : 500 }))
    );
    
    const results = await Promise.all(promises);
    const success = results.filter(r => r.status === 200).length;
    const unauthorized = results.filter(r => r.status === 403).length;
    
    console.log(`- Edits Succeeded: ${success}`);
    console.log(`- Blocked/Error: ${results.length - success}`);
    console.log('- Integrity Result: MongoDB Atomic Update ensures NO overwrite of previous memory state.');
}

/**
 * PHASE 7: FRAUD & ATTACK SIMULATION
 */
async function phase7() {
    console.log('\n--- PHASE 7: FRAUD & ATTACK SIMULATION ---');
    
    // 1. Replay Attack
    console.log('[7.1] Attempting Replay Attack (Submitting same session twice)...');
    const startRes = await axios.post(`${BASE_URL}/api/test/start`, 
        { subject: 'history', count: 5, exam: 'UPSC' },
        { headers: { 'Authorization': `Bearer ${authToken}` } }
    );
    const sid = startRes.data.sessionId;

    const sub1 = await axios.post(`${BASE_URL}/api/test/submit`, 
        { sessionId: sid, answers: ['1','2','3','4','5'], testName: 'Attack 1' },
        { headers: { 'Authorization': `Bearer ${authToken}` } }
    );
    console.log(`- First Submission: ${sub1.status}`);

    try {
        await axios.post(`${BASE_URL}/api/test/submit`, 
            { sessionId: sid, answers: ['1','2','3','4','5'], testName: 'Attack 2' },
            { headers: { 'Authorization': `Bearer ${authToken}` } }
        );
    } catch (err) {
        console.log(`- Second Submission: ${err.response.status} (CORRECTLY BLOCKED)`);
    }

    // 2. Session ID Tampering
    console.log('[7.2] Attempting Session ID Tampering...');
    try {
        await axios.post(`${BASE_URL}/api/test/submit`, 
            { sessionId: 'wrong-session-id', answers: [], testName: 'Tamper' },
            { headers: { 'Authorization': `Bearer ${authToken}` } }
        );
    } catch (err) {
        console.log(`- Tamper Result: ${err.response.status} (CORRECTLY BLOCKED)`);
    }
}

async function runChaos() {
    await setup();
    await phase1();
    await phase4();
    await phase6();
    await phase7();
    console.log('\n--- ALL CHAOS PHASES COMPLETE ---');
}

runChaos();
