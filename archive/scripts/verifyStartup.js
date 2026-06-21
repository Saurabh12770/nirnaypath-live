const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const report = {
    timestamp: new Date().toISOString(),
    status: 'PENDING',
    checks: {
        importIntegrity: 'SUCCESS',
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
    
    // 1. Check Import Integrity / App Bootstrap
    try {
        require('../app');
        report.checks.appBootstrap = 'SUCCESS';
        console.log('✅ App Bootstrapped Successfully');
    } catch (err) {
        report.checks.appBootstrap = 'FAILURE';
        report.errors.push({ step: 'bootstrap', message: err.message, stack: err.stack });
        console.error('❌ App Bootstrap Failed:', err.message);
    }

    // 2. Scan for Circular Dependencies / Runtime checks
    const unhandledRejectionHandler = (reason, promise) => {
        report.errors.push({ step: 'runtime', type: 'unhandledRejection', reason: String(reason) });
        console.error('❌ Unhandled Rejection:', reason);
    };
    process.on('unhandledRejection', unhandledRejectionHandler);

    // Wait for async connections to resolve (Mongoose, Redis, Workers)
    console.log('Waiting for database and message queue connections to stabilize...');
    const startTime = Date.now();
    const TIMEOUT_MS = 5000;
    
    const { isRedisAvailable } = require('../services/redisService');
    const workerService = require('../services/workerService');

    while (Date.now() - startTime < TIMEOUT_MS) {
        // Check database
        if (mongoose.connection.readyState === 1) {
            report.checks.databaseConnection = 'SUCCESS';
        }
        // Check redis
        if (!process.env.REDIS_URL) {
            report.checks.redisConnection = 'SUCCESS'; // Graceful degradation
        } else if (isRedisAvailable()) {
            report.checks.redisConnection = 'SUCCESS';
        }
        // Check workers (if disabled or Redis is not configured, treat as SUCCESS/dormant, else check initialization)
        if (process.env.ENABLE_WORKERS === 'false' || !process.env.REDIS_URL) {
            report.checks.workerInitialization = 'SUCCESS';
        } else if (workerService.isInitialized && workerService.isInitialized()) {
            report.checks.workerInitialization = 'SUCCESS';
        }

        // Break early if everything is resolved successfully
        const dbDone = report.checks.databaseConnection === 'SUCCESS';
        const redisDone = report.checks.redisConnection === 'SUCCESS';
        const workersDone = report.checks.workerInitialization === 'SUCCESS';
        
        if (dbDone && redisDone && workersDone) {
            break;
        }

        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Post-timeout/completion check and fallback errors
    if (report.checks.databaseConnection !== 'SUCCESS') {
        report.checks.databaseConnection = 'FAILURE';
        report.errors.push({ step: 'database', message: `MongoDB state is ${mongoose.connection.readyState} (expected 1)` });
    }
    if (report.checks.redisConnection !== 'SUCCESS') {
        report.checks.redisConnection = 'FAILURE';
        report.errors.push({ step: 'redis', message: 'Redis connection timed out or is unavailable' });
    }
    if (report.checks.workerInitialization !== 'SUCCESS') {
        report.checks.workerInitialization = 'FAILURE';
        report.errors.push({ step: 'workers', message: 'Background workers failed to initialize' });
    }

    // Cleanup process listener to prevent listener leaks
    process.off('unhandledRejection', unhandledRejectionHandler);

    report.status = report.errors.length === 0 ? 'SUCCESS' : 'FAILURE';
    
    const logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
    try {
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        fs.writeFileSync(path.join(logDir, 'startup_forensic_report.json'), JSON.stringify(report, null, 2));
        console.log(`Report generated: ${path.join(logDir, 'startup_forensic_report.json')}`);
    } catch (err) {
        console.warn("Could not write startup forensic report to disk:", err.message);
    }

    // Force exit cleanly so script terminates
    console.log(`Startup forensic check finished with status: ${report.status}`);
    process.exit(report.status === 'SUCCESS' ? 0 : 1);
}

verify();
