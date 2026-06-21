const http = require('http');
const path = require('path');
const fs = require('fs');

async function verify() {
    console.log('--- Phase 2: Route Verification ---');
    
    // Dynamically require app to avoid EADDRINUSE if we can control listen
    // However, app.js in this project calls server.listen immediately.
    // We'll set a different PORT environment variable.
    process.env.PORT = 3001;
    
    const app = require('../app');
    const report = {
        timestamp: new Date().toISOString(),
        results: []
    };

    // Wait for DB connection (app.js logs "Connected to MongoDB")
    // For simplicity, we'll just wait a bit
    await new Promise(resolve => setTimeout(resolve, 3000));

    const routes = [
        { path: '/health', expectedStatus: 200 },
        { path: '/api/auth/status', expectedStatus: 200, fallback: '/api/auth/me' }, // Guessing some routes
        { path: '/', expectedStatus: 200 },
        { path: '/admin', expectedStatus: 200 }
    ];

    for (const route of routes) {
        try {
            const res = await new Promise((resolve, reject) => {
                http.get(`http://localhost:3001${route.path}`, (res) => {
                    resolve(res);
                }).on('error', reject);
            });
            
            console.log(`Checking ${route.path}... ${res.statusCode}`);
            report.results.push({ path: route.path, status: res.statusCode, success: res.statusCode === route.expectedStatus });
        } catch (err) {
            console.error(`Error checking ${route.path}:`, err.message);
            report.results.push({ path: route.path, error: err.message, success: false });
        }
    }

    fs.writeFileSync(path.join(__dirname, '..', 'logs', 'route_verification.json'), JSON.stringify(report, null, 2));
    console.log('Route verification report saved.');
    process.exit(0);
}

verify();
