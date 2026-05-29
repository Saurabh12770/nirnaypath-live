const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const jwt = require('jsonwebtoken');
const notificationService = require('./notificationService');

class SocketService {
    constructor() {
        this.io = null;
        this.pubClient = null;
        this.subClient = null;
    }

    init(server) {
        this.io = new Server(server, {
            cors: { origin: '*', methods: ['GET', 'POST'] },
            pingTimeout: 30000,
            pingInterval: 10000,
        });

        // Redis Adapter — optional, falls back to single-instance mode gracefully
        const { getRedisClient, isRedisAvailable } = require('./redisService');
        if (isRedisAvailable()) {
            try {
                this.pubClient = getRedisClient();
                this.subClient = this.pubClient.duplicate();
                this.subClient.on('error', (e) => console.error('[Socket] Sub error:', e.message));
                this.io.adapter(createAdapter(this.pubClient, this.subClient));
                console.log('[Socket] Redis Adapter enabled (multi-instance mode using shared singleton).');
            } catch (err) {
                console.error('[Socket] Redis Adapter failed, using single-instance:', err.message);
            }
        } else {
            console.log('[Socket] Single-instance mode (no Redis adapter).');
        }

        this.setupMiddleware();
        this.setupEvents();
        global.io = this.io;
        return this.io;
    }

    setupMiddleware() {
        this.io.use((socket, next) => {
            let token = socket.handshake.auth.token || socket.handshake.query.token;
            
            // Extract from cookie if not explicitly sent in auth/query payload (for HttpOnly cookies)
            if (!token && socket.handshake.headers.cookie) {
                socket.handshake.headers.cookie.split(';').forEach(cookie => {
                    let [name, ...rest] = cookie.split('=');
                    name = name.trim();
                    if (name === 'token') {
                        token = decodeURIComponent(rest.join('=').trim());
                    }
                });
            }

            if (!token) return next(new Error('Authentication required'));
            try {
                socket.user = jwt.verify(token, process.env.JWT_SECRET);
                next();
            } catch {
                next(new Error('Invalid token'));
            }
        });
    }

    setupEvents() {
        this.io.on('connection', (socket) => {
            const userId = socket.user?.id;
            socket.join(`user:${userId}`);
            socket.on('heartbeat', () => socket.emit('heartbeat_ack', { timestamp: Date.now() }));
            socket.on('join_exam', (examId) => socket.join(`exam:${examId}`));
            socket.on('anti_cheat_event', (data) => {
                console.warn(`[Anti-Cheat] User ${userId}:`, data?.type);
                try { notificationService.sendCheatWarning(userId, data?.type); } catch {}
            });
            socket.on('disconnect', () => console.log(`[Socket] Disconnected: ${userId}`));
        });
    }

    async close() {
        if (this.io) {
            console.log('[Socket] Disconnecting all WebSocket clients and shutting down server...');
            try {
                this.io.disconnectSockets(true);
            } catch (err) {
                console.error('[Socket] Error disconnecting clients:', err.message);
            }
            await new Promise((resolve) => this.io.close(resolve));
            this.io = null;
        }
        if (this.subClient) {
            try {
                await this.subClient.quit();
            } catch (_) {}
            this.subClient = null;
        }
    }

    emitToUser(userId, event, data) { if (this.io) this.io.to(`user:${userId}`).emit(event, data); }
    emitToExam(examId, event, data) { if (this.io) this.io.to(`exam:${examId}`).emit(event, data); }
}

module.exports = new SocketService();
