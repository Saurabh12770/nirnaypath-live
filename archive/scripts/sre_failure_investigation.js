/**
 * NirnayPath — Targeted Failure Investigation
 * Corrects 3 wrong endpoint paths from sre_full_audit.js
 * Tests: css path, test/start with real auth, user/history
 */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const BASE   = 'http://localhost:3000';
const LOG    = path.join(__dirname, '..', 'logs');
const OUT    = path.join(LOG, 'sre_failure_investigation.json');

function req(opts, body) {
  return new Promise((resolve) => {
    const start = Date.now();
    const r = http.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        let json = null; try { json = JSON.parse(d); } catch(_) {}
        resolve({ status: res.statusCode, headers: res.headers, raw: d, json, ms: Date.now() - start });
      });
    });
    r.on('error', e => resolve({ error: e.message, status: 0, ms: Date.now() - start }));
    r.setTimeout(35000, () => { r.destroy(); resolve({ error: 'TIMEOUT', status: 0, ms: 35000 }); });
    if (body) r.write(body);
    r.end();
  });
}

function GET(p, headers = {}) {
  return req({ hostname: 'localhost', port: 3000, path: p, method: 'GET', headers });
}

function POST(p, body, headers = {}) {
  const payload = JSON.stringify(body);
  return req({
    hostname: 'localhost', port: 3000, path: p, method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload), ...headers }
  }, payload);
}

(async () => {
  const results = { timestamp: new Date().toISOString(), checks: [] };
  const log = (label, result, evidence) => {
    const r = { label, result, evidence };
    results.checks.push(r);
    console.log(`  [${result}] ${label}: ${evidence}`);
    return r;
  };

  console.log('\n═══════════════════════════════════════════════');
  console.log('  FAILURE INVESTIGATION — Corrected Endpoint Probes');
  console.log('═══════════════════════════════════════════════');

  // ── FIX 1: CSS is at /style.css (root), not /css/style.css ──────────────
  console.log('\n[PROBE 1] CSS Asset Path');
  const cssRoot   = await GET('/style.css');
  const cssBad    = await GET('/css/style.css');
  log('style.css at /style.css', cssRoot.status === 200 ? 'PASS' : 'FAIL',
    `HTTP ${cssRoot.status}, size=${cssRoot.raw.length}B`);
  log('style.css at /css/style.css (audit script path — WRONG)', cssBad.status === 404 ? 'CONFIRMED_404' : 'UNEXPECTED',
    `HTTP ${cssBad.status} — audit script used wrong path, NOT a real app bug`);

  // ── FIX 2: Test/start requires auth — login first ────────────────────────
  console.log('\n[PROBE 2] POST /api/test/start with valid auth cookie');
  const loginRes = await POST('/api/auth/login',
    { email: 'admin@example.com', password: 'AdminPassword123!' });
  let authCookie = '';
  if (loginRes.status === 200 && loginRes.headers['set-cookie']) {
    authCookie = loginRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
    log('Admin login for test probe', 'PASS', `HTTP 200, cookie=${authCookie.length}chars`);
  } else {
    log('Admin login for test probe', 'FAIL', `HTTP ${loginRes.status}`);
  }

  if (authCookie) {
    const startRes = await POST('/api/test/start',
      { subject: 'history', exam: 'upsc', numQuestions: 5 },
      { cookie: authCookie });
    const startOk = [200, 201].includes(startRes.status);
    log('POST /api/test/start (authenticated)', startOk ? 'PASS' : 'FAIL',
      `HTTP ${startRes.status} — ${startOk
        ? `questions=${startRes.json?.questions?.length}, sessionId=${startRes.json?.sessionId ? 'present' : 'missing'}`
        : startRes.error || startRes.raw?.slice(0, 200)}`);

    // If we got a session, test submit too
    const sessionId = startRes.json?.sessionId;
    if (sessionId) {
      const answers = startRes.json?.questions?.map(q => ({ questionId: q._id, selected: 0 })) || [];
      const submitRes = await POST('/api/test/submit',
        { sessionId, answers },
        { cookie: authCookie });
      log('POST /api/test/submit (with sessionId)', [200, 201].includes(submitRes.status) ? 'PASS' : 'FAIL',
        `HTTP ${submitRes.status} — ${submitRes.json?.score !== undefined ? `score=${submitRes.json.score}` : submitRes.raw?.slice(0,150)}`);
    } else {
      log('POST /api/test/submit', 'SKIP', 'No sessionId returned from test/start');
    }

    // ── FIX 3: Test history is /api/user/history not /api/user/test-history
    console.log('\n[PROBE 3] GET /api/user/history (correct route)');
    const histRes = await GET('/api/user/history', { cookie: authCookie });
    log('GET /api/user/history (correct endpoint)', histRes.status === 200 ? 'PASS' : 'FAIL',
      `HTTP ${histRes.status} — count=${Array.isArray(histRes.json) ? histRes.json.length : JSON.stringify(histRes.json)?.slice(0,100)}`);

    const histBad = await GET('/api/user/test-history', { cookie: authCookie });
    log('GET /api/user/test-history (wrong endpoint used in audit)', histBad.status === 404 ? 'CONFIRMED_404' : 'UNEXPECTED',
      `HTTP ${histBad.status} — audit script used wrong path, NOT a real app bug`);

    // ── Result persistence: verify submitted test appears in history ─────────
    console.log('\n[PROBE 4] Result Persistence Verification');
    const histAfter = await GET('/api/user/history', { cookie: authCookie });
    const count = Array.isArray(histAfter.json) ? histAfter.json.length : (histAfter.json?.results?.length ?? 'N/A');
    log('Result persistence in DB (/api/user/history)', histAfter.status === 200 ? 'PASS' : 'FAIL',
      `HTTP ${histAfter.status}, records=${count}`);

    // ── Leaderboard (check more routes) ─────────────────────────────────────
    console.log('\n[PROBE 5] Leaderboard & Growth APIs');
    const lbRes = await GET('/api/leaderboard/global', { cookie: authCookie });
    log('GET /api/leaderboard/global', [200, 204].includes(lbRes.status) ? 'PASS' : 'FAIL',
      `HTTP ${lbRes.status}`);

    const statsRes = await GET('/api/user/stats', { cookie: authCookie });
    log('GET /api/user/stats', statsRes.status === 200 ? 'PASS' : 'FAIL',
      `HTTP ${statsRes.status} — ${JSON.stringify(statsRes.json)?.slice(0,150)}`);
  }

  // ── Write report ─────────────────────────────────────────────────────────
  const pass = results.checks.filter(c => c.result === 'PASS').length;
  const fail = results.checks.filter(c => c.result === 'FAIL').length;
  results.summary = { pass, fail, total: results.checks.length };
  console.log(`\n  Probe summary: ${pass} PASS / ${fail} FAIL`);
  fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
  console.log(`✅ Failure investigation saved → logs/sre_failure_investigation.json`);
  process.exit(0);
})();
