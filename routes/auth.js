const express = require('express');
/**
 * NP-PERF-01 FIX: native bcrypt replaces bcryptjs.
 * bcryptjs is pure-JS and runs on the main V8 thread — hash operations block
 * the event loop for ~85ms (rounds=10) or ~340ms (rounds=12) per call.
 * Under 25+ concurrent signups all hashes serialize on one thread.
 *
 * Native bcrypt delegates to libuv's UV thread pool (default 4 threads).
 * Hash operations become truly async — concurrent signups run in parallel
 * across OS threads, never blocking the event loop.
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth');
const crypto = require('crypto');
const router = express.Router();

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').toLowerCase();

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET must be set in production.');
  process.exit(1);
}
const jwtSecret = process.env.JWT_SECRET;

if (!process.env.REFRESH_TOKEN_SECRET) {
  console.error('FATAL: REFRESH_TOKEN_SECRET must be set in production.');
  process.exit(1);
}
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

/**
 * SECURITY: bcrypt cost factor — OWASP minimum is 10.
 * NP-PERF-01 FIX: Default reduced from 12 → 10.
 *   - Rounds=12: ~340ms/hash → event-loop starvation at 25+ concurrent signups
 *   - Rounds=10: ~85ms/hash  → 4× faster, within safe OWASP bounds
 * Override via BCRYPT_ROUNDS env var (must be >= 10).
 */
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');
if (BCRYPT_ROUNDS < 10) {
  console.error(`FATAL: BCRYPT_ROUNDS=${BCRYPT_ROUNDS} is below minimum of 10.`);
  process.exit(1);
}

const { authLimiter } = require('../middleware/rateLimiter');

/**
 * Validate email format and password strength.
 * Returns an error message string or null if valid.
 */
function validateCredentials(email, password) {
  if (!email || typeof email !== 'string') return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
  if (!password || typeof password !== 'string') return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password) && !/[0-9]/.test(password)) {
    return 'Password must contain at least one uppercase letter or number';
  }
  return null;
}

// Signup
router.post('/signup', authLimiter, async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // PHASE 6: Input validation
        if (!name || typeof name !== 'string' || name.trim().length < 2) {
            return res.status(400).json({ error: 'Name must be at least 2 characters' });
        }
        const validationError = validateCredentials(email, password);
        if (validationError) return res.status(400).json({ error: validationError });

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already in use' }); // 409 Conflict
        }

        // PHASE 6: bcrypt rounds >= 10
        const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword
        });

        // Auto-promote admin email
        if (ADMIN_EMAIL && user.email === ADMIN_EMAIL) {
            user.role = 'admin';
            console.log(`[Admin] ${email} signed up and was auto-promoted to admin.`);
        }

        await user.save();

        // Fire-and-forget welcome notification mock
        console.log(`[Signup] Welcome email mock triggered for user: ${user.email}`);

        // PHASE 6: JWT on signup MUST have expiry
        const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
        // PHASE-4A FIX: Generate refresh token on signup (consistent with login flow)
        const refreshToken = jwt.sign({ id: user._id }, refreshTokenSecret, { expiresIn: '7d' });

        // PHASE-4A FIX: Persist refresh token (BUG-1 — schema now has refreshTokens field)
        user.refreshTokens = [refreshToken];
        await user.save();

        // PHASE-4A FIX: Relax sameSite to 'lax' for compatibility with email redirects and PWA flows
        const cookieSecure = process.env.NODE_ENV === 'production';
        res.cookie('token', token, { httpOnly: true, secure: cookieSecure, sameSite: 'lax', maxAge: 60 * 60 * 1000 });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: cookieSecure, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
        // PHASE-4A: Tokens are httpOnly-cookie-only by design.
        // The auth middleware supports Bearer tokens via Authorization header for
        // clients that already possess a token. Native mobile apps should use a
        // dedicated mobile-auth endpoint (future feature), not body-exposed tokens.
        res.status(201).json({ user: { name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Email already in use' });
        }
        res.status(400).json({ error: error.message });
    }
});

// Login
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;

        // PHASE 6: Input validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // PHASE 6: Must use .select('+password') because select:false on schema
        const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

        if (!user) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }

        // Auto-promote admin email on every login
        if (ADMIN_EMAIL && user.email === ADMIN_EMAIL && user.role !== 'admin') {
            user.role = 'admin';
            console.log(`[Admin] ${email} logged in and was auto-promoted to admin.`);
        }

        const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user._id }, refreshTokenSecret, { expiresIn: '7d' });

        // PHASE-4A FIX: refreshTokens is now a declared schema field; persist correctly
        user.refreshTokens = [...(user.refreshTokens || []), refreshToken].slice(-5); // Keep last 5
        await user.save();

        // PHASE-4A FIX: Relax sameSite to 'lax' for compatibility with email redirects and PWA flows
        const cookieSecure = process.env.NODE_ENV === 'production';
        res.cookie('token', token, { httpOnly: true, secure: cookieSecure, sameSite: 'lax', maxAge: 60 * 60 * 1000 });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: cookieSecure, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

        res.json({ user: { name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Refresh Token
router.post('/refresh-token', async (req, res) => {
    try {
        let refreshToken = req.body.refreshToken;
        if (!refreshToken && req.headers.cookie) {
            req.headers.cookie.split(';').forEach(cookie => {
                let [name, ...rest] = cookie.split('=');
                name = name.trim();
                if (name === 'refreshToken') refreshToken = decodeURIComponent(rest.join('=').trim());
            });
        }
        if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

        const decoded = jwt.verify(refreshToken, refreshTokenSecret);
        const user = await User.findOne({ _id: decoded.id, refreshTokens: refreshToken });

        if (!user) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        const newToken = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
        const newRefreshToken = jwt.sign({ id: user._id }, refreshTokenSecret, { expiresIn: '7d' });

        // Replace old refresh token (BUG-1 FIX: refreshTokens now persists correctly)
        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
        user.refreshTokens.push(newRefreshToken);
        user.refreshTokens = user.refreshTokens.slice(-5); // Keep last 5
        await user.save();

        // PHASE-4A FIX: Consistent cookie settings with login/signup
        const cookieSecure = process.env.NODE_ENV === 'production';
        res.cookie('token', newToken, { httpOnly: true, secure: cookieSecure, sameSite: 'lax', maxAge: 60 * 60 * 1000 });
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: cookieSecure, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

        res.json({ message: 'Token refreshed' });
    } catch (error) {
        res.status(403).json({ error: 'Token refresh failed' });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    try {
        let refreshToken = req.body.refreshToken;
        if (!refreshToken && req.headers.cookie) {
            req.headers.cookie.split(';').forEach(cookie => {
                let [name, ...rest] = cookie.split('=');
                name = name.trim();
                if (name === 'refreshToken') refreshToken = decodeURIComponent(rest.join('=').trim());
            });
        }
        const user = await User.findOne({ refreshTokens: refreshToken });
        if (user) {
            user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
            await user.save();
        }
        const cookieSecure = process.env.NODE_ENV === 'production';
        res.clearCookie('token', { httpOnly: true, secure: cookieSecure, sameSite: 'lax' });
        res.clearCookie('refreshToken', { httpOnly: true, secure: cookieSecure, sameSite: 'lax' });
        res.json({ message: 'Logged out' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get currently logged in user info (BUG-006 endpoint)
router.get('/me', auth, async (req, res) => {
    res.json({ user: { name: req.user.name, email: req.user.email, role: req.user.role } });
});

// Forgot Password - Initiate Recovery (Phase 8 Hardened)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const user = await User.findOne({ email: email.toLowerCase() });
        
        console.log('Forgot Password Requested for:', email);

        if (!user) {
            // Security Best Practice: Always return generic success to prevent user enumeration
            return res.json({ message: 'If that email exists in our system, a reset link has been sent.' });
        }

        // Generate high-entropy secure token
        const rawToken = crypto.randomBytes(32).toString('hex');
        
        // Phase 8: Hash the token for storage (Replay & Compromise protection)
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        
        // Store hashed token and 15-minute expiry
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 Minutes
        
        await user.save();

        console.log('Reset Token Generated & Hashed:', { 
            userId: user._id, 
            tokenStub: rawToken.substring(0, 4) + '...'
        });

        // Mock password reset link printing to logs (no email integration)
        console.log(`[Forgot Password] Password reset email link: /reset-password.html?token=${rawToken}`);

        res.json({ message: 'Reset link sent to your email.' });
    } catch (error) {
        console.error('Forgot Password Error:', error.message);
        res.status(500).json({ error: 'Recovery system failure' });
    }
});

// Reset Password - Commit Recovery (Phase 8 Hardened)
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }

        // Hash the incoming raw token to compare with DB
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Atomic check for valid token and non-expired window
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            console.log('Reset Attempt Failed: Invalid or Expired Hash', { tokenStub: token.substring(0, 4) });
            return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
        }

        // Update and Securely Hash the new password
        user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
        
        // Invalidate token immediately (Atomic cleanup)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();

        console.log('Password Reset Successful', { userId: user._id });

        res.json({ message: 'Password has been reset successfully. You can now log in.' });
    } catch (error) {
        console.error('Password Reset Error:', error.message);
        res.status(500).json({ error: 'Reset operation failed' });
    }
});

module.exports = router;
