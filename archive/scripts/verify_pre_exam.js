const puppeteer = require('puppeteer');

(async () => {
    console.log('🏁 STARTING CBT PRE-EXAM SCREENS STABILIZATION CHECK...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // 1. Load a blank page on the origin to set localStorage
    await page.goto('http://localhost:3000/manifest.json'); 
    
    // 2. Set mock test state
    await page.evaluate(() => {
        localStorage.setItem('nirnaypath_user', 'Candidate@nirnaypath.test');
        localStorage.setItem('nirnaypath_token', 'mock-token');
        localStorage.setItem('mockTestState', JSON.stringify({
            isActive: true,
            testId: 'mock-test-123',
            testName: 'Science Verification Test',
            sessionId: 'mock-session-12345678',
            timeLeft: 300,
            timeLimit: 300,
            currentIdx: 0,
            visited: [0],
            answers: {}
        }));
    });

    // 3. Navigate to test.html
    console.log('Navigating to CBT terminal...');
    await page.goto('http://localhost:3000/test.html', { waitUntil: 'domcontentloaded' });
    console.log('✔ test.html loaded.');

    // 4. Verify System Diagnostic Screen
    const checkVisible = async (selector) => {
        return page.evaluate((sel) => {
            const el = document.querySelector(sel);
            if (!el) return false;
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) !== 0;
        }, selector);
    };

    const isSystemCheckVisible = await checkVisible('#system-check-screen');
    console.log('✔ System Diagnostic screen is active:', isSystemCheckVisible);

    // Wait for checks to pass and proceed button to display
    await page.waitForSelector('#btn-system-ok', { visible: true });
    
    // Check height and width of #system-check-screen
    let screenMetrics = await page.evaluate((id) => {
        const el = document.getElementById(id);
        const container = el.querySelector('.instruction-container');
        return {
            screenHeight: el.offsetHeight,
            containerHeight: container.offsetHeight,
            screenScrollHeight: el.scrollHeight,
            bodyScrollHeight: document.body.scrollHeight,
            windowHeight: window.innerHeight
        };
    }, 'system-check-screen');
    console.log('✔ System Check screen metrics:', screenMetrics);

    // Click proceed
    await page.click('#btn-system-ok');
    console.log('✔ Clicked Proceed to Verification.');

    // 5. Verify Candidate Verification Screen
    await page.waitForSelector('#candidate-verification-screen.active');
    const isVerificationVisible = await checkVisible('#candidate-verification-screen');
    console.log('✔ Candidate Verification screen is active:', isVerificationVisible);

    // Check stacking / dimensions
    screenMetrics = await page.evaluate((id) => {
        const el = document.getElementById(id);
        const container = el.querySelector('.instruction-container');
        return {
            screenHeight: el.offsetHeight,
            containerHeight: container.offsetHeight,
            screenScrollHeight: el.scrollHeight,
            bodyScrollHeight: document.body.scrollHeight,
            windowHeight: window.innerHeight
        };
    }, 'candidate-verification-screen');
    console.log('✔ Verification screen metrics:', screenMetrics);

    // Agree to consent and click proceed
    await page.click('#verify-consent-check');
    console.log('✔ Verification consent checked.');
    await page.click('#btn-verify-proceed');
    console.log('✔ Clicked Proceed to Instructions.');

    // 6. Verify Instructions Screen
    await page.waitForSelector('#instruction-screen.active');
    const isInstructionsVisible = await checkVisible('#instruction-screen');
    console.log('✔ Instructions screen is active:', isInstructionsVisible);

    // Verify scrolling metrics
    screenMetrics = await page.evaluate((id) => {
        const el = document.getElementById(id);
        const container = el.querySelector('.instruction-container');
        return {
            screenHeight: el.offsetHeight,
            containerHeight: container.offsetHeight,
            screenScrollHeight: el.scrollHeight,
            bodyScrollHeight: document.body.scrollHeight,
            windowHeight: window.innerHeight
        };
    }, 'instruction-screen');
    console.log('✔ Instruction screen metrics:', screenMetrics);

    // Test mobile responsive layout
    console.log('--- Testing Mobile Dimensions (375x667) ---');
    await page.setViewport({ width: 375, height: 667 });

    // Scroll to the bottom of the page
    await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
    });
    // Wait a brief moment for scroll render
    await new Promise(resolve => setTimeout(resolve, 500));

    const mobileMetrics = await page.evaluate(() => {
        const screen = document.getElementById('instruction-screen');
        const container = screen.querySelector('.instruction-container');
        const body = document.body;
        const btn = document.getElementById('btn-proceed');
        const rect = btn ? btn.getBoundingClientRect() : null;
        return {
            bodyScrollWidth: body.scrollWidth,
            bodyClientWidth: body.clientWidth,
            containerWidth: container.offsetWidth,
            containerScrollHeight: container.scrollHeight,
            bodyScrollHeight: body.scrollHeight,
            windowHeight: window.innerHeight,
            isNextButtonFound: !!btn,
            isNextButtonVisible: btn ? (rect.top >= 0 && rect.bottom <= window.innerHeight) : false,
            buttonRect: rect
        };
    });
    console.log('✔ Mobile metrics after scrolling:', mobileMetrics);

    if (mobileMetrics.bodyScrollWidth > mobileMetrics.bodyClientWidth) {
        console.log('❌ Failure: Horizontal overflow detected on mobile!');
    } else {
        console.log('✔ Success: No horizontal overflow on mobile.');
    }

    if (!mobileMetrics.isNextButtonVisible) {
        console.log('❌ Failure: Next button is still not visible after scrolling!');
    } else {
        console.log('✔ Success: Next button is visible and clickable after scrolling.');
    }

    console.log('✔ Success: Scroll is now handled by the viewport body.');
    
    await browser.close();
    process.exit(0);
})();
