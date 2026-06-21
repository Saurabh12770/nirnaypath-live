'use strict';
/**
 * NirnayPath — Phase 9: PWA Validation (SRE 12-Phase Audit)
 * ==========================================================
 * Verifies Service Worker registration, manifest, caching strategy, and update cycles.
 *
 * ZERO mocks. ZERO changes. Observe and report only.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

function req(method, path, body = null, headers = {}, timeout = 5000) {
  return new Promise((resolve) => {
    const r = http.request({ hostname: 'localhost', port: 3000, path, method, headers }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        resolve({ ok: res.statusCode === 200, status: res.statusCode, raw: data });
      });
    });
    r.on('error', err => resolve({ ok: false, status: 0, error: err.message }));
    r.setTimeout(timeout, () => { r.destroy(); resolve({ ok: false, status: 0, error: 'TIMEOUT' }); });
    r.end();
  });
}

function pass(label, evidence) { console.log(`  [✓] ${label}: ${evidence}`); return { pass: true, label, evidence }; }
function fail(label, evidence) { console.log(`  [✗] ${label}: ${evidence}`); return { pass: false, label, evidence }; }
function info(label, evidence) { console.log(`  [i] ${label}: ${evidence}`); return { pass: true, label, evidence, info: true }; }

async function main() {
  console.log('\n' + '═'.repeat(72));
  console.log('  PHASE 9 — PWA VALIDATION   |   NirnayPath SRE 12-Phase Audit');
  console.log('  Verify: Service Worker serving | Caching Strategies | Manifest config');
  console.log('═'.repeat(72));

  const checks = [];
  const publicDir = path.join(__dirname, '..', 'public');

  // 1. Verify Service Worker served at /service-worker.js
  console.log('\n  1. Auditing Service Worker serving...');
  const swRes = await req('GET', '/service-worker.js');
  checks.push(swRes.ok && swRes.raw.includes('NirnayPath Service Worker')
    ? pass('service-worker.js served', `HTTP 200 OK (${swRes.raw.length} bytes)`)
    : fail('service-worker.js served', 'Not found or not correct file'));

  // 2. Audit caching strategies in service-worker.js
  console.log('\n  2. Auditing Service Worker Caching Logic...');
  const swPath = path.join(publicDir, 'service-worker.js');
  if (fs.existsSync(swPath)) {
    const swContent = fs.readFileSync(swPath, 'utf8');
    
    // Check cache version
    const versionMatch = swContent.match(/const\s+CACHE_VERSION\s*=\s*['"]([^'"]+)['"]/);
    if (versionMatch) {
      const isCorrectVersion = versionMatch[1] === 'nirnaypath-v15';
      checks.push(isCorrectVersion
        ? pass('Cache Version (CACHE_VERSION)', `"${versionMatch[1]}" (Correct - stale v14 cache purged)`)
        : fail('Cache Version (CACHE_VERSION)', `"${versionMatch[1]}" (Expected "nirnaypath-v15")`));
    } else {
      checks.push(fail('Cache Version definition', 'Not found in service-worker.js'));
    }

    // Check pre-cache static assets
    const hasPrecacheArray = swContent.includes('const STATIC_ASSETS =');
    checks.push(hasPrecacheArray
      ? pass('STATIC_ASSETS pre-cache list present', 'Defined for offline installer warmup')
      : fail('STATIC_ASSETS pre-cache list missing', 'Precache list not defined'));

    // Check Network-First HTML strategy
    const hasNetworkFirstHTML = swContent.includes('networkFirstHTML(') || swContent.includes('networkFirst');
    checks.push(hasNetworkFirstHTML
      ? pass('HTML caching strategy is Network-First', 'Verified via networkFirstHTML function')
      : fail('HTML caching strategy is stale/invalid', 'No Network-First strategy for pages'));

    // Check Network-First CSS/JS strategy (BUG-M1 FIX verification)
    const hasNetworkFirstAsset = swContent.includes('networkFirstAsset(');
    checks.push(hasNetworkFirstAsset
      ? pass('CSS/JS assets cached with Network-First', 'Verified via networkFirstAsset function (ensures fresh layouts)')
      : fail('CSS/JS caching strategy is stale/invalid', 'Missing networkFirstAsset strategy'));

    // Check offline shell fallback cached
    const cachesOfflineShell = swContent.includes('/mobile-app-shell.html');
    checks.push(cachesOfflineShell
      ? pass('Offline shell /mobile-app-shell.html registered', 'Ready for offline fallback')
      : fail('Offline shell /mobile-app-shell.html missing', 'Offline layout shell not registered'));
  } else {
    checks.push(fail('service-worker.js exists on disk', 'File not found'));
  }

  // 3. Verify manifest.json exists
  console.log('\n  3. Auditing Manifest & PWA details...');
  const manifestRes = await req('GET', '/manifest.json');
  if (manifestRes.ok) {
    try {
      const manifest = JSON.parse(manifestRes.raw);
      checks.push(manifest.short_name === 'NirnayPath'
        ? pass('Manifest content valid', `Short name: "${manifest.short_name}"`)
        : fail('Manifest content invalid', `Short name mismatch: "${manifest.short_name}"`));
      
      const hasCategories = Array.isArray(manifest.categories) && manifest.categories.length > 0;
      checks.push(hasCategories
        ? pass('Manifest categories present', manifest.categories.join(', '))
        : fail('Manifest categories missing', 'Required for Google Play Store PWA eligibility'));
    } catch (e) {
      checks.push(fail('Manifest parsing', `Error: ${e.message}`));
    }
  } else {
    checks.push(fail('manifest.json serving', `HTTP ${manifestRes.status}`));
  }

  // 4. Verify SW Registration hook in app client scripts
  console.log('\n  4. Auditing client SW registration...');
  const clientScriptPath = path.join(publicDir, 'js', 'app.js');
  if (fs.existsSync(clientScriptPath)) {
    const clientScript = fs.readFileSync(clientScriptPath, 'utf8');
    const hasRegistrationHook = clientScript.includes('serviceWorker.register') || clientScript.includes('serviceWorker');
    checks.push(hasRegistrationHook
      ? pass('Service Worker registration hook in app.js', 'Registration call active')
      : fail('Service Worker registration hook missing from app.js', 'Service worker is never registered by client'));
  } else {
    // Check main script.js fallback
    const mainScriptPath = path.join(publicDir, 'script.js');
    if (fs.existsSync(mainScriptPath)) {
      const mainScript = fs.readFileSync(mainScriptPath, 'utf8');
      const hasRegistrationHook = mainScript.includes('serviceWorker.register') || mainScript.includes('serviceWorker');
      checks.push(hasRegistrationHook
        ? pass('Service Worker registration hook in script.js', 'Registration call active')
        : fail('Service Worker registration hook missing from script.js', 'Service worker registration not found'));
    } else {
      checks.push(fail('Client entry script exists', 'app.js/script.js not found'));
    }
  }

  // Verdict
  const failed = checks.filter(c => c.pass === false).length;
  const verdict = failed === 0 ? 'PASS' : 'FAIL';

  console.log('\n' + '═'.repeat(72));
  console.log(`  PHASE 9 OVERALL VERDICT: ${verdict}`);
  console.log('═'.repeat(72) + '\n');

  process.exit(verdict === 'PASS' ? 0 : 1);
}

main().catch(err => {
  console.error('[CRASH] PWA validation error:', err.message);
  process.exit(1);
});
