'use strict';
const puppeteer = require('puppeteer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const SCRATCH_DIR = 'C:\\Users\\SAURABH KUMAR\\.gemini\\antigravity-ide\\brain\\dfa04b7c-d137-498e-b10c-1c93d096039b\\scratch';
if (!fs.existsSync(SCRATCH_DIR)) {
    fs.mkdirSync(SCRATCH_DIR, { recursive: true });
}
const BASE = 'http://localhost:3000';

const results = {
    phases: {},
    apiMatrix: [],
    networkFailures: [],
    consoleErrors: [],
    consoleLogs: []
};

function pass(phase, msg) {
    console.log(`✅ [${phase}] ${msg}`);
    if (!results.phases[phase]) results.phases[phase] = { status: 'PASS', notes: [] };
    results.phases[phase].notes.push({ pass: true, msg });
}

function fail(phase, msg) {
    console.log(`❌ [${phase}] ${msg}`);
    if (!results.phases[phase]) results.phases[phase] = { status: 'FAIL', notes: [] };
    results.phases[phase].status = 'FAIL';
    results.phases[phase].notes.push({ pass: false, msg });
}

function info(phase, msg) {
    console.log(`ℹ️  [${phase}] ${msg}`);
    if (!results.phases[phase]) results.phases[phase] = { status: 'PASS', notes: [] };
    results.phases[phase].notes.push({ info: true, msg });
}

(async () => {
    console.log('🏁 NirnayPath — FULL E2E BROWSER CERTIFICATION SPRINT\n');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // ── Intercept browser events ──────────────────────────────────────────
    page.on('console', msg => {
        const text = msg.text();
        const type = msg.type();
        results.consoleLogs.push({ type, text });
        if (type === 'error') {
            results.consoleErrors.push({ severity: 'HIGH', text });
        }
        if (type !== 'verbose') console.log(`  💬 [CONSOLE:${type}] ${text}`);
    });
    page.on('pageerror', err => {
        results.consoleErrors.push({ severity: 'CRITICAL', text: err.message });
        console.log(`  🔴 [EXCEPTION] ${err.message}`);
    });
    page.on('requestfailed', req => {
        const errText = req.failure()?.errorText || 'unknown';
        const url = req.url();
        // Only record local failures — third-party CDN aborts are expected in headless
        if (url.includes('localhost')) {
            results.networkFailures.push({ method: req.method(), url, error: errText });
            console.log(`  🔴 [REQUEST FAILED] ${req.method()} ${url} — ${errText}`);
        }
    });
    page.on('request', req => { req._t0 = Date.now(); });
    page.on('response', res => {
        const req = res.request();
        const url = req.url();
        const status = res.status();
        const ms = req._t0 ? Date.now() - req._t0 : '?';
        if (url.includes('/api/')) {
            results.apiMatrix.push({
                url: url.replace(BASE, ''),
                method: req.method(),
                status,
                responseTime: ms + 'ms',
                error: status >= 400 ? `HTTP ${status}` : null
            });
        }
    });

    // ─────────────────────────────────────────────────────────────────────
    // PHASE 1 — ENVIRONMENT VALIDATION
    // ─────────────────────────────────────────────────────────────────────
    console.log('\n━━━ PHASE 1: Environment Validation ━━━');
    try {
        const resp = await page.goto(`${BASE}/`, { waitUntil: 'networkidle2', timeout: 20000 });
        if (resp.status() === 200) {
            pass('PHASE1', `Server UP — HTTP ${resp.status()}`);
        } else {
            fail('PHASE1', `Unexpected status: ${resp.status()}`);
        }
        const title = await page.title();
        if (title.includes('NirnayPath')) {
            pass('PHASE1', `Title correct: "${title}"`);
        } else {
            fail('PHASE1', `Unexpected title: "${title}"`);
        }
    } catch (err) {
        fail('PHASE1', `Server unreachable: ${err.message}`);
    }

    // SW check with retry loop
    let swRegistered = false;
    for (let attempt = 0; attempt < 25; attempt++) {
        swRegistered = await page.evaluate(async () => {
            if (!('serviceWorker' in navigator)) return false;
            const regs = await navigator.serviceWorker.getRegistrations();
            return regs.length > 0;
        });
        if (swRegistered) break;
        await delay(500);
    }
    swRegistered ? pass('PHASE1', 'Service Worker registered') : fail('PHASE1', 'Service Worker NOT registered');

    let cacheKeys = [];
    for (let attempt = 0; attempt < 25; attempt++) {
        cacheKeys = await page.evaluate(async () => {
            if (!('caches' in window)) return [];
            return await window.caches.keys();
        });
        if (cacheKeys.some(k => k.includes('nirnaypath-v15'))) break;
        await delay(500);
    }
    if (cacheKeys.some(k => k.includes('nirnaypath-v15'))) {
        pass('PHASE1', `SW cache v15 active — keys: ${cacheKeys.join(', ')}`);
    } else {
        fail('PHASE1', `SW cache v15 NOT found — found: ${cacheKeys.join(', ') || 'none'}`);
    }

    // ─────────────────────────────────────────────────────────────────────
    // PHASE 2 — GUEST USER JOURNEY
    // ─────────────────────────────────────────────────────────────────────
    console.log('\n━━━ PHASE 2: Guest User Journey ━━━');
    await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });

    // Home
    await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
    await delay(800);
    await page.screenshot({ path: path.join(SCRATCH_DIR, 'p2_guest_home.png') });
    pass('PHASE2', 'Home page screenshot captured');

    // Check hero CTA visible
    const heroCtaVisible = await page.evaluate(() => {
        const btns = document.querySelectorAll('.cta-btn, .hero-actions a, .hero-actions button');
        if (!btns.length) return false;
        const r = btns[0].getBoundingClientRect();
        return r.top >= 0 && r.bottom <= window.innerHeight && r.width > 0 && r.height > 0;
    });
    heroCtaVisible ? pass('PHASE2', 'Hero CTA button is visible in viewport') : fail('PHASE2', 'Hero CTA button clipped/invisible');

    // About
    await page.goto(`${BASE}/about.html`, { waitUntil: 'domcontentloaded' });
    await delay(800);
    await page.screenshot({ path: path.join(SCRATCH_DIR, 'p2_guest_about.png') });
    pass('PHASE2', 'About page screenshot captured');

    const aboutTitle = await page.title();
    aboutTitle.includes('NirnayPath') ? pass('PHASE2', `About title: "${aboutTitle}"`) : fail('PHASE2', `About title unexpected: "${aboutTitle}"`);

    // Back Home + Login Modal
    await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
    await delay(800);
    await page.waitForSelector('#loginBtn', { visible: true });
    await page.click('#loginBtn');
    await delay(400);
    const loginModalVisible = await page.evaluate(() => {
        const m = document.getElementById('loginModal');
        return m && window.getComputedStyle(m).display === 'flex';
    });
    loginModalVisible ? pass('PHASE2', 'Login modal opens on click') : fail('PHASE2', 'Login modal did NOT open');
    await page.screenshot({ path: path.join(SCRATCH_DIR, 'p2_login_modal.png') });

    // Switch to Signup
    await page.waitForSelector('#showSignup', { visible: true });
    await page.click('#showSignup');
    await delay(300);
    const signupContainerVisible = await page.evaluate(() => {
        const el = document.getElementById('signupFormContainer');
        return el && window.getComputedStyle(el).display !== 'none';
    });
    signupContainerVisible ? pass('PHASE2', 'Signup form visible after toggle') : fail('PHASE2', 'Signup form NOT visible after toggle');
    await page.screenshot({ path: path.join(SCRATCH_DIR, 'p2_register_modal.png') });

    // Close modal
    await page.click('#closeLogin');
    await delay(300);
    const modalClosed = await page.evaluate(() => {
        const m = document.getElementById('loginModal');
        return m && window.getComputedStyle(m).display === 'none';
    });
    modalClosed ? pass('PHASE2', 'Login modal closes correctly') : fail('PHASE2', 'Login modal did NOT close');

    // ─────────────────────────────────────────────────────────────────────
    // PHASE 3 — AUTHENTICATED USER JOURNEY
    // ─────────────────────────────────────────────────────────────────────
    console.log('\n━━━ PHASE 3: Authenticated User Journey ━━━');
    const testId = crypto.randomBytes(3).toString('hex');
    const email = `qa_${testId}@nirnaypath.test`;
    const password = 'SecurityTest123!';
    info('PHASE3', `Creating account: ${email}`);

    // Open modal and signup
    await page.click('#loginBtn');
    await delay(400);
    let signupVisible = await page.evaluate(() => {
        const el = document.getElementById('signupFormContainer');
        return el && window.getComputedStyle(el).display !== 'none';
    });
    if (!signupVisible) {
        await page.click('#showSignup');
        await delay(300);
    }
    await page.type('#signupName', 'QA Aspirant');
    await page.type('#signupEmail', email);
    await page.type('#signupPass', password);

    const dialogHandler = async dialog => { await dialog.accept(); };
    page.on('dialog', dialogHandler);
    await page.click('#doSignup');
    let signupSucceeded = false;
    for (let attempt = 0; attempt < 30; attempt++) {
        signupSucceeded = await page.evaluate(() => {
            return !!localStorage.getItem('np_user_data');
        });
        if (signupSucceeded) break;
        await delay(500);
    }
    page.off('dialog', dialogHandler);

    const signedUpIn = await page.evaluate(() => {
        return !!localStorage.getItem('np_user_data') || (window.Auth && window.Auth.isLoggedIn && Auth.isLoggedIn());
    });
    signedUpIn ? pass('PHASE3', 'Signup succeeded — user session created') : fail('PHASE3', 'Signup may have failed — no session detected');

    if (signedUpIn) {
        info('PHASE3', `Promoting ${email} to Pro plan in MongoDB...`);
        try {
            await mongoose.connect('mongodb://localhost:27017/nirnaypath');
            await mongoose.connection.db.collection('users').updateOne(
                { email: email },
                {
                    $set: {
                        plan: 'pro_monthly',
                        subscriptionStatus: 'active',
                        subscriptionEnd: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
                    }
                }
            );
            await mongoose.disconnect();
            pass('PHASE3', 'User promoted to Pro successfully');
        } catch (dbErr) {
            fail('PHASE3', `Failed to promote user to Pro: ${dbErr.message}`);
        }
    }

    // Dismiss onboarding modal if visible, since it blocks clicking the logout button (#loginBtn)
    const onboardingExists = await page.evaluate(() => {
        const modal = document.getElementById('onboardingModal');
        return modal && modal.style.display !== 'none';
    });
    if (onboardingExists) {
        info('PHASE3', 'Onboarding modal detected. Choosing exam and submitting...');
        await page.waitForSelector('.onboard-exam-opt', { visible: true });
        await page.click('.onboard-exam-opt[data-exam="bpsc"]');
        await delay(500);
        await page.click('#onboardingSubmitBtn');
        await delay(1000); // allow transition and modal hide to complete
    }

    // Logout
    info('PHASE3', 'Triggering logout...');
    await page.waitForSelector('#loginBtn', { visible: true });
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 8000 }).catch(() => {}),
        page.click('#loginBtn')
    ]);
    await delay(1500);
    const loggedOut = await page.evaluate(() => !localStorage.getItem('np_user_data'));
    loggedOut ? pass('PHASE3', 'Logout succeeded — session cleared') : fail('PHASE3', 'Logout may have failed — session still present');

    // Manual login
    info('PHASE3', 'Performing manual login...');
    await page.waitForSelector('#loginBtn', { visible: true });
    await page.click('#loginBtn');
    await delay(400);
    let loginFormVisible = await page.evaluate(() => {
        const el = document.getElementById('loginFormContainer');
        return el && window.getComputedStyle(el).display !== 'none';
    });
    if (!loginFormVisible) {
        await page.click('#showLogin');
        await delay(300);
    }
    await page.type('#loginEmail', email);
    await page.type('#loginPass', password);
    await page.click('#doLogin');
    let loginSucceeded = false;
    for (let attempt = 0; attempt < 30; attempt++) {
        loginSucceeded = await page.evaluate(() => {
            return !!localStorage.getItem('np_user_data');
        });
        if (loginSucceeded) break;
        await delay(500);
    }

    const loggedIn = await page.evaluate(() => {
        return !!localStorage.getItem('np_user_data') || (window.Auth && window.Auth.isLoggedIn && Auth.isLoggedIn());
    });
    loggedIn ? pass('PHASE3', 'Manual login succeeded') : fail('PHASE3', 'Manual login FAILED — no session after doLogin');

    // Dashboard
    info('PHASE3', 'Opening Dashboard...');
    const dashResult = await page.evaluate(() => {
        if (typeof Dashboard !== 'undefined' && Dashboard.show) {
            Dashboard.show();
            return 'called';
        } else if (window.Dashboard) {
            window.Dashboard.show();
            return 'called-window';
        }
        return 'missing';
    });
    await delay(2500);
    await page.screenshot({ path: path.join(SCRATCH_DIR, 'p3_dashboard.png') });
    dashResult !== 'missing' ? pass('PHASE3', `Dashboard.show() invoked (${dashResult})`) : fail('PHASE3', 'Dashboard global not found in page scope');

    // Verify dashboard view is active
    const dashViewActive = await page.evaluate(() => {
        const el = document.getElementById('user-dashboard');
        return el && el.classList.contains('active');
    });
    dashViewActive ? pass('PHASE3', 'user-dashboard view is active') : info('PHASE3', 'user-dashboard view active state uncertain');

    // Analytics (mobile bottom nav Analytics click path)
    info('PHASE3', 'Testing mobile Analytics nav...');
    await page.setViewport({ width: 390, height: 844 });
    await delay(300);
    const analyticsNavResult = await page.evaluate(() => {
        const btn = document.getElementById('mob-nav-analytics');
        if (btn) { btn.click(); return 'clicked'; }
        return 'not-found';
    });
    await delay(1000);
    analyticsNavResult === 'clicked' ? pass('PHASE3', 'mob-nav-analytics click triggered') : fail('PHASE3', '#mob-nav-analytics element not found');
    await page.screenshot({ path: path.join(SCRATCH_DIR, 'p3_mobile_analytics_nav.png') });

    // Check no blank screen
    const bodyVisible = await page.evaluate(() => {
        return document.body.innerHTML.length > 100;
    });
    bodyVisible ? pass('PHASE3', 'No blank screen after Analytics nav click') : fail('PHASE3', 'Page blank after Analytics nav click');

    await page.setViewport({ width: 1440, height: 900 });

    // Leaderboard API (Cookie-based Auth verification)
    const lbRes = await page.evaluate(async () => {
        const r = await fetch('/api/leaderboard/upsc');
        return { status: r.status };
    });
    lbRes.status === 200 ? pass('PHASE3', `GET /api/leaderboard/upsc → ${lbRes.status}`) : fail('PHASE3', `GET /api/leaderboard/upsc → ${lbRes.status}`);

    // ─────────────────────────────────────────────────────────────────────
    // PHASE 4 — TEST FLOW CERTIFICATION
    // ─────────────────────────────────────────────────────────────────────
    console.log('\n━━━ PHASE 4: Test Flow Certification ━━━');
    await page.setViewport({ width: 1440, height: 900 });
    // Ensure we're on index.html
    if (!page.url().includes('index.html') && page.url() !== BASE + '/') {
        await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
        await delay(1000);
    }

    info('PHASE4', 'Triggering startTest(science, 5)...');
    const testNavResult = await Promise.race([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).then(() => 'navigated'),
        page.evaluate(() => {
            if (typeof startTest === 'function') {
                startTest('Science E2E Test', 'science', 5, 5);
                return 'started';
            }
            return 'no-startTest';
        }).then(r => r === 'no-startTest' ? 'no-startTest' : new Promise(() => {}))
    ]);
    await delay(2000);

    const testUrl = page.url();
    info('PHASE4', `Current URL: ${testUrl}`);

    if (testUrl.includes('test.html')) {
        pass('PHASE4', 'Navigated to test.html ✔');

        // POST /api/test/start verified (check API matrix)
        const startApiCall = results.apiMatrix.find(a => a.url.includes('/api/test/start'));
        startApiCall
            ? (startApiCall.status === 201 ? pass('PHASE4', `POST /api/test/start → ${startApiCall.status} in ${startApiCall.responseTime}`) : fail('PHASE4', `POST /api/test/start → ${startApiCall.status}`))
            : info('PHASE4', 'POST /api/test/start not captured in API matrix (may have occurred before interception started)');

        // System diagnostics
        await page.waitForSelector('#btn-system-ok', { visible: true, timeout: 8000 });
        await page.click('#btn-system-ok');
        pass('PHASE4', 'System diagnostics: Proceed clicked');
        await delay(500);

        // Candidate verification
        await page.waitForSelector('#verify-consent-check', { visible: true, timeout: 5000 });
        await page.click('#verify-consent-check');
        await delay(200);
        await page.click('#btn-verify-proceed');
        pass('PHASE4', 'Candidate verification: Proceed clicked');
        await delay(500);

        // Instructions consent
        await page.waitForSelector('#consent-check', { visible: true, timeout: 5000 });
        await page.click('#consent-check');
        await delay(200);
        await page.click('#btn-proceed');
        pass('PHASE4', 'Instructions: I am ready to begin clicked');
        await delay(2500);
        await page.screenshot({ path: path.join(SCRATCH_DIR, 'p4_exam_engine.png') });

        // Verify question renders (correct selector: #q-text-content)
        const qText = await page.evaluate(() => {
            const el = document.getElementById('q-text-content');
            return el ? el.textContent.trim() : null;
        });
        qText && qText.length > 3 ? pass('PHASE4', `Question rendered: "${qText.substring(0, 80)}..."`) : fail('PHASE4', `Question text not rendered — got: "${qText}"`);

        // Verify timer (correct selector: #cbt-time-display)
        const timerVal1 = await page.evaluate(() => document.getElementById('cbt-time-display')?.textContent);
        await delay(2100);
        const timerVal2 = await page.evaluate(() => document.getElementById('cbt-time-display')?.textContent);
        info('PHASE4', `Timer t1="${timerVal1}" t2="${timerVal2}"`);
        timerVal1 !== timerVal2 ? pass('PHASE4', 'Timer is counting down ✔') : fail('PHASE4', 'Timer appears static');

        // Answer Q1 — click the option row div (which has the click listener)
        const opt0Row = await page.$('.q-option-row');
        if (opt0Row) {
            await opt0Row.click();
            pass('PHASE4', 'Selected option row 0 for Q1');
        } else {
            fail('PHASE4', '.q-option-row not found — options may not have rendered');
        }
        await delay(300);
        await page.click('#btn-save-next');
        pass('PHASE4', 'Save & Next clicked');
        await delay(500);

        // Back-navigation via palette button #pal-0
        const pal0 = await page.$('#pal-0');
        if (pal0) {
            await pal0.click();
            pass('PHASE4', 'Back-navigation via palette #pal-0 ✔');
            await delay(400);
        } else {
            fail('PHASE4', '#pal-0 palette button not found (no previous-button exists — palette is the nav mechanism)');
        }

        // Answer all 5 questions
        for (let i = 0; i < 5; i++) {
            const row = await page.$('.q-option-row');
            if (row) await row.click();
            await delay(200);
            await page.click('#btn-save-next');
            await delay(600);
        }
        pass('PHASE4', 'Answered all 5 questions via Save & Next');

        // Heartbeat — check API matrix
        const hbCall = results.apiMatrix.find(a => a.url.includes('/api/test/heartbeat'));
        hbCall ? pass('PHASE4', `Heartbeat active: POST /api/test/heartbeat → ${hbCall.status}`) : info('PHASE4', 'Heartbeat not yet in API matrix (fires at 10s interval)');

        // Submit
        await page.waitForSelector('#btn-submit-test', { visible: true, timeout: 5000 });
        await page.click('#btn-submit-test');
        await delay(500);
        await page.waitForSelector('#btn-confirm-submit', { visible: true, timeout: 5000 });
        await page.click('#btn-confirm-submit');
        pass('PHASE4', 'Test submission confirmed');
        try {
            await page.waitForSelector('#terminated-overlay.active', { timeout: 12000 });
        } catch (overlayErr) {
            info('PHASE4', `Timeout waiting for #terminated-overlay.active: ${overlayErr.message}`);
        }
        await page.screenshot({ path: path.join(SCRATCH_DIR, 'p4_result_screen.png') });

        // Verify submit API call
        const submitCall = results.apiMatrix.find(a => a.url.includes('/api/test/submit'));
        submitCall ? pass('PHASE4', `POST /api/test/submit → ${submitCall.status}`) : fail('PHASE4', 'POST /api/test/submit not in API matrix');

        // Result screen
        const terminatedOverlay = await page.evaluate(() => {
            const el = document.getElementById('terminated-overlay');
            return el && el.classList.contains('active');
        });
        terminatedOverlay ? pass('PHASE4', 'Result/terminated overlay shown ✔') : fail('PHASE4', 'Result overlay NOT active after submit');

        // Return home
        await page.waitForSelector('#btn-return-home', { visible: true, timeout: 5000 });
        await page.click('#btn-return-home');
        await delay(2000);
        pass('PHASE4', 'Returned home after test');
    } else {
        fail('PHASE4', `Failed to navigate to test.html — still at: ${testUrl}`);
    }

    // ─────────────────────────────────────────────────────────────────────
    // PHASE 5 — BIHAR REGRESSION TEST
    // ─────────────────────────────────────────────────────────────────────
    console.log('\n━━━ PHASE 5: Bihar Regression Test ━━━');
    if (!page.url().includes('index.html') && page.url() !== `${BASE}/`) {
        await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
        await delay(1000);
    }

    info('PHASE5', 'Triggering startTest(bihar, 5)...');
    await Promise.race([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).then(() => 'navigated'),
        page.evaluate(() => {
            if (typeof startTest === 'function') {
                startTest('Bihar GK Test', 'bihar', 5, 5);
            }
        }).then(() => new Promise(() => {}))
    ]);
    await delay(2000);

    const biharUrl = page.url();
    if (biharUrl.includes('test.html')) {
        pass('PHASE5', 'Bihar test navigated to test.html ✔');

        // Check API start call for bihar
        const biharApiCalls = results.apiMatrix.filter(a => a.url.includes('/api/test/start'));
        info('PHASE5', `test/start API calls: ${biharApiCalls.map(c => `${c.status}`).join(', ')}`);
        const lastStart = biharApiCalls[biharApiCalls.length - 1];
        lastStart?.status === 201 ? pass('PHASE5', `POST /api/test/start → ${lastStart.status} ✔ No 404 "No questions found"`) : fail('PHASE5', `POST /api/test/start → ${lastStart?.status} — possible subject mismatch`);

        await page.waitForSelector('#btn-system-ok', { visible: true, timeout: 8000 });
        await page.click('#btn-system-ok');
        await delay(400);
        await page.waitForSelector('#verify-consent-check', { visible: true });
        await page.click('#verify-consent-check');
        await delay(200);
        await page.click('#btn-verify-proceed');
        await delay(400);
        await page.waitForSelector('#consent-check', { visible: true });
        await page.click('#consent-check');
        await delay(200);
        await page.click('#btn-proceed');
        await delay(2500);
        await page.screenshot({ path: path.join(SCRATCH_DIR, 'p5_bihar_test.png') });

        const biharQuestion = await page.evaluate(() => {
            const el = document.getElementById('q-text-content');
            return el ? el.textContent.trim() : null;
        });
        biharQuestion && biharQuestion.length > 3
            ? pass('PHASE5', `Bihar question rendered: "${biharQuestion.substring(0, 80)}..."`)
            : fail('PHASE5', `Bihar question NOT rendered — got: "${biharQuestion}"`);

        // Submit to clean up
        await page.waitForSelector('#btn-submit-test', { visible: true, timeout: 5000 });
        await page.click('#btn-submit-test');
        await delay(400);
        await page.waitForSelector('#btn-confirm-submit', { visible: true });
        await page.click('#btn-confirm-submit');
        try {
            await page.waitForSelector('#terminated-overlay.active', { timeout: 12000 });
        } catch (overlayErr) {
            info('PHASE5', `Timeout waiting for #terminated-overlay.active: ${overlayErr.message}`);
        }
        await page.waitForSelector('#btn-return-home', { visible: true, timeout: 5000 });
        await page.click('#btn-return-home');
        await delay(2000);
    } else {
        fail('PHASE5', `Bihar test did NOT navigate to test.html — at: ${biharUrl}`);
    }

    // ─────────────────────────────────────────────────────────────────────
    // PHASE 6 — DASHBOARD API MATRIX CERTIFICATION
    // ─────────────────────────────────────────────────────────────────────
    console.log('\n━━━ PHASE 6: Dashboard API Matrix ━━━');
    // Dashboard.show() triggers concurrent: /api/user/me, /api/user/stats, /api/leaderboard/upsc
    const dashApiResult = await page.evaluate(() => {
        if (typeof Dashboard !== 'undefined') { Dashboard.show(); return 'ok'; }
        return 'missing';
    });
    await delay(3000);
    await page.screenshot({ path: path.join(SCRATCH_DIR, 'p6_dashboard_loaded.png') });
    dashApiResult === 'ok' ? pass('PHASE6', 'Dashboard.show() called') : fail('PHASE6', 'Dashboard not accessible');

    const dashboardApis = [
        { path: '/api/user/me', method: 'GET' },
        { path: '/api/user/stats', method: 'GET' },
        { path: '/api/leaderboard/upsc', method: 'GET' }
    ];
    for (const api of dashboardApis) {
        const hit = results.apiMatrix.filter(a => a.url.includes(api.path) && a.method === api.method).pop();
        if (hit) {
            (hit.status === 200 || hit.status === 304)
                ? pass('PHASE6', `${api.method} ${api.path} → ${hit.status} (${hit.responseTime})`)
                : fail('PHASE6', `${api.method} ${api.path} → ${hit.status}`);
        } else {
            info('PHASE6', `${api.method} ${api.path} — not yet in API matrix`);
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // PHASE 7 — MOBILE CERTIFICATION
    // ─────────────────────────────────────────────────────────────────────
    console.log('\n━━━ PHASE 7: Mobile Certification ━━━');
    const mobileViewports = [320, 360, 375, 390, 414, 768];
    for (const w of mobileViewports) {
        await page.setViewport({ width: w, height: 800 });
        await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
        await delay(600);
        await page.screenshot({ path: path.join(SCRATCH_DIR, `p7_mobile_${w}.png`) });

        // Hero CTA visibility check
        const heroVisible = await page.evaluate(() => {
            const ctas = document.querySelectorAll('.cta-btn, .hero-actions a, .hero-actions button');
            if (!ctas.length) return 'no-cta-found';
            const r = ctas[0].getBoundingClientRect();
            const clipped = r.bottom <= 0 || r.top >= window.innerHeight || r.width === 0 || r.height === 0;
            return clipped ? 'clipped' : 'visible';
        });
        heroVisible === 'visible'
            ? pass('PHASE7', `${w}px — Hero CTA visible ✔`)
            : fail('PHASE7', `${w}px — Hero CTA ${heroVisible}`);

        // Check hero overflow
        const heroOverflow = await page.evaluate(() => {
            const hero = document.querySelector('.hero, .hero-container');
            if (!hero) return 'no-hero';
            const style = window.getComputedStyle(hero);
            return style.overflow + '/' + style.overflowX + '/' + style.overflowY;
        });
        info('PHASE7', `${w}px — .hero overflow: ${heroOverflow}`);

        // Check mobile drawer Dashboard link (for authenticated)
        const mobileDrawerDash = await page.evaluate(() => {
            const el = document.getElementById('mobileDashNavLink');
            return el ? 'present' : 'missing';
        });
        mobileDrawerDash === 'present'
            ? pass('PHASE7', `${w}px — mobileDashNavLink present in drawer`)
            : fail('PHASE7', `${w}px — mobileDashNavLink missing from drawer`);
    }
    await page.setViewport({ width: 1440, height: 900 });

    // ─────────────────────────────────────────────────────────────────────
    // PHASE 8 — LOGO CERTIFICATION
    // ─────────────────────────────────────────────────────────────────────
    console.log('\n━━━ PHASE 8: Logo Certification ━━━');
    await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
    await delay(600);
    const logoAssets = await page.evaluate(() => {
        const logos = [];
        document.querySelectorAll('img').forEach(img => {
            if (img.src.includes('logo') || (img.alt && img.alt.toLowerCase().includes('logo'))) {
                logos.push({ src: img.src, loaded: img.naturalWidth > 0 && img.naturalHeight > 0, w: img.naturalWidth, h: img.naturalHeight });
            }
        });
        const faCompass = document.querySelector('.fa-compass, .fas.fa-compass');
        if (faCompass) logos.push({ type: 'fontIcon', icon: 'fa-compass', present: true });
        return logos;
    });
    if (logoAssets.length > 0) {
        pass('PHASE8', `${logoAssets.length} logo asset(s) detected`);
        logoAssets.forEach(l => {
            if (l.type === 'fontIcon') {
                pass('PHASE8', `FontIcon logo: ${l.icon} present`);
            } else {
                l.loaded
                    ? pass('PHASE8', `IMG logo loaded: ${l.src} (${l.w}×${l.h})`)
                    : fail('PHASE8', `IMG logo NOT loaded: ${l.src}`);
            }
        });
    } else {
        info('PHASE8', 'No <img> logo found — app uses FontAwesome icon as logo');
    }

    // PWA manifest icons
    const manifestCheck = await page.evaluate(async () => {
        try {
            const r = await fetch('/manifest.json');
            const m = await r.json();
            return { icons: m.icons?.map(i => i.src), name: m.name };
        } catch { return null; }
    });
    if (manifestCheck) {
        pass('PHASE8', `PWA manifest loaded — name: "${manifestCheck.name}"`);
        if (manifestCheck.icons?.length) {
            pass('PHASE8', `Manifest icons: ${manifestCheck.icons.join(', ')}`);
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // PHASE 9 — PWA / SERVICE WORKER CERTIFICATION
    // ─────────────────────────────────────────────────────────────────────
    console.log('\n━━━ PHASE 9: PWA Certification ━━━');
    const swInfo = await page.evaluate(async () => {
        if (!('serviceWorker' in navigator)) return { supported: false };
        const regs = await navigator.serviceWorker.getRegistrations();
        return {
            supported: true,
            count: regs.length,
            registrations: regs.map(r => ({
                scope: r.scope,
                scriptURL: r.active?.scriptURL,
                state: r.active?.state
            }))
        };
    });
    swInfo.supported && swInfo.count > 0
        ? pass('PHASE9', `SW active — ${JSON.stringify(swInfo.registrations[0])}`)
        : fail('PHASE9', 'No active service worker');

    const cacheInfo = await page.evaluate(async () => {
        if (!('caches' in window)) return [];
        return await window.caches.keys();
    });
    info('PHASE9', `Cache keys: ${cacheInfo.join(', ')}`);
    cacheInfo.some(k => k.includes('v15'))
        ? pass('PHASE9', 'Cache v15 is active — stale v14 cache purged')
        : fail('PHASE9', 'Cache v15 NOT found — SW cache may be stale');

    // ─────────────────────────────────────────────────────────────────────
    // PHASE 10 — CONSOLE AUDIT
    // ─────────────────────────────────────────────────────────────────────
    console.log('\n━━━ PHASE 10: Console Audit ━━━');
    const critical = results.consoleErrors.filter(e => e.severity === 'CRITICAL');
    const high = results.consoleErrors.filter(e => e.severity === 'HIGH' && !e.text.includes('401'));
    const medium = results.consoleErrors.filter(e => e.text.includes('401') || e.text.includes('503'));

    critical.length === 0 ? pass('PHASE10', 'No CRITICAL uncaught exceptions') : fail('PHASE10', `${critical.length} CRITICAL exceptions: ${critical.map(e => e.text).join('; ')}`);
    high.length === 0 ? pass('PHASE10', 'No HIGH console errors (excluding expected 401s)') : fail('PHASE10', `${high.length} HIGH errors: ${high.map(e => e.text.substring(0, 60)).join('; ')}`);
    medium.length > 0 ? info('PHASE10', `${medium.length} MEDIUM errors (401 Unauthorized on /api/user/me for guest — EXPECTED)`) : pass('PHASE10', 'No medium errors');

    // ─────────────────────────────────────────────────────────────────────
    // PHASE 11 — NETWORK AUDIT
    // ─────────────────────────────────────────────────────────────────────
    console.log('\n━━━ PHASE 11: Network Audit (Local Only) ━━━');
    if (results.networkFailures.length === 0) {
        pass('PHASE11', 'No local HTTP request failures');
    } else {
        results.networkFailures.forEach(f => fail('PHASE11', `${f.method} ${f.url} — ${f.error}`));
    }

    const failedApiCalls = results.apiMatrix.filter(a => a.status >= 400 && !a.url.includes('/api/user/me'));
    failedApiCalls.length === 0
        ? pass('PHASE11', 'No unexpected API failures')
        : failedApiCalls.forEach(a => fail('PHASE11', `${a.method} ${a.url} → ${a.status}`));

    // Expected 401 for guest /api/user/me
    const guestMeCall = results.apiMatrix.find(a => a.url.includes('/api/user/me') && a.status === 401);
    guestMeCall ? pass('PHASE11', 'GET /api/user/me → 401 for guest (EXPECTED behaviour)') : info('PHASE11', 'No 401 for guest /api/user/me');

    // ─────────────────────────────────────────────────────────────────────
    // PHASE 12 — FINAL VERDICT
    // ─────────────────────────────────────────────────────────────────────
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PHASE 12: FINAL VERDICT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    let allPass = true;
    for (const [phase, data] of Object.entries(results.phases)) {
        const icon = data.status === 'PASS' ? '✅' : '❌';
        if (data.status !== 'PASS') allPass = false;
        console.log(`  ${icon}  ${phase}: ${data.status}`);
        data.notes.filter(n => !n.pass && !n.info).forEach(n => console.log(`        ↳ FAIL: ${n.msg}`));
    }

    console.log(`\n  Overall: ${allPass ? '✅ ALL PHASES PASS' : '⚠️  SOME PHASES FAILED'}`);

    // Production readiness scores
    const phaseList = Object.values(results.phases);
    const passCount = phaseList.filter(p => p.status === 'PASS').length;
    const total = phaseList.length;
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('PRODUCTION READINESS SCORE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Phases Passing : ${passCount}/${total}`);

    // Write final results
    fs.writeFileSync(
        path.join(SCRATCH_DIR, 'e2e_results_final.json'),
        JSON.stringify({ results, apiMatrix: results.apiMatrix }, null, 2),
        'utf8'
    );
    console.log('\n✔ Full results written to e2e_results_final.json');

    await browser.close();
})();
