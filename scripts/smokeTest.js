/**
 * smokeTest.js — NirnayPath Production Smoke Test
 *
 * Usage:
 *   node scripts/smokeTest.js               → spawns its own server on PORT 4005
 *   SMOKE_TARGET_PORT=3000 node scripts/smokeTest.js → hits already-running server (CI / dev mode)
 */
const { spawn } = require('child_process');
const http = require('http');

const TARGET_PORT = parseInt(process.env.SMOKE_TARGET_PORT || '0');
const SPAWN_PORT  = 4005;

const endpoints = [
    { path: '/health',                      expectStatus: 200 },
    { path: '/api/health',                  expectStatus: [200, 404] },
    { path: '/api/questions/history',       expectStatus: [200, 401, 404] },
    { path: '/api/questions/physics',       expectStatus: [200, 401, 404] },
    { path: '/api/questions/computerscience', expectStatus: [200, 401, 404] },
    { path: '/api/admin',                   expectStatus: [200, 401, 403, 404] },
    { path: '/about',                       expectStatus: [200, 301, 302] },
];

const results = [];

function checkPort(port, cb) {
    const tester = http.createServer()
        .once('error', err => { cb(err.code === 'EADDRINUSE'); })
        .once('listening', () => { tester.once('close', () => cb(false)).close(); })
        .listen(port, '0.0.0.0');
}

async function probeEndpoints(port) {
    for (const ep of endpoints) {
        try {
            const res = await fetch(`http://127.0.0.1:${port}${ep.path}`);
            const text = await res.text();
            results.push({ endpoint: ep.path, status: res.status, body: text.substring(0, 120) });
        } catch (e) {
            results.push({ endpoint: ep.path, status: 'FAILED', error: e.message });
        }
    }
}

function isPass(ep, status) {
    if (status === 'FAILED') return false;
    const expected = Array.isArray(ep.expectStatus) ? ep.expectStatus : [ep.expectStatus];
    return expected.includes(status);
}

async function runAgainstExisting(port) {
    console.log(`\n[SMOKE] Targeting already-running server on PORT ${port}...\n`);
    await probeEndpoints(port);
}

async function spawnAndRun() {
    return new Promise((resolve) => {
        const env = {
            ...process.env,
            PORT: SPAWN_PORT.toString(),
            REDIS_URL: '',
            // Forward critical secrets so env validation passes
            JWT_SECRET:            process.env.JWT_SECRET            || 'smoke-test-secret-placeholder',
            REFRESH_TOKEN_SECRET:  process.env.REFRESH_TOKEN_SECRET  || 'smoke-test-refresh-placeholder',
            MONGO_URI:             process.env.MONGO_URI             || 'mongodb://localhost:27017/nirnaypath',
            NODE_ENV:              process.env.NODE_ENV              || 'test',
        };

        console.log(`\n[SMOKE] Spawning server on PORT ${SPAWN_PORT}...`);
        const server = spawn('node', ['app.js'], { env, cwd: __dirname + '/..' });

        server.stdout.on('data', d => process.stdout.write(`[SERVER] ${d}`));
        server.stderr.on('data', d => process.stderr.write(`[SERVER_ERR] ${d}`));

        setTimeout(async () => {
            await probeEndpoints(SPAWN_PORT);
            server.kill('SIGTERM');
            resolve();
        }, 6000);
    });
}

async function main() {
    if (TARGET_PORT > 0) {
        await runAgainstExisting(TARGET_PORT);
    } else {
        const inUse = await new Promise(r => checkPort(SPAWN_PORT, r));
        if (inUse) {
            console.error(`[SMOKE] Port ${SPAWN_PORT} is already in use. Use SMOKE_TARGET_PORT=<port> to target a running server.`);
            process.exit(1);
        }
        await spawnAndRun();
    }

    console.log('\n════════════════ SMOKE TEST RESULTS ════════════════');
    let failed = false;
    for (const r of results) {
        const epDef = endpoints.find(e => e.path === r.endpoint);
        const pass  = isPass(epDef, r.status);
        const mark  = pass ? '✔' : '✖';
        const line  = `${mark} ${r.endpoint.padEnd(45)} → ${r.status}${r.error ? ` (${r.error})` : ''}`;
        if (pass) console.log(line); else { console.error(line); failed = true; }
    }
    console.log('════════════════════════════════════════════════════\n');

    process.exit(failed ? 1 : 0);
}

main();
