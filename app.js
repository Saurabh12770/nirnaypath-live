const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const cluster = require('cluster');
const os = require('os');
const mongoose = require('mongoose');


dotenv.config();
if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
}
if (!process.env.MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined.');
    process.exit(1);
}

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
const liveRoutes = require('./routes/live');
const liveAdminRoutes = require('./routes/liveAdmin');
const discussionRoutes = require('./routes/discussion');
const chatRoutes = require('./routes/chat');
const pagesRoutes = require('./routes/pages');
const auth = require('./middleware/auth');
const adminAuth = require('./middleware/adminAuth');
const { initCronJobs } = require('./services/cronService');
const User = require('./models/User');

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

// Trust proxy for production (needed for rate limiting and HTTPS behind proxies like Railway/Render)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        await autoPromoteAdmin();
    })
    .catch(err => console.error('MongoDB connection error:', err));

app.use(express.json());


const isProduction = process.env.NODE_ENV === 'production';

// Security Headers
app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "default-src": ["'self'"],
            "script-src": ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com", "https://cdn.razorpay.com", "https://cdnjs.cloudflare.com"],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
            "img-src": ["'self'", "data:", "blob:", "https://ui-avatars.com"],
            "connect-src": ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "https://checkout.razorpay.com", "https://cdn.razorpay.com", "https://api.razorpay.com", "https://ui-avatars.com"],
            "frame-src": ["'self'", "https://checkout.razorpay.com", "https://api.razorpay.com"],
        },
    },
    hsts: isProduction,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [];

app.use(cors({
    origin: (origin, callback) => {
        // Always allow requests with no origin (server-to-server, curl, mobile apps)
        if (!origin) return callback(null, true);
        // Allow explicitly listed origins
        if (allowedOrigins.includes(origin)) return callback(null, true);
        // Allow any Railway.app subdomain and localhost in development
        if (
            origin.endsWith('.railway.app') ||
            origin.startsWith('http://localhost') ||
            origin.startsWith('http://127.0.0.1')
        ) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
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

// Debug logger for all requests
app.use((req, res, next) => {
    console.log(`[DEBUG] ${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
    next();
});

// Set up simple versioning middleware for static views
app.use((req, res, next) => {
    res.locals.assetVersion = process.env.ASSET_VERSION || '1.0.0';
    next();
});

// Serve static files with caching
// HTML files get short cache, assets get long cache
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath, {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            // Never cache HTML — always revalidate
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        } else if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
            // JS and CSS: revalidate on every request so deploys take effect immediately
            res.setHeader('Cache-Control', 'no-cache');
        } else {
            // Images, fonts, manifests: 7 days
            res.setHeader('Cache-Control', 'public, max-age=604800');
        }
    }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
console.log('[DEBUG] Mounting Test Routes at /api/test');\napp.use('/api/test', testRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/drill', drillRoutes);
app.use('/api/section', sectionRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/live', liveRoutes);
app.use('/api/admin/live-sessions', liveAdminRoutes);
app.use('/api/discussion', discussionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', apiRoutes);
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin.html'));
});

app.use('/', pagesRoutes);


// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Bind to 0.0.0.0 to allow access via IP addresses
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Worker ${process.pid}] Server running on http://0.0.0.0:${PORT}`);
    console.log(`[Worker ${process.pid}] Locally accessible at http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

// Initialize Background Workers
const { createEmailWorker } = require('./workers/emailWorker');
const { createDigestWorker } = require('./workers/digestWorker');

if (process.env.NODE_ENV !== 'test') {
    createEmailWorker();
    createDigestWorker();
    console.log('[Background] Workers initialized successfully.');
}

// Initialize Cron Jobs
initCronJobs();

// ══════════════════════════════════════════════════════════
// LIVE SESSION AUTOMATION
// ══════════════════════════════════════════════════════════
const LiveSession = require('./models/LiveSession');
setInterval(async () => {
    try {
        const now = new Date();
        
        // Upcoming -> Live
        await LiveSession.updateMany(
            { status: 'upcoming', startTime: { $lte: now } },
            { $set: { status: 'live' } }
        );

        // Live -> Ended
        const sessions = await LiveSession.find({ status: 'live' });
        for (const session of sessions) {
            const endTime = new Date(session.startTime.getTime() + session.duration * 60000);
            if (endTime <= now) {
                session.status = 'ended';
                await session.save();
            }
        }
    } catch (err) {
        console.error('LiveSession Automation Error:', err);
    }
}, 60000);

module.exports = app;
