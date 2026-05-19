const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const cluster = require('cluster');
const os = require('os');
const mongoose = require('mongoose');
const crypto = require('crypto');
const http = require('http');
const context = require('./utils/context');
const socketService = require('./services/socketService');
const CrashReportingService = require('./services/crashReportingService');
const ArchitectureLockService = require('./services/ArchitectureLockService');


dotenv.config();

const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const testRoutes = require('./routes/test');
const leaderboardRoutes = require('./routes/leaderboard');
const drillRoutes = require('./routes/drills');
const sectionRoutes = require('./routes/section');
const pushRoutes = require('./routes/push');
const paymentRoutes = require('./routes/payment');
const adminRoutes = require('./routes/admin');
const chatRoutes = require('./routes/chat');
const pagesRoutes = require('./routes/pages');
const analyticsRoutes = require('./routes/analytics');
const learningRoutes = require('./routes/learning');
const healthRoutes = require('./routes/health');
const liveRoutes = require('./routes/live');
const liveAdminRoutes = require('./routes/liveAdmin');
const auth = require('./middleware/auth');
const adminAuth = require('./middleware/adminAuth');
const { initCronJobs } = require('./services/cronService');
const { initWorkers, shutdownWorkers } = require('./services/workerService');
const User = require('./models/user');

async function autoPromoteAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;
    try {
        const user = await User.findOne({ email: adminEmail.toLowerCase() });
        if (user) {
            if (user.role !== 'admin') {
                user.role = 'admin';
                await user.save();
                console.log(`[Admin] User ${adminEmail} promoted to admin.`);
            } else {
                console.log(`[Admin] ${adminEmail} is already an admin.`);
            }
        } else {
            console.log(`[Admin] No user found with email ${adminEmail}. Sign up first, then redeploy.`);
        }
    } catch (err) {
        console.error('[Admin] Auto-promote error:', err.message);
    }
}


// Initialize app
const app = express();
CrashReportingService.init(app);

// Trust proxy for production (needed for rate limiting and HTTPS behind proxies like Railway/Render)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath')
    .then(async () => {
        console.log('Connected to MongoDB');
        await autoPromoteAdmin();
    })
    .catch(err => console.error('MongoDB connection error:', err));

const isProduction = process.env.NODE_ENV === 'production';

// Security Headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://checkout.razorpay.com", "https://cdn.razorpay.com", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https://ui-avatars.com"],
            connectSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com", "https://cdn.razorpay.com", "https://ui-avatars.com"],
            frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
            upgradeInsecureRequests: [],
        },
    },
    hsts: isProduction,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://nirnaypath-live-production.up.railway.app' 
    : 'http://localhost:8080',
  credentials: true
}));

// PHASE 5: Capture raw body buffer for webhook HMAC verification.
// MUST be registered BEFORE express.json() so the raw bytes are available.
// The webhook route reads req.rawBody; all other routes use req.body as normal.
app.use((req, res, next) => {
    if (req.path === '/api/payment/webhook') {
        let data = [];
        req.on('data', chunk => data.push(chunk));
        req.on('end', () => {
            req.rawBody = Buffer.concat(data);
            // Also parse as JSON so req.body works in the handler
            try {
                req.body = JSON.parse(req.rawBody.toString('utf8'));
            } catch (e) {
                req.body = {};
            }
            next();
        });
        req.on('error', next);
    } else {
        next();
    }
});
app.use(express.json({ limit: '1mb' }));

// 1. Context Tracking Middleware (Senior Engineer Implementation)
app.use((req, res, next) => {
    const requestId = req.get('X-Request-ID') || crypto.randomUUID();
    res.setHeader('X-Request-ID', requestId);
    context.run({ requestId, startTime: Date.now() }, next);
});

app.use(compression());
app.use(morgan(isProduction ? 'combined' : 'dev'));

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
});

// Debug logger only in development (morgan already covers production logging above)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`[DEBUG] ${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
        next();
    });
}

// Set up simple versioning middleware for static views
app.use((req, res, next) => {
    res.locals.assetVersion = process.env.ASSET_VERSION || '1.0.0';
    next();
});

// Serve static files with caching
// HTML files get short cache, assets get long cache
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath, {
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes for HTML
        } else {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year for CSS/JS/Images
        }
    }
}));

// Chaos Engineering Middleware (Failure Injection)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        // 1. Latency Injection
        const delay = req.get('X-Chaos-Delay');
        if (delay) {
            return setTimeout(next, parseInt(delay));
        }

        // 2. DB Failure Simulation
        if (req.get('X-Chaos-DB-Down')) {
            return res.status(503).json({ error: 'Chaos Simulation: Database Unavailable' });
        }

        next();
    });
}

const { generalLimiter } = require('./middleware/rateLimiter');
app.use('/api/', generalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/test', testRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/drill', drillRoutes);
app.use('/api/section', sectionRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/admin/live-sessions', liveAdminRoutes);
app.use('/api', apiRoutes);
app.get('/admin', auth, adminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin.html'));
});

app.use('/', pagesRoutes);


// Sentry error handler registered before other error handlers
CrashReportingService.registerErrorHandler(app);

// 404 Handler for API routes
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    CrashReportingService.captureException(err, {
        category: 'http_error_handler',
        url: req.url,
        method: req.method,
        ip: req.ip
    });
    res.status(500).json({ error: 'Internal Server Error' });
});

// Create HTTP Server
const server = http.createServer(app);

// Initialize WebSocket Engine
socketService.init(server);

// Bind to 0.0.0.0 to allow access via IP addresses
const PORT = process.env.PORT || 3000;

/**
 * BOOT SEQUENCE STABILIZATION
 * Express MUST boot first to satisfy Railway/K8s health checks
 */
server.listen(PORT, '0.0.0.0', () => {
    console.log('====================================================');
    console.log(`[BOOT] NirnayPath Platform v1.0.0`);
    console.log(`[BOOT] Status: ONLINE`);
    console.log(`[BOOT] Port: ${PORT}`);
    console.log(`[BOOT] Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[BOOT] PID: ${process.pid}`);
    console.log('====================================================');

    // Deferred initialization of background services to ensure port binding is successful first
    try {
        console.log('[BOOT] Initializing architecture drift check...');
        ArchitectureLockService.runStartupValidation();

        console.log('[BOOT] Initializing background services...');
        initCronJobs();
        initWorkers();
        console.log('[BOOT] Background services initialization sequence triggered.');
        
        // Trigger precompiled cache generation for sub-50ms warm reads
        const QuestionRepository = require('./services/questionRepository');
        QuestionRepository.precompileAllSubjects().catch(err => {
            console.error('[BOOT][PRECOMPILE] Error warming up question cache:', err.message);
        });
    } catch (error) {
        console.error('[BOOT] Error during background service initialization:', error.message);
    }
});

process.on('SIGTERM', async () => {
    console.log('[SHUTDOWN] SIGTERM received. Graceful shutdown initiated.');
    await shutdownWorkers();
    server.close(() => {
        console.log('[SHUTDOWN] HTTP server closed.');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('[SHUTDOWN] SIGINT received. Graceful shutdown initiated.');
    await shutdownWorkers();
    server.close(() => {
        console.log('[SHUTDOWN] HTTP server closed.');
        process.exit(0);
    });
});

module.exports = app;
