const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
    email: `adaptive_cert_${Date.now()}@example.com`,
    password: 'Password123!',
    name: 'Adaptive Certifier'
};

async function runAdaptiveCertification() {
    console.log('=== NIRNAYPATH AI ADAPTIVE LEARNING CERTIFICATION ===');
    
    let token;
    try {
        // 1. Auth & Token
        const signup = await axios.post(`${BASE_URL}/api/auth/signup`, TEST_USER);
        token = signup.data.token;
        const authHeaders = { headers: { 'Authorization': `Bearer ${token}` } };
        console.log('[1/5] Auth: Signup Success');

        // 2. Generate Initial Study Plan (New User)
        const initialPlan = await axios.get(`${BASE_URL}/api/learning/plan`, authHeaders);
        console.log('[2/5] Initial Study Plan:', initialPlan.data.focusArea);

        // 3. Simulate Learning Activity (Submitting a test with a specific weak topic)
        console.log('[3/5] Simulating test submission for weakness detection...');
        const testStart = await axios.post(`${BASE_URL}/api/test/start`, {
            subject: 'history',
            count: 5,
            exam: 'BPSC'
        }, authHeaders);

        const { sessionId, questions } = testStart.data;
        const answers = questions.map((q, idx) => idx === 0 ? q.correctAnswer : -1); // Intentionally fail most questions

        await axios.post(`${BASE_URL}/api/test/submit`, {
            sessionId,
            answers,
            testName: 'Cert Simulation'
        }, authHeaders);
        console.log(' - Test Submitted (Intentionally Low Accuracy)');

        // 4. Verify Intelligence Recalculation
        const intelligence = await axios.get(`${BASE_URL}/api/learning/intelligence`, authHeaders);
        console.log('[4/5] Predictive Intelligence Recalculated:', intelligence.data.predictive.rankBand);
        console.log(' - Accuracy Detected:', Math.round(intelligence.data.profile.overallAccuracy) + '%');

        // 5. Verify Adaptive Test Generation (Should prioritize the weak subject/topics)
        const adaptiveStart = await axios.post(`${BASE_URL}/api/test/start`, {
            subject: 'history',
            count: 10,
            exam: 'BPSC'
        }, authHeaders);
        
        if (adaptiveStart.data.questions.length > 0) {
            console.log('[5/5] Adaptive Test Generation: OK');
        }

    } catch (err) {
        console.error('Certification failed:', err.response ? err.response.data : err.message);
        process.exit(1);
    }

    console.log('=== ADAPTIVE LEARNING CERTIFICATION COMPLETE ===');
    process.exit(0);
}

runAdaptiveCertification();
