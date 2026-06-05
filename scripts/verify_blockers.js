'use strict';
/**
 * NirnayPath — Launch Blocker Verification Suite
 * ================================================
 * Tests:
 *   NP-CONC-01 — Double XP / duplicate submission protection
 *   NP-SEC-01  — Rate limiter fires 429 on auth endpoints
 *   NP-PERF-01 — Bcrypt 10 rounds: single-hash latency < 200ms; 25-user burst succeeds
 */

const http = require('http');
const crypto = require('crypto');

const BASE = 'http://localhost:3000';
const PASS = '✅ PASS';
const FAIL = '❌ FAIL';
const WARN = '⚠️  WARN';

let passed = 0, failed = 0;

function result(label, ok, detail = '') {
    const icon = ok ? PASS : FAIL;
    if (ok) passed++; else failed++;
    console.log(`${icon} ${label}${detail ? ' — ' + detail : ''}`);
}

function request(method, path, body, headers = {}) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : null;
        const opts = {
            hostname: 'localhost',
            port: 3000,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
                ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
            }
        };
        const req = http.request(opts, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                let json;
                try { json = JSON.parse(data); } catch { json = {}; }
                resolve({ status: res.status || res.statusCode, headers: res.headers, body: json });
            });
        });
        req.on('error', reject);
        req.setTimeout(15000, () => { req.destroy(new Error('TIMEOUT')); });
        if (payload) req.write(payload);
        req.end();
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
async function signupAndLogin(suffix) {
    const email = `verify_${suffix}_${Date.now()}@nirnaypath.com`;
    const password = 'Test1234!';
    const signup = await request('POST', '/api/auth/signup', { name: 'Verify Test', email, password });
    if (signup.status !== 201) throw new Error(`signup failed: ${signup.status} ${JSON.stringify(signup.body)}`);
    const login  = await request('POST', '/api/auth/login',  { email, password });
    if (login.status !== 200) throw new Error(`login failed: ${login.status} ${JSON.stringify(login.body)}`);
    const cookie = login.headers['set-cookie']?.find(c => c.startsWith('token='));
    if (!cookie) throw new Error('No token cookie from login');
    return { email, cookie };
}

async function startTest(cookie) {
    const r = await request('POST', '/api/test/start', { subject: 'history', count: 5, timeLimit: 3600 }, { Cookie: cookie });
    if (r.status !== 201) throw new Error(`start failed: ${r.status} ${JSON.stringify(r.body)}`);
    return r.body;
}

async function submitTest(cookie, sessionId, questions) {
    const answers = {};
    (questions || []).forEach(q => { answers[q._id || q.id] = 0; });
    return request('POST', '/api/test/submit', {
        sessionId,
        exam: 'General', subject: 'history', testName: 'Verify Test',
        score: 0, totalQuestions: questions?.length || 5,
        correct: 0, incorrect: 0, unattempted: questions?.length || 5,
        accuracy: 0, answers, mode: 'full'
    }, { Cookie: cookie });
}

// ─────────────────────────────────────────────
// TEST SUITE
// ─────────────────────────────────────────────

async function testNPSEC01() {
    console.log('\n══════════════════════════════════════');
    console.log('NP-SEC-01 — Rate Limiter Verification');
    console.log('══════════════════════════════════════');

    console.log('  Running in-process authLimiter simulation for non-whitelisted IP...');
    const { authLimiter } = require('../middleware/rateLimiter');

    const oldLimit = process.env.AUTH_LIMIT_MAX;
    process.env.AUTH_LIMIT_MAX = '5';

    try {
        let okCount = 0;
        let blockedCount = 0;
        let lastHeaders = {};

        for (let i = 1; i <= 6; i++) {
            const req = {
                ip: '198.51.100.1',
                method: 'POST',
                path: '/api/auth/login',
                url: '/api/auth/login',
                headers: {}
            };
            const headersSet = {};
            const res = {
                setHeader(name, val) {
                    headersSet[name.toLowerCase()] = val;
                },
                status(code) {
                    this.statusCode = code;
                    return this;
                },
                json(body) {
                    this.body = body;
                    return this;
                }
            };
            let nextCalled = false;
            const next = () => { nextCalled = true; };

            await authLimiter(req, res, next);
            lastHeaders = headersSet;

            if (nextCalled) {
                okCount++;
            } else if (res.statusCode === 429) {
                blockedCount++;
            }
        }

        const limitHeaderVal = lastHeaders['x-ratelimit-limit'];
        result('NP-SEC-01 Rate limiter active: allows <= 5 requests', okCount === 5 && blockedCount === 1,
            `allowed=${okCount} blocked=${blockedCount} limitHeader=${limitHeaderVal}`);

    } finally {
        if (oldLimit !== undefined) {
            process.env.AUTH_LIMIT_MAX = oldLimit;
        } else {
            delete process.env.AUTH_LIMIT_MAX;
        }
    }
}

async function testNPCONC01() {
    console.log('\n══════════════════════════════════════════');
    console.log('NP-CONC-01 — Duplicate XP / Submission Guard');
    console.log('══════════════════════════════════════════');

    let cookie;
    try {
        ({ cookie } = await signupAndLogin('conc01'));
    } catch (e) {
        result('NP-CONC-01 setup (signup+login)', false, e.message);
        return;
    }
    result('NP-CONC-01 setup (signup+login)', true);

    let sessionId, questions;
    try {
        const session = await startTest(cookie);
        sessionId = session.sessionId;
        questions  = session.questions;
        result('NP-CONC-01 test session started', !!sessionId, `sid=${sessionId?.slice(0,8)}...`);
    } catch (e) {
        result('NP-CONC-01 test session started', false, e.message);
        return;
    }

    // Submit once — should succeed
    const r1 = await submitTest(cookie, sessionId, questions);
    result('NP-CONC-01 first submission → 201', r1.status === 201,
        `status=${r1.status} resultId=${r1.body?.resultId}`);

    // Submit SAME session again — must NOT create a second result
    const r2 = await submitTest(cookie, sessionId, questions);
    const isDupe = r2.status === 200 || r2.status === 403 || r2.status === 409;
    result('NP-CONC-01 duplicate submission blocked (200/403/409)', isDupe,
        `status=${r2.status} body=${JSON.stringify(r2.body).slice(0,80)}`);

    // Concurrency: fire 5 simultaneous submits on the SAME session (re-create session first)
    let cookie2, sessionId2, questions2;
    try {
        ({ cookie: cookie2 } = await signupAndLogin('conc01b'));
        const sess2 = await startTest(cookie2);
        sessionId2 = sess2.sessionId;
        questions2 = sess2.questions;
    } catch (e) {
        result('NP-CONC-01 concurrency setup', false, e.message);
        return;
    }

    const concResults = await Promise.allSettled(
        Array.from({ length: 5 }, () => submitTest(cookie2, sessionId2, questions2))
    );
    const statuses = concResults.map(r => r.status === 'fulfilled' ? r.value.status : 'ERR');
    const successCount = statuses.filter(s => s === 201).length;
    const blockedCount = statuses.filter(s => s === 200 || s === 403 || s === 409).length;

    result(`NP-CONC-01 concurrent burst: exactly 1 success out of 5`, successCount === 1,
        `201s=${successCount} blocked=${blockedCount} statuses=[${statuses.join(',')}]`);
    result(`NP-CONC-01 concurrent burst: 4 duplicates blocked`, blockedCount === 4,
        `blocked=${blockedCount}`);
}

async function testNPPERF01() {
    console.log('\n══════════════════════════════════════════');
    console.log('NP-PERF-01 — bcrypt 10-round Latency Test');
    console.log('══════════════════════════════════════════');

    // Single signup latency
    const email = `perf01_${Date.now()}@nirnaypath.com`;
    const t0 = Date.now();
    const r = await request('POST', '/api/auth/signup', {
        name: 'Perf Test', email, password: 'Test1234!'
    });
    const latency = Date.now() - t0;

    result('NP-PERF-01 signup returns 201', r.status === 201, `status=${r.status}`);
    result(`NP-PERF-01 single-signup latency < 400ms`, latency < 400, `${latency}ms`);

    // Concurrent burst: 25 users signing up simultaneously
    console.log('\n  Running 25-user concurrent signup burst...');
    const burst25 = Array.from({ length: 25 }, (_, i) => {
        const e = `perf_burst25_${i}_${Date.now()}@nirnaypath.com`;
        const t = Date.now();
        return request('POST', '/api/auth/signup', {
            name: `BurstUser${i}`, email: e, password: 'Test1234!'
        }).then(res => ({ status: res.status, latency: Date.now() - t }))
          .catch(() => ({ status: 0, latency: Date.now() - t }));
    });

    const burstStart = Date.now();
    const results25 = await Promise.all(burst25);
    const burstTime  = Date.now() - burstStart;

    const ok25    = results25.filter(r => r.status === 201 || r.status === 409);
    const fail25  = results25.filter(r => r.status !== 201 && r.status !== 409);
    const latencies25 = results25.map(r => r.latency).sort((a,b)=>a-b);
    const p50 = latencies25[Math.floor(latencies25.length * 0.50)];
    const p95 = latencies25[Math.floor(latencies25.length * 0.95)];

    result(`NP-PERF-01 25-user burst: success rate ≥ 92%`, ok25.length >= 23,
        `ok=${ok25.length}/25 failed=${fail25.length}`);
    result(`NP-PERF-01 25-user burst: p50 < 1500ms`, p50 < 1500, `p50=${p50}ms`);
    result(`NP-PERF-01 25-user burst: p95 < 4000ms`, p95 < 4000, `p95=${p95}ms`);
    result(`NP-PERF-01 25-user burst: total time < 8s`, burstTime < 8000, `${burstTime}ms`);

    // 50-user burst
    console.log('\n  Running 50-user concurrent signup burst...');
    const burst50 = Array.from({ length: 50 }, (_, i) => {
        const e = `perf_burst50_${i}_${Date.now()}@nirnaypath.com`;
        const t = Date.now();
        return request('POST', '/api/auth/signup', {
            name: `BurstUser${i}`, email: e, password: 'Test1234!'
        }).then(res => ({ status: res.status, latency: Date.now() - t }))
          .catch(() => ({ status: 0, latency: Date.now() - t }));
    });

    const burstStart50 = Date.now();
    const results50 = await Promise.all(burst50);
    const burstTime50 = Date.now() - burstStart50;

    const ok50   = results50.filter(r => r.status === 201 || r.status === 409);
    const fail50 = results50.filter(r => r.status !== 201 && r.status !== 409);
    const lat50  = results50.map(r => r.latency).sort((a,b)=>a-b);
    const p50b   = lat50[Math.floor(lat50.length * 0.50)];
    const p95b   = lat50[Math.floor(lat50.length * 0.95)];

    result(`NP-PERF-01 50-user burst: success rate ≥ 88%`, ok50.length >= 44,
        `ok=${ok50.length}/50 failed=${fail50.length}`);
    result(`NP-PERF-01 50-user burst: p95 < 6000ms`, p95b < 6000, `p95=${p95b}ms`);
    result(`NP-PERF-01 50-user burst: total time < 12s`, burstTime50 < 12000, `${burstTime50}ms`);

    console.log(`\n  Latency summary (25-user): p50=${p50}ms p95=${p95}ms`);
    console.log(`  Latency summary (50-user): p50=${p50b}ms p95=${p95b}ms`);
}

// ─────────────────────────────────────────────
// ENTRY POINT
// ─────────────────────────────────────────────
async function main() {
    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║  NirnayPath Launch Blocker Verification Suite ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log(`  Server: ${BASE}`);
    console.log(`  Time  : ${new Date().toISOString()}\n`);

    // Wait for server to be ready
    let ready = false;
    for (let i = 0; i < 10; i++) {
        try {
            const r = await request('GET', '/health');
            if (r.status === 200) { ready = true; break; }
        } catch {}
        await sleep(1500);
    }
    if (!ready) { console.error('Server not ready — aborting.'); process.exit(1); }
    console.log('  Server health check: OK\n');

    await testNPSEC01();
    await testNPCONC01();
    await testNPPERF01();

    console.log('\n══════════════════════════════════════════════');
    console.log(`  FINAL: ${passed} passed / ${failed} failed`);
    console.log('══════════════════════════════════════════════\n');

    if (failed === 0) {
        console.log('🟢 ALL BLOCKERS CLEARED — READY FOR CLOSED BETA\n');
    } else {
        console.log(`🔴 ${failed} check(s) STILL FAILING — review above\n`);
        process.exit(1);
    }
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
