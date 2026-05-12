const axios = require('axios');
const { Queue } = require('bullmq');
const Redis = require('ioredis');
const crypto = require('crypto');

/**
 * NIRNAYPATH INTEGRATION VERIFICATION SCRIPT
 * Purpose: Verify end-to-end wiring of Email, Queue, and Auth systems.
 */

const BASE_URL = 'http://localhost:3000/api';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new Redis(REDIS_URL, { 
    maxRetriesPerRequest: null,
    enableReadyCheck: false
});

const emailQueue = new Queue('email-queue', { connection });

async function runTests() {
    console.log('🚀 INITIALIZING NIRNAYPATH INTEGRATION AUDIT...');
    
    const testId = crypto.randomBytes(3).toString('hex');
    const email = `audit_${testId}@nirnaypath.test`;
    const password = 'SecurityTest123!';
    let authToken = '';

    console.log(`\n--- [FLOW 1] SIGNUP & WELCOME PIPELINE ---`);
    try {
        const signupRes = await axios.post(`${BASE_URL}/auth/signup`, { 
            name: 'Audit Bot', 
            email, 
            password 
        });
        
        if (signupRes.status === 201) {
            console.log('   [API] Signup successful.');
            
            // Wait for queue propagation
            await new Promise(r => setTimeout(r, 1000));
            
            const jobs = await emailQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
            const welcomeJob = jobs.find(j => j.name === 'welcome' && j.data.to === email);
            
            if (welcomeJob) {
                console.log(`   [QUEUE] Job ${welcomeJob.id} (type: welcome) detected.`);
                console.log(`✅ PASS: Signup flow correctly wired to Welcome Email queue.`);
            } else {
                console.log(`❌ FAIL: Signup successful but no Welcome Email job found in queue.`);
            }
        }
    } catch (err) {
        console.log(`❌ FAIL: Signup request failed: ${err.response?.data?.error || err.message}`);
    }

    console.log(`\n--- [FLOW 2] FORGOT PASSWORD PIPELINE ---`);
    try {
        const forgotRes = await axios.post(`${BASE_URL}/auth/forgot-password`, { email });
        
        if (forgotRes.status === 200) {
            console.log('   [API] Forgot-password request successful.');
            
            await new Promise(r => setTimeout(r, 1000));
            
            const jobs = await emailQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
            const resetJob = jobs.find(j => j.name === 'password_reset' && j.data.to === email);
            
            if (resetJob) {
                console.log(`   [QUEUE] Job ${resetJob.id} (type: password_reset) detected.`);
                console.log(`✅ PASS: Forgot-password flow correctly wired to Reset Email queue.`);
            } else {
                console.log(`❌ FAIL: Forgot-password successful but no Reset Email job found in queue.`);
            }
        }
    } catch (err) {
        console.log(`❌ FAIL: Forgot-password request failed: ${err.message}`);
    }

    console.log(`\n--- [FLOW 3] TEST SUBMISSION & REPORT PIPELINE ---`);
    try {
        // 1. Login
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, { email, password });
        authToken = loginRes.data.token;

        // 2. Start Test
        const startRes = await axios.post(`${BASE_URL}/test/start`, 
            { subject: 'science', count: 5 }, 
            { headers: { Authorization: `Bearer ${authToken}` } }
        );
        const { sessionId } = startRes.data;

        // 3. Submit Test
        const submitRes = await axios.post(`${BASE_URL}/test/submit`, 
            { sessionId, answers: [0, 1, 2, 0, 1] }, 
            { headers: { Authorization: `Bearer ${authToken}` } }
        );

        if (submitRes.status === 201) {
            console.log('   [API] Test submission successful.');
            
            await new Promise(r => setTimeout(r, 1000));
            
            const jobs = await emailQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
            const reportJob = jobs.find(j => j.name === 'test_report' && j.data.to === email);
            
            if (reportJob) {
                console.log(`   [QUEUE] Job ${reportJob.id} (type: test_report) detected.`);
                console.log(`✅ PASS: Submission flow correctly wired to Test Report queue.`);
            } else {
                console.log(`❌ FAIL: Submission successful but no Test Report email job found.`);
            }
        }
    } catch (err) {
        console.log(`❌ FAIL: Submission flow failed: ${err.message}`);
    }

    console.log(`\n--- [SUBSYSTEM AUDIT] BULLMQ & REDIS ---`);
    try {
        const [waiting, active, failed, completed] = await Promise.all([
            emailQueue.getWaitingCount(),
            emailQueue.getActiveCount(),
            emailQueue.getFailedCount(),
            emailQueue.getCompletedCount()
        ]);
        
        console.log(`   [QUEUE STATS] Waiting: ${waiting}, Active: ${active}, Failed: ${failed}, Completed: ${completed}`);
        
        if (completed > 0 || waiting > 0) {
            console.log(`✅ PASS: Redis connection and BullMQ queue state validated.`);
        } else {
            console.log(`⚠️  WARN: Queue is empty. Ensure workers are running to verify consumption.`);
        }
    } catch (err) {
        console.log(`❌ FAIL: Queue state validation failed: ${err.message}`);
    }

    console.log(`\n🚀 INTEGRATION AUDIT COMPLETE.`);
    await connection.quit();
    process.exit(0);
}

runTests();
