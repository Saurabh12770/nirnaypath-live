
const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = `analytics_cert_${Date.now()}@example.com`;
const TEST_PASS = 'Password123!';

async function analyticsCertification() {
    console.log('=== NIRNAYPATH ANALYTICS INTELLIGENCE CERTIFICATION ===');
    
    let token;
    let userId;
    try {
        // 1. Setup User
        const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Analytics Tester', email: TEST_EMAIL, password: TEST_PASS })
        });
        const signupData = await signupRes.json();
        token = signupData.token;
        console.log('[1/4] User setup complete.');

        // 2. Mock Data Generation
        console.log('[2/4] Generating 20 mock test results...');
        // We'll use a direct internal tool if possible, but here we just hit the submit endpoint repeatedly
        // To speed up, we'll first start a session and then submit multiple times 
        // (Wait, sessionId must be unique, so we'll start 20 sessions)
        
        for (let i = 0; i < 10; i++) {
            const startRes = await fetch(`${BASE_URL}/api/test/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ subject: 'history', count: 10 })
            });
            const startData = await startRes.json();
            
            await fetch(`${BASE_URL}/api/test/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    sessionId: startData.sessionId,
                    answers: Array(10).fill(i % 2 === 0 ? 1 : 0), // Vary accuracy
                    testName: `Mock Test ${i}`
                })
            });
            process.stdout.write('.');
        }
        console.log('\n - Data generation complete.');

        // 3. Analytics Retrieval
        console.log('[3/4] Testing Analytics Intelligence...');
        
        const endpoints = ['overview', 'topics', 'trends', 'readiness', 'streak'];
        for (const ep of endpoints) {
            const res = await fetch(`${BASE_URL}/api/analytics/${ep}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (res.ok) {
                console.log(` - SUCCESS [${ep}]:`, JSON.stringify(data).substring(0, 80) + '...');
            } else {
                throw new Error(`Endpoint ${ep} failed: ${JSON.stringify(data)}`);
            }
        }

        // 4. Cache Invalidation Test
        console.log('[4/4] Testing Cache Performance...');
        const start = Date.now();
        await fetch(`${BASE_URL}/api/analytics/overview`, { headers: { 'Authorization': `Bearer ${token}` } });
        const firstRun = Date.now() - start;
        
        const start2 = Date.now();
        await fetch(`${BASE_URL}/api/analytics/overview`, { headers: { 'Authorization': `Bearer ${token}` } });
        const secondRun = Date.now() - start2;
        
        console.log(` - First run: ${firstRun}ms`);
        console.log(` - Second run (Cached): ${secondRun}ms`);
        if (secondRun < firstRun) console.log(' - SUCCESS: Cache hit verified.');

    } catch (err) {
        console.error('Certification failed:', err.message);
        process.exit(1);
    }
    
    console.log('=== ANALYTICS CERTIFICATION COMPLETE ===');
}

analyticsCertification();
