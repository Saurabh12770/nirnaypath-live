const mongoose = require('mongoose');
const { initRedis, isRedisAvailable, getRedisClient } = require('../services/redisService');
const dotenv = require('dotenv');
const path = require('path');
const os = require('os');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function runForensics() {
    console.log('====================================================');
    console.log('🔍 NIRNAYPATH PRODUCTION STARTUP FORENSICS');
    console.log('====================================================');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Node Version: ${process.version}`);
    console.log(`OS: ${process.platform} (${os.release()})`);
    console.log(`Memory Usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB / ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`);
    console.log('----------------------------------------------------');

    // 1. ENV Integrity Check
    console.log('[ENV] Checking critical environment variables...');
    const criticalVars = ['MONGO_URI', 'PORT', 'NODE_ENV'];
    criticalVars.forEach(v => {
        if (process.env[v]) {
            console.log(`✅ ${v}: PRESENT`);
        } else {
            console.log(`❌ ${v}: MISSING`);
        }
    });

    const optionalVars = ['REDIS_URL', 'ENABLE_REDIS', 'ENABLE_QUEUE', 'ENABLE_WORKERS'];
    optionalVars.forEach(v => {
        console.log(`ℹ️  ${v}: ${process.env[v] || 'NOT SET'}`);
    });
    console.log('----------------------------------------------------');

    // 2. MongoDB Connectivity
    console.log('[MONGO] Testing connection...');
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath';
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ MongoDB: CONNECTED');
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ MongoDB: FAILED', { error: err.message });
    }
    console.log('----------------------------------------------------');

    // 3. Redis Connectivity
    console.log('[REDIS] Testing connection...');
    if (process.env.ENABLE_REDIS === 'false') {
        console.log('ℹ️  Redis: DISABLED via ENABLE_REDIS');
    } else {
        try {
            const client = initRedis();
            if (client) {
                // Wait a bit for connection
                await new Promise(resolve => setTimeout(resolve, 2000));
                if (isRedisAvailable()) {
                    console.log('✅ Redis: CONNECTED AND READY');
                    const info = await client.info();
                    const version = info.match(/redis_version:([0-9.]+)/)?.[1];
                    console.log(`   Version: ${version || 'Unknown'}`);
                } else {
                    console.log('⚠️  Redis: CLIENT CREATED BUT NOT READY (Timeout)');
                }
                client.disconnect();
            } else {
                console.log('❌ Redis: FAILED TO CREATE CLIENT');
            }
        } catch (err) {
            console.error('❌ Redis: FATAL ERROR', { error: err.message });
        }
    }
    console.log('----------------------------------------------------');

    // 4. Port Binding Check
    console.log('[NETWORK] Checking port availability...');
    const PORT = process.env.PORT || 3000;
    const http = require('http');
    const server = http.createServer();
    try {
        await new Promise((resolve, reject) => {
            server.on('error', (e) => {
                if (e.code === 'EADDRINUSE') {
                    console.log(`❌ PORT ${PORT}: ALREADY IN USE`);
                    reject(e);
                } else {
                    reject(e);
                }
            });
            server.listen(PORT, '0.0.0.0', () => {
                console.log(`✅ PORT ${PORT}: AVAILABLE`);
                server.close(resolve);
            });
        });
    } catch (err) {
        if (err.code !== 'EADDRINUSE') {
            console.log(`❌ PORT ${PORT}: FAILED TO BIND`, { error: err.message });
        }
    }
    console.log('----------------------------------------------------');

    console.log('🏁 Forensics Complete.');
    console.log('====================================================');
    process.exit(0);
}

runForensics().catch(err => {
    console.error('Forensics script failed:', err);
    process.exit(1);
});
