const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    // Log in to get the token
    await page.goto('http://localhost:3000/index.html', { waitUntil: 'networkidle2' });
    await page.waitForSelector('#loginBtn', { visible: true });
    await page.click('#loginBtn');
    await page.waitForSelector('#loginEmail', { visible: true });
    await page.type('#loginEmail', 'admin@example.com');
    await page.type('#loginPass', 'AdminPassword123!');
    await page.click('#doLogin');
    await new Promise(r => setTimeout(r, 2000));
    
    // Fetch telemetry overview
    const telemetryData = await page.evaluate(async () => {
        const userData = JSON.parse(localStorage.getItem('np_user_data') || '{}');
        const token = userData.token || '';
        const res = await fetch('/api/telemetry/overview', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        return await res.json();
    });
    
    console.log(JSON.stringify(telemetryData, null, 2));
    
    await browser.close();
    process.exit(0);
})();
