
const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = `cert_${Date.now()}@example.com`;
const TEST_PASS = 'Password123!';

async function forensicAudit() {
    console.log('=== NIRNAYPATH FORENSIC RUNTIME CERTIFICATION ===');
    const auditLog = [];

    // Helper to log and track
    const record = (step, status, details) => {
        const entry = { step, status, details, timestamp: new Date().toISOString() };
        auditLog.push(entry);
        console.log(`[${status}] ${step}: ${typeof details === 'object' ? JSON.stringify(details) : details}`);
    };

    try {
        // 1. SIGNUP FLOW VERIFICATION
        console.log('\n--- 1. Signup Flow ---');
        const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'SRE Tester', email: TEST_EMAIL, password: TEST_PASS })
        });
        const signupData = await signupRes.json();
        
        if (signupRes.status === 201 && signupData.token) {
            record('Signup API', 'SUCCESS', 'User created, token received');
            const token = signupData.token;

            // 2. FORGOT PASSWORD FLOW
            console.log('\n--- 2. Forgot Password Flow ---');
            const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: TEST_EMAIL })
            });
            const forgotData = await forgotRes.json();
            record('Forgot Password API', forgotRes.ok ? 'SUCCESS' : 'FAILED', forgotData);

            // 3. TEST REPORT FLOW
            console.log('\n--- 3. Test Report Flow ---');
            // Start a test
            const startRes = await fetch(`${BASE_URL}/api/test/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ subject: 'history', count: 5 })
            });
            const startData = await startRes.json();
            
            if (startRes.ok && startData.sessionId) {
                record('Test Start', 'SUCCESS', { sessionId: startData.sessionId });
                
                // Submit the test
                const submitRes = await fetch(`${BASE_URL}/api/test/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({
                        sessionId: startData.sessionId,
                        answers: [1, 2, 3, 4, 5], // Assuming these are wrong for "weakest topic" check
                        testName: 'Forensic Audit Test'
                    })
                });
                const submitData = await submitRes.json();
                record('Test Submission', submitRes.status === 201 ? 'SUCCESS' : 'FAILED', submitData);
            } else {
                record('Test Start', 'FAILED', startData);
            }

            // 4. SECURITY VERIFICATION
            console.log('\n--- 4. Security Verification ---');
            // Token Reuse (Reset Password)
            // We need the token from the DB since email is likely in DLQ
            // But let's check Anti-enumeration first
            const enumRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'nonexistent@example.com' })
            });
            const enumData = await enumRes.json();
            const isProtected = enumData.message === 'If that email exists in our system, a reset link has been sent.';
            record('Anti-Enumeration', isProtected ? 'SUCCESS' : 'FAILED', enumData.message);

        } else {
            record('Signup API', 'FAILED', signupData);
        }

        // 5. OBSERVABILITY & QUEUE RELIABILITY
        console.log('\n--- 5. Observability & Queue Reliability ---');
        const healthRes = await fetch(`${BASE_URL}/api/health/email`);
        const healthData = await healthRes.json();
        record('Health Check', healthRes.ok ? 'SUCCESS' : 'DEGRADED/FAILED', healthData);

    } catch (err) {
        console.error('Audit crashed:', err.message);
    }

    console.log('\n=== AUDIT COMPLETE ===');
}

forensicAudit();
