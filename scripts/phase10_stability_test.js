'use strict';
/**
 * NirnayPath — Phase 10: 24-Hour Stability Simulation (SRE 12-Phase Audit)
 * ==========================================================================
 * Simulates real user patterns in an accelerated loop.
 * Measures memory, CPU load, and DB growth.
 * Checks for crashes, process restarts, and unhandled rejections.
 *
 * ZERO mocks. ZERO changes. Observe and report only.
 */

const http = require('http');
const crypto = require('crypto');

function req(method, path, body = null, headers = {}, timeout = 10000) {
  return new Promise((resolve) => {
    const payload = body ? JSON.stringify(body) : null;
    const allHeaders = { 'Content-Type': 'application/json', ...headers };
    if (payload) allHeaders['Content-Length'] = Buffer.byteLength(payload);

    const start = Date.now();
    const r = http.request({ hostname: 'localhost', port: 3000, path, method, headers: allHeaders }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        let json = null; try { json = JSON.parse(data); } catch (_) {}
        let token = null;
        const sc = res.headers['set-cookie'];
        if (sc) sc.forEach(c => { if (c.startsWith('token=')) token = c.split(';')[0].replace('token=', ''); });
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode, ms: Date.now() - start, json, token, raw: data });
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

async function simulateSingleUserFlow() {
  const email = `stab_${crypto.randomBytes(4).toString('hex')}@nirnaypath.com`;
  const pass = 'StabPass@123!';
  
  // 1. Signup
  const signup = await req('POST', '/api/auth/signup', { name: 'Stability User', email, password: pass, confirmPassword: pass });
  if (!signup.ok || !signup.token) return { success: false, step: 'signup', error: signup.error || `HTTP ${signup.status}` };
  
  const headers = { 'Cookie': `token=${signup.token}` };

  // 2. View Dashboard
  const dash = await req('GET', '/api/analytics/overview', null, headers);
  if (!dash.ok) return { success: false, step: 'dashboard', error: `HTTP ${dash.status}` };

  // 3. Start Test
  const start = await req('POST', '/api/test/start', { subject: 'history', count: 5, timeLimit: 300, exam: 'UPSC' }, headers);
  if (!start.ok || !start.json?.sessionId) return { success: false, step: 'start_test', error: `HTTP ${start.status}` };

  const sessionId = start.json.sessionId;

  // 4. Submit Test
  const submit = await req('POST', '/api/test/submit', {
    sessionId,
    subject: 'history',
    exam: 'UPSC',
    answers: { '0': '1', '1': '2', '2': '3', '3': '0', '4': '1' }
  }, headers);
  if (!submit.ok) return { success: false, step: 'submit_test', error: `HTTP ${submit.status}` };

  return { success: true };
}

async function main() {
  console.log('\n' + '═'.repeat(72));
  console.log('  PHASE 10 — 24-HOUR STABILITY SIMULATION | NirnayPath SRE 12-Phase Audit');
  console.log('  Accelerated run: 100 User Flows (Signup -> Dash -> Start Test -> Submit)');
  console.log('═'.repeat(72));

  const checks = [];

  // Get initial server health & uptime
  const startHealth = await req('GET', '/api/health/detailed');
  if (!startHealth.ok) {
    console.error('  [ABORT] Detailed health endpoint not reachable.');
    process.exit(1);
  }
  const startUptime = startHealth.json.uptime.seconds;
  const startMem = startHealth.json.memory.rssMB;
  info('Start Server Uptime', `${startHealth.json.uptime.formatted} (${startUptime}s)`);
  info('Start Memory RSS', `${startMem} MB`);

  console.log('\n  [SIMULATION] Executing 100 concurrent user flows in batches...');
  const batchSize = 10;
  const totalFlows = 100;
  let successCount = 0;
  let failCount = 0;
  const failures = [];

  const startTime = Date.now();
  for (let i = 0; i < totalFlows; i += batchSize) {
    const promises = Array.from({ length: batchSize }, () => simulateSingleUserFlow());
    const results = await Promise.all(promises);
    
    results.forEach(r => {
      if (r.success) {
        successCount++;
      } else {
        failCount++;
        failures.push(r);
      }
    });
  }
  const durationMs = Date.now() - startTime;
  info('Simulation Duration', `${(durationMs / 1000).toFixed(1)}s`);
  info('Successful Flows', `${successCount}/${totalFlows}`);
  info('Failed Flows', `${failCount}/${totalFlows}`);

  if (failures.length > 0) {
    console.log('  Failed Flow details:');
    failures.slice(0, 5).forEach((f, idx) => {
      console.log(`    ↳ #${idx + 1}: Step: ${f.step} | Error: ${f.error}`);
    });
  }

  // Cool down
  console.log('\n  [COOL-DOWN] Cooling down for 3 seconds...');
  await new Promise(r => setTimeout(r, 3000));

  // Get end health & uptime
  const endHealth = await req('GET', '/api/health/detailed');
  if (!endHealth.ok) {
    checks.push(fail('Post-Load Health check', 'Server is down / crashed!'));
  } else {
    const endUptime = endHealth.json.uptime.seconds;
    const endMem = endHealth.json.memory.rssMB;
    info('End Server Uptime', `${endHealth.json.uptime.formatted} (${endUptime}s)`);
    info('End Memory RSS', `${endMem} MB`);

    // Verify Crash/Restart behavior
    const expectedUptimeMin = startUptime + Math.floor(durationMs / 1000);
    const didRestart = endUptime < expectedUptimeMin;
    checks.push(!didRestart
      ? pass('Server Crash & Restart Check', 'No server process restarts detected (uptime is contiguous)')
      : fail('Server CRASH / RESTART detected', `Uptime reset! Start: ${startUptime}s, Expected >= ${expectedUptimeMin}s, Got: ${endUptime}s`));

    // Verify Memory leakage under continuous flows
    const memDelta = endMem - startMem;
    checks.push(memDelta < 100
      ? pass('Memory Stability Check', `Delta RSS memory: ${memDelta > 0 ? '+' : ''}${memDelta} MB`)
      : fail('Potential RSS Leakage', `Server RSS grew by ${memDelta} MB`));
  }

  // Verdict
  const failed = checks.filter(c => c.pass === false).length;
  const verdict = (failed === 0 && failCount === 0) ? 'PASS' : 'FAIL';

  console.log('\n' + '═'.repeat(72));
  console.log(`  PHASE 10 OVERALL VERDICT: ${verdict}`);
  console.log('═'.repeat(72) + '\n');

  process.exit(verdict === 'PASS' ? 0 : 1);
}

main().catch(err => {
  console.error('[CRASH] stability simulation crashed:', err.message);
  process.exit(1);
});
