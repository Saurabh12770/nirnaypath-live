const dotenv = require('dotenv');
dotenv.config();

const { validateEnv } = require('./services/envValidationService');
validateEnv();

const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const { registerGlobalQueryLogger } = require('./services/slowQueryLogger');
registerGlobalQueryLogger(mongoose);
const crypto = require('crypto');
const http = require('http');
const context = require('./utils/context');
const socketService = require('./services/socketService');
const CrashReportingService = require('./services/crashReportingService');

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
const notificationRoutes = require('./routes/notifications');
const recommendationRoutes = require('./routes/recommendations');
const growthRoutes = require('./routes/growth');
const seoRoutes = require('./routes/seo');
const engagementRoutes = require('./routes/engagement');
const statsRoutes = require('./routes/stats');
const adminIntelligenceRoutes = require('./routes/adminIntelligence');
const telemetryRoutes = require('./routes/telemetry');
const { recordError } = require('./utils/telemetryStore');
const auth = require('./middleware/auth');
const adminAuth = require('./middleware/adminAuth');
const { requestTracer } = require('./middleware/requestTracing');
const { initCronJobs } = require('./services/cronService');
const { initWorkers, shutdownWorkers } = require('./services/workerService');
const User = require('./models/user');

async function autoPromoteAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nirnaypath.local';
    const isProduction = process.env.NODE_ENV === 'production';
    const isBlockedEmail = ['admin@nirnaypath.local', 'admin@example.com', 'test@example.com', 'demo@example.com'].includes(adminEmail.toLowerCase());

    try {
        const bcrypt = require('bcrypt'); // NP-PERF-01: native bcrypt (libuv thread pool)
        const defaultPassword = 'AdminPassword123!';
        
        let user = await User.findOne({ email: adminEmail.toLowerCase() });
        if (!user) {
            if (isProduction && isBlockedEmail) {
                console.log(`[Admin] Refusing to seed default/test admin account ${adminEmail} in production.`);
            } else {
                const hashedPassword = await bcrypt.hash(defaultPassword, 10);
                user = new User({
                    name: 'System Admin',
                    email: adminEmail.toLowerCase(),
                    password: hashedPassword,
                    role: 'admin',
                    plan: 'pro_yearly',
                    subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                });
                await user.save();
                console.log(`[Admin] Admin user ${adminEmail} seeded successfully.`);
            }
        } else if (user.role !== 'admin') {
            user.role = 'admin';
            await user.save();
            console.log(`[Admin] Existing user ${adminEmail} promoted to admin.`);
        } else {
            console.log(`[Admin] Admin user ${adminEmail} is active.`);
        }

        // Also seed admin@example.com for test runs if not matching the primary admin email and NOT in production
        if (!isProduction && adminEmail.toLowerCase() !== 'admin@example.com') {
            let testAdmin = await User.findOne({ email: 'admin@example.com' });
            if (!testAdmin) {
                const hashedPassword = await bcrypt.hash(defaultPassword, 10);
                testAdmin = new User({
                    name: 'Test Admin',
                    email: 'admin@example.com',
                    password: hashedPassword,
                    role: 'admin',
                    plan: 'pro_yearly',
                    subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                });
                await testAdmin.save();
                console.log(`[Admin] Test admin user admin@example.com seeded successfully.`);
            }
        }
    } catch (err) {
        console.error('[Admin] Auto-promote/seeding error:', err.message);
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
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/nirnaypath';
mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    heartbeatFrequencyMS: 10000,
    maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || '50'),
    minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE || '5'),
    socketTimeoutMS: parseInt(process.env.MONGO_SOCKET_TIMEOUT_MS || '45000')
})
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
            scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com", "https://cdn.razorpay.com", "https://checkout-static-next.razorpay.com", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https://ui-avatars.com"],
            connectSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com", "https://cdn.razorpay.com", "https://checkout-static-next.razorpay.com", "https://ui-avatars.com", "https://lumberjack.razorpay.com"],
            frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com", "https://checkout-static-next.razorpay.com"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
            upgradeInsecureRequests: [],
        },
    },
    hsts: isProduction,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  // M-1 FIX: Read allowed origins from env so custom domains and staging work
  // without code changes. Set ALLOWED_ORIGINS as a comma-separated list in Railway config.
  // Example: https://nirnaypath.com,https://staging.nirnaypath.com
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
        : 'https://nirnaypath-live-production.up.railway.app')
    : ['http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));

app.use(requestTracer);

// PHASE 5: Capture raw body buffer for webhook HMAC verification.
// MUST be registered BEFORE express.json() so the raw bytes are available.
// The webhook route reads req.rawBody; all other routes use req.body as normal.
app.use((req, res, next) => {
    const isWebhook = req.originalUrl && req.originalUrl.split('?')[0].toLowerCase() === '/api/payment/webhook';
    if (isWebhook) {
        let data = [];
        req.on('data', chunk => data.push(chunk));
        req.on('end', () => {
            req.rawBody = Buffer.concat(data);
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

app.use((req, res, next) => {
    const isWebhook = req.originalUrl && req.originalUrl.split('?')[0].toLowerCase() === '/api/payment/webhook';
    if (isWebhook) {
        return next();
    }
    express.json({ limit: '1mb' })(req, res, next);
});

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

app.get('/health/detailed', (req, res, next) => {
    req.url = '/api/health/detailed';
    app.handle(req, res, next);
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

const { generalLimiter, telemetryLimiter, testEngineLimiter } = require('./middleware/rateLimiter');

// Telemetry gets its own isolated rate-limit tier (60 req/15min)
app.use('/api/telemetry', telemetryLimiter);
app.use('/api/v1/telemetry', telemetryLimiter);

// Test Engine gets its own isolated rate-limit tier (100 req/15min)
app.use('/api/test', testEngineLimiter);

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
app.use('/api/notifications', notificationRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/growth', growthRoutes);
app.use('/api/engagement', engagementRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin/intelligence', adminIntelligenceRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/v1/telemetry', telemetryRoutes);
app.use('/', seoRoutes);
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
    // Feed into telemetry store so /api/telemetry/overview reflects real errors
    recordError({ message: err.message, stack: err.stack, url: req.url, method: req.method });
    res.status(500).json({ error: 'Internal Server Error' });
});

// Create HTTP Server
const server = http.createServer(app);

// CB-2 FIX: Prevent port-lock after Railway/Render proxy closes keep-alive connections.
// keepAliveTimeout must exceed the upstream proxy idle timeout (typically 60s).
// headersTimeout must be slightly greater than keepAliveTimeout.
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

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

    // Defer initialization of background services to ensure port binds in < 1 second
    setImmediate(() => {
        try {
            console.log('[BOOT] Initializing background services...');
            
            // PM2 Cluster Mode Isolation: Only run crons on instance 0 or when not in PM2 cluster mode
            const isPrimaryInstance = process.env.NODE_APP_INSTANCE === undefined || 
                                     process.env.NODE_APP_INSTANCE === '0';
            if (isPrimaryInstance) {
                console.log('[BOOT] Primary instance / single node detected. Registering cron jobs...');
                initCronJobs();
            } else {
                console.log(`[BOOT] Clustered instance #${process.env.NODE_APP_INSTANCE}. Skipping cron registration.`);
            }

            initWorkers();
            console.log('[BOOT] Background services initialization sequence triggered.');
            
            // Trigger precompiled cache generation for sub-50ms warm reads
            const QuestionRepository = require('./services/questionRepository');
            QuestionRepository.precompileAllSubjects().catch(err => {
                console.error('[BOOT][PRECOMPILE] Error warming up question cache:', err.message);
            });

            // Launch isolated background workers
            require('./bootstrap/workersLoader').start(server);
        } catch (error) {
            console.error('[BOOT] Error during background service initialization:', error.message);
        }
    });
});

// Upgraded SRE Graceful Shutdown Handler
async function gracefulShutdown(signal) {
    console.log(`[SHUTDOWN] ${signal} received. Graceful shutdown initiated.`);

    // 1. Stop Cron Jobs
    try {
        const { shutdownCronJobs } = require('./services/cronService');
        await shutdownCronJobs();
    } catch (err) {
        console.error('[SHUTDOWN] Cron cleanup error:', err.message);
    }

    // 2. Close Sockets (disconnect WebSocket clients cleanly)
    try {
        const socketService = require('./services/socketService');
        await socketService.close();
    } catch (err) {
        console.error('[SHUTDOWN] Socket cleanup error:', err.message);
    }

    // 3. Shutdown BullMQ workers
    const shutdownTimeout = new Promise(resolve => setTimeout(resolve, 5000));
    try {
        await Promise.race([shutdownWorkers(), shutdownTimeout]);
    } catch (err) {
        console.error('[SHUTDOWN] Worker shutdown error (non-fatal):', err.message);
    }

    // 4. Close MongoDB connection
    try {
        if (mongoose.connection.readyState !== 0) {
            console.log('[SHUTDOWN] Closing MongoDB connection...');
            await mongoose.connection.close();
            console.log('[SHUTDOWN] MongoDB connection closed.');
        }
    } catch (err) {
        console.error('[SHUTDOWN] MongoDB close error:', err.message);
    }

    // 5. Disconnect Redis client socket
    try {
        const { disconnectRedis } = require('./services/redisService');
        await disconnectRedis();
    } catch (err) {
        console.error('[SHUTDOWN] Redis disconnect error:', err.message);
    }

    server.close(() => {
        console.log('[SHUTDOWN] HTTP server closed. Exiting cleanly.');
        process.exit(0);
    });

    // Hard kill fallback if server.close() itself hangs
    setTimeout(() => {
        console.error('[SHUTDOWN] Forced exit after hard timeout.');
        process.exit(1);
    }, 8000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

module.exports = app;
