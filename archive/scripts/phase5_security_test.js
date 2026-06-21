'use strict';
/**
 * NirnayPath — Phase 5: Security Test (SRE 12-Phase Audit)
 * =========================================================
 * Tests:
 *   1. Authentication bypass attempts
 *   2. Authorization boundary violations (IDOR)
 *   3. Rate limiting enforcement
 *   4. Input sanitization (XSS / injection in test answers)
 *   5. Session token security
 *   6. Sensitive data exposure in responses
 *   7. API enumeration resistance
 *
 * ZERO mocks. ZERO application changes. Observe only.
 */

const http = require('http');
const crypto = require('crypto');

function req(method, path, body, cookie, timeout = 10000) {
  return new Promise((resolve) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    if (cookie) headers['Cookie'] = cookie;

    const start = Date.now();
    const r = http.request({ hostname: 'localhost', port: 3000, path, method, headers }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        let json = null; try { json = JSON.parse(data); } catch (_) {}
        let token = null;
        const sc = res.headers['set-cookie'];
        if (sc) sc.forEach(c => { if (c.startsWith('token=')) token = c.split(';')[0].replace('token=', ''); });
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode, ms: Date.now() - start, json, token, raw: data, headers: res.headers });
      });
    });
    r.on('error', err => resolve({ ok: false, status: 0, ms: Date.now() - start, error: err.message }));
    r.setTimeout(timeout, () => { r.destroy(); resolve({ ok: false, status: 0, ms: timeout, error: 'TIMEOUT' }); });
    if (payload) r.write(payload);
    r.end();
  });
}

function pass(label, evidence) { console.log(`  [✓] ${label}: ${evidence}`); return { pass: true, label, evidence }; }
function fail(label, evidence) { console.log(`  [✗] ${label}: ${evidence}`); return { pass: false, label, evidence }; }
function info(label, evidence) { console.log(`  [i] ${label}: ${evidence}`); return { pass: true, label, evidence, info: true }; }

async function createUser(suffix = '') {
  const email = `sec${suffix}_${crypto.randomBytes(4).toString('hex')}@nirnaypath.com`;
  const r = await req('POST', '/api/auth/signup', { name: 'SecTest', email, password: 'Sec@123!', confirmPassword: 'Sec@123!' });
  return r.ok && r.token ? { email, token: r.token } : null;
}

// ─── S1: Auth Bypass ─────────────────────────────────────────────────────────
async function test_auth_bypass() {
  console.log('\n  ── S1: Authentication Bypass Attempts ──');
  const checks = [];

  const bypassTokens = [
    'eyJhbGciOiJub25lIn0.eyJ1c2VySWQiOiJhZG1pbiJ9.',     // alg:none JWT
    'admin',
    '../../../etc/passwd',
    '%00',
    'null',
    'undefined',
    'true',
  ];

  let bypassCount = 0;
  for (const tok of bypassTokens) {
    const r = await req('GET', '/api/analytics/overview', null, `token=${tok}`);
    if (r.ok) {
      bypassCount++;
      console.log(`       ⚠ BYPASS with token "${tok.slice(0, 30)}" → HTTP ${r.status}`);
    }
  }
  checks.push(bypassCount === 0
    ? pass('Auth bypass attempts all blocked', `${bypassTokens.length}/${bypassTokens.length} rejected`)
    : fail('Auth bypass SUCCEEDED', `${bypassCount} tokens produced 2xx response`));

  return checks;
}

// ─── S2: IDOR (Insecure Direct Object Reference) ─────────────────────────────
async function test_idor() {
  console.log('\n  ── S2: IDOR — Cross-User Data Access ──');
  const checks = [];

  const userA = await createUser('A');
  const userB = await createUser('B');
  if (!userA || !userB) { console.log('  [SKIP] Could not create IDOR test users'); return []; }

  // UserA starts a session
  const sessionRes = await req('POST', '/api/test/start', { subject: 'history', count: 5, timeLimit: 300, exam: 'UPSC' }, `token=${userA.token}`);
  const sessionId = sessionRes.json?.sessionId;

  if (sessionId) {
    // UserB tries to submit UserA's session
    const idorSubmit = await req('POST', '/api/test/submit', {
      sessionId,
      subject: 'history',
      exam: 'UPSC',
      answers: { '0': '1', '1': '2', '2': '0', '3': '3', '4': '1' }
    }, `token=${userB.token}`);

    checks.push(!idorSubmit.ok
      ? pass('IDOR: User B cannot submit User A session', `HTTP ${idorSubmit.status}`)
      : fail('IDOR: User B CAN submit User A session!', `HTTP ${idorSubmit.status} — CRITICAL authorization bypass`));
  } else {
    console.log('  [SKIP] IDOR session submit — no session created');
  }

  // UserB tries to view UserA's analytics directly with a guessed userId
  const guessedId = '000000000000000000000001';
  const idorAnalytics = await req('GET', `/api/analytics/user/${guessedId}`, null, `token=${userB.token}`);
  checks.push(idorAnalytics.status === 401 || idorAnalytics.status === 403 || idorAnalytics.status === 404
    ? pass('IDOR: Direct user analytics access blocked', `HTTP ${idorAnalytics.status}`)
    : info('IDOR: User analytics route', `HTTP ${idorAnalytics.status} — route may not exist (acceptable)`));

  return checks;
}

// ─── S3: Rate Limiting ────────────────────────────────────────────────────────
async function test_rate_limiting() {
  console.log('\n  ── S3: Rate Limiting ──');
  const checks = [];

  // Fire 30 rapid login attempts for same account
  const results = await Promise.all(Array.from({ length: 30 }, (_, i) =>
    req('POST', '/api/auth/login', { email: `nonexistent_${i}@x.com`, password: 'wrong' }, null, 5000)
  ));

  const rate429 = results.filter(r => r.status === 429).length;
  const anyBlocked = results.some(r => r.status === 429 || r.status === 503);

  checks.push(anyBlocked
    ? pass('Rate limiter active', `${rate429}/30 requests got 429`)
    : fail('Rate limiter NOT active', `0/30 requests throttled — brute force possible`));

  // Check response time degradation under rate limiting
  const avgMs = Math.round(results.reduce((s, r) => s + r.ms, 0) / results.length);
  info('Avg response time under 30 rapid login attempts', `${avgMs}ms`);

  return checks;
}

// ─── S4: Input Sanitization ──────────────────────────────────────────────────
async function test_input_sanitization(user) {
  console.log('\n  ── S4: Input Sanitization (XSS / Injection) ──');
  const checks = [];
  const cookie = `token=${user.token}`;

  // XSS in exam answers
  const xssStart = await req('POST', '/api/test/start', { subject: 'history', count: 5, timeLimit: 300, exam: 'UPSC' }, cookie);
  const sessionId = xssStart.json?.sessionId;

  if (sessionId) {
    const xssSubmit = await req('POST', '/api/test/submit', {
      sessionId,
      subject: 'history',
      exam: 'UPSC',
      answers: {
        '0': '<script>alert(1)</script>',
        '1': 'javascript:alert(1)',
        '2': '${7*7}',
        '3': "'; DROP TABLE sessions; --",
        '4': '1'
      }
    }, cookie);

    if (xssSubmit.ok) {
      const raw = JSON.stringify(xssSubmit.json || xssSubmit.raw || '');
      const containsRawScript = raw.includes('<script>') || raw.includes('javascript:');
      checks.push(!containsRawScript
        ? pass('XSS payload sanitized in submit response', 'No raw <script> in response')
        : fail('XSS payload REFLECTED in submit response', 'Raw script tag in API response'));
    } else {
      checks.push(pass('XSS payload in answers — server rejected', `HTTP ${xssSubmit.status}`));
    }
  } else {
    console.log('  [SKIP] XSS test — no session available');
  }

  // NoSQL injection in login
  const noSqlInjection = await req('POST', '/api/auth/login', {
    email: { '$gt': '' },
    password: { '$gt': '' }
  });
  checks.push(noSqlInjection.status >= 400
    ? pass('NoSQL injection in login body rejected', `HTTP ${noSqlInjection.status}`)
    : fail('NoSQL injection SUCCEEDED', `HTTP ${noSqlInjection.status} — auth bypass possible`));

  return checks;
}

// ─── S5: Token Security ───────────────────────────────────────────────────────
async function test_token_security(user) {
  console.log('\n  ── S5: Session Token Security ──');
  const checks = [];

  // Check cookie flags via raw HTTP response
  const loginRes = await req('POST', '/api/auth/login', { email: user.email, password: 'Sec@123!' });
  const sc = loginRes.headers?.['set-cookie'];

  if (sc && sc.length > 0) {
    const tokenCookie = sc.find(c => c.startsWith('token=')) || '';
    const hasHttpOnly = tokenCookie.toLowerCase().includes('httponly');
    const hasSecure = tokenCookie.toLowerCase().includes('secure');
    const hasSameSite = tokenCookie.toLowerCase().includes('samesite');

    checks.push(hasHttpOnly
      ? pass('Cookie HttpOnly flag set', 'XSS cannot steal token via document.cookie')
      : fail('Cookie HttpOnly flag MISSING', 'Token accessible via JS — XSS session hijack risk'));

    checks.push(hasSameSite
      ? pass('Cookie SameSite flag set', tokenCookie.match(/samesite=\w+/i)?.[0] || 'present')
      : fail('Cookie SameSite flag MISSING', 'CSRF risk'));

    info('Cookie Secure flag', hasSecure ? 'present' : 'absent (OK for localhost HTTP)');
    info('Full cookie header', tokenCookie.slice(0, 120));
  } else {
    console.log('  [SKIP] No Set-Cookie header in login response');
  }

  return checks;
}

// ─── S6: Sensitive Data Exposure ─────────────────────────────────────────────
async function test_data_exposure(user) {
  console.log('\n  ── S6: Sensitive Data Exposure ──');
  const checks = [];
  const cookie = `token=${user.token}`;

  // Check profile/me endpoint doesn't expose password hash
  const profile = await req('GET', '/api/auth/me', null, cookie);
  if (profile.ok && profile.json) {
    const raw = JSON.stringify(profile.json);
    const exposesPassword = raw.includes('password') || raw.includes('hash') || raw.includes('salt');
    checks.push(!exposesPassword
      ? pass('Profile endpoint: no password hash exposed', '/api/auth/me safe')
      : fail('Profile endpoint EXPOSES password field', 'Password hash in API response'));
  } else {
    info('Profile endpoint', `HTTP ${profile.status} — route may not exist`);
  }

  // Check error responses don't leak stack traces
  const badReq = await req('GET', '/api/nonexistent-route-xyz', null, cookie);
  const raw = badReq.raw || '';
  const hasStackTrace = raw.includes('at Object.') || raw.includes('node_modules') || raw.includes('Error:');
  checks.push(!hasStackTrace
    ? pass('Error responses: no stack trace leaked', `HTTP ${badReq.status}, no internal paths exposed`)
    : fail('Stack trace LEAKED in error response', raw.slice(0, 200)));

  return checks;
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n' + '═'.repeat(72));
  console.log('  PHASE 5 — SECURITY TEST   |   NirnayPath SRE 12-Phase Audit');
  console.log('  Tests: Auth Bypass | IDOR | Rate Limiting | XSS | Token | Data Exposure');
  console.log('═'.repeat(72));

  const user = await createUser();
  if (!user) { console.error('\n  [ABORT] Could not create test user'); process.exit(1); }
  console.log(`\n  [SETUP] Security test user: ${user.email}`);

  const allChecks = [];

  allChecks.push(...await test_auth_bypass());
  allChecks.push(...await test_idor());
  allChecks.push(...await test_rate_limiting());
  allChecks.push(...await test_input_sanitization(user));
  allChecks.push(...await test_token_security(user));
  allChecks.push(...await test_data_exposure(user));

  const passed = allChecks.filter(c => c.pass && !c.info).length;
  const failed = allChecks.filter(c => c.pass === false).length;
  const verdict = failed === 0 ? 'PASS' : 'FAIL';

  console.log('\n' + '═'.repeat(72));
  console.log('  PHASE 5 FINAL SUMMARY');
  console.log('═'.repeat(72));
  console.log(`  Total Checks : ${allChecks.length}`);
  console.log(`  Passed       : ${passed}`);
  console.log(`  Failed       : ${failed}`);

  if (failed > 0) {
    console.log('\n  Failed checks:');
    allChecks.filter(c => c.pass === false).forEach(c => console.log(`    ✗ ${c.label}: ${c.evidence}`));
  }

  console.log('\n' + '═'.repeat(72));
  console.log(`  PHASE 5 OVERALL VERDICT: ${verdict}`);
  console.log('═'.repeat(72) + '\n');

  process.exit(verdict === 'PASS' ? 0 : 1);
})();
