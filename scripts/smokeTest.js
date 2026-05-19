const { spawn } = require('child_process');
const http = require('http');

const PORT = 4005;
const endpoints = [
    '/api/health',
    '/api/questions/history',
    '/api/questions/physics',
    '/api/questions/computerscience',
    '/api/admin',
    '/about'
];

const results = [];

function checkPort(port, cb) {
    const tester = http.createServer()
        .once('error', err => {
            if (err.code === 'EADDRINUSE') {
                cb(true);
            } else {
                cb(false);
            }
        })
        .once('listening', () => {
            tester.once('close', () => cb(false)).close();
        })
        .listen(port, '0.0.0.0');
}

async function smokeTest() {
    return new Promise((resolve) => {
        const env = { ...process.env, PORT: PORT.toString(), REDIS_URL: '' };
        const server = spawn('node', ['app.js'], { env, cwd: __dirname + '/..' });
        
        server.stdout.on('data', data => console.log(`[SERVER] ${data.toString().trim()}`));
        server.stderr.on('data', data => console.error(`[SERVER_ERR] ${data.toString().trim()}`));
        
        // Give server 5 seconds to boot
        setTimeout(async () => {
            for (const ep of endpoints) {
                try {
                    const res = await fetch(`http://127.0.0.1:${PORT}${ep}`);
                    const text = await res.text();
                    results.push({ endpoint: ep, status: res.status, body: text.substring(0, 100) });
                } catch (e) {
                    results.push({ endpoint: ep, status: 'FAILED', error: e.message });
                }
            }
            server.kill();
            resolve(results);
        }, 5000);
    });
}

checkPort(PORT, async (inUse) => {
    if (inUse) {
        console.error(`Port ${PORT} is in use. Exiting.`);
        process.exit(1);
    }
    
    console.log(`Starting smoke tests on PORT ${PORT}...`);
    const res = await smokeTest();
    console.log('\n--- SMOKE TEST RESULTS ---');
    console.log(JSON.stringify(res, null, 2));
    
    let failed = false;
    for (const r of res) {
        if (r.status === 'FAILED' || r.status >= 500) {
            console.error(`[FAIL] ${r.endpoint} returned ${r.status}`);
            failed = true;
        } else {
            console.log(`[PASS] ${r.endpoint} returned ${r.status}`);
        }
    }
    
    if (failed) {
        process.exit(1);
    } else {
        process.exit(0);
    }
});
