/**
 * NirnayPath Real-Time & Anti-Cheat Frontend Engine
 * Handles Socket.IO connection, heartbeats, and activity monitoring
 */
const RealTime = {
    socket: null,
    heartbeatInterval: null,
    examActive: false,

    init() {
        if (!Auth.isLoggedIn()) return;
        if (typeof io === 'undefined') {
            console.warn('[RealTime] socket.io not available, skipping connection.');
            return;
        }

        console.log('[RealTime] Connecting to engine...');
        const token = Auth.getToken();
        const config = {
            transports: ['websocket']
        };
        if (token) {
            config.auth = { token };
        }
        this.socket = io(config);

        this.setupListeners();
        this.startHeartbeat();
    },

    setupListeners() {
        this.socket.on('connect', () => {
            console.log('[RealTime] Online');
        });

        this.socket.on('notification', (data) => {
            window.showToast(data.message, data.type === 'warning' ? 'var(--danger)' : 'var(--primary)');
            if (data.type === 'warning') {
                this.shakeExamContainer();
            }
        });

        this.socket.on('heartbeat_ack', (data) => {
            // Server is alive and tracking us
        });

        this.socket.on('disconnect', () => {
            console.warn('[RealTime] Offline. Attempting reconnect...');
        });

        // --- Anti-Cheat Events ---
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.examActive) {
                this.reportActivity('tab_switch');
            }
        });

        window.addEventListener('blur', () => {
            if (this.examActive) {
                this.reportActivity('window_blur');
            }
        });

        document.addEventListener('copy', (e) => {
            if (this.examActive) {
                e.preventDefault();
                this.reportActivity('copy_attempt');
                window.showToast('Copying is disabled during exams.', 'var(--danger)');
            }
        });

        document.addEventListener('paste', (e) => {
            if (this.examActive) {
                e.preventDefault();
                this.reportActivity('paste_attempt');
            }
        });
    },

    startHeartbeat() {
        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = setInterval(() => {
            if (this.socket?.connected) {
                this.socket.emit('heartbeat', {
                    examActive: this.examActive,
                    timestamp: Date.now()
                });
            }
        }, 10000);
    },

    reportActivity(type) {
        if (this.socket?.connected) {
            this.socket.emit('anti_cheat_event', {
                type,
                timestamp: Date.now(),
                url: window.location.href
            });
        }
    },

    setExamActive(active, examId = null) {
        this.examActive = active;
        if (active && examId) {
            this.socket.emit('join_exam', examId);
            document.body.classList.add('exam-active');
        } else {
            document.body.classList.remove('exam-active');
        }
    },

    shakeExamContainer() {
        const container = document.getElementById('exam-engine');
        if (container) {
            container.classList.add('shake-anim');
            setTimeout(() => container.classList.remove('shake-anim'), 500);
        }
    }
};

// Initialize inside AppLifecycle with retry/timeout for socket.io availability
AppLifecycle.register(() => {
    let attempts = 0;
    const maxAttempts = 30; // 3 seconds timeout (30 * 100ms)
    
    const tryInitRealtime = () => {
        if (typeof io !== 'undefined') {
            if (Auth.isLoggedIn()) {
                RealTime.init();
            }
        } else if (attempts < maxAttempts) {
            attempts++;
            setTimeout(tryInitRealtime, 100);
        } else {
            console.warn('[RealTime] socket.io client failed to load within 3s. Operating in standalone mode.');
        }
    };
    tryInitRealtime();
});
