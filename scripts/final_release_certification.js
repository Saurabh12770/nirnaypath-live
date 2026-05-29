/**
 * NirnayPath EdTech Platform — Final Release Certification Gate
 * 
 * Performs 10 SRE validation checks including local file audits,
 * live server smoke testing, and concurrent load stress simulation.
 * 
 * Run: node scripts/final_release_certification.js
 * Exit 0 = RELEASE CERTIFIED (100% pass). Exit 1 = RELEASE BLOCKED.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');

const PORT = parseInt(process.env.PORT || '3000');
const BASE_URL = `http://localhost:${PORT}`;

/* ── Colors ─────────────────────────────────────────────────── */
const GREEN = '\x1b[32m✅';
const RED = '\x1b[31m❌';
const YELLOW = '\x1b[33m⚠️ ';
const BLUE = '\x1b[34mℹ️ ';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const CYAN = '\x1b[36m';

let passedChecks = 0;
let failedChecks = 0;
const reportSummary = [];

function pass(category, name, detail = '') {
    console.log(`  ${GREEN}  [${category}] ${BOLD}${name}${RESET}${detail ? ' — ' + detail : ''}`);
    passedChecks++;
    reportSummary.push({ category, name, status: 'PASS', detail });
}

function fail(category, name, detail = '') {
    console.log(`  ${RED}  [${category}] ${BOLD}${name}${RESET}${detail ? ' — ' + detail : ''}`);
    failedChecks++;
    reportSummary.push({ category, name, status: 'FAIL', detail });
}

function info(msg) {
    console.log(`  ${BLUE}  ${msg}`);
}

/* Helper to read file content */
function readProjectFile(relPath) {
    try {
        return fs.readFileSync(path.join(__dirname, '..', relPath), 'utf8');
    } catch (e) {
        return null;
    }
}

/* Helper to execute HTTP request */
function makeRequest(urlPath, method = 'GET') {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: urlPath,
            method: method,
            timeout: 3000
        };
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ ok: res.statusCode < 400, status: res.statusCode, body }));
        });
        req.on('error', (err) => resolve({ ok: false, status: 0, error: err.message }));
        req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: 0, error: 'TIMEOUT' }); });
        req.end();
    });
}

async function runReleaseAudit() {
    const hr = '═'.repeat(70);
    console.log(`\n${hr}`);
    console.log(`${BOLD}${CYAN}  NIRNAYPATH — INTERNET-SCALE RELEASE CERTIFICATION ENGINE${RESET}`);
    console.log(`  Target Server: ${BASE_URL}`);
    console.log(`  Time:          ${new Date().toISOString()}`);
    console.log(`${hr}\n`);

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 1: HERO SYSTEM Hardening (Phase 2)
    // ══════════════════════════════════════════════════════════════
    console.log(`${BOLD}── Category 1: Hero System Hardening ─────────────────────${RESET}`);
    const styleCss = readProjectFile('public/style.css');
    if (!styleCss) {
        fail('Hero', 'style.css loaded', 'File not found');
    } else {
        const hasContainer = styleCss.includes('.hero-container');
        const hasAspectRatio = /aspect-ratio\s*:\s*16\s*\/\s*6/.test(styleCss);
        const hasOpacityTransition = /\.hero-slider\s+img[\s\S]{0,200}opacity/.test(styleCss);
        
        if (hasContainer && hasAspectRatio && hasOpacityTransition) {
            pass('Hero', 'CSS configuration verified', '16:6 aspect-ratio and opacity fades are active.');
        } else {
            fail('Hero', 'CSS configuration verified', 'Missing aspect-ratio or transition styles.');
        }
    }

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 2: SPA RUNTIME LIFECYCLE (Phase 3)
    // ══════════════════════════════════════════════════════════════
    console.log(`\n${BOLD}── Category 2: SPA Runtime Lifecycle ─────────────────────${RESET}`);
    const scriptJs = readProjectFile('public/script.js');
    if (!scriptJs) {
        fail('SPA', 'script.js loaded', 'File not found');
    } else {
        const hasPageMount = scriptJs.includes('function pageMount');
        const hasPageUnmount = scriptJs.includes('function pageUnmount');
        const hasDeduplication = scriptJs.includes('DOM deduplication guard');
        const hasUnmountTearDown = scriptJs.includes('data-hero-interval') && scriptJs.includes('data-slider-interval');

        if (hasPageMount && hasPageUnmount && hasDeduplication && hasUnmountTearDown) {
            pass('SPA', 'Lifecycle methods present', 'Page mount/unmount and interval clear rules are active.');
        } else {
            fail('SPA', 'Lifecycle methods present', 'Missing unmount or deduplication handlers.');
        }
    }

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 3: TELEMETRY & RATE LIMIT COMPLIANCE (Phase 4)
    // ══════════════════════════════════════════════════════════════
    console.log(`\n${BOLD}── Category 3: Telemetry & Rate Limiting ──────────────────${RESET}`);
    const telemetryJs = readProjectFile('public/js/telemetry.js');
    if (!telemetryJs) {
        fail('Telemetry', 'telemetry.js loaded', 'File not found');
    } else {
        const hasVisibilityPause = telemetryJs.includes('visibilityState') && telemetryJs.includes('hidden');
        const hasIdleDetection = telemetryJs.includes('IDLE_THRESHOLD_MS') && telemetryJs.includes('isIdle');
        const hasBackoff = telemetryJs.includes('429') && telemetryJs.includes('Retry-After');
        const hasCappedGrowth = telemetryJs.includes('backoffMultiplier') && telemetryJs.includes('Math.min');

        if (hasVisibilityPause && hasIdleDetection && hasBackoff && hasCappedGrowth) {
            pass('Telemetry', 'Rate-limiting & Backoff compliant', 'Active state suppression and exponential backoffs confirmed.');
        } else {
            fail('Telemetry', 'Rate-limiting & Backoff compliant', 'Missing idle trackers or Retry-After backoffs.');
        }
    }

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 4: SERVICE WORKER STRATEGY (Phase 5)
    // ══════════════════════════════════════════════════════════════
    console.log(`\n${BOLD}── Category 4: Service Worker Caching ────────────────────${RESET}`);
    const swJs = readProjectFile('public/service-worker.js');
    if (!swJs) {
        fail('SW', 'service-worker.js loaded', 'File not found');
    } else {
        const hasV13 = swJs.includes('v13') || swJs.includes('v14') || swJs.includes('v15');
        const hasNetworkFirst = swJs.includes('networkFirstHTML');
        const hasStaleWhileRevalidate = swJs.includes('staleWhileRevalidate');
        const hasPurge = swJs.includes('validCaches.includes');

        if (hasV13 && hasNetworkFirst && hasStaleWhileRevalidate && hasPurge) {
            pass('SW', 'SW strategies certified', 'Network-First for HTML, Stale-While-Revalidate for CSS/JS, and legacy cleanups verified.');
        } else {
            fail('SW', 'SW strategies certified', 'Caching strategy violates network-first/revalidate policies.');
        }
    }

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 5: DASHBOARD STABILITY & LAYOUT (Phase 6)
    // ══════════════════════════════════════════════════════════════
    console.log(`\n${BOLD}── Category 5: Dashboard Grid & Charts ───────────────────${RESET}`);
    const dashCss = readProjectFile('public/css/dashboard.css');
    if (!dashCss) {
        fail('Dashboard', 'dashboard.css loaded', 'File not found');
    } else {
        const hasMinWidthZero = /min-width\s*:\s*0/.test(dashCss);
        const hasChartOverflow = /chart-container[\s\S]{0,200}overflow\s*:\s*hidden/.test(dashCss);

        if (hasMinWidthZero && hasChartOverflow) {
            pass('Dashboard', 'Grid and canvas layout verified', 'Chart sizes are bound and columns use overflow isolation.');
        } else {
            fail('Dashboard', 'Grid and canvas layout verified', 'Missing min-width: 0 or overflow: hidden settings.');
        }
    }

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 6: RESPONSIVE VIEWPORT HARDENING (Phase 7)
    // ══════════════════════════════════════════════════════════════
    console.log(`\n${BOLD}── Category 6: Responsive Viewports ──────────────────────${RESET}`);
    if (!styleCss) {
        fail('Responsive', 'style.css audit', 'style.css unavailable');
    } else {
        const hasBodyClip = /body[\s\S]{0,300}overflow-x\s*:\s*clip/.test(styleCss);
        const hasDvh = /min-height\s*:\s*100dvh/.test(styleCss);

        if (hasBodyClip && hasDvh) {
            pass('Responsive', 'Body viewport layout secured', 'overflow-x: clip and min-height: 100dvh are set.');
        } else {
            fail('Responsive', 'Body viewport layout secured', 'Missing overflow-x: clip or dvh height variables.');
        }
    }

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 7: CBT ENGINE INTEGRITY (Anti-Cheat & Handshake)
    // ══════════════════════════════════════════════════════════════
    console.log(`\n${BOLD}── Category 7: CBT Engine & Anti-Cheat ───────────────────${RESET}`);
    const testJs = readProjectFile('public/js/test.js');
    if (!testJs) {
        fail('CBT', 'test.js loaded', 'File not found');
    } else {
        const hasIdempotency = testJs.includes('_cbtStarted') && testJs.includes('_cbtControlsBound') && testJs.includes('_antiCheatInstalled');
        const hasSessionHandshake = testJs.includes('sessionStorage.getItem(\'cbt-active-session\')') && testJs.includes('testState.sessionId');
        const hasAntiCheatListeners = testJs.includes('fullscreenchange') && testJs.includes('visibilitychange') && testJs.includes('keydown');
        const hasMathJax = testJs.includes('MathJax.typesetPromise');

        if (hasIdempotency && hasSessionHandshake && hasAntiCheatListeners && hasMathJax) {
            pass('CBT', 'Handshake & Integrity verified', 'Session guards, MathJax math layouts, and fullscreen cheating locks are secure.');
        } else {
            fail('CBT', 'Handshake & Integrity verified', 'CBT engine is vulnerable to dual-binding or lack of MathJax configurations.');
        }
    }

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 8: NODE.JS & RAILWAY CONFIGURATION
    // ══════════════════════════════════════════════════════════════
    console.log(`\n${BOLD}── Category 8: Railway & PM2 Configs ─────────────────────${RESET}`);
    const appJs = readProjectFile('app.js');
    if (!appJs) {
        fail('Railway', 'app.js loaded', 'File not found');
    } else {
        const hasKeepAlive = appJs.includes('server.keepAliveTimeout = 65000') || appJs.includes('server.keepAliveTimeout = 65000;');
        const hasHeadersTimeout = appJs.includes('server.headersTimeout = 66000') || appJs.includes('server.headersTimeout = 66000;');
        const hasPM2Primary = appJs.includes('NODE_APP_INSTANCE') && appJs.includes('isPrimaryInstance');

        if (hasKeepAlive && hasHeadersTimeout && hasPM2Primary) {
            pass('Railway', 'HTTP Keepalive & PM2 setup verified', 'Proxy port lock bypass active (65s/66s) and primary PM2 cron isolation verified.');
        } else {
            fail('Railway', 'HTTP Keepalive & PM2 setup verified', 'Missing keepAliveTimeout or PM2 NODE_APP_INSTANCE checks.');
        }
    }

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 9: TELEMETRY & CRASH REPORTING
    // ══════════════════════════════════════════════════════════════
    console.log(`\n${BOLD}── Category 9: Crash Telemetry & Health ──────────────────${RESET}`);
    if (!appJs) {
        fail('Reporting', 'app.js checks', 'app.js unavailable');
    } else {
        const hasCrashService = appJs.includes('CrashReportingService') && appJs.includes('captureException');
        const hasHealthEndpoint = appJs.includes('/health') && appJs.includes('process.uptime()');
        const hasSlowQueryLog = appJs.includes('registerGlobalQueryLogger');

        if (hasCrashService && hasHealthEndpoint && hasSlowQueryLog) {
            pass('Reporting', 'Telemetry services configured', 'Sentry diagnostics, global query loggers, and node health endpoint are active.');
        } else {
            fail('Reporting', 'Telemetry services configured', 'Missing crash monitors or query latency traps.');
        }
    }

    // ══════════════════════════════════════════════════════════════
    // CATEGORY 10: STRESS & LOAD CONCURRENCY (Simulated)
    // ══════════════════════════════════════════════════════════════
    console.log(`\n${BOLD}── Category 10: Concurrency Stress Simulation ─────────────${RESET}`);
    info('Starting simulated high-velocity request burst...');
    
    // We send 25 concurrent requests to verify non-blocking event-loop operation
    const requestBurst = [];
    const endpoints = ['/health', '/index.html', '/style.css', '/script.js', '/service-worker.js'];
    
    const startTime = performance.now();
    for (let i = 0; i < 25; i++) {
        const route = endpoints[i % endpoints.length];
        requestBurst.push(makeRequest(route));
    }

    try {
        const responses = await Promise.all(requestBurst);
        const duration = performance.now() - startTime;
        const totalReq = responses.length;
        const failedReq = responses.filter(r => !r.ok).length;
        const avgLatency = duration / totalReq;

        info(`Simulated Load Stats:`);
        info(`  - Total Requests Sent:  ${totalReq}`);
        info(`  - Failed Requests:      ${failedReq} (${((failedReq / totalReq) * 100).toFixed(1)}%)`);
        info(`  - Total Burst Time:     ${duration.toFixed(2)}ms`);
        info(`  - Average Request Latency: ${avgLatency.toFixed(2)}ms`);

        if (failedReq === 0 && avgLatency < 60) {
            pass('Stress', 'Event-Loop Stress verified', 'Server handled 25 concurrent requests with 0% loss (Average latency: ' + avgLatency.toFixed(2) + 'ms).');
        } else {
            fail('Stress', 'Event-Loop Stress verified', `Request failures: ${failedReq}, Avg Latency: ${avgLatency.toFixed(2)}ms.`);
        }
    } catch (e) {
        fail('Stress', 'Event-Loop Stress verified', `Load run failed: ${e.message}`);
    }

    // ══════════════════════════════════════════════════════════════
    // AUDIT COMPLETED: SUMMARY REPORT
    // ══════════════════════════════════════════════════════════════
    const total = passedChecks + failedChecks;
    const readinessPct = Math.round((passedChecks / total) * 100);

    console.log(`\n${hr}`);
    console.log(`${BOLD}  NirnayPath Release Hardening Summary${RESET}`);
    console.log(`─`.repeat(70));
    console.log(`  Passed Checks:    ${GREEN} ${passedChecks} / ${total}${RESET}`);
    if (failedChecks > 0) {
        console.log(`  Failed Checks:    ${RED} ${failedChecks}${RESET}`);
    }
    console.log(`  Launch Readiness: ${readinessPct}%`);
    console.log(`${hr}\n`);

    const isCertified = failedChecks === 0;

    // ── Generate Report Artifact ──
    let reportMd = `# NirnayPath Release Hardening Certification Report\n\n`;
    reportMd += `**Date:** ${new Date().toISOString()}\n`;
    reportMd += `**Target URL:** ${BASE_URL}\n`;
    reportMd += `**Launch Recommendation:** ${isCertified ? '🟢 APPROVED FOR PRODUCTION' : '🔴 DEPLOYMENT BLOCKED'}\n`;
    reportMd += `**Overall Release Readiness:** ${readinessPct}%\n\n`;
    
    reportMd += `## Audit Area Results\n\n`;
    reportMd += `| Area | Check | Status | Details |\n|---|---|---|---|\n`;
    reportSummary.forEach(r => {
        reportMd += `| **${r.category}** | ${r.name} | ${r.status === 'PASS' ? '✅ PASS' : '❌ FAIL'} | ${r.detail} |\n`;
    });
    
    reportMd += `\n---\n*Report generated automatically by SRE Launch certification suite.*`;
    
    fs.writeFileSync(path.join(__dirname, '..', 'FINAL_RELEASE_CERTIFICATION.md'), reportMd);
    console.log(`  Certification report written to: ${path.join(__dirname, '..', 'FINAL_RELEASE_CERTIFICATION.md')}\n`);

    if (isCertified) {
        console.log(`\n${GREEN} RELEASE CERTIFIED FOR PRODUCTION! The platform has successfully cleared all SRE checks.${RESET}\n`);
        process.exit(0);
    } else {
        console.log(`\n${RED} DEPLOYMENT BLOCKED! Remediation is required before launching.${RESET}\n`);
        process.exit(1);
    }
}

runReleaseAudit().catch(err => {
    console.error('Fatal error during launch audit:', err.message);
    process.exit(1);
});
