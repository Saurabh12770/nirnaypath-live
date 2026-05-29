const puppeteer = require('puppeteer');

(async () => {
    console.log('🏁 STARTING LEGACY SUBMIT MODAL VALIDATION...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1000 });

    const logs = [];
    page.on('console', msg => {
        const text = msg.text();
        logs.push(text);
        console.log('[BROWSER]', text);
    });
    page.on('pageerror', err => {
        console.error('[BROWSER EXCEPTION]', err.message);
    });
    
    // Dialog handler to automatically accept alerts/confirms
    page.on('dialog', async dialog => {
        console.log('💬 Dialog Alert/Confirm:', dialog.message());
        await dialog.accept();
    });

    try {
        console.log('Navigating to homepage...');
        await page.goto('http://localhost:3000/index.html', { waitUntil: 'domcontentloaded' });
        
        // Wait for Auth module to finish async initialization and bind event listeners
        console.log('Waiting for Auth event listeners to bind...');
        await page.waitForFunction(() => typeof Auth !== 'undefined' && Auth.eventListenersSetup === true, { timeout: 15000 });
        console.log('✔ Auth module initialized.');

        // Log in as test user
        console.log('Opening login modal...');
        await page.waitForSelector('#loginBtn', { visible: true });
        await page.click('#loginBtn');
        
        await page.waitForSelector('#loginEmail', { visible: true });
        await page.type('#loginEmail', 'admin@example.com');
        await page.type('#loginPass', 'AdminPassword123!');
        await page.click('#doLogin');
        
        console.log('Logging in...');
        await page.waitForFunction(() => !!localStorage.getItem('np_user_data'), { timeout: 10000 });
        console.log('✔ Logged in successfully.');
        
        // Reload homepage so we are fully initialized as logged in
        await page.goto('http://localhost:3000/index.html', { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => typeof Auth !== 'undefined' && Auth.eventListenersSetup === true, { timeout: 10000 });
        await delay(1000);

        // Call startTest directly
        console.log('Starting a mock test programmatically...');
        await page.evaluate(() => {
            if (typeof startTest === 'function') {
                startTest('QA History Test', 'history', 5, 5);
            } else {
                throw new Error('startTest is not a function');
            }
        });
        
        // Wait for exam engine to become active
        console.log('Waiting for exam engine view...');
        await page.waitForSelector('#exam-engine', { visible: true, timeout: 15000 });
        
        // Wait for questions to load
        await page.waitForFunction(() => {
            const el = document.getElementById('q-text');
            return el && el.textContent !== 'Loading...';
        }, { timeout: 10000 });
        console.log('✔ Test loaded.');

        // Select an option for the first question
        await page.waitForSelector('.option-row', { visible: true });
        const options = await page.$$('.option-row');
        if (options.length > 0) {
            await options[0].click();
            console.log('✔ Answered first question option.');
        }

        // Click "Save & Next"
        await page.click('#btn-next');
        console.log('✔ Save & Next clicked.');
        
        // Wait for second question
        await page.waitForFunction(() => {
            const qno = document.getElementById('q-no');
            return qno && qno.textContent === '2';
        });
        
        console.log('Verifying submission confirmation modal presence...');
        await page.waitForSelector('#btn-submit', { visible: true });
        await page.click('#btn-submit');
        console.log('✔ Submit button clicked.');
        
        // Verify submit confirmation modal is flex
        const isModalVisible = await page.evaluate(() => {
            const modal = document.getElementById('submit-confirm-modal');
            return modal && window.getComputedStyle(modal).display === 'flex';
        });
        console.log('✔ Submit confirmation modal visible:', isModalVisible);
        
        if (!isModalVisible) {
            throw new Error('Submit modal is not visible!');
        }

        // Verify stats are populated
        const statsHtml = await page.evaluate(() => document.getElementById('submit-modal-stats').innerHTML);
        console.log('✔ Stats content:\n', statsHtml);
        if (!statsHtml.includes('Total Questions') || !statsHtml.includes('Answered')) {
            throw new Error('Stats were not populated correctly!');
        }

        // Click cancel
        console.log('Clicking cancel button...');
        await page.click('#submit-modal-cancel');
        
        // Verify modal closed
        const isModalHidden = await page.evaluate(() => {
            const modal = document.getElementById('submit-confirm-modal');
            return modal && window.getComputedStyle(modal).display === 'none';
        });
        console.log('✔ Submit confirmation modal closed on cancel:', isModalHidden);
        if (!isModalHidden) {
            throw new Error('Submit modal did not close on cancel!');
        }

        // Click submit again
        await page.click('#btn-submit');
        await page.waitForSelector('#submit-modal-confirm', { visible: true });
        
        // Click confirm
        console.log('Clicking confirm submit button...');
        await page.click('#submit-modal-confirm');
        
        // Wait for result screen
        console.log('Waiting for result screen...');
        await page.waitForSelector('#result-screen', { visible: true, timeout: 15000 });
        console.log('✔ Result screen loaded successfully. Test submission workflow works perfectly!');

    } catch (err) {
        console.error('❌ Validation Failed:', err);
    } finally {
        await browser.close();
        process.exit(0);
    }
})();

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
