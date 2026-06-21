'use strict';
/**
 * NirnayPath — Phase 2 Load Test (SRE 12-Phase Audit)
 * =====================================================
 * Simulates 50 / 100 / 250 / 500 concurrent virtual users.
 * For each level measures per-endpoint: avg / P95 / P99 / error-rate
 * Endpoints tested:
 *   LOGIN         POST /api/auth/login
 *   DASHBOARD     GET  /api/analytics/overview
 *   START TEST    POST /api/test/start
 *   SUBMIT TEST   POST /api/test/submit
 *   ANALYTICS     GET  /api/stats/achievements-feed  (heavy query)
 *
 * NO mocks. NO changes to application code.
 */

const http = require('http');
const crypto = require('crypto');

const BASE = 'http://localhost:3000';
const USER_LEVELS = [50, 100, 250, 500];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function httpRequest(method, path, body, cookieHeader) {
  return new Promise((resolve) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    if (cookieHeader) headers['Cookie'] = cookieHeader;

    const start = Date.now();
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        const ms = Date.now() - start;
        let json = null;
        try { json = JSON.parse(data); } catch (_) {}

        // Extract token cookie from Set-Cookie header
        let token = null;
        const sc = res.headers['set-cookie'];
        if (sc) {
          sc.forEach(c => {
            if (c.startsWith('token=')) token = c.split(';')[0].replace('token=', '');
          });
        }

        const ok = res.statusCode >= 200 && res.statusCode < 400;
        resolve({ ok, status: res.statusCode, ms, json, token });
      });
    });

    req.on('error', (err) => {
      resolve({ ok: false, status: 0, ms: Date.now() - start, error: err.message });
    });
    req.setTimeout(15000, () => {
      req.destroy();
      resolve({ ok: false, status: 0, ms: 15000, error: 'TIMEOUT' });
    });

    if (payload) req.write(payload);
    req.end();
  });
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = Math.min(Math.floor(sorted.length * p / 100), sorted.length - 1);
  return sorted[idx];
}

function stats(latencies) {
  if (!latencies.length) return { avg: 0, p95: 0, p99: 0, min: 0, max: 0 };
  const sorted = [...latencies].sort((a, b) => a - b);
  const avg = Math.round(sorted.reduce((s, v) => s + v, 0) / sorted.length);
  return {
    avg,
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
    min: sorted[0],
    max: sorted[sorted.length - 1]
  };
}

// ─── SEED: pre-create one test user for login tests ──────────────────────────

let SEED_EMAIL = null;
let SEED_TOKEN = null;
const SEED_PASS = 'SeedPass@123';

async function seedTestUser() {
  const email = `seed_lt_${crypto.randomBytes(4).toString('hex')}@nirnaypath.com`;
  const res = await httpRequest('POST', '/api/auth/signup', {
    name: 'SRE Load Seed',
    email,
    password: SEED_PASS,
    confirmPassword: SEED_PASS
  });
  if (res.ok && res.token) {
    SEED_EMAIL = email;
    SEED_TOKEN = res.token;
    console.log(`  [SEED] Test user created: ${email}`);
    return true;
  }
  console.log(`  [SEED] WARN: Could not pre-create seed user (status=${res.status})`);
  return false;
}

// ─── SINGLE USER FLOW ────────────────────────────────────────────────────────

async function runUserFlow(endpointMetrics) {
  const email = `lt_${crypto.randomBytes(4).toString('hex')}@nirnaypath.com`;
  const pass = 'LoadTest@123!';

  // ── 1. REGISTER (to get a fresh token)
  const reg = await httpRequest('POST', '/api/auth/signup', {
    name: 'LT User',
    email,
    password: pass,
    confirmPassword: pass
  });
  let token = reg.token;

  // ── 2. LOGIN (use seed user if registration already exists scenario)
  const loginStart = Date.now();
  const loginRes = await httpRequest('POST', '/api/auth/login', {
    email: SEED_EMAIL || email,
    password: SEED_PASS || pass
  });
  endpointMetrics.LOGIN.latencies.push(Date.now() - loginStart);
  if (loginRes.ok) {
    endpointMetrics.LOGIN.success++;
    if (loginRes.token) token = loginRes.token;
  } else {
    endpointMetrics.LOGIN.errors++;
  }

  if (!token) return; // no auth — skip rest

  const auth = `token=${token}`;

  // ── 3. DASHBOARD
  const dashStart = Date.now();
  const dashRes = await httpRequest('GET', '/api/analytics/overview', null, auth);
  endpointMetrics.DASHBOARD.latencies.push(Date.now() - dashStart);
  dashRes.ok ? endpointMetrics.DASHBOARD.success++ : endpointMetrics.DASHBOARD.errors++;

  // ── 4. START TEST
  const startStart = Date.now();
  const startRes = await httpRequest('POST', '/api/test/start', {
    subject: 'history',
    count: 5,
    timeLimit: 300,
    exam: 'UPSC'
  }, auth);
  endpointMetrics['START TEST'].latencies.push(Date.now() - startStart);
  startRes.ok ? endpointMetrics['START TEST'].success++ : endpointMetrics['START TEST'].errors++;

  // ── 5. SUBMIT TEST
  const sessionId = startRes.json?.sessionId;
  if (sessionId) {
    const submitStart = Date.now();
    const submitRes = await httpRequest('POST', '/api/test/submit', {
      sessionId,
      subject: 'history',
      exam: 'UPSC',
      answers: { '0': '1', '1': '2', '2': '3', '3': '0', '4': '1' }
    }, auth);
    endpointMetrics['SUBMIT TEST'].latencies.push(Date.now() - submitStart);
    submitRes.ok ? endpointMetrics['SUBMIT TEST'].success++ : endpointMetrics['SUBMIT TEST'].errors++;
  } else {
    endpointMetrics['SUBMIT TEST'].errors++;
    endpointMetrics['SUBMIT TEST'].latencies.push(0);
  }

  // ── 6. ANALYTICS
  const analyticsStart = Date.now();
  const analyticsRes = await httpRequest('GET', '/api/stats/achievements-feed', null, auth);
  endpointMetrics.ANALYTICS.latencies.push(Date.now() - analyticsStart);
  analyticsRes.ok ? endpointMetrics.ANALYTICS.success++ : endpointMetrics.ANALYTICS.errors++;
}

// ─── RUN ONE LOAD LEVEL ───────────────────────────────────────────────────────

async function runLoadLevel(userCount) {
  const endpointMetrics = {
    'LOGIN':       { latencies: [], success: 0, errors: 0 },
    'DASHBOARD':   { latencies: [], success: 0, errors: 0 },
    'START TEST':  { latencies: [], success: 0, errors: 0 },
    'SUBMIT TEST': { latencies: [], success: 0, errors: 0 },
    'ANALYTICS':   { latencies: [], success: 0, errors: 0 },
  };

  // Batch users into chunks of 25 to avoid socket exhaustion
  const BATCH = 25;
  const wallStart = Date.now();

  for (let i = 0; i < userCount; i += BATCH) {
    const batchSize = Math.min(BATCH, userCount - i);
    const promises = Array.from({ length: batchSize }, () => runUserFlow(endpointMetrics));
    await Promise.all(promises);
  }

  const wallMs = Date.now() - wallStart;

  return { endpointMetrics, wallMs };
}

// ─── REPORT ──────────────────────────────────────────────────────────────────

function printLevelReport(userCount, { endpointMetrics, wallMs }) {
  const LINE = '─'.repeat(72);
  console.log(`\n╔${'═'.repeat(70)}╗`);
  console.log(`║  LOAD LEVEL: ${userCount} VIRTUAL USERS${' '.repeat(70 - 16 - String(userCount).length - 16)}║`);
  console.log(`║  Wall-clock duration: ${(wallMs / 1000).toFixed(1)}s${' '.repeat(70 - 25 - String((wallMs/1000).toFixed(1)).length)}║`);
  console.log(`╚${'═'.repeat(70)}╝`);

  const rows = [];
  for (const [ep, m] of Object.entries(endpointMetrics)) {
    const total = m.success + m.errors;
    const errRate = total > 0 ? ((m.errors / total) * 100).toFixed(1) : '0.0';
    const s = stats(m.latencies);
    rows.push({ ep, total, success: m.success, errors: m.errors, errRate, ...s });
  }

  console.log(`\n  ${'Endpoint'.padEnd(14)} ${'Req'.padStart(5)} ${'OK'.padStart(5)} ${'ERR'.padStart(5)} ${'Err%'.padStart(6)} ${'Avg'.padStart(7)} ${'P95'.padStart(7)} ${'P99'.padStart(7)} ${'Max'.padStart(7)}`);
  console.log(`  ${LINE}`);
  for (const r of rows) {
    const epLabel = r.ep.padEnd(14);
    const pass = r.errRate === '0.0' || parseFloat(r.errRate) < 5 ? '✓' : '✗';
    console.log(`${pass} ${epLabel} ${String(r.total).padStart(5)} ${String(r.success).padStart(5)} ${String(r.errors).padStart(5)} ${r.errRate.padStart(5)}% ${String(r.avg+'ms').padStart(7)} ${String(r.p95+'ms').padStart(7)} ${String(r.p99+'ms').padStart(7)} ${String(r.max+'ms').padStart(7)}`);
  }

  // Threshold evaluation
  const overallErrors = rows.reduce((s, r) => s + r.errors, 0);
  const overallTotal  = rows.reduce((s, r) => s + r.total, 0);
  const overallErrRate = overallTotal > 0 ? (overallErrors / overallTotal * 100).toFixed(2) : '0.00';
  const maxP99 = Math.max(...rows.map(r => r.p99));

  console.log(`\n  Overall Error Rate : ${overallErrRate}%   (threshold: <5%)`);
  console.log(`  Max P99 Latency    : ${maxP99}ms         (threshold: <5000ms)`);

  let verdict = 'PASS';
  const issues = [];
  if (parseFloat(overallErrRate) >= 5) { verdict = 'FAIL'; issues.push(`Error rate ${overallErrRate}% ≥ 5%`); }
  if (maxP99 >= 5000) { verdict = 'FAIL'; issues.push(`P99 ${maxP99}ms ≥ 5000ms`); }
  if (issues.length) console.log(`  Issues: ${issues.join(' | ')}`);
  console.log(`  VERDICT @ ${userCount} users: ${verdict}`);

  return { userCount, overallErrRate: parseFloat(overallErrRate), maxP99, verdict, rows };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

(async () => {
  console.log('\n' + '═'.repeat(72));
  console.log('  PHASE 2 — LOAD TEST   |   NirnayPath SRE 12-Phase Audit');
  console.log('  Levels: 50 → 100 → 250 → 500 Virtual Users');
  console.log('  Endpoints: LOGIN | DASHBOARD | START TEST | SUBMIT TEST | ANALYTICS');
  console.log('═'.repeat(72));

  // Verify server is reachable
  const ping = await httpRequest('GET', '/api/health', null, null);
  if (!ping.ok && ping.status !== 404) {
    // try root
    const root = await httpRequest('GET', '/', null, null);
    if (!root.ok) {
      console.error('\n[ABORT] Server not reachable at localhost:3000');
      process.exit(1);
    }
  }
  console.log('\n  [✓] Server reachable at localhost:3000');

  // Seed test user
  await seedTestUser();

  const allResults = [];

  for (const level of USER_LEVELS) {
    console.log(`\n  ► Running ${level} virtual users...`);
    const result = await runLoadLevel(level);
    const report = printLevelReport(level, result);
    allResults.push(report);
    // Cool-down between levels
    if (level < USER_LEVELS[USER_LEVELS.length - 1]) {
      console.log(`\n  [COOL-DOWN] Waiting 5s before next level...`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  // ─── FINAL SUMMARY ───────────────────────────────────────────────────────
  console.log('\n\n' + '═'.repeat(72));
  console.log('  PHASE 2 FINAL SUMMARY');
  console.log('═'.repeat(72));
  console.log(`  ${'Users'.padEnd(8)} ${'ErrRate%'.padStart(10)} ${'MaxP99'.padStart(9)} ${'Verdict'.padStart(9)}`);
  console.log('  ' + '─'.repeat(40));

  let phase2Verdict = 'PASS';
  for (const r of allResults) {
    const v = r.verdict === 'PASS' ? '✓ PASS' : '✗ FAIL';
    console.log(`  ${String(r.userCount).padEnd(8)} ${String(r.overallErrRate+'%').padStart(10)} ${String(r.maxP99+'ms').padStart(9)} ${v.padStart(9)}`);
    if (r.verdict === 'FAIL') phase2Verdict = 'FAIL';
  }

  console.log('\n' + '═'.repeat(72));
  console.log(`  PHASE 2 OVERALL VERDICT: ${phase2Verdict}`);
  console.log('═'.repeat(72) + '\n');

  process.exit(phase2Verdict === 'PASS' ? 0 : 1);
})();
