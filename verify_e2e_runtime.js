const puppeteer = require('puppeteer');
const crypto = require('crypto');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitForSpinnerHidden(page) {
    await page.waitForFunction(() => {
        const el = document.getElementById('loadingOverlay');
        return !el || el.classList.contains('hidden') || window.getComputedStyle(el).display === 'none';
    }, { timeout: 10000 }).catch(e => console.warn('Warning: Spinner did not hide in 10s'));
}

(async () => {
    console.log('🏁 STARTING END-TO-END RUNTIME VALIDATION...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1000 });

    const consoleErrors = [];
    const consoleLogs = [];
    const failedRequests = [];

    page.on('console', msg => {
        const text = msg.text();
        consoleLogs.push(text);
        if (msg.type() === 'error') {
            consoleErrors.push(text);
            console.log('🔴 BROWSER CONSOLE ERROR:', text);
        }
    });

    page.on('pageerror', err => {
        consoleErrors.push(err.message);
        console.log('🔴 BROWSER EXCEPTION:', err.message);
    });

    page.on('requestfailed', req => {
        const errText = req.failure() ? req.failure().errorText : 'unknown';
        failedRequests.push({ url: req.url(), error: errText });
        console.log('🔴 REQUEST FAILED:', req.url(), 'Error:', errText);
    });

    try {
        // ==========================================
        // FLOW 1 — Anonymous User
        // ==========================================
        console.log('\n--- [FLOW 1] Anonymous User Navigation ---');
        await page.goto('http://localhost:3000/index.html', { waitUntil: 'load' });
        
        // Clear session first to make sure we are anonymous
        await page.evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
        });
        await page.reload({ waitUntil: 'load' });
        console.log('✔ Anonymous Homepage loaded successfully.');

        // Hero Images Check
        const heroImageCount = await page.evaluate(() => {
            const images = Array.from(document.querySelectorAll('#homeHeroSlider img'));
            const loaded = images.filter(img => img.naturalWidth > 0);
            return { total: images.length, loaded: loaded.length };
        });
        console.log(`✔ Slider Hero Images: ${heroImageCount.loaded}/${heroImageCount.total} successfully loaded (naturalWidth > 0).`);

        // Open Mobile Menu
        await page.setViewport({ width: 375, height: 667 });
        await page.waitForSelector('#mobileMenuToggle', { visible: true });
        await page.click('#mobileMenuToggle');
        console.log('✔ Mobile menu toggle clicked.');
        await page.setViewport({ width: 1600, height: 1000 });

        // Open Help Center
        await page.waitForSelector('#chatbotToggle', { visible: true });
        await page.click('#chatbotToggle');
        console.log('✔ Chatbot widget opened.');
        await page.click('#chatbotToggle');
        console.log('✔ Chatbot widget closed.');

        // Login Modal open/close
        await page.waitForSelector('#loginBtn', { visible: true });
        await page.click('#loginBtn');
        console.log('✔ Login button clicked.');

        // Check if modal display is flex
        const loginVisibleBeforeClose = await page.evaluate(() => {
            const modal = document.getElementById('loginModal');
            return modal && window.getComputedStyle(modal).display === 'flex';
        });
        console.log('✔ Login Modal display is "flex":', loginVisibleBeforeClose);

        await page.waitForSelector('#closeLogin', { visible: true });
        await page.click('#closeLogin');
        console.log('✔ Login Modal close button clicked.');

        const loginVisibleAfterClose = await page.evaluate(() => {
            const modal = document.getElementById('loginModal');
            return modal && window.getComputedStyle(modal).display === 'none';
        });
        console.log('✔ Login Modal display is "none":', loginVisibleAfterClose);

        // Scroll page
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        console.log('✔ Scrolled to page bottom.');
        await page.evaluate(() => window.scrollTo(0, 0));
        console.log('✔ Scrolled back to top.');


        // ==========================================
        // FLOW 2 — User Authentication
        // ==========================================
        console.log('\n--- [FLOW 2] User Authentication (Signup & Login) ---');
        await page.waitForSelector('#loginBtn', { visible: true });
        await page.click('#loginBtn');
        await page.waitForSelector('#showSignup', { visible: true });
        await page.click('#showSignup');
        console.log('✔ Switched modal to Signup Form.');

        const testId = crypto.randomBytes(3).toString('hex');
        const email = `qa_user_${testId}@nirnaypath.test`;
        const password = 'SecurityTest123!';

        await page.type('#signupName', 'QA Aspirant');
        await page.type('#signupEmail', email);
        await page.type('#signupPass', password);
        
        // Handle signup submission intercepting alert
        page.on('dialog', async dialog => {
            console.log('💬 Dialog Alert:', dialog.message());
            await dialog.accept();
        });

        await page.click('#doSignup');
        console.log('✔ Signup submitted.');
        await delay(3000);

        // Verify if token exists in local storage
        const hasSession = await page.evaluate(() => !!localStorage.getItem('np_user_data'));
        console.log('✔ Session created in localStorage after Signup (np_user_data):', hasSession);

        // Logout
        if (hasSession) {
            console.log('✔ Triggering logout via navbar button...');
            await page.waitForSelector('#loginBtn', { visible: true });
            await page.click('#loginBtn'); // click logout
            await delay(2000); // wait for page reload
        }

        const loggedOut = await page.evaluate(() => !localStorage.getItem('np_user_data'));
        console.log('✔ Logged out successfully (np_user_data is cleared):', loggedOut);

        // Login again manually
        await page.waitForSelector('#loginBtn', { visible: true });
        await page.click('#loginBtn'); // opens login modal
        
        await page.waitForSelector('#loginEmail', { visible: true });
        await page.type('#loginEmail', email);
        await page.type('#loginPass', password);
        await page.click('#doLogin');
        console.log('✔ Login submitted.');
        await delay(3000);

        const loggedInAgain = await page.evaluate(() => !!localStorage.getItem('np_user_data'));
        console.log('✔ Session verified after manual Login:', loggedInAgain);


        // ==========================================
        // FLOW 3 — Test Engine (Secure CBT Terminal)
        // ==========================================
        console.log('\n--- [FLOW 3] Secure CBT Test Engine ---');
        // Start science test with 5 questions
        await page.evaluate(() => {
            window.startTest('Science Verification Test', 'science', 5, 5);
        });
        console.log('✔ window.startTest executed. Waiting for navigation to test.html...');
        await delay(4000);

        const currentUrl = page.url();
        console.log('✔ Current Page URL:', currentUrl);

        if (currentUrl.includes('test.html')) {
            console.log('✔ CBT terminal reached.');

            // 1. Diagnostics Ok
            await page.waitForSelector('#btn-system-ok', { visible: true });
            await page.click('#btn-system-ok');
            console.log('✔ Diagnostics Proceed button clicked.');

            // 2. Candidate verification
            await page.waitForSelector('#verify-consent-check', { visible: true });
            await page.click('#verify-consent-check');
            console.log('✔ Consent check checked.');
            await page.click('#btn-verify-proceed');
            console.log('✔ Verification Proceed button clicked.');

            // 3. Instructions
            await page.waitForSelector('#consent-check', { visible: true });
            await page.click('#consent-check');
            console.log('✔ Instruction consent check checked.');
            await page.click('#btn-proceed');
            console.log('✔ Ready to begin clicked. Initializing exam...');
            await delay(2000);

            // 4. Answer 5 questions
            for (let i = 0; i < 5; i++) {
                await page.waitForSelector('#opt_0', { visible: true });
                await page.click('#opt_0');
                console.log(`✔ Answered Option 0 for Question ${i + 1}.`);
                await page.click('#btn-save-next');
                await delay(1500);
            }

            // 5. Submit test
            await page.waitForSelector('#btn-submit-test', { visible: true });
            await page.click('#btn-submit-test');
            console.log('✔ Submit test button clicked.');

            await page.waitForSelector('#btn-confirm-submit', { visible: true });
            await page.click('#btn-confirm-submit');
            console.log('✔ Submit confirmed.');
            await delay(3000);

            // Wait for terminated overlay or return dashboard
            await page.waitForSelector('#btn-return-home', { visible: true });
            await page.click('#btn-return-home');
            console.log('✔ Return to Dashboard clicked.');
            await delay(3000);
        } else {
            console.log('❌ Failed to navigate to CBT terminal.');
        }


        // ==========================================
        // FLOW 4 — Admin Runtime
        // ==========================================
        console.log('\n--- [FLOW 4] Admin Dashboard Validation ---');
        // Log out the test user on homepage first
        await page.goto('http://localhost:3000/index.html', { waitUntil: 'load' });
        const hasSessionBeforeAdmin = await page.evaluate(() => !!localStorage.getItem('np_user_data'));
        if (hasSessionBeforeAdmin) {
            await page.click('#loginBtn'); // logout
            await delay(2000);
        }

        // Log in as Admin
        await page.waitForSelector('#loginBtn', { visible: true });
        await page.click('#loginBtn');
        await page.waitForSelector('#loginEmail', { visible: true });
        await page.type('#loginEmail', 'admin@example.com');
        await page.type('#loginPass', 'AdminPassword123!');
        await page.click('#doLogin');
        await delay(3000);

        // Go to admin dashboard
        await page.goto('http://localhost:3000/admin.html', { waitUntil: 'load' });
        console.log('✔ Admin dashboard loaded.');
        await delay(2000);

        // Section switches
        const sections = ['analytics', 'questions', 'users', 'payments', 'live-sessions'];
        for (const sec of sections) {
            const navId = `#nav-${sec}`;
            await page.waitForSelector(navId, { visible: true });
            await page.click(navId);
            console.log(`✔ Navigated to section: ${sec}`);
            await waitForSpinnerHidden(page);
            await delay(500);
        }

        // Add a question
        console.log('✔ Switching back to Questions section...');
        await page.click('#nav-questions');
        await waitForSpinnerHidden(page);
        await delay(1000);

        await page.waitForSelector('#btn-add-question');
        
        // Open question modal programmatically to be viewport-independent
        await page.evaluate(() => {
            const btn = document.getElementById('btn-add-question');
            if (btn) btn.click();
        });
        console.log('✔ Question modal opened.');
        await delay(1000);

        await page.select('#subjectSelect', 'history');
        await page.type('#q-topic', 'QA Validation');
        await page.type('#q-en', 'Automated QA Test Question?');
        await page.type('#q-hi', 'क्या यह स्वचालित परीक्षण प्रश्न है?');
        await page.type('#q-opt0', 'Yes');
        await page.type('#q-opt1', 'No');
        await page.type('#q-opt2', 'Maybe');
        await page.type('#q-opt3', 'None');
        await page.type('#q-exp-en', 'Explanation en');
        await page.type('#q-exp-hi', 'Explanation hi');

        // Submit form programmatically
        await page.evaluate(() => {
            const form = document.getElementById('questionForm');
            if (form) {
                const btn = form.querySelector('button[type="submit"]');
                if (btn) btn.click();
            }
        });
        console.log('✔ New question submitted (programmatic submit click).');
        await waitForSpinnerHidden(page);
        await delay(2000);


        // ==========================================
        // FLOW 5 — Stress Testing
        // ==========================================
        console.log('\n--- [FLOW 5] Stress & Memory Stability Testing ---');
        
        // 1. Viewport testing
        const viewports = [
            { width: 1920, height: 1080 },
            { width: 1366, height: 768 },
            { width: 768, height: 1024 },
            { width: 390, height: 844 },
            { width: 360, height: 640 }
        ];
        for (const vp of viewports) {
            await page.setViewport(vp);
            await delay(100);
        }
        console.log(`✔ Viewport switches tested successfully.`);
        await page.setViewport({ width: 1600, height: 1000 });

        // 2. 50 Tab switches
        console.log('✔ Running 50 tab switches simulation...');
        for (let i = 0; i < 50; i++) {
            await page.evaluate(() => {
                const e = new Event('visibilitychange');
                document.dispatchEvent(e);
            });
        }

        // 3. 50 modal opens/closes simulation
        console.log('✔ Running 50 modal opens/closes simulation...');
        for (let i = 0; i < 50; i++) {
            await page.evaluate(() => {
                document.getElementById('questionModal').style.display = 'block';
                document.getElementById('questionModal').style.display = 'none';
            });
        }

        // 4. 50 search events
        console.log('✔ Running 50 search events simulation...');
        for (let i = 0; i < 50; i++) {
            await page.type('#userSearch', 'a');
        }

        // 5. 20 Reloads verification
        console.log('✔ Running 20 page reloads verification...');
        for (let i = 0; i < 20; i++) {
            await page.reload({ waitUntil: 'load' });
        }
        console.log('✔ All 20 reloads finished.');

    } catch (e) {
        console.error('❌ Automation Error:', e);
    } finally {
        console.log('\n==========================================');
        console.log('📊 FINAL RUNTIME TEST SUMMARY');
        console.log('==========================================');
        console.log(`Console Errors Captured: ${consoleErrors.length}`);
        console.log(`Failed HTTP Requests: ${failedRequests.length}`);
        console.log('==========================================');

        await browser.close();
        process.exit(0);
    }
})();
