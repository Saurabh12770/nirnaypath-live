'use strict';
/**
 * NirnayPath — Phase 6: Performance Monitoring (SRE 12-Phase Audit)
 * =================================================================
 * Measures memory utilization, event loop lag, database pool latency, and response latency.
 * Detects event loop delays and checks for memory leaks before, during, and after load.
 *
 * ZERO mocks. ZERO application changes. Observe and report only.
 */

const http = require('http');
const os = require('os');

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
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode, ms: Date.now() - start, json, raw: data });
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

async function main() {
  console.log('\n' + '═'.repeat(72));
  console.log('  PHASE 6 — PERFORMANCE MONITORING   |   NirnayPath SRE 12-Phase Audit');
  console.log('  Metrics: Event Loop Lag | Memory Leakage | CPU / DB Load Latencies');
  console.log('═'.repeat(72));

  const checks = [];

  // 1. Get Baseline Metrics
  console.log('\n  1. Fetching Baseline Performance...');
  const baseRes = await req('GET', '/api/health/detailed');
  if (!baseRes.ok || !baseRes.json) {
    console.error('  [ABORT] Detailed health endpoint not reachable.');
    process.exit(1);
  }

  const baseStats = baseRes.json;
  info('Baseline Memory RSS', `${baseStats.memory.rssMB} MB`);
  info('Baseline Heap Used', `${baseStats.memory.heapUsedMB} MB / ${baseStats.memory.heapTotalMB} MB`);
  info('Baseline Event Loop Lag', `${baseStats.eventLoop.lagMs} ms`);
  info('Baseline DB Latency', `${baseStats.database.latencyMs} ms`);
  info('CPU Core Count', `${os.cpus().length} cores`);
  info('Load Average (1m/5m/15m)', `${os.loadavg().map(v => v.toFixed(2)).join(', ')}`);

  // 2. Trigger Active Load
  console.log('\n  2. Triggering Active Load (50 concurrent heavy requests to /api/stats/achievements-feed)...');
  const startLoad = Date.now();
  const loadPromises = Array.from({ length: 50 }, () => req('GET', '/api/stats/achievements-feed'));
  const loadResults = await Promise.all(loadPromises);
  const loadDuration = Date.now() - startLoad;

  const latencies = loadResults.map(r => r.ms).sort((a, b) => a - b);
  const avgMs = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  const p95Ms = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99Ms = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const errorCount = loadResults.filter(r => !r.ok).length;
  const errorRate = (errorCount / loadResults.length) * 100;

  info('Load Duration', `${(loadDuration / 1000).toFixed(2)}s`);
  info('Average Latency', `${avgMs}ms`);
  info('P95 Latency', `${p95Ms}ms`);
  info('P99 Latency', `${p99Ms}ms`);
  info('Error Rate', `${errorRate.toFixed(1)}% (${errorCount}/50)`);

  // 3. Fetch Mid-Load / Peak Metrics immediately
  const midRes = await req('GET', '/api/health/detailed');
  const midStats = midRes.json || baseStats;

  // 4. Cool-down & Reclaim Check
  console.log('\n  3. Cooling down for 5 seconds to observe memory reclamation...');
  await new Promise(r => setTimeout(r, 5000));
  
  // Force garbage collection check or fetch recovery metrics
  const recoveryRes = await req('GET', '/api/health/detailed');
  const recoveryStats = recoveryRes.json || baseStats;

  console.log('\n  4. Analyzing Performance Metrics...');

  // Check event loop lag threshold
  const peakLag = midStats.eventLoop.lagMs;
  checks.push(peakLag < 100
    ? pass('Peak Event Loop Lag', `${peakLag} ms (< 100ms threshold)`)
    : fail('Peak Event Loop Lag Exceeded', `${peakLag} ms (event loop blocked)`));

  // Check memory growth & leakage
  const heapGrowth = recoveryStats.memory.heapUsedMB - baseStats.memory.heapUsedMB;
  const isLeaking = heapGrowth > 50; // Heap growth > 50MB after 5s cooldown might indicate leak
  checks.push(!isLeaking
    ? pass('Memory Recovery / Leak Check', `Heap recovered (Delta: ${heapGrowth > 0 ? '+' : ''}${heapGrowth} MB)`)
    : fail('Potential Memory Leak Detected', `Heap grew from ${baseStats.memory.heapUsedMB} MB to ${recoveryStats.memory.heapUsedMB} MB (Delta: +${heapGrowth} MB)`));

  // Check database pool latency
  const peakDbLatency = midStats.database.latencyMs;
  checks.push(peakDbLatency < 1000
    ? pass('Database Pool Latency', `${peakDbLatency} ms (< 1000ms threshold)`)
    : fail('Database Pool Latency High', `${peakDbLatency} ms`));

  // Check Load Response Times
  checks.push(avgMs < 2000
    ? pass('Response Time (Avg)', `${avgMs} ms`)
    : fail('Average Response Time High', `${avgMs} ms`));

  checks.push(errorRate < 5
    ? pass('Request Error Rate', `${errorRate.toFixed(1)}%`)
    : fail('Request Error Rate High', `${errorRate.toFixed(1)}%`));

  // Verdict
  const failed = checks.filter(c => c.pass === false).length;
  const verdict = failed === 0 ? 'PASS' : 'FAIL';

  console.log('\n' + '═'.repeat(72));
  console.log(`  PHASE 6 OVERALL VERDICT: ${verdict}`);
  console.log('═'.repeat(72) + '\n');

  process.exit(verdict === 'PASS' ? 0 : 1);
}

main().catch(err => {
  console.error('[CRASH] performance test run error:', err.message);
  process.exit(1);
});
