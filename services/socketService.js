const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');
const notificationService = require('./notificationService');

/**
 * NirnayPath Real-Time & Anti-Cheat WebSocket Engine
 * Handles live updates, session heartbeats, and competitive sync
 */
class SocketService {
    constructor() {
        this.io = null;
        this.pubClient = null;
        this.subClient = null;
    }

    init(server) {
        this.io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            },
            pingTimeout: 30000,
            pingInterval: 10000
        });

        // Redis Adapter for Clustering Support
        if (process.env.REDIS_URL) {
            this.pubClient = new Redis(process.env.REDIS_URL);
            this.subClient = this.pubClient.duplicate();
            this.io.adapter(createAdapter(this.pubClient, this.subClient));
            console.log('[Socket] Redis Adapter enabled for real-time scale.');
        }

        this.setupMiddleware();
        this.setupEvents();
        
        global.io = this.io; // Export to global for services to broadcast
        return this.io;
    }

    setupMiddleware() {
        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token || socket.handshake.query.token;
            if (!token) return next(new Error('Authentication required'));

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.user = decoded;
                next();
            } catch (err) {
                next(new Error('Invalid token'));
            }
        });
    }

    setupEvents() {
        this.io.on('connection', (socket) => {
            const userId = socket.user.id;
            console.log(`[Socket] User Connected: ${userId} (${socket.id})`);

            // Join personal room for private notifications
            socket.join(`user:${userId}`);

            // 1. Session Heartbeat (Anti-Cheat / Presence)
            socket.on('heartbeat', (data) => {
                // Tracking live presence to prevent multi-tab/device overlap
                socket.emit('heartbeat_ack', { timestamp: Date.now() });
            });

            // 2. Competitive Exam Sync
            socket.on('join_exam', (examId) => {
                socket.join(`exam:${examId}`);
                console.log(`[Socket] User ${userId} joined exam room: ${examId}`);
            });

            // 3. Anti-Cheat: Tab Activity Alerts (Relayed from Client)
            socket.on('anti_cheat_event', (data) => {
                console.warn(`[Anti-Cheat] Activity detected for User ${userId}:`, data.type);
                notificationService.sendCheatWarning(userId, data.type);
            });

            socket.on('disconnect', () => {
                console.log(`[Socket] User Disconnected: ${userId}`);
            });
        });
    }

    /**
     * Broadcast XP/Streak updates to specific user
     */
    emitToUser(userId, event, data) {
        if (this.io) {
            this.io.to(`user:${userId}`).emit(event, data);
        }
    }

    /**
     * Broadcast live leaderboard updates to exam rooms
     */
    emitToExam(examId, event, data) {
        if (this.io) {
            this.io.to(`exam:${examId}`).emit(event, data);
        }
    }
}

module.exports = new SocketService();
