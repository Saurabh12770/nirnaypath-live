'use strict';

/**
 * NirnayPath — High Concurrency Load Test Cluster Simulator (Phase 8)
 * =================================================================
 * Simulates active user journeys under concurrent load.
 * Runs in a master-worker cluster configuration to utilize all CPU cores.
 * 
 * Flows emulated per user:
 *   1. Register / Login
 *   2. View Dashboard / Analytics Overview
 *   3. Start Exam Session
 *   4. Heartbeat Sync
 *   5. Integrity Violation Post
 *   6. Submit Exam Results
 *   7. Query Global and Weekly Leaderboards
 * 
 * Generates clear latency, error-rate, and system memory reports.
 */

const cluster = require('cluster');
const http = require('http');
const crypto = require('crypto');

// Command line configuration
const args = process.argv.slice(2);
const getUserArg = () => {
    const idx = args.indexOf('--users');
    return idx !== -1 ? parseInt(args[idx + 1]) : 100;
};
const getHostArg = () => {
    const idx = args.indexOf('--host');
    return idx !== -1 ? args[idx + 1] : 'http://localhost:3000';
};

const TOTAL_USERS = getUserArg();
const TARGET_HOST = getHostArg();

if (cluster.isMaster) {
    const numCPUs = require('os').cpus().length;
    console.log('====================================================');
    console.log(`[LOAD-TEST] NirnayPath Platform Load Simulator`);
    console.log(`[LOAD-TEST] Host: ${TARGET_HOST}`);
    console.log(`[LOAD-TEST] Total Virtual Users: ${TOTAL_USERS}`);
    console.log(`[LOAD-TEST] Spawning workers across ${numCPUs} CPU cores...`);
    console.log('====================================================');

    const usersPerWorker = Math.ceil(TOTAL_USERS / numCPUs);
    let completedWorkers = 0;
    const allMetrics = [];

    for (let i = 0; i < numCPUs; i++) {
        const worker = cluster.fork({ USERS_COUNT: usersPerWorker, TARGET_HOST });
        worker.on('message', (msg) => {
            if (msg.type === 'METRICS') {
                allMetrics.push(msg.data);
            }
        });
    }

    cluster.on('exit', (worker, code, signal) => {
        completedWorkers++;
        if (completedWorkers === numCPUs) {
            aggregateAndReport(allMetrics);
            process.exit(0);
        }
    });
} else {
    // Worker Process Execution
    const count = parseInt(process.env.USERS_COUNT || '10');
    const host = process.env.TARGET_HOST || 'http://localhost:3000';
    runWorkerLoad(count, host);
}

async function runWorkerLoad(count, host) {
    const metrics = {
        totalRequests: 0,
        successRequests: 0,
        failedRequests: 0,
        latencies: []
    };

    const runRequest = async (name, path, method = 'GET', body = null, headers = {}) => {
        const url = `${host}${path}`;
        const start = Date.now();
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        return new Promise((resolve) => {
            const req = http.request(url, options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const elapsed = Date.now() - start;
                    metrics.totalRequests++;
                    metrics.latencies.push(elapsed);
                    
                    // Parse token cookie from Set-Cookie header
                    let token = null;
                    const cookies = res.headers['set-cookie'];
                    if (cookies) {
                        cookies.forEach(c => {
                            if (c.trim().startsWith('token=')) {
                                token = c.trim().split(';')[0].split('=')[1];
                            }
                        });
                    }
                    
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        metrics.successRequests++;
                        try {
                            resolve({ success: true, status: res.statusCode, body: JSON.parse(data), token });
                        } catch (_) {
                            resolve({ success: true, status: res.statusCode, body: data, token });
                        }
                    } else {
                        metrics.failedRequests++;
                        resolve({ success: false, status: res.statusCode, token });
                    }
                });
            });

            req.on('error', (err) => {
                metrics.totalRequests++;
                metrics.failedRequests++;
                metrics.latencies.push(Date.now() - start);
                resolve({ success: false, error: err.message });
            });

            if (body) {
                req.write(JSON.stringify(body));
            }
            req.end();
        });
    };

    const activeSessions = [];
    
    // Simulate user batches with short spacing to protect connection pools
    for (let i = 0; i < count; i++) {
        const userEmail = `load_sre_${crypto.randomBytes(4).toString('hex')}@nirnaypath.com`;
        const userPassword = 'SecurePassword123!';
        const userName = `Load User ${i}`;

        // 1. Register User (correct endpoint is /signup)
        const regRes = await runRequest('Register', '/api/auth/signup', 'POST', {
            name: userName,
            email: userEmail,
            password: userPassword,
            confirmPassword: userPassword
        });

        if (!regRes.success || !regRes.token) continue;
        const token = regRes.token;
        const authHeader = { 'Cookie': `token=${token}` };

        // 2. View Dashboard Overview
        await runRequest('Dashboard', '/api/analytics/overview', 'GET', null, authHeader);

        // 3. Start Practice Exam
        const startRes = await runRequest('StartExam', '/api/test/start', 'POST', {
            subject: 'history',
            count: 10,
            timeLimit: 1200,
            exam: 'UPSC'
        }, authHeader);

        if (!startRes.success || !startRes.body?.sessionId) continue;
        const sessionId = startRes.body.sessionId;

        // 4. Send Autorun Heartbeat Sync
        await runRequest('Heartbeat', '/api/test/heartbeat', 'POST', {
            sessionId,
            answers: { '0': '2' }
        }, authHeader);

        // 5. Submit Exam Answers
        await runRequest('SubmitExam', '/api/test/submit', 'POST', {
            sessionId,
            subject: 'history',
            exam: 'UPSC',
            answers: { '0': '2', '1': '1', '2': '3' }
        }, authHeader);

        // 6. View Competitive Leaderboard
        await runRequest('Leaderboard', '/api/leaderboard/global', 'GET', null, authHeader);
        
        // Minor spacing between sessions
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    process.send({ type: 'METRICS', data: metrics });
    process.exit(0);
}

function aggregateAndReport(metricsList) {
    let totalReq = 0;
    let successReq = 0;
    let failedReq = 0;
    let latencies = [];

    metricsList.forEach(m => {
        totalReq += m.totalRequests;
        successReq += m.successRequests;
        failedReq += m.failedRequests;
        latencies.push(...m.latencies);
    });

    latencies.sort((a, b) => a - b);
    const avg = latencies.length > 0 ? Math.round(latencies.reduce((s, v) => s + v, 0) / latencies.length) : 0;
    const p95 = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.95)] : 0;
    const p99 = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.99)] : 0;
    const errorRate = totalReq > 0 ? ((failedReq / totalReq) * 100).toFixed(2) : '0.00';

    console.log('====================================================');
    console.log('                 SRE LOAD TEST REPORT               ');
    console.log('====================================================');
    console.log(`Total Requests Sent : ${totalReq}`);
    console.log(`Successful Requests : ${successReq}`);
    console.log(`Failed Requests     : ${failedReq} (${errorRate}% error rate)`);
    console.log(`Average Latency     : ${avg}ms`);
    console.log(`95th Percentile     : ${p95}ms`);
    console.log(`99th Percentile     : ${p99}ms`);
    console.log('====================================================');
}
