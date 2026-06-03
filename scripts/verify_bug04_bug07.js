/**
 * Targeted verification for BUG-04 and BUG-07 fixes.
 * BUG-04: SSC exam button must be clickable (not intercepted by mobile-nav-panel).
 * BUG-07: No 401 errors should appear in console on a fresh guest page load.
 */
const puppeteer = require('puppeteer');

const BASE = 'http://localhost:3000';
const results = { bug04: null, bug07: null };

(async () => {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    // Capture all 401 responses
    const errors401 = [];
    page.on('response', res => {
        if (res.status() === 401) errors401.push(res.url());
    });

    // ── Load page as GUEST (no localStorage) ──────────────────────────────
    await page.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // BUG-07: count 401s — wait 4s for deferred async (Auth.init) to fire and settle
    await new Promise(r => setTimeout(r, 4000));
    results.bug07 = {
        status: errors401.length === 0 ? 'PASS' : 'FAIL',
        count401: errors401.length,
        urls: errors401
    };

    // ── BUG-04: SSC button clickability ───────────────────────────────────
    try {
        await page.waitForSelector('.exam-btn[data-exam="ssc"]', { timeout: 5000 });
        const sscBtn = await page.$('.exam-btn[data-exam="ssc"]');

        // Confirm bounding box (visible + rendered)
        const box = await sscBtn.boundingBox();
        if (!box) throw new Error('SSC button has no bounding box (not visible)');

        // Click without navigation wait
        await sscBtn.click({ delay: 50 });
        await new Promise(r => setTimeout(r, 500));

        // Verify active-exam class applied
        const isActive = await page.evaluate(() => {
            const btn = document.querySelector('.exam-btn[data-exam="ssc"]');
            return btn && btn.classList.contains('active-exam');
        });

        results.bug04 = {
            status: isActive ? 'PASS' : 'FAIL',
            detail: isActive
                ? 'SSC button clicked and became active-exam'
                : 'SSC button clicked but active-exam class not applied — click intercepted'
        };
    } catch (err) {
        results.bug04 = { status: 'FAIL', detail: err.message };
    }

    await browser.close();

    console.log('\n══════════════════════════════════════════');
    console.log('  BUG-04 (SSC button)  :', results.bug04.status);
    console.log('  Detail:', results.bug04.detail);
    console.log('──────────────────────────────────────────');
    console.log('  BUG-07 (401 on guest):', results.bug07.status);
    console.log('  401 count:', results.bug07.count401);
    if (results.bug07.urls.length) console.log('  URLs:', results.bug07.urls);
    console.log('══════════════════════════════════════════\n');

    const passed = results.bug04.status === 'PASS' && results.bug07.status === 'PASS';
    process.exit(passed ? 0 : 1);
})();
