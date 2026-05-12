const axios = require('axios');
const crypto = require('crypto');

async function stressTest() {
    console.log('--- SIGNUP STRESS TEST (100 CONCURRENT) ---');
    const promises = [];
    for (let i = 0; i < 100; i++) {
        const email = `stress_${crypto.randomBytes(4).toString('hex')}@test.com`;
        promises.push(axios.post('http://localhost:3000/api/auth/signup', {
            name: 'Stress User',
            email,
            password: 'Password123!'
        }).catch(err => ({ status: err.response?.status })));
    }
    
    const startTime = Date.now();
    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;
    
    const success = results.filter(r => r.status === 201).length;
    console.log(`Finished in ${duration}ms. Success: ${success}, Failed: ${100 - success}`);
}

stressTest();
