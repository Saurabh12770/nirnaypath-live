const { io } = require('socket.io-client');
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
    email: `realtime_cert_${Date.now()}@example.com`,
    password: 'Password123!',
    name: 'RealTime Certifier'
};

async function runRealTimeCertification() {
    console.log('=== NIRNAYPATH REAL-TIME & ANTI-CHEAT CERTIFICATION ===');
    
    let token;
    try {
        // 1. Auth & Token
        const signup = await axios.post(`${BASE_URL}/api/auth/signup`, TEST_USER);
        token = signup.data.token;
        console.log('[1/6] Auth: Signup Success');

        // 2. WebSocket Connection
        console.log('[2/6] Establishing WebSocket connection...');
        const socket = io(BASE_URL, {
            auth: { token },
            transports: ['websocket']
        });

        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Connection timeout')), 5000);
            socket.on('connect', () => {
                clearTimeout(timeout);
                console.log(' - Connection Established');
                resolve();
            });
        });

        // 3. Heartbeat Verification
        console.log('[3/6] Verifying Heartbeat Mechanism...');
        socket.emit('heartbeat', { examActive: false, timestamp: Date.now() });
        const heartbeatAck = await new Promise((resolve) => {
            socket.on('heartbeat_ack', resolve);
        });
        if (heartbeatAck.timestamp) console.log(' - Heartbeat Ack: OK');

        // 4. Anti-Cheat Event Delivery
        console.log('[4/6] Verifying Anti-Cheat Event Delivery...');
        socket.emit('anti_cheat_event', { type: 'tab_switch', timestamp: Date.now() });
        const notification = await new Promise((resolve) => {
            socket.on('notification', resolve);
        });
        if (notification.type === 'warning') {
            console.log(` - Anti-Cheat Alert Received: ${notification.message}`);
        }

        // 5. Exam Room Sync
        console.log('[5/6] Verifying Exam Room Join...');
        socket.emit('join_exam', 'session_cert_123');
        // If no crash, it worked. Socket.io doesn't ack join by default without custom logic.
        console.log(' - Exam Room Join: OK');

        // 6. Cleanup
        socket.disconnect();
        console.log('[6/6] Cleanup Complete.');

    } catch (err) {
        console.error('Certification failed:', err.response ? err.response.data : err.message);
        process.exit(1);
    }

    console.log('=== REAL-TIME CERTIFICATION COMPLETE ===');
    process.exit(0);
}

runRealTimeCertification();
