'use strict';

const http = require('http');
const { performance } = require('perf_hooks');

const CONCURRENCY = parseInt(process.argv[2] || '100', 10);
const TARGET_URL = 'http://localhost:3000/api/subject/science/topics';

function makeRequest() {
    return new Promise((resolve) => {
        const start = performance.now();
        const req = http.get(TARGET_URL, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                const duration = performance.now() - start;
                resolve({
                    success: res.statusCode === 200,
                    status: res.statusCode,
                    duration,
                    size: body.length
                });
            });
        });

        req.on('error', (err) => {
            const duration = performance.now() - start;
            resolve({
                success: false,
                status: 0,
                duration,
                error: err.message
            });
        });
    });
}

async function runBenchmark() {
    console.log(`\n=== Running Load Test: ${CONCURRENCY} Concurrent Requests ===`);
    console.log(`Target: ${TARGET_URL}`);

    const startTime = performance.now();
    
    // Fire off all requests concurrently
    const promises = Array.from({ length: CONCURRENCY }, () => makeRequest());
    const results = await Promise.all(promises);
    
    const totalTime = performance.now() - startTime;

    const durations = results
        .filter(r => r.success)
        .map(r => r.duration)
        .sort((a, b) => a - b);

    const failures = results.filter(r => !r.success);

    if (durations.length === 0) {
        console.error('All requests failed!');
        if (failures.length > 0) {
            console.error(`First error: ${failures[0].error || 'Status ' + failures[0].status}`);
        }
        return;
    }

    const min = durations[0];
    const max = durations[durations.length - 1];
    const sum = durations.reduce((a, b) => a + b, 0);
    const avg = sum / durations.length;

    // Percentiles
    const getPercentile = (p) => {
        const index = Math.ceil((p / 100) * durations.length) - 1;
        return durations[index];
    };

    const p50 = getPercentile(50);
    const p95 = getPercentile(95);
    const p99 = getPercentile(99);

    console.log(`\nResults:`);
    console.log(`- Total Requests: ${CONCURRENCY}`);
    console.log(`- Successful:     ${durations.length}`);
    console.log(`- Failed:         ${failures.length}`);
    console.log(`- Total Time:     ${totalTime.toFixed(2)} ms`);
    console.log(`- Min Latency:    ${min.toFixed(2)} ms`);
    console.log(`- Max Latency:    ${max.toFixed(2)} ms`);
    console.log(`- Avg Latency:    ${avg.toFixed(2)} ms`);
    console.log(`- P50 (Median):   ${p50.toFixed(2)} ms`);
    console.log(`- P95:            ${p95.toFixed(2)} ms`);
    console.log(`- P99:            ${p99.toFixed(2)} ms`);

    return {
        concurrency: CONCURRENCY,
        successful: durations.length,
        failed: failures.length,
        min,
        max,
        avg,
        p50,
        p95,
        p99
    };
}

runBenchmark().catch(console.error);
