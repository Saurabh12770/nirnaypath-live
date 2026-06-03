const puppeteer = require('c:/Users/SAURABH KUMAR/Desktop/NirnayPath/node_modules/puppeteer');

(async () => {
    console.log('Launching browser to debug requests...');
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    page.on('console', msg => {
        console.log(`[BROWSER CONSOLE] [${msg.type()}] ${msg.text()}`);
    });

    page.on('pageerror', err => {
        console.error('[BROWSER ERROR]', err);
    });

    page.on('response', response => {
        const status = response.status();
        const url = response.url();
        if (status >= 400) {
            console.log(`[HTTP ERROR] ${status} - ${url}`);
        } else {
            console.log(`[HTTP SUCCESS] ${status} - ${url}`);
        }
    });

    try {
        await page.goto('http://localhost:3000/index.html', { waitUntil: 'domcontentloaded' });
        console.log('Page loaded under domcontentloaded.');
        await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (err) {
        console.error('Navigation error:', err);
    } finally {
        await browser.close();
        console.log('Browser closed.');
    }
})();
