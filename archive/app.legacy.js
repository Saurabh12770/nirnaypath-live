const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const http = require('http');

// Routes
const pagesRoutes = require('./routes/pages');
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/test');
const adminRoutes = require('./routes/admin');
const learningRoutes = require('./routes/learning');

const auth = require('./middleware/auth');
const adminAuth = require('./middleware/adminAuth');
const User = require('./models/user');

async function autoPromoteAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nirnaypath.local';
    const isProduction = process.env.NODE_ENV === 'production';
    const isBlockedEmail = ['admin@nirnaypath.local', 'admin@example.com', 'test@example.com', 'demo@example.com'].includes(adminEmail.toLowerCase());

    try {
        const bcrypt = require('bcryptjs'); 
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
                    role: 'admin'
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

        if (!isProduction && adminEmail.toLowerCase() !== 'admin@example.com') {
            let testAdmin = await User.findOne({ email: 'admin@example.com' });
            if (!testAdmin) {
                const hashedPassword = await bcrypt.hash(defaultPassword, 10);
                testAdmin = new User({
                    name: 'Test Admin',
                    email: 'admin@example.com',
                    password: hashedPassword,
                    role: 'admin'
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

// Trust proxy for production (needed for rate limiting and HTTPS behind proxies like Railway/Render)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Database Connection
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/nirnaypath';
mongoose.connect(mongoUri)
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
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
            scriptSrcAttr: ["'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https://ui-avatars.com"],
            connectSrc: ["'self'", "https://ui-avatars.com"],
            frameSrc: ["'self'"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
            upgradeInsecureRequests: [],
        },
    },
    hsts: isProduction,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
        : 'https://nirnaypath-live-production.up.railway.app')
    : ['http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
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

// Set up simple versioning middleware for static views
app.use((req, res, next) => {
    res.locals.assetVersion = process.env.ASSET_VERSION || '1.0.0';
    next();
});

// Serve static files with caching
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes for HTML
        } else {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year for assets
        }
    }
}));

const { generalLimiter, testEngineLimiter } = require('./middleware/rateLimiter');

app.use('/api/test', testEngineLimiter);
app.use('/api/', generalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/test', testRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/learning', learningRoutes);

// Telemetry mock for admin panel
app.get('/api/telemetry/overview', auth, adminAuth, (req, res) => {
    res.json({
        activeUsersCount: 1,
        errorCount: 0,
        slowApis: [],
        avgSessionDurationMs: 5000,
        recentErrors: [],
        memoryTrend: [
            { timestamp: new Date().toISOString(), usedJSHeapSize: 45 * 1024 * 1024 }
        ]
    });
});

app.get('/admin', auth, adminAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin.html'));
});

app.use('/', pagesRoutes);

// 404 Handler for API routes
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[Global Error]:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Create HTTP Server
const server = http.createServer(app);

server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
    console.log('====================================================');
    console.log(`[BOOT] NirnayPath Platform v2.0.0`);
    console.log(`[BOOT] Status: ONLINE`);
    console.log(`[BOOT] Port: ${PORT}`);
    console.log(`[BOOT] Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`[BOOT] PID: ${process.pid}`);
    console.log('====================================================');
});

// Graceful Shutdown Handler
async function gracefulShutdown(signal) {
    console.log(`[SHUTDOWN] ${signal} received. Graceful shutdown initiated.`);

    try {
        if (mongoose.connection.readyState !== 0) {
            console.log('[SHUTDOWN] Closing MongoDB connection...');
            await mongoose.connection.close();
            console.log('[SHUTDOWN] MongoDB connection closed.');
        }
    } catch (err) {
        console.error('[SHUTDOWN] MongoDB close error:', err.message);
    }

    server.close(() => {
        console.log('[SHUTDOWN] HTTP server closed. Exiting cleanly.');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('[SHUTDOWN] Forced exit after hard timeout.');
        process.exit(1);
    }, 5000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));

module.exports = app;
