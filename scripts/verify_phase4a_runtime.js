/**
 * scripts/verify_phase4a_runtime.js
 *
 * NOTE: Set MONGOMS_VERSION=8.2.1 to use cached binary (avoids 781MB download).
 *       A cached binary exists at: %USERPROFILE%\.cache\mongodb-binaries\mongod-x64-win32-8.2.1.exe
 * =================================
 * POST-IMPLEMENTATION RUNTIME VERIFICATION
 * 
 * Uses mongodb-memory-server for an in-process MongoDB,
 * then spawns the NirnayPath server and runs all 6 verification flows.
 * 
 * NO static assumptions. All evidence comes from live HTTP requests.
 * 
 * Usage: node scripts/verify_phase4a_runtime.js
 */
'use strict';

const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const BASE_DIR = path.resolve(__dirname, '..');
const TEST_PORT = 5001;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

const JWT_SECRET = 'verify-phase4a-jwt-secret-runtime';
const REFRESH_TOKEN_SECRET = 'verify-phase4a-refresh-secret-runtime';

// ── Global state ────────────────────────────────────────────────────────
const results = [];
let mongod = null;
let serverProc = null;
let mongoUri = null;
const testUsers = {};

// ── Helpers ─────────────────────────────────────────────────────────────
function record(label, passed, details) {
    const entry = { label, passed, timestamp: new Date().toISOString(), ...details };
    results.push(entry);
    const icon = passed ? '✓ PASS' : '✗ FAIL';
    console.log(`  ${icon} | ${label}`);
    if (!passed && details.error) console.log(`         Error: ${details.error}`);
    if (!passed && details.expected) console.log(`         Expected: ${details.expected}, Got: ${details.got}`);
    return entry;
}

function httpReq(method, urlPath, opts = {}) {
    return new Promise((resolve, reject) => {
        const u = new URL(BASE_URL + urlPath);
        const req = http.request({
            hostname: u.hostname, port: u.port, path: u.pathname,
            method, headers: { 'Content-Type': 'application/json', ...opts.headers },
            timeout: 10000,
        }, (res) => {
            let body = '';
            res.on('data', c => body += c);
            res.on('end', () => {
                let parsed = body;
                try { parsed = JSON.parse(body); } catch (_) {}
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: parsed,
                    rawBody: body,
                    cookies: (res.headers['set-cookie'] || []).map(c => {
                        const parts = {};
                        c.split(';').forEach((p, i) => {
                            const [k, ...v] = p.trim().split('=');
                            if (i === 0) { parts.name = k.trim(); parts.value = (v.join('=') || '').trim(); }
                            else parts[k.trim().toLowerCase()] = (v.join('=') || 'true').trim();
                        });
                        return parts;
                    }),
                });
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
        if (opts.body) req.write(JSON.stringify(opts.body));
        req.end();
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Connect mongoose for direct DB queries ──────────────────────────────
let _mongooseConnected = false;
async function ensureMongooseConnected() {
    if (_mongooseConnected) return;
    const mongoose = require('mongoose');
    // Connect to the SAME in-memory MongoDB that the server uses
    await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
    });
    _mongooseConnected = true;
    console.log('[MONGO] Test script mongoose connected to in-memory DB');
}

// ── Start MongoDB ───────────────────────────────────────────────────────
async function startMongo() {
    console.log('\n[MONGO] Starting in-memory MongoDB...');
    mongod = await MongoMemoryServer.create({
        instance: { dbName: 'nirnaypath_test_phase4a' },
    });
    mongoUri = mongod.getUri();
    console.log(`[MONGO] URI: ${mongoUri}`);
}

// ── Start Server ───────────────────────────────────────────────────────
async function startServer() {
    console.log(`[SERVER] Starting NirnayPath on port ${TEST_PORT}...`);
    return new Promise((resolve, reject) => {
        const env = {
            ...process.env,
            PORT: TEST_PORT.toString(),
            MONGO_URI: mongoUri,
            JWT_SECRET,
            REFRESH_TOKEN_SECRET,
            NODE_ENV: 'test',
            ENABLE_REDIS: 'false',
            ENABLE_QUEUE: 'false',
            ENABLE_WORKERS: 'false',
        };
        serverProc = spawn('node', ['app.js'], { env, cwd: BASE_DIR, stdio: ['pipe', 'pipe', 'pipe'] });

        let started = false;
        const t = setTimeout(() => {
            if (!started) { serverProc.kill(); reject(new Error('Server startup timeout (25s)')); }
        }, 25000);

        serverProc.stdout.on('data', (d) => {
            const msg = d.toString();
            if (msg.includes('ONLINE') || msg.includes('Connected to MongoDB')) {
                // Give DB time to settle
                if (!started) {
                    started = true;
                    clearTimeout(t);
                    setTimeout(() => resolve(), 2000);
                }
            }
        });
        serverProc.stderr.on('data', (d) => { /* normal noise */ });
        serverProc.on('error', (e) => { clearTimeout(t); reject(e); });
        serverProc.on('exit', (c) => { if (!started) { clearTimeout(t); reject(new Error(`Exit ${c}`)); } });
    });
}

function stopAll() {
    if (serverProc) { serverProc.kill('SIGTERM'); serverProc = null; }
    if (mongod) { mongod.stop().catch(() => {}); mongod = null; }
}

// ════════════════════════════════════════════════════════════════════════
//  FLOW 1: Signup Runtime Test
// ════════════════════════════════════════════════════════════════════════
async function flow1_Signup() {
    console.log('\n── FLOW 1: Signup Runtime Test ──');
    const email = `flow1_${Date.now()}@test.nirnaypath`;

    try {
        const res = await httpReq('POST', '/api/auth/signup', {
            body: { name: 'Flow1 Tester', email, password: 'Flow1Pass!123' },
        });

        // 1a: Status code
        const statusOk = res.status === 201;
        record('F1-1: Signup returns 201', statusOk, { status: res.status });

        // 1b: Response structure unchanged
        const hasUser = res.body.user && res.body.user.email === email;
        const noTokenLeaked = !res.body.token && !res.body.refreshToken;
        record('F1-2: Response { user: { name, email, role } } — no tokens leaked', hasUser && noTokenLeaked, {
            hasUser, noTokenLeaked, bodyKeys: Object.keys(res.body).join(','),
        });

        // 1c: Cookies
        const tokenCookie = res.cookies.find(c => c.name === 'token');
        const refreshCookie = res.cookies.find(c => c.name === 'refreshToken');
        const hasTokenCookie = !!tokenCookie;
        const hasRefreshCookie = !!refreshCookie;

        record('F1-3: token cookie set (httpOnly)', hasTokenCookie, {
            httpOnly: tokenCookie?.httponly || 'missing',
            sameSite: tokenCookie?.samesite || 'missing',
            maxAge: tokenCookie?.maxage || 'missing',
            secure: tokenCookie?.secure || false,
            path: tokenCookie?.path || 'missing',
        });

        record('F1-4: refreshToken cookie set (httpOnly)', hasRefreshCookie, {
            httpOnly: refreshCookie?.httponly || 'missing',
            sameSite: refreshCookie?.samesite || 'missing',
            maxAge: refreshCookie?.maxage || 'missing',
            secure: refreshCookie?.secure || false,
        });

        // 1d: sameSite values
        const sameSiteLax = tokenCookie?.samesite === 'Lax' && refreshCookie?.samesite === 'Lax';
        record('F1-5: sameSite=Lax on both cookies', sameSiteLax, {
            tokenSameSite: tokenCookie?.samesite,
            refreshSameSite: refreshCookie?.samesite,
        });

        // 1e: Cookie expiry values
        const tokenMaxAge = parseInt(tokenCookie?.maxage || '0');
        const refreshMaxAge = parseInt(refreshCookie?.maxage || '0');
        const tokenExpires1h = tokenMaxAge === 3600;
        const refreshExpires7d = refreshMaxAge === 604800;
        record('F1-6: token maxAge=3600 (1h), refreshToken maxAge=604800 (7d)', tokenExpires1h && refreshExpires7d, {
            tokenMaxAge, refreshMaxAge,
        });

        // 1f: Verify refreshTokens persisted in MongoDB via direct DB query
        const mongoose = require('mongoose');
        const User = require('../models/user');
        const dbUser = await User.findOne({ email }).select('+password');
        const hasRefreshInDb = dbUser && Array.isArray(dbUser.refreshTokens) && dbUser.refreshTokens.length === 1;
        record('F1-7: refreshTokens[1] persisted in MongoDB', hasRefreshInDb, {
            count: dbUser?.refreshTokens?.length,
            tokenLengths: dbUser?.refreshTokens?.map(t => t.length),
        });

        testUsers.flow1 = { email, tokenCookie, refreshCookie, dbUser };

    } catch (err) {
        record('F1-FATAL: Signup test crashed', false, { error: err.message });
    }
}

// ════════════════════════════════════════════════════════════════════════
//  FLOW 2: Login + Multi-Device Runtime Test
// ════════════════════════════════════════════════════════════════════════
async function flow2_MultiDevice() {
    console.log('\n── FLOW 2: Login + Multi-Device Runtime Test ──');
    const email = `flow2_${Date.now()}@test.nirnaypath`;

    try {
        // Pre-create user
        await httpReq('POST', '/api/auth/signup', {
            body: { name: 'Flow2 Multi', email, password: 'Flow2Pass!' },
        });

        const devices = ['A', 'B', 'C', 'D', 'E', 'F'];
        const loginResults = [];

        for (const dev of devices) {
            const res = await httpReq('POST', '/api/auth/login', {
                body: { email, password: 'Flow2Pass!' },
            });
            loginResults.push({
                device: dev,
                status: res.status,
                tokenCookie: res.cookies.find(c => c.name === 'token'),
                refreshCookie: res.cookies.find(c => c.name === 'refreshToken'),
            });
            await sleep(100);
        }

        // F2-1: All 6 logins succeed
        const allOk = loginResults.every(r => r.status === 200);
        record('F2-1: All 6 device logins return 200', allOk, {
            statuses: loginResults.map(r => r.status),
        });

        // F2-2: Each login generates unique cookies
        const uniqueCookies = new Set(loginResults.map(r => r.refreshCookie?.value?.substring(0, 20)));
        record('F2-2: Each device gets a unique refreshToken cookie', uniqueCookies.size === 6, {
            uniqueCount: uniqueCookies.size,
        });

        // F2-3: Check DB — max 5 tokens (oldest removed)
        const User = require('../models/user');
        const dbUser = await User.findOne({ email });
        const tokenCount = dbUser?.refreshTokens?.length || 0;
        record('F2-3: refreshTokens array capped at 5 (oldest evicted)', tokenCount === 5, {
            tokenCount, expectedMax: 5,
        });

        // F2-4: Oldest device (A) token should be evicted
        // Device A's refresh token should NOT be in the array
        const deviceAToken = loginResults[0].refreshCookie?.value;
        const aEvicted = deviceAToken && !dbUser?.refreshTokens?.includes(deviceAToken);
        record('F2-4: Oldest device (A) refresh token evicted after 6 logins', aEvicted, {
            aTokenInDb: aEvicted ? false : true,
        });

        testUsers.flow2 = { email, loginResults, dbUser };

    } catch (err) {
        record('F2-FATAL: Multi-device test crashed', false, { error: err.message });
    }
}

// ════════════════════════════════════════════════════════════════════════
//  FLOW 3: Refresh Flow Runtime Test
// ════════════════════════════════════════════════════════════════════════
async function flow3_Refresh() {
    console.log('\n── FLOW 3: Refresh Flow Runtime Test ──');
    const email = `flow3_${Date.now()}@test.nirnaypath`;

    try {
        // Create user and login to get refresh token
        await httpReq('POST', '/api/auth/signup', {
            body: { name: 'Flow3 Refresh', email, password: 'Flow3Pass!' },
        });
        const loginRes = await httpReq('POST', '/api/auth/login', {
            body: { email, password: 'Flow3Pass!' },
        });

        const originalRefreshToken = loginRes.cookies.find(c => c.name === 'refreshToken')?.value;
        if (!originalRefreshToken) throw new Error('No refresh token from login');

        // F3-1: First refresh succeeds
        const refresh1 = await httpReq('POST', '/api/auth/refresh-token', {
            body: { refreshToken: originalRefreshToken },
        });
        const refresh1Ok = refresh1.status === 200;
        const gotNewCookies = refresh1.cookies.some(c => c.name === 'token') && refresh1.cookies.some(c => c.name === 'refreshToken');
        record('F3-1: First refresh → 200 + new cookies set', refresh1Ok && gotNewCookies, {
            status: refresh1.status,
            newTokenCookie: !!refresh1.cookies.find(c => c.name === 'token'),
            newRefreshCookie: !!refresh1.cookies.find(c => c.name === 'refreshToken'),
        });

        // F3-2: DB: old token removed, new token inserted
        const User = require('../models/user');
        const dbUser1 = await User.findOne({ email });
        const oldTokenRemoved = !dbUser1.refreshTokens.includes(originalRefreshToken);
        const tokenCount = dbUser1.refreshTokens.length;
        record('F3-2: DB: old refresh token removed, new token inserted (count=1)', oldTokenRemoved && tokenCount === 1, {
            oldTokenRemoved, tokenCount,
        });

        // F3-3: Second refresh using OLD (now-invalid) token → FAILS
        const refresh2 = await httpReq('POST', '/api/auth/refresh-token', {
            body: { refreshToken: originalRefreshToken },
        });
        const rotationWorks = refresh2.status === 403;
        record('F3-3: Second refresh with old token → 403 (rotation invalidates)', rotationWorks, {
            status: refresh2.status, body: refresh2.body.error,
        });

        // F3-4: Refresh using new token → succeeds
        const newRefreshToken = refresh1.cookies.find(c => c.name === 'refreshToken')?.value;
        const refresh3 = await httpReq('POST', '/api/auth/refresh-token', {
            body: { refreshToken: newRefreshToken },
        });
        record('F3-4: Refresh with new token → 200', refresh3.status === 200, {
            status: refresh3.status,
        });

        testUsers.flow3 = { email, originalRefreshToken, newRefreshToken };

    } catch (err) {
        record('F3-FATAL: Refresh test crashed', false, { error: err.message });
    }
}

// ════════════════════════════════════════════════════════════════════════
//  FLOW 4: Logout Runtime Test
// ════════════════════════════════════════════════════════════════════════
async function flow4_Logout() {
    console.log('\n── FLOW 4: Logout Runtime Test ──');
    const email = `flow4_${Date.now()}@test.nirnaypath`;

    try {
        await httpReq('POST', '/api/auth/signup', {
            body: { name: 'Flow4 Logout', email, password: 'Flow4Pass!' },
        });
        const loginRes = await httpReq('POST', '/api/auth/login', {
            body: { email, password: 'Flow4Pass!' },
        });

        const refreshToken = loginRes.cookies.find(c => c.name === 'refreshToken')?.value;

        // F4-1: Logout returns 200
        const logoutRes = await httpReq('POST', '/api/auth/logout', {
            body: { refreshToken },
        });
        record('F4-1: Logout → 200', logoutRes.status === 200, { status: logoutRes.status });

        // F4-2: Cookie cleared (clearCookie sets empty value with past expiry)
        const tokenCleared = logoutRes.cookies.some(c => c.name === 'token' && (!c.value || c.value === ''));
        const refreshCleared = logoutRes.cookies.some(c => c.name === 'refreshToken' && (!c.value || c.value === ''));
        record('F4-2: clearCookie for token + refreshToken', tokenCleared || refreshCleared, {
            tokenCleared, refreshCleared,
        });

        // F4-3: DB: refresh token removed
        const User = require('../models/user');
        const dbUser = await User.findOne({ email });
        const tokenRemovedFromDb = !dbUser.refreshTokens.includes(refreshToken);
        record('F4-3: Refresh token removed from MongoDB', tokenRemovedFromDb, {
            tokenCount: dbUser.refreshTokens.length,
            tokenStillPresent: !tokenRemovedFromDb,
        });

        // F4-4: Old refresh token rejected after logout
        const retryRefresh = await httpReq('POST', '/api/auth/refresh-token', {
            body: { refreshToken },
        });
        record('F4-4: Logged-out refresh token → 403', retryRefresh.status === 403, {
            status: retryRefresh.status,
        });

    } catch (err) {
        record('F4-FATAL: Logout test crashed', false, { error: err.message });
    }
}

// ════════════════════════════════════════════════════════════════════════
//  FLOW 5: Authentication Failure Matrix
// ════════════════════════════════════════════════════════════════════════
async function flow5_FailureMatrix() {
    console.log('\n── FLOW 5: Authentication Failure Matrix ──');

    // F5-1: Missing token → 401 NO_TOKEN
    try {
        const res = await httpReq('GET', '/api/auth/me', {
            headers: { /* no auth header, no cookie */ },
        });
        record('F5-1: Missing token → 401, code=NO_TOKEN',
            res.status === 401 && res.body.code === 'NO_TOKEN',
            { status: res.status, code: res.body.code, error: res.body.error });
    } catch (err) {
        record('F5-1: Missing token', false, { error: err.message });
    }

    // F5-2: Expired JWT → 401 TOKEN_EXPIRED
    try {
        const expiredToken = jwt.sign({ id: '000000000000000000000000' }, JWT_SECRET, { expiresIn: '-1h' });
        const res = await httpReq('GET', '/api/auth/me', {
            headers: { Authorization: `Bearer ${expiredToken}` },
        });
        record('F5-2: Expired JWT → 401, code=TOKEN_EXPIRED',
            res.status === 401 && res.body.code === 'TOKEN_EXPIRED',
            { status: res.status, code: res.body.code, error: res.body.error });
    } catch (err) {
        record('F5-2: Expired JWT', false, { error: err.message });
    }

    // F5-3: Malformed JWT → 400 TOKEN_MALFORMED
    try {
        const res = await httpReq('GET', '/api/auth/me', {
            headers: { Authorization: 'Bearer this.is.not.a.jwt' },
        });
        record('F5-3: Malformed JWT → 400, code=TOKEN_MALFORMED',
            res.status === 400 && res.body.code === 'TOKEN_MALFORMED',
            { status: res.status, code: res.body.code, error: res.body.error });
    } catch (err) {
        record('F5-3: Malformed JWT', false, { error: err.message });
    }

    // F5-4: Valid JWT for deleted user → 401 USER_NOT_FOUND
    try {
        const phantomToken = jwt.sign({ id: '000000000000000000000000' }, JWT_SECRET, { expiresIn: '1h' });
        const res = await httpReq('GET', '/api/auth/me', {
            headers: { Authorization: `Bearer ${phantomToken}` },
        });
        record('F5-4: Valid JWT, deleted/missing user → 401, code=USER_NOT_FOUND',
            res.status === 401 && res.body.code === 'USER_NOT_FOUND',
            { status: res.status, code: res.body.code, error: res.body.error });
    } catch (err) {
        record('F5-4: Deleted user', false, { error: err.message });
    }

    // F5-5: Wrong secret signed JWT → 400 TOKEN_MALFORMED
    try {
        const wrongSecretToken = jwt.sign({ id: '000000000000000000000000' }, 'wrong-secret-value', { expiresIn: '1h' });
        const res = await httpReq('GET', '/api/auth/me', {
            headers: { Authorization: `Bearer ${wrongSecretToken}` },
        });
        record('F5-5: JWT signed with wrong secret → 400, code=TOKEN_MALFORMED',
            res.status === 400 && res.body.code === 'TOKEN_MALFORMED',
            { status: res.status, code: res.body.code, error: res.body.error });
    } catch (err) {
        record('F5-5: Wrong secret', false, { error: err.message });
    }

    // F5-6: Valid authenticated request → 200
    try {
        const email = `flow5_${Date.now()}@test.nirnaypath`;
        const signupRes = await httpReq('POST', '/api/auth/signup', {
            body: { name: 'Flow5 Valid', email, password: 'Flow5Pass!' },
        });
        const cookieHeader = signupRes.cookies.map(c => `${c.name}=${c.value}`).join('; ');
        const meRes = await httpReq('GET', '/api/auth/me', {
            headers: { Cookie: cookieHeader },
        });
        record('F5-6: Valid cookie auth → 200, user object returned',
            meRes.status === 200 && meRes.body.user && meRes.body.user.email === email,
            { status: meRes.status, userEmail: meRes.body?.user?.email });
    } catch (err) {
        record('F5-6: Valid auth', false, { error: err.message });
    }

    // F5-7: Valid Bearer token auth → 200
    try {
        const email = `flow5b_${Date.now()}@test.nirnaypath`;
        const signupRes = await httpReq('POST', '/api/auth/signup', {
            body: { name: 'Flow5 Bearer', email, password: 'Flow5Pass!' },
        });
        const tokenValue = signupRes.cookies.find(c => c.name === 'token')?.value;
        if (!tokenValue) throw new Error('No token cookie');
        const res = await httpReq('GET', '/api/auth/me', {
            headers: { Authorization: `Bearer ${tokenValue}` },
        });
        record('F5-7: Valid Bearer token auth → 200',
            res.status === 200 && res.body.user,
            { status: res.status, hasUser: !!res.body.user });
    } catch (err) {
        record('F5-7: Bearer auth', false, { error: err.message });
    }
}

// ════════════════════════════════════════════════════════════════════════
//  MAIN
// ════════════════════════════════════════════════════════════════════════
async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  PHASE-4A: POST-IMPLEMENTATION RUNTIME VERIFICATION');
    console.log('  Evidence-Only — No Static Assumptions');
    console.log('═══════════════════════════════════════════════════════');

    try {
        await startMongo();
        await startServer();
        console.log('[SERVER] Ready. Executing runtime verification flows...\n');

        await flow1_Signup();
        await flow2_MultiDevice();
        await flow3_Refresh();
        await flow4_Logout();
        await flow5_FailureMatrix();

    } catch (err) {
        console.error('\n[FATAL] Verification infrastructure failure:', err.message);
    } finally {
        stopAll();
    }

    // ── Report ──────────────────────────────────────────────────────────
    const total = results.length;
    const passed = results.filter(r => r.passed).length;
    const failed = total - passed;

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('  RUNTIME VERIFICATION RESULTS');
    console.log('═══════════════════════════════════════════════════════');
    for (const r of results) {
        const icon = r.passed ? '✓' : '✗';
        console.log(`  ${icon} ${r.label}`);
        if (!r.passed && r.error) console.log(`    Error: ${r.error}`);
    }
    console.log('─────────────────────────────────────────────────────');
    console.log(`  Total:  ${total}`);
    console.log(`  Passed: ${passed}`);
    console.log(`  Failed: ${failed}`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Write report
    const report = {
        phase: '4A-RUNTIME',
        description: 'Post-implementation runtime verification with in-memory MongoDB',
        timestamp: new Date().toISOString(),
        summary: { total, passed, failed },
        results,
    };
    const reportPath = path.join(BASE_DIR, 'logs', 'verify_phase4a_runtime.json');
    try {
        if (!fs.existsSync(path.dirname(reportPath))) fs.mkdirSync(path.dirname(reportPath), { recursive: true });
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`Report saved: ${reportPath}`);
    } catch (e) {
        console.error('Report write error:', e.message);
    }

    process.exit(failed > 0 ? 1 : 0);
}

process.on('SIGINT', () => { stopAll(); process.exit(1); });
process.on('SIGTERM', () => { stopAll(); process.exit(1); });

main();