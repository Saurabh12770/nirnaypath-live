
const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = `topic_cert_${Date.now()}@example.com`;
const TEST_PASS = 'Password123!';

async function topicCertification() {
    console.log('=== NIRNAYPATH TOPIC-WISE ENGINE CERTIFICATION ===');
    
    let token;
    try {
        // 1. Setup
        const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Topic Tester', email: TEST_EMAIL, password: TEST_PASS })
        });
        const signupData = await signupRes.json();
        token = signupData.token;
        console.log('[1/4] User setup complete.');

        // 2. Topic Test Start
        console.log('[2/4] Testing Topic Drill Start...');
        const startRes = await fetch(`${BASE_URL}/api/drill/history/Ancient%20India`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const startData = await startRes.json();
        
        if (startRes.ok && startData.sessionId && startData.topic === 'ancient india') {
            console.log(' - SUCCESS: Session created for topic:', startData.topic);
            console.log(' - Session ID:', startData.sessionId);
            console.log(' - Question Count:', startData.questions.length);
        } else {
            throw new Error(`Drill start failed: ${JSON.stringify(startData)}`);
        }

        // 3. Topic Test Submission
        console.log('[3/4] Testing Topic Drill Submission...');
        const submitRes = await fetch(`${BASE_URL}/api/test/submit`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                sessionId: startData.sessionId,
                answers: Array(startData.questions.length).fill(1),
                testName: 'Topic Logic Test'
            })
        });
        const submitData = await submitRes.json();
        
        if (submitRes.status === 201) {
            console.log(' - SUCCESS: Result saved.');
            console.log(' - Mode:', submitData.mode || 'drill (implicit)');
        } else {
            throw new Error(`Submission failed: ${JSON.stringify(submitData)}`);
        }

        // 4. Stress Test: Concurrency
        console.log('[4/4] Stress Testing (10 Concurrent Starts)...');
        const starts = Array.from({ length: 10 }).map(() => 
            fetch(`${BASE_URL}/api/drill/history/Ancient%20India`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(r => r.json())
        );
        const results = await Promise.all(starts);
        const uniqueSessions = new Set(results.map(r => r.sessionId));
        console.log(` - Success: ${results.length} sessions created.`);
        console.log(` - Uniqueness: ${uniqueSessions.size === 10 ? 'VERIFIED' : 'FAILED'}`);

    } catch (err) {
        console.error('Certification failed:', err.message);
        process.exit(1);
    }
    
    console.log('=== CERTIFICATION COMPLETE ===');
}

topicCertification();
