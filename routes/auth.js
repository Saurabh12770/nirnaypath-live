const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService');
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

const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many requests' }
});

// Signup
router.post('/signup', authLimiter, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 8);
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        // Auto-promote admin email
        if (ADMIN_EMAIL && user.email === ADMIN_EMAIL) {
            user.role = 'admin';
            console.log(`[Admin] ${email} signed up and was auto-promoted to admin.`);
        }

        await user.save();

        // Fire-and-forget: Trigger welcome email without blocking the response
        sendWelcomeEmail(user).catch(err => console.error('[Signup] Welcome email queue failure:', err.message));
        const token = jwt.sign({ id: user._id }, jwtSecret);
        
        res.status(201).json({ user: { name: user.name, email: user.email, role: user.role }, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
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

        user.refreshTokens = [...(user.refreshTokens || []), refreshToken].slice(-5); // Keep last 5
        await user.save();

        res.json({ 
            user: { name: user.name, email: user.email, role: user.role }, 
            token,
            refreshToken
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Refresh Token
router.post('/refresh-token', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });

        const decoded = jwt.verify(refreshToken, refreshTokenSecret);
        const user = await User.findOne({ _id: decoded.id, refreshTokens: refreshToken });

        if (!user) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        const newToken = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
        const newRefreshToken = jwt.sign({ id: user._id }, refreshTokenSecret, { expiresIn: '7d' });

        // Replace old refresh token
        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
        user.refreshTokens.push(newRefreshToken);
        await user.save();

        res.json({ token: newToken, refreshToken: newRefreshToken });
    } catch (error) {
        res.status(403).json({ error: 'Token refresh failed' });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const user = await User.findOne({ refreshTokens: refreshToken });
        if (user) {
            user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
            await user.save();
        }
        res.json({ message: 'Logged out' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Forgot Password - Initiate Recovery (Phase 8 Hardened)
router.post('/forgot-password', async (req, res) => {
    const { trace, CATEGORIES } = require('../utils/runtimeTrace');
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const user = await User.findOne({ email: email.toLowerCase() });
        
        trace(CATEGORIES.PASSWORD_FLOW, 'Forgot Password Requested', { email });

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

        trace(CATEGORIES.PASSWORD_FLOW, 'Reset Token Generated & Hashed', { 
            userId: user._id, 
            tokenStub: rawToken.substring(0, 4) + '...'
        });

        // Queue email via BullMQ dispatcher (Send the RAW token to the user)
        sendPasswordResetEmail(user, rawToken).catch(err => console.error('[Auth] Password reset queue error:', err));

        res.json({ message: 'Reset link sent to your email.' });
    } catch (error) {
        trace(CATEGORIES.PASSWORD_FLOW, 'Forgot Password Error', { error: error.message });
        res.status(500).json({ error: 'Recovery system failure' });
    }
});

// Reset Password - Commit Recovery (Phase 8 Hardened)
router.post('/reset-password', async (req, res) => {
    const { trace, CATEGORIES } = require('../utils/runtimeTrace');
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
            trace(CATEGORIES.PASSWORD_FLOW, 'Reset Attempt Failed: Invalid or Expired Hash', { tokenStub: token.substring(0, 4) });
            return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
        }

        // Update and Securely Hash the new password
        user.password = await bcrypt.hash(newPassword, 8);
        
        // Invalidate token immediately (Atomic cleanup)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();

        trace(CATEGORIES.PASSWORD_FLOW, 'Password Reset Successful', { userId: user._id });

        res.json({ message: 'Password has been reset successfully. You can now log in.' });
    } catch (error) {
        trace(CATEGORIES.PASSWORD_FLOW, 'Password Reset Error', { error: error.message });
        res.status(500).json({ error: 'Reset operation failed' });
    }
});

module.exports = router;
