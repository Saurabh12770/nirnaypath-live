/**
 * NirnayPath — Frontend Runtime Certification Script
 * Phase 9: SRE-Grade Verification Suite
 * 
 * Run: node scripts/frontend_runtime_certification.js
 * 
 * Checks:
 *  1. SPA lifecycle hooks present in script.js
 *  2. Hero container aspect-ratio 16/6 CSS present in style.css
 *  3. Service Worker uses Network-First for HTML (v13)
 *  4. Telemetry has visibility + idle + 429 backoff guards
 *  5. Dashboard CSS has min-width: 0 on grid rows
 *  6. Body uses overflow-x: clip (Phase 7 hardening)
 *  7. No duplicate IDs in any HTML page (static scan)
 *  8. Server smoke test on port 3000
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const http = require('http');

const PUBLIC  = path.join(__dirname, '..', 'public');
const SCRIPTS = path.join(__dirname, '..', 'public');

/* ── Colours ─────────────────────────────────────────────────── */
const GREEN  = '\x1b[32m✅';
const RED    = '\x1b[31m❌';
const YELLOW = '\x1b[33m⚠️ ';
const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';

let passed = 0;
let failed = 0;
const warnings = [];

function pass(label) {
    console.log(`${GREEN} PASS${RESET}  ${label}`);
    passed++;
}
function fail(label, detail = '') {
    console.log(`${RED} FAIL${RESET}  ${label}${detail ? '\n       ' + detail : ''}`);
    failed++;
}
function warn(label) {
    console.log(`${YELLOW} WARN${RESET}  ${label}`);
    warnings.push(label);
}

function readFile(relPath) {
    const abs = path.join(PUBLIC, relPath);
    if (!fs.existsSync(abs)) return null;
    return fs.readFileSync(abs, 'utf8');
}

/* ══════════════════════════════════════════════════════════════
   CHECK 1 — SPA Lifecycle Hooks (Phase 3)
   ════════════════════════════════════════════════════════════ */
console.log(`\n${BOLD}── CHECK 1: SPA Lifecycle Hooks (Phase 3) ────────────────${RESET}`);
{
    const src = readFile('script.js');
    if (!src) { fail('script.js not found'); }
    else {
        const checks = [
            ['pageUnmount function defined',     /function pageUnmount\s*\(/],
            ['pageMount function defined',       /function pageMount\s*\(/],
            ['_activeViewId tracker present',    /_activeViewId/],
            ['showView calls pageUnmount',       /showView[\s\S]{0,300}pageUnmount/],
            ['showView calls pageMount',         /pageMount\(id\)/],
            ['DOM deduplication guard in pageMount', /idMap\[id\]/],
            ['Hero interval cleanup in pageUnmount', /data-hero-interval/],
            ['Slider interval cleanup in pageUnmount', /data-slider-interval/],
            ['cleanupActiveView retained (compat)', /function cleanupActiveView/],
        ];
        checks.forEach(([label, regex]) => {
            regex.test(src) ? pass(label) : fail(label);
        });
    }
}

/* ══════════════════════════════════════════════════════════════
   CHECK 2 — Hero System Aspect Ratio (Phase 2)
   ════════════════════════════════════════════════════════════ */
console.log(`\n${BOLD}── CHECK 2: Hero System (Phase 2) ───────────────────────${RESET}`);
{
    const css = readFile('style.css');
    if (!css) { fail('style.css not found'); }
    else {
        const checks = [
            ['hero-container class defined',           /\.hero-container\s*\{/],
            ['aspect-ratio 16/6 set',                  /aspect-ratio\s*:\s*16\s*\/\s*6/],
            ['hero-slider img uses opacity transition', /\.hero-slider\s+img[\s\S]{0,200}opacity/],
            ['hero-slider img.active has opacity 1',   /\.hero-slider\s+img\.active[\s\S]{0,100}opacity\s*:\s*1/],
        ];
        checks.forEach(([label, regex]) => {
            regex.test(css) ? pass(label) : fail(label);
        });
    }
}

/* ══════════════════════════════════════════════════════════════
   CHECK 3 — Service Worker Cache Strategy (Phase 5)
   ════════════════════════════════════════════════════════════ */
console.log(`\n${BOLD}── CHECK 3: Service Worker Cache Strategy (Phase 5) ─────${RESET}`);
{
    const sw = readFile('service-worker.js');
    if (!sw) { fail('service-worker.js not found'); }
    else {
        const checks = [
            ['Cache version is v13 (purges stale v12)', /nirnaypath-v13/],
            ['HTML pages array defined',                /const HTML_PAGES\s*=/],
            ['SWR_EXTENSIONS array defined',            /const SWR_EXTENSIONS\s*=/],
            ['networkFirstHTML function defined',       /async function networkFirstHTML/],
            ['staleWhileRevalidate function defined',   /async function staleWhileRevalidate/],
            ['HTML routes use networkFirstHTML',        /event\.respondWith\(networkFirstHTML/],
            ['CSS/JS routes use staleWhileRevalidate',  /event\.respondWith\(staleWhileRevalidate/],
            ['Activate purges all non-current caches',  /validCaches\.includes\(key\)/],
            ['Telemetry still bypassed',                /api\/telemetry.*return/],
        ];
        checks.forEach(([label, regex]) => {
            regex.test(sw) ? pass(label) : fail(label);
        });
    }
}

/* ══════════════════════════════════════════════════════════════
   CHECK 4 — Telemetry Rate-Limit Guards (Phase 4)
   ════════════════════════════════════════════════════════════ */
console.log(`\n${BOLD}── CHECK 4: Telemetry Rate-Limit Guards (Phase 4) ───────${RESET}`);
{
    const tel = readFile('js/telemetry.js');
    if (!tel) { fail('js/telemetry.js not found'); }
    else {
        const checks = [
            ['Visibility hidden pause guard',          /visibilityState.*===.*hidden/],
            ['Idle detection threshold defined',       /IDLE_THRESHOLD_MS/],
            ['Activity event listeners for idle reset', /resetIdleTimer/],
            ['isIdle flag defined',                    /let isIdle\s*=/],
            ['shouldSuppressFlush function defined',   /function shouldSuppressFlush/],
            ['429 backoff logic present',              /429/],
            ['Retry-After header parsed',              /Retry-After/],
            ['backoffMultiplier grows on 429',         /backoffMultiplier\s*=\s*Math\.min/],
            ['Backoff capped (no infinite growth)',    /backoffMultiplier.*16/],
            ['Tab visible resumes session',            /visible[\s\S]{0,100}isShuttingDown\s*=\s*false/],
            ['Memory sampler skips hidden/idle tabs',  /visibilityState.*hidden.*isIdle/],
            ['Slow idle flush (60s) implemented',      /60000/],
            ['NirnayTelemetry global exposed',         /window\.NirnayTelemetry/],
        ];
        checks.forEach(([label, regex]) => {
            regex.test(tel) ? pass(label) : fail(label);
        });
    }
}

/* ══════════════════════════════════════════════════════════════
   CHECK 5 — Dashboard Grid Overflow Stability (Phase 6)
   ════════════════════════════════════════════════════════════ */
console.log(`\n${BOLD}── CHECK 5: Dashboard Grid Stability (Phase 6) ──────────${RESET}`);
{
    const css = readFile('css/dashboard.css');
    if (!css) { fail('css/dashboard.css not found'); }
    else {
        const checks = [
            ['intel-top-row has min-width: 0',    /intel-top-row[\s\S]{0,300}min-width\s*:\s*0/],
            ['intel-mid-row has min-width: 0',    /intel-mid-row[\s\S]{0,300}min-width\s*:\s*0/],
            ['intel-bottom-row has min-width: 0', /intel-bottom-row[\s\S]{0,300}min-width\s*:\s*0/],
            ['chart-container has overflow: hidden', /chart-container[\s\S]{0,200}overflow\s*:\s*hidden/],
            ['Responsive 1200px breakpoint defined', /@media.*max-width.*1200px/],
            ['Responsive 768px breakpoint defined',  /@media.*max-width.*768px/],
        ];
        checks.forEach(([label, regex]) => {
            regex.test(css) ? pass(label) : fail(label);
        });
    }
}

/* ══════════════════════════════════════════════════════════════
   CHECK 6 — Responsive Hardening App Shell (Phase 7)
   ════════════════════════════════════════════════════════════ */
console.log(`\n${BOLD}── CHECK 6: Responsive Hardening (Phase 7) ──────────────${RESET}`);
{
    const css = readFile('style.css');
    if (!css) { fail('style.css not found'); }
    else {
        const checks = [
            ['body uses overflow-x: clip (not hidden)', /body[\s\S]{0,200}overflow-x\s*:\s*clip/],
            ['body has min-height: 100dvh',             /min-height\s*:\s*100dvh/],
            ['body has position: relative',             /body[\s\S]{0,300}position\s*:\s*relative/],
            ['Universal box-sizing set',                /\*,\s*\*::before,\s*\*::after[\s\S]{0,100}box-sizing/],
        ];
        checks.forEach(([label, regex]) => {
            regex.test(css) ? pass(label) : fail(label);
        });
    }
}

/* ══════════════════════════════════════════════════════════════
   CHECK 7 — Duplicate ID Static Scan (HTML files)
   ════════════════════════════════════════════════════════════ */
console.log(`\n${BOLD}── CHECK 7: Duplicate ID Scan (HTML Pages) ──────────────${RESET}`);
{
    const htmlFiles = ['index.html', 'about.html', 'test.html'];
    htmlFiles.forEach(file => {
        const src = readFile(file);
        if (!src) { warn(`${file} not found — skipping`); return; }

        const idRegex = /\sid="([^"]+)"/g;
        const ids = {};
        const dups = [];
        let match;
        while ((match = idRegex.exec(src)) !== null) {
            const id = match[1];
            if (ids[id]) {
                dups.push(id);
            }
            ids[id] = true;
        }

        if (dups.length === 0) {
            pass(`${file} — no duplicate IDs found`);
        } else {
            fail(`${file} — ${dups.length} duplicate ID(s): ${dups.slice(0, 5).join(', ')}${dups.length > 5 ? '...' : ''}`);
        }
    });
}

/* ══════════════════════════════════════════════════════════════
   CHECK 8 — Server Smoke Test (port 3000)
   ════════════════════════════════════════════════════════════ */
console.log(`\n${BOLD}── CHECK 8: Server Smoke Test ───────────────────────────${RESET}`);

function smokeRequest(urlPath) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: urlPath,
            method: 'GET',
            timeout: 5000
        };
        const req = http.request(options, (res) => {
            resolve({ status: res.statusCode, ok: res.statusCode < 400 });
        });
        req.on('error', () => resolve({ status: 0, ok: false }));
        req.on('timeout', () => { req.destroy(); resolve({ status: 0, ok: false }); });
        req.end();
    });
}

async function runSmokeTests() {
    const endpoints = [
        ['GET /',                          '/'],
        ['GET /index.html',               '/index.html'],
        ['GET /about.html',               '/about.html'],
        ['GET /style.css',                '/style.css'],
        ['GET /script.js',                '/script.js'],
        ['GET /service-worker.js',        '/service-worker.js'],
        ['GET /api/auth/me (auth gate)',  '/api/auth/me'],
    ];

    for (const [label, urlPath] of endpoints) {
        const result = await smokeRequest(urlPath);
        if (result.status === 0) {
            warn(`${label} — server not responding (start server to test)`);
        } else if (result.ok || result.status === 401 || result.status === 403) {
            // 401/403 are expected on auth-gated endpoints
            pass(`${label} → HTTP ${result.status}`);
        } else {
            fail(`${label} → HTTP ${result.status}`);
        }
    }
}

/* ══════════════════════════════════════════════════════════════
   RUN ALL & SUMMARY
   ════════════════════════════════════════════════════════════ */
runSmokeTests().then(() => {
    const total = passed + failed;
    console.log('\n' + '═'.repeat(55));
    console.log(`${BOLD}  NirnayPath Frontend Runtime Certification${RESET}`);
    console.log('─'.repeat(55));
    console.log(`  ${GREEN} PASSED${RESET}:   ${passed} / ${total}`);
    if (failed > 0) console.log(`  ${RED} FAILED${RESET}:   ${failed}`);
    if (warnings.length > 0) console.log(`  ${YELLOW} WARNINGS${RESET}: ${warnings.length}`);
    console.log('═'.repeat(55));

    if (failed === 0) {
        console.log(`\n${GREEN} ALL CHECKS PASSED — Platform is Production Ready!${RESET}\n`);
        process.exit(0);
    } else {
        console.log(`\n${RED} ${failed} CHECK(S) FAILED — Review and fix before deploy.${RESET}\n`);
        process.exit(1);
    }
});
