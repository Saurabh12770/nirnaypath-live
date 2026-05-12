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
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nirnaypath')
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
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://checkout.razorpay.com", "https://cdn.razorpay.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https://ui-avatars.com", "https://*.ui-avatars.com", "https://i.pravatar.cc", "https://*.placeholder.com", "https://razorpay.com", "https://*.razorpay.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            connectSrc: ["'self'", "https://api.razorpay.com", "https://lumberjack.razorpay.com", "https://fonts.googleapis.com", "https://fonts.gstatic.com", "https://*.ui-avatars.com"],
            frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
            upgradeInsecureRequests: [],
        },
    },
    hsts: isProduction,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors());
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
    setHeaders: (res, path, stat) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes for HTML
        } else {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); // 1 year for CSS/JS/Images
        }
    }
}));

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

// Initialize Cron Jobs
initCronJobs();

module.exports = app;
