const puppeteer = require('puppeteer');
const http = require('http');

const delay = ms => new Promise(r => setTimeout(r, ms));

function nodePost(path, payload) {
    return new Promise((resolve, reject) => {
        const body = JSON.stringify(payload);
        const req = http.request({
            host: 'localhost', port: 3000, path, method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) }); }
                catch(e) { resolve({ status: res.statusCode, headers: res.headers, body: data }); }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

function nodeGetAuth(path, token) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            host: 'localhost', port: 3000, path, method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        }, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
                catch(e) { resolve({ status: res.statusCode, body: data }); }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

(async () => {
    console.log('🏁 STARTING RUNTIME TELEMETRY VALIDATION (PHASE 9A)...');

    // STEP 0: Get admin token via Node HTTP
    console.log('✔ Authenticating admin via direct Node.js HTTP call...');
    const loginRes = await nodePost('/api/auth/login', { email: 'admin@nirnaypath.local', password: 'AdminPassword123!' });
    if (loginRes.status !== 200 || !loginRes.body.user) {
        console.error('❌ FATAL: Admin login failed via Node HTTP. Status:', loginRes.status, 'Body:', JSON.stringify(loginRes.body));
        process.exit(1);
    }
    
    // Parse cookies from response
    const setCookies = loginRes.headers['set-cookie'] || [];
    const cookiesToSet = [];
    let adminToken = '';
    
    setCookies.forEach(cookieStr => {
        const parts = cookieStr.split(';');
        const [name, value] = parts[0].split('=');
        const trimmedName = name.trim();
        const trimmedVal = decodeURIComponent(value.trim());
        cookiesToSet.push({
            name: trimmedName,
            value: trimmedVal,
            domain: 'localhost',
            path: '/'
        });
        if (trimmedName === 'token') {
            adminToken = trimmedVal;
        }
    });

    console.log(`✔ Admin cookies parsed. Token length: ${adminToken.length}`);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-dev-shm-usage'],
        timeout: 60000
    });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    await page.setViewport({ width: 1200, height: 800 });

    // Set the cookie in browser context before navigating
    if (cookiesToSet.length > 0) {
        await page.setCookie(...cookiesToSet);
        console.log('✔ Telemetry validation cookies injected into browser context.');
    }

    // Inject admin session into localStorage before any navigation
    const adminUserData = JSON.stringify(loginRes.body.user);
    await page.evaluateOnNewDocument((userData) => {
        localStorage.setItem('np_user_data', userData);
    }, adminUserData);

    // 1. Viewport changes
    console.log('✔ Triggering viewport changes...');
    for(let i = 0; i < 5; i++){
        await page.setViewport({ width: 800 + i*100, height: 600 });
        await delay(50);
    }
    await page.setViewport({ width: 1200, height: 800 });

    // 2. 50 Page Reloads
    console.log('✔ Running 50 page reloads...');
    for(let i = 0; i < 50; i++){
        await page.goto('http://localhost:3000/index.html', { waitUntil: 'domcontentloaded' });
        await delay(50);
    }
    console.log('✔ 50 page reloads complete.');

    // 3. 50 Route Changes (SPA sections via admin panel)
    console.log('✔ Running 50 SPA route changes...');
    await page.goto('http://localhost:3000/admin.html', { waitUntil: 'domcontentloaded' });
    await delay(2000);

    const sections = ['analytics', 'questions', 'users', 'payments', 'live-sessions', 'telemetry'];
    for(let i = 0; i < 50; i++){
        await page.evaluate((sec) => {
            if (window.AdminPanel && window.AdminPanel.showSection) window.AdminPanel.showSection(sec);
        }, sections[i % sections.length]);
        await delay(50);
    }
    console.log('✔ 50 SPA route changes complete.');

    // 4. 100 Modal Operations
    console.log('✔ Running 100 modal operations...');
    for(let i = 0; i < 100; i++){
        await page.evaluate((idx) => {
            const m = document.getElementById('questionModal');
            if(m) m.style.display = idx % 2 === 0 ? 'block' : 'none';
        }, i);
        await delay(10);
    }
    console.log('✔ 100 modal operations complete.');

    // 5. 100 API requests
    console.log('✔ Running 100 API requests...');
    await page.evaluate(async () => {
        const promises = [];
        for(let i = 0; i < 100; i++){
            promises.push(
                fetch(i % 10 === 0 ? '/api/non-existent-endpoint' : '/api/subject/science/topics').catch(() => {})
            );
        }
        await Promise.all(promises);
    });

    // Inject a runtime error
    await page.evaluate(() => {
        setTimeout(() => { throw new Error('Phase9A simulated runtime error for telemetry test'); }, 0);
    });
    console.log('✔ 100 API requests complete.');

    // 6. Wait for telemetry flush (5s batch interval)
    console.log('✔ Waiting 8 seconds for telemetry queue flush...');
    await delay(8000);

    // 7. Fetch telemetry overview
    console.log('✔ Fetching telemetry overview via authenticated Node.js request...');
    const overviewRes = await nodeGetAuth('/api/telemetry/overview', adminToken);
    if (overviewRes.status !== 200) {
        console.error('❌ FATAL: Telemetry overview returned status:', overviewRes.status);
        console.error('Body:', JSON.stringify(overviewRes.body));
        await browser.close();
        process.exit(1);
    }
    const telemetryData = overviewRes.body;

    await browser.close();

    // ============================================================
    // PHASE 9A FORENSIC REPORT — ALL VALUES FROM RUNTIME EXECUTION
    // ============================================================
    console.log('\n=================================================================');
    console.log('📊 PHASE 9A TELEMETRY FORENSIC REPORT — RUNTIME MEASURED VALUES');
    console.log('=================================================================');

    // Telemetry Ingestion
    console.log('\n--- 1. TELEMETRY INGESTION ---');
    console.log(`Total Events Ingested:     ${telemetryData.queueBehavior ? telemetryData.queueBehavior.totalIngested : 'UNKNOWN'}`);
    console.log(`Errors Captured:           ${telemetryData.errorCount}`);
    console.log(`Failed Requests Captured:  ${telemetryData.failedRequests ? telemetryData.failedRequests.length : 'UNKNOWN'}`);
    console.log(`Slow APIs Captured:        ${telemetryData.slowApis ? telemetryData.slowApis.length : 'UNKNOWN'}`);
    console.log(`Long Tasks Captured:       ${telemetryData.longTasks ? telemetryData.longTasks.length : 'UNKNOWN'}`);
    console.log(`Memory Snapshots:          ${telemetryData.memoryMetrics ? telemetryData.memoryMetrics.snapshotsCount : 'UNKNOWN'}`);
    console.log(`Active Users Tracked:      ${telemetryData.activeUsersCount}`);
    console.log(`Avg Session Duration:      ${telemetryData.avgSessionDurationMs ? telemetryData.avgSessionDurationMs.toFixed(2) : 0} ms`);

    // Queue Behavior
    const q = telemetryData.queueBehavior || {};
    console.log('\n--- 2. QUEUE BEHAVIOR ---');
    console.log(`Queue Max Size (per queue): ${q.maxSizePerQueue}`);
    console.log(`Queue Current Size (total): ${q.currentSizeTotal}`);
    console.log(`Queue Eviction Count:       ${q.evictionCount}`);
    console.log(`Dropped Events:             ${q.droppedEvents}`);
    console.log(`Ingestion Rate/sec:         ${q.ingestionRatePerSec ? q.ingestionRatePerSec.toFixed(4) : 0}`);

    // API Metrics
    const apis = telemetryData.apiMetrics || {};
    let slowest = { url: 'UNKNOWN', max: -1 };
    let fastest = { url: 'UNKNOWN', min: Infinity };
    let totalLatency = 0, totalApiReqs = 0, failedApiReqs = 0;

    for (const [url, stat] of Object.entries(apis)) {
        if (stat.max > slowest.max) slowest = { url, max: stat.max };
        if (stat.min < fastest.min) fastest = { url, min: stat.min };
        totalLatency += stat.sum;
        totalApiReqs += stat.count;
        failedApiReqs += stat.failed;
    }
    const avgLatency = totalApiReqs > 0 ? (totalLatency / totalApiReqs).toFixed(2) : 'UNKNOWN';

    console.log('\n--- 3. API METRICS ---');
    console.log(`Endpoints Tracked:          ${Object.keys(apis).length}`);
    console.log(`Slowest Endpoint:           ${slowest.url} (${slowest.max !== -1 ? slowest.max : 'UNKNOWN'}ms max)`);
    console.log(`Fastest Endpoint:           ${fastest.url} (${fastest.min !== Infinity ? fastest.min : 'UNKNOWN'}ms min)`);
    console.log(`Average Latency:            ${avgLatency}ms`);
    console.log(`Total API Calls:            ${totalApiReqs}`);
    console.log(`Failed Request Count:       ${failedApiReqs}`);

    // Full endpoint breakdown
    console.log('\n--- 3a. PER-ENDPOINT BREAKDOWN ---');
    for (const [url, stat] of Object.entries(apis)) {
        const avg = stat.count > 0 ? (stat.sum / stat.count).toFixed(1) : 0;
        console.log(`  ${url}: count=${stat.count}, min=${stat.min}ms, max=${stat.max}ms, avg=${avg}ms, failed=${stat.failed}`);
    }

    // Browser Metrics
    const b = telemetryData.browserMetrics || {};
    let minSession = Infinity, maxSession = -1;
    (b.sessionDurations || []).forEach(d => {
        if(d < minSession) minSession = d;
        if(d > maxSession) maxSession = d;
    });

    console.log('\n--- 4. BROWSER METRICS ---');
    console.log(`Browser Distribution:       ${JSON.stringify(b.browserDistribution)}`);
    console.log(`Viewport Distribution:      ${JSON.stringify(b.viewportDistribution)}`);
    console.log(`Platform Distribution:      ${JSON.stringify(b.platformDistribution)}`);
    console.log(`Session Duration Range:     ${minSession !== Infinity ? minSession : 0}ms — ${maxSession !== -1 ? maxSession : 0}ms`);
    console.log(`Session Count:              ${(b.sessionDurations || []).length}`);

    // Memory Metrics
    const mem = telemetryData.memoryMetrics || {};
    console.log('\n--- 5. MEMORY METRICS ---');
    console.log(`Memory Sample Count:        ${mem.snapshotsCount}`);
    console.log(`Unsupported Browser Count:  ${mem.unsupportedBrowserCount}`);
    if (telemetryData.memoryTrend && telemetryData.memoryTrend.length > 0) {
        const last = telemetryData.memoryTrend[telemetryData.memoryTrend.length - 1];
        console.log(`Latest Heap Snapshot:       ${(last.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
    } else {
        console.log(`Latest Heap Snapshot:       UNKNOWN`);
    }

    // Runtime Validation Summary
    console.log('\n--- 6. RUNTIME VALIDATION COUNTS ---');
    console.log(`Page Reloads Completed:     50`);
    console.log(`SPA Route Changes:          50`);
    console.log(`Modal Operations:           100`);
    console.log(`API Requests Fired:         100`);

    // Assertions
    let passed = true;
    console.log('\n--- ASSERTIONS ---');
    if (telemetryData.errorCount < 1)  { console.error('❌ FAILED: No errors captured'); passed = false; }
    else console.log(`✅ Errors captured: ${telemetryData.errorCount}`);
    if (failedApiReqs < 1) { console.error('❌ FAILED: No failed API requests captured'); passed = false; }
    else console.log(`✅ Failed API requests captured: ${failedApiReqs}`);
    if (!q.totalIngested || q.totalIngested < 1) { console.error('❌ FAILED: No events ingested'); passed = false; }
    else console.log(`✅ Total ingested: ${q.totalIngested}`);

    if (passed) console.log('\n✅ ALL PHASE 9A ASSERTIONS PASSED.');
    else console.error('\n❌ SOME PHASE 9A ASSERTIONS FAILED.');

    process.exit(passed ? 0 : 1);
})();
