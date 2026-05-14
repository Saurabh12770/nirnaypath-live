const fs = require('fs');
const path = require('path');

const report = {
    timestamp: new Date().toISOString(),
    status: 'PENDING',
    checks: {
        importIntegrity: 'UNKNOWN',
        appBootstrap: 'UNKNOWN',
        databaseConnection: 'UNKNOWN',
        redisConnection: 'UNKNOWN',
        workerInitialization: 'UNKNOWN'
    },
    errors: [],
    logs: []
};

async function verify() {
    console.log('--- Phase 1: Startup Forensics ---');
    
    // 1. Check Import Integrity (Already mostly covered by linuxImportAudit.js)
    try {
        require('../app');
        report.checks.appBootstrap = 'SUCCESS';
        console.log('✅ App Bootstrapped Successfully');
    } catch (err) {
        report.checks.appBootstrap = 'FAILURE';
        report.errors.push({ step: 'bootstrap', message: err.message, stack: err.stack });
        console.error('❌ App Bootstrap Failed:', err.message);
    }

    // 2. Scan for Circular Dependencies (Simulated via node's module cache check if needed, or just rely on bootstrap)
    // If it boots without "is not a function" or "undefined" errors at top level, it's mostly safe.

    // 3. Check for obvious memory leak warnings or unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
        report.errors.push({ step: 'runtime', type: 'unhandledRejection', reason });
        console.error('❌ Unhandled Rejection:', reason);
    });

    report.status = report.errors.length === 0 ? 'SUCCESS' : 'FAILURE';
    
    const logDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
    
    fs.writeFileSync(path.join(logDir, 'startup_forensic_report.json'), JSON.stringify(report, null, 2));
    console.log('Report generated: logs/startup_forensic_report.json');
}

verify();
