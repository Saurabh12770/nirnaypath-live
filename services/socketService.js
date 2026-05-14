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

        // Redis Adapter for Clustering Support
        if (process.env.REDIS_URL && process.env.ENABLE_REDIS !== 'false') {
            try {
                this.pubClient = new Redis(process.env.REDIS_URL, {
                    maxRetriesPerRequest: null,
                    retryStrategy: (times) => Math.min(times * 100, 3000)
                });
                
                this.pubClient.on('error', (err) => {
                    console.error('[Socket] Redis PubClient Error:', err.message);
                });

                this.subClient = this.pubClient.duplicate();
                this.subClient.on('error', (err) => {
                    console.error('[Socket] Redis SubClient Error:', err.message);
                });

                this.io.adapter(createAdapter(this.pubClient, this.subClient));
                console.log('[Socket] Redis Adapter enabled for real-time scale.');
            } catch (err) {
                console.error('[Socket] Failed to initialize Redis Adapter:', err.message);
            }
        }
        }

        this.setupMiddleware();
        this.setupEvents();
        global.io = this.io;
        return this.io;
    }

    setupMiddleware() {
        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token || socket.handshake.query.token;
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
