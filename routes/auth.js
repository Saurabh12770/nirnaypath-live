const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../services/emailService');

// Rate limiter for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter limiter for password resets
const resetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many reset attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').toLowerCase();

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user._id, role: user.role }, 
        process.env.JWT_SECRET, 
        { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
        { id: user._id }, 
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh', 
        { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
};

// Signup
router.post('/signup', authLimiter, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already in use' });

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({ name, email, password: hashedPassword });

        if (ADMIN_EMAIL && user.email === ADMIN_EMAIL) {
            user.role = 'admin';
        }

        const { accessToken, refreshToken } = generateTokens(user);
        user.refreshTokens = [refreshToken];
        await user.save();
        
        res.status(201).json({ 
            user: { name: user.name, email: user.email, role: user.role }, 
            token: accessToken,
            refreshToken
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login
router.post('/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }

        if (ADMIN_EMAIL && user.email === ADMIN_EMAIL && user.role !== 'admin') {
            user.role = 'admin';
        }

        const { accessToken, refreshToken } = generateTokens(user);
        
        // Keep only last 5 sessions
        user.refreshTokens = (user.refreshTokens || []).slice(-4);
        user.refreshTokens.push(refreshToken);
        await user.save();

        res.json({ 
            user: { name: user.name, email: user.email, role: user.role }, 
            token: accessToken,
            refreshToken
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Refresh Token
router.post('/refresh-token', authLimiter, async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh');
        const user = await User.findById(decoded.id);

        if (!user || !user.refreshTokens.includes(refreshToken)) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        // Token Rotation: Generate new pair
        const tokens = generateTokens(user);
        
        // Replace old refresh token with new one
        user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken);
        user.refreshTokens.push(tokens.refreshToken);
        await user.save();

        res.json({ 
            token: tokens.accessToken, 
            refreshToken: tokens.refreshToken 
        });
    } catch (error) {
        res.status(403).json({ error: 'Invalid or expired refresh token' });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    const { refreshToken } = req.body;
    try {
        if (refreshToken) {
            const decoded = jwt.decode(refreshToken);
            if (decoded && decoded.id) {
                await User.findByIdAndUpdate(decoded.id, {
                    $pull: { refreshTokens: refreshToken }
                });
            }
        }
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Logout failed' });
    }
});

// Forgot Password
router.post('/forgot-password', resetLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (user) {
            const token = crypto.randomBytes(32).toString('hex');
            // Hash the token so even if DB is leaked, reset tokens aren't immediately usable
            const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
            
            user.resetPasswordToken = hashedToken;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            await user.save();

            await sendPasswordResetEmail(user, token);
        }

        // Generic message to prevent email enumeration
        res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'An error occurred, please try again later' });
    }
});

// Reset Password
router.post('/reset-password', resetLimiter, async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired password reset token' });
        }

        // Update password
        user.password = await bcrypt.hash(newPassword, 12);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        // Security: Invalidate all existing sessions on password change
        user.refreshTokens = [];
        
        await user.save();

        res.json({ message: 'Password has been reset successfully. You can now login with your new password.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'An error occurred during password reset' });
    }
});

module.exports = router;
