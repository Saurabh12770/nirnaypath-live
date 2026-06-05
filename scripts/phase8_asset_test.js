'use strict';
/**
 * NirnayPath — Phase 8: Asset/Logo Integrity (SRE 12-Phase Audit)
 * ================================================================
 * Crawls index.html and manifest.json to verify that all referenced images, icons,
 * logos, stylesheets, and scripts serve successfully with HTTP 200.
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
  console.log('  PHASE 8 — ASSET / LOGO INTEGRITY   |   NirnayPath SRE 12-Phase Audit');
  console.log('  Verify: logo.png | PWA Icons | Styles & Scripts serve 200 OK');
  console.log('═'.repeat(72));

  const checks = [];
  const publicDir = path.join(__dirname, '..', 'public');

  // 1. Check core brand logo
  console.log('\n  1. Checking brand logos...');
  const logoRes = await req('GET', '/logo.png');
  checks.push(logoRes.ok
    ? pass('logo.png loaded', `HTTP 200 OK (${logoRes.raw.length} bytes)`)
    : fail('logo.png loaded', `HTTP ${logoRes.status || 'failed'}`));

  // 2. Fetch and parse manifest.json
  console.log('\n  2. Checking manifest.json & PWA Icons...');
  const manifestRes = await req('GET', '/manifest.json');
  if (manifestRes.ok) {
    pass('manifest.json loaded', 'HTTP 200 OK');
    try {
      const manifest = JSON.parse(manifestRes.raw);
      const icons = manifest.icons || [];
      info('Icons listed in manifest', `${icons.length}`);
      
      for (const icon of icons) {
        const iconPath = icon.src;
        const iconCheck = await req('GET', iconPath);
        checks.push(iconCheck.ok
          ? pass(`Manifest Icon: ${iconPath} (${icon.sizes})`, 'HTTP 200 OK')
          : fail(`Manifest Icon: ${iconPath} (${icon.sizes})`, `HTTP ${iconCheck.status}`));
      }
    } catch (e) {
      checks.push(fail('manifest.json parsing', `JSON parsing error: ${e.message}`));
    }
  } else {
    checks.push(fail('manifest.json loaded', `HTTP ${manifestRes.status}`));
  }

  // 3. Scan HTML files for asset references and check them
  console.log('\n  3. Checking HTML asset references...');
  const htmlFiles = ['index.html', 'test.html', 'admin.html', 'about.html'];
  const checkedAssets = new Set();

  for (const file of htmlFiles) {
    const filePath = path.join(publicDir, file);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract src="..." and href="..."
    const srcRegex = /(?:src|href)=["']([^"']+)["']/g;
    let match;
    while ((match = srcRegex.exec(content)) !== null) {
      const asset = match[1];
      
      // Filter out absolute URLs, anchors, empty, external resources, mailto/tel protocols
      if (asset.startsWith('http') || asset.startsWith('#') || asset.startsWith('data:') || asset.startsWith('mailto:') || asset.startsWith('tel:') || !asset.trim()) {
        continue;
      }

      // Standardize relative paths to root paths
      let rootPath = asset;
      if (!asset.startsWith('/')) {
        // Since we are running at root of server, resolve relative to root
        rootPath = '/' + asset;
      }

      // Deduplicate checks
      if (checkedAssets.has(rootPath)) continue;
      checkedAssets.add(rootPath);

      // Verify asset exists locally on server
      const assetRes = await req('GET', rootPath);
      // /admin route is authenticated (redirects or returns 401), which is acceptable
      const isOk = assetRes.ok || (rootPath.startsWith('/admin') && (assetRes.status === 401 || assetRes.status === 302));
      checks.push(isOk
        ? pass(`Asset serve: ${rootPath}`, `HTTP ${assetRes.status} OK`)
        : fail(`Asset serve: ${rootPath}`, `HTTP ${assetRes.status || 'failed'}`));
    }
  }

  // Verdict
  const failed = checks.filter(c => c.pass === false).length;
  const verdict = failed === 0 ? 'PASS' : 'FAIL';

  console.log('\n' + '═'.repeat(72));
  console.log(`  PHASE 8 OVERALL VERDICT: ${verdict}`);
  console.log('═'.repeat(72) + '\n');

  process.exit(verdict === 'PASS' ? 0 : 1);
}

main().catch(err => {
  console.error('[CRASH] asset integrity audit error:', err.message);
  process.exit(1);
});
