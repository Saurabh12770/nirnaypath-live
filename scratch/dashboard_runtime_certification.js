const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
    email: `dash_cert_${Date.now()}@example.com`,
    password: 'Password123!',
    name: 'Dashboard Certifier'
};

async function runDashboardCertification() {
    console.log('=== NIRNAYPATH DASHBOARD INTELLIGENCE CERTIFICATION ===');
    
    let token;
    try {
        // 1. User Auth
        const signup = await axios.post(`${BASE_URL}/api/auth/signup`, TEST_USER);
        token = signup.data.token;
        console.log('[1/5] Auth: Signup Success');

        // 2. Data Seed (5 tests to trigger readiness)
        console.log('[2/5] Seeding Intelligence Data...');
        for (let i = 0; i < 5; i++) {
            const start = await axios.post(`${BASE_URL}/api/test/start`, 
                { subject: 'polity', count: 10 },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await axios.post(`${BASE_URL}/api/test/submit`,
                { sessionId: start.data.sessionId, answers: Array(10).fill(1), testName: `Cert Test ${i}` },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        }
        console.log(' - Data seed complete.');

        // 3. Analytics API Verification
        console.log('[3/5] Verifying Analytics Endpoints...');
        const endpoints = ['overview', 'topics', 'trends', 'readiness'];
        for (const ep of endpoints) {
            const res = await axios.get(`${BASE_URL}/api/analytics/${ep}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.status === 200) {
                console.log(` - ${ep.toUpperCase()}: OK`);
            } else {
                throw new Error(`${ep} failed with ${res.status}`);
            }
        }

        // 4. Leaderboard API Verification
        console.log('[4/5] Verifying Leaderboard Endpoints...');
        const lbGlobal = await axios.get(`${BASE_URL}/api/leaderboard/global`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(` - GLOBAL LEADERBOARD: ${lbGlobal.data.length} entries`);

        // 5. Readiness Logic Check
        const readiness = await axios.get(`${BASE_URL}/api/analytics/readiness`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(` - READINESS SCORE: ${readiness.data.score}%`);
        if (readiness.data.score > 0) {
            console.log(' - SUCCESS: Readiness engine operational.');
        } else {
            console.log(' - WARNING: Readiness score is 0. Check data aggregation.');
        }

    } catch (err) {
        console.error('Certification failed:', err.response ? err.response.data : err.message);
        process.exit(1);
    }

    console.log('=== DASHBOARD CERTIFICATION COMPLETE ===');
    console.log('Recommendation: Manually open /index.html and check the "Dashboard" link in header.');
}

runDashboardCertification();
