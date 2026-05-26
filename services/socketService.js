const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const Redis = require('ioredis');
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
        if (process.env.REDIS_URL && process.env.ENABLE_REDIS !== 'false') {
            try {
                const opts = {
                    maxRetriesPerRequest: null,
                    retryStrategy: (t) => t > 5 ? null : Math.min(t * 500, 3000),
                };
                this.pubClient = new Redis(process.env.REDIS_URL, opts);
                this.subClient = this.pubClient.duplicate();
                this.pubClient.on('error', (e) => console.error('[Socket] Pub error:', e.message));
                this.subClient.on('error', (e) => console.error('[Socket] Sub error:', e.message));
                this.io.adapter(createAdapter(this.pubClient, this.subClient));
                console.log('[Socket] Redis Adapter enabled (multi-instance mode).');
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

    emitToUser(userId, event, data) { if (this.io) this.io.to(`user:${userId}`).emit(event, data); }
    emitToExam(examId, event, data) { if (this.io) this.io.to(`exam:${examId}`).emit(event, data); }
}

module.exports = new SocketService();
