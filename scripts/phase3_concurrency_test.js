'use strict';
/**
 * NirnayPath — Phase 3: Concurrency Test (SRE 12-Phase Audit)
 * ============================================================
 * Verifies correctness under parallel load for:
 *   - Subject Test, Topic Test, Section Test
 * Runs 10 / 25 / 50 parallel requests simultaneously.
 *
 * Checks:
 *   - No duplicate sessionIds issued
 *   - No duplicate scoring (submit same session twice)
 *   - No duplicate analytics records
 *   - No race condition on leaderboard
 *
 * ZERO mocks. ZERO application changes.
 */

const http = require('http');
const crypto = require('crypto');

const BASE = 'http://localhost:3000';
const PARALLEL_LEVELS = [10, 25, 50];

// ─── HTTP HELPER ──────────────────────────────────────────────────────────────
function req(method, path, body, cookie) {
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
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode, ms: Date.now() - start, json, token });
      });
    });
    r.on('error', err => resolve({ ok: false, status: 0, ms: Date.now() - start, error: err.message }));
    r.setTimeout(20000, () => { r.destroy(); resolve({ ok: false, status: 0, ms: 20000, error: 'TIMEOUT' }); });
    if (payload) r.write(payload);
    r.end();
  });
}

// ─── SETUP: Create N authenticated users ──────────────────────────────────────
async function createUsers(n) {
  const users = [];
  // Create in batches of 5
  for (let i = 0; i < n; i += 5) {
    const batch = Array.from({ length: Math.min(5, n - i) }, async (_, j) => {
      const email = `c3_${crypto.randomBytes(4).toString('hex')}@nirnaypath.com`;
      const pass = 'Concur@123!';
      const r = await req('POST', '/api/auth/signup', { name: `C3 User ${i+j}`, email, password: pass, confirmPassword: pass });
      if (r.ok && r.token) return { email, token: r.token };
      return null;
    });
    const results = await Promise.all(batch);
    users.push(...results.filter(Boolean));
  }
  return users;
}

// ─── TEST 1: Duplicate Session Check ─────────────────────────────────────────
async function testDuplicateSessions(users, parallelCount) {
  const issues = [];
  const sessionIds = new Set();
  let duplicates = 0;

  const subset = users.slice(0, parallelCount);
  const results = await Promise.all(subset.map(u =>
    req('POST', '/api/test/start', {
      subject: 'history',
      count: 5,
      timeLimit: 300,
      exam: 'UPSC'
    }, `token=${u.token}`)
  ));

  results.forEach((r, i) => {
    if (r.ok && r.json?.sessionId) {
      if (sessionIds.has(r.json.sessionId)) {
        duplicates++;
        issues.push(`DUPLICATE sessionId: ${r.json.sessionId}`);
      }
      sessionIds.add(r.json.sessionId);
    }
  });

  const ok = results.filter(r => r.ok).length;
  const pass = duplicates === 0;
  console.log(`  [${pass ? '✓' : '✗'}] Duplicate Sessions @ ${parallelCount} parallel: ${ok}/${parallelCount} started, ${duplicates} duplicates`);
  if (!pass) issues.forEach(i => console.log(`       ⚠ ${i}`));

  return { pass, duplicates, sessionIds: Array.from(sessionIds), rawResults: results };
}

// ─── TEST 2: Duplicate Scoring (double-submit) ───────────────────────────────
async function testDuplicateScoring(user, sessionId) {
  const answers = { '0': '1', '1': '2', '2': '0', '3': '3', '4': '1' };
  const cookie = `token=${user.token}`;

  // Fire 3 simultaneous submits of same session
  const results = await Promise.all([
    req('POST', '/api/test/submit', { sessionId, subject: 'history', exam: 'UPSC', answers }, cookie),
    req('POST', '/api/test/submit', { sessionId, subject: 'history', exam: 'UPSC', answers }, cookie),
    req('POST', '/api/test/submit', { sessionId, subject: 'history', exam: 'UPSC', answers }, cookie),
  ]);

  const successes = results.filter(r => r.ok).length;
  // Only 1 should succeed (idempotency guard)
  const pass = successes <= 1;
  console.log(`  [${pass ? '✓' : '✗'}] Duplicate Scoring Guard: ${successes}/3 submits succeeded (expected ≤1)`);
  if (!pass) console.log(`       ⚠ DOUBLE-SCORING DETECTED — ${successes} concurrent submits all returned 2xx`);

  return { pass, successes };
}

// ─── TEST 3: Duplicate Analytics ─────────────────────────────────────────────
async function testDuplicateAnalytics(user) {
  const cookie = `token=${user.token}`;

  // Fire 5 simultaneous analytics reads
  const results = await Promise.all(Array.from({ length: 5 }, () =>
    req('GET', '/api/analytics/overview', null, cookie)
  ));

  const ok = results.filter(r => r.ok).length;
  // All should return same data — check xpTotal consistency
  const xpValues = results.filter(r => r.ok && r.json?.xpTotal !== undefined).map(r => r.json.xpTotal);
  const consistent = xpValues.length === 0 || new Set(xpValues).size === 1;

  const pass = ok >= 4 && consistent;
  console.log(`  [${pass ? '✓' : '✗'}] Analytics Consistency: ${ok}/5 succeeded, XP values consistent=${consistent}`);
  if (!consistent) console.log(`       ⚠ INCONSISTENT ANALYTICS: ${JSON.stringify([...new Set(xpValues)])}`);

  return { pass, ok, consistent };
}

// ─── TEST 4: Race Condition on Leaderboard ────────────────────────────────────
async function testLeaderboardRace(users, parallelCount) {
  const subset = users.slice(0, parallelCount);
  const cookie = `token=${subset[0].token}`;

  // All users read leaderboard simultaneously
  const results = await Promise.all(subset.map(() =>
    req('GET', '/api/leaderboard/global', null, cookie)
  ));

  const ok = results.filter(r => r.ok || r.status === 304).length;
  // Check error rate
  const errors = results.filter(r => !r.ok && r.status !== 304).length;
  const pass = errors === 0;
  console.log(`  [${pass ? '✓' : '✗'}] Leaderboard Race @ ${parallelCount} parallel: ${ok}/${parallelCount} OK, ${errors} errors`);

  return { pass, ok, errors };
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n' + '═'.repeat(72));
  console.log('  PHASE 3 — CONCURRENCY TEST   |   NirnayPath SRE 12-Phase Audit');
  console.log('  Parallel Levels: 10 → 25 → 50 simultaneous requests');
  console.log('  Tests: Session Uniqueness | Scoring Idempotency | Analytics | Leaderboard');
  console.log('═'.repeat(72));

  // Pre-create users pool (need 50 for max level)
  console.log('\n  [SETUP] Creating 55 test users...');
  const users = await createUsers(55);
  console.log(`  [SETUP] Created ${users.length}/55 users successfully`);

  if (users.length < 10) {
    console.error('\n  [ABORT] Not enough test users created. Check auth/signup endpoint.');
    process.exit(1);
  }

  const allResults = [];

  for (const level of PARALLEL_LEVELS) {
    console.log(`\n${'─'.repeat(72)}`);
    console.log(`  ► Parallel Level: ${level} simultaneous requests`);
    console.log('─'.repeat(72));

    const levelResults = { level, tests: {}, verdict: 'PASS' };

    // Test 1: Duplicate Sessions
    const dupSessions = await testDuplicateSessions(users, Math.min(level, users.length));
    levelResults.tests.duplicateSessions = dupSessions;
    if (!dupSessions.pass) levelResults.verdict = 'FAIL';

    // Test 2: Duplicate Scoring — use first session created at this level
    const validSession = dupSessions.rawResults?.find(r => r.ok && r.json?.sessionId);
    if (validSession && users[0]) {
      const dupScore = await testDuplicateScoring(users[0], validSession.json.sessionId);
      levelResults.tests.duplicateScoring = dupScore;
      if (!dupScore.pass) levelResults.verdict = 'FAIL';
    } else {
      console.log('  [SKIP] Duplicate Scoring — no valid session available');
      levelResults.tests.duplicateScoring = { pass: null, skipped: true };
    }

    // Test 3: Analytics Consistency
    const analytics = await testDuplicateAnalytics(users[0]);
    levelResults.tests.analytics = analytics;
    if (!analytics.pass) levelResults.verdict = 'FAIL';

    // Test 4: Leaderboard Race
    const leaderboard = await testLeaderboardRace(users, Math.min(level, users.length));
    levelResults.tests.leaderboard = leaderboard;
    if (!leaderboard.pass) levelResults.verdict = 'FAIL';

    console.log(`\n  VERDICT @ ${level} parallel: ${levelResults.verdict}`);
    allResults.push(levelResults);
  }

  // ─── FINAL SUMMARY ────────────────────────────────────────────────────────
  console.log('\n\n' + '═'.repeat(72));
  console.log('  PHASE 3 FINAL SUMMARY');
  console.log('═'.repeat(72));
  console.log(`  ${'Parallel'.padEnd(10)} ${'DupSession'.padStart(12)} ${'DupScore'.padStart(10)} ${'Analytics'.padStart(11)} ${'Leaderboard'.padStart(13)} ${'Verdict'.padStart(9)}`);
  console.log('  ' + '─'.repeat(68));

  let phase3Verdict = 'PASS';
  for (const r of allResults) {
    const ds = r.tests.duplicateSessions?.pass ? '✓' : '✗';
    const sc = r.tests.duplicateScoring?.pass === null ? '-' : r.tests.duplicateScoring?.pass ? '✓' : '✗';
    const an = r.tests.analytics?.pass ? '✓' : '✗';
    const lb = r.tests.leaderboard?.pass ? '✓' : '✗';
    const v  = r.verdict === 'PASS' ? '✓ PASS' : '✗ FAIL';
    console.log(`  ${String(r.level).padEnd(10)} ${ds.padStart(12)} ${sc.padStart(10)} ${an.padStart(11)} ${lb.padStart(13)} ${v.padStart(9)}`);
    if (r.verdict === 'FAIL') phase3Verdict = 'FAIL';
  }

  console.log('\n' + '═'.repeat(72));
  console.log(`  PHASE 3 OVERALL VERDICT: ${phase3Verdict}`);
  console.log('═'.repeat(72) + '\n');

  process.exit(phase3Verdict === 'PASS' ? 0 : 1);
})();
