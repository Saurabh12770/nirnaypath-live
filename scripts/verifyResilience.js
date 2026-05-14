const http = require('http');
const path = require('path');
const fs = require('fs');

async function verify() {
    console.log('--- Phase 6: Stress + Failure Testing ---');
    
    // Start server on 3002
    process.env.PORT = 3002;
    const app = require('../app');
    
    await new Promise(resolve => setTimeout(resolve, 3000));

    const report = {
        timestamp: new Date().toISOString(),
        concurrency: {
            requests: 100,
            success: 0,
            failed: 0
        },
        failures: []
    };

    console.log('Executing 100 concurrent health checks...');
    const promises = Array.from({ length: 100 }).map(() => {
        return new Promise((resolve) => {
            http.get('http://localhost:3002/health', (res) => {
                if (res.statusCode === 200) report.concurrency.success++;
                else report.concurrency.failed++;
                resolve();
            }).on('error', (err) => {
                report.concurrency.failed++;
                report.failures.push(err.message);
                resolve();
            });
        });
    });

    await Promise.all(promises);
    console.log(`Results: ${report.concurrency.success} Success, ${report.concurrency.failed} Failed`);

    fs.writeFileSync(path.join(__dirname, '..', 'logs', 'resilience_verification.json'), JSON.stringify(report, null, 2));
    process.exit(0);
}

verify();
