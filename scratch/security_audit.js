
const BASE_URL = 'http://localhost:3000';
const TOKEN = '1fde6c80b2fbd8cb589eb4bcf7a375065143d20dcd830d5ab97adc21fe4c09d5';

async function securityAudit() {
    console.log('--- Security Audit: Token Reuse ---');
    
    // First reset
    const res1 = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: TOKEN, newPassword: 'NewPassword123!' })
    });
    console.log('First Reset Status:', res1.status, await res1.json());

    // Second reset (should fail)
    const res2 = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: TOKEN, newPassword: 'NewPassword123!' })
    });
    console.log('Second Reset Status:', res2.status, await res2.json());
}

securityAudit();
