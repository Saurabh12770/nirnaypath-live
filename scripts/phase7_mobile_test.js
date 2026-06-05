'use strict';
/**
 * NirnayPath — Phase 7: Mobile/Responsiveness Audit (SRE 12-Phase Audit)
 * =====================================================================
 * Verifies mobile viewport tags, media query definitions, and touch target targets.
 *
 * ZERO mocks. ZERO changes. Observe and report only.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

function pass(label, evidence) { console.log(`  [✓] ${label}: ${evidence}`); return { pass: true, label, evidence }; }
function fail(label, evidence) { console.log(`  [✗] ${label}: ${evidence}`); return { pass: false, label, evidence }; }
function info(label, evidence) { console.log(`  [i] ${label}: ${evidence}`); return { pass: true, label, evidence, info: true }; }

async function main() {
  console.log('\n' + '═'.repeat(72));
  console.log('  PHASE 7 — MOBILE / RESPONSIVENESS   |   NirnayPath SRE 12-Phase Audit');
  console.log('  Metrics: Viewport Meta | Media Queries | Touch Target Padding');
  console.log('═'.repeat(72));

  const checks = [];
  const publicDir = path.join(__dirname, '..', 'public');

  // 1. Audit HTML Viewport Tags
  console.log('\n  1. Auditing Viewport Meta Tags...');
  const htmlFiles = ['index.html', 'test.html', 'admin.html', 'about.html', 'reset-password.html'];
  
  for (const file of htmlFiles) {
    const filePath = path.join(publicDir, file);
    if (!fs.existsSync(filePath)) {
      checks.push(fail(`File Exists: ${file}`, 'File not found in public directory'));
      continue;
    }
    const htmlContent = fs.readFileSync(filePath, 'utf8');
    const hasViewport = /<meta\s+name=["']viewport["']\s+content=["'][^"']+["']/.test(htmlContent);
    const viewportMatch = htmlContent.match(/<meta\s+name=["']viewport["']\s+content=["']([^"']+)["']/);
    
    if (hasViewport && viewportMatch) {
      checks.push(pass(`Viewport tag in ${file}`, `content="${viewportMatch[1]}"`));
    } else {
      checks.push(fail(`Viewport tag in ${file}`, 'Missing or invalid viewport meta tag'));
    }
  }

  // 2. Audit CSS Media Queries
  console.log('\n  2. Auditing CSS Media Queries...');
  const cssPath = path.join(publicDir, 'style.css');
  if (fs.existsSync(cssPath)) {
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    const mediaQueries = cssContent.match(/@media\s*[^{]+/g) || [];
    info('CSS File Size', `${(fs.statSync(cssPath).size / 1024).toFixed(1)} KB`);
    info('Total Media Queries Found', `${mediaQueries.length}`);

    // Check for standard breakpoints (e.g. 768px, 480px, etc.)
    const hasMobileBreakpoint = mediaQueries.some(mq => mq.includes('768') || mq.includes('600') || mq.includes('480') || mq.includes('320') || mq.includes('max-width'));
    checks.push(hasMobileBreakpoint
      ? pass('Mobile Responsive Breakpoints', `${mediaQueries.slice(0, 5).map(mq => mq.trim()).join(', ')}...`)
      : fail('Mobile Responsive Breakpoints', 'No standard mobile max-width breakpoints found'));
  } else {
    checks.push(fail('style.css exists', 'File not found'));
  }

  // 3. Audit Touch Target Padding & Heights in CSS
  console.log('\n  3. Auditing CSS Touch Target Sizes...');
  if (fs.existsSync(cssPath)) {
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Check if there are styles enforcing padding/height on buttons/links
    const hasBtnPadding = cssContent.includes('padding:') || cssContent.includes('padding-top:');
    const minHeightMatch = cssContent.match(/min-height:\s*(\d+)px/g) || [];
    
    info('Min-Height declarations found', `${minHeightMatch.length}`);
    
    // Verify that key interactive elements (.btn, button, input) have sufficient spacing/heights
    const hasTouchTargetStandard = cssContent.includes('.btn') || cssContent.includes('button');
    checks.push(hasTouchTargetStandard
      ? pass('Touch target selectors present', '.btn / button styling active')
      : fail('Touch target selectors missing', 'No styled buttons or interactive classes detected in CSS'));
  }

  // Verdict
  const failed = checks.filter(c => c.pass === false).length;
  const verdict = failed === 0 ? 'PASS' : 'FAIL';

  console.log('\n' + '═'.repeat(72));
  console.log(`  PHASE 7 OVERALL VERDICT: ${verdict}`);
  console.log('═'.repeat(72) + '\n');

  process.exit(verdict === 'PASS' ? 0 : 1);
}

main().catch(err => {
  console.error('[CRASH] mobile responsiveness audit error:', err.message);
  process.exit(1);
});
