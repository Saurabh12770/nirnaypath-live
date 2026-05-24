const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
    page.on('requestfailed', request => console.log('BROWSER REQUEST FAILED:', request.url(), request.failure().errorText));

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    console.log('Page loaded. Clicking login button...');
    await page.click('#loginBtn');
    
    const isVisible = await page.evaluate(() => {
        const modal = document.getElementById('loginModal');
        return modal && window.getComputedStyle(modal).display !== 'none';
    });
    
    console.log('Login Modal Visible:', isVisible);
    await browser.close();
})();
