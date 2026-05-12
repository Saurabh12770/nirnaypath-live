const { io } = require('socket.io-client');
const axios = require('axios');

async function testSocket() {
    console.log('--- SOCKET FORENSIC AUDIT ---');
    
    const BASE_URL = 'http://localhost:3000/api';
    
    try {
        // 1. Get Token
        console.log('[Auth] Logging in...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'pre_audit@nirnaypath.test',
            password: 'TestPass123!'
        });
        const token = loginRes.data.token;
        console.log('[Auth] Token acquired.');

        // 2. Connect Socket
        console.log('[Socket] Connecting...');
        const socket = io('http://localhost:3000', {
            auth: { token }
        });

        socket.on('connect', () => {
            console.log(`[Socket] Connected with ID: ${socket.id}`);
            
            // 3. Test Room Join
            console.log('[Socket] Joining exam room...');
            socket.emit('join_exam', 'test-exam-123');
            
            // 4. Test Heartbeat
            console.log('[Socket] Sending heartbeat...');
            socket.emit('heartbeat', { status: 'active' });
        });

        socket.on('heartbeat_ack', (data) => {
            console.log('[Socket] Heartbeat ACK received:', data);
            console.log('✅ PASS: Socket connection and event cycle validated.');
            socket.disconnect();
            process.exit(0);
        });

        socket.on('connect_error', (err) => {
            console.error('[Socket] Connection Error:', err.message);
            process.exit(1);
        });

        setTimeout(() => {
            console.error('❌ FAIL: Socket test timed out.');
            process.exit(1);
        }, 5000);

    } catch (err) {
        console.error('❌ FAIL: Socket test setup failed:', err.message);
        process.exit(1);
    }
}

testSocket();
