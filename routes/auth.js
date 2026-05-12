const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../services/emailService');
const crypto = require('crypto');
const router = express.Router();

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').toLowerCase();

// Signup
router.post('/signup', async (req, res) => {
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
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your_fallback_secret');
        
        res.status(201).json({ user: { name: user.name, email: user.email, role: user.role }, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
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

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your_fallback_secret', { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET || 'refresh_fallback_secret', { expiresIn: '7d' });

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

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || 'refresh_fallback_secret');
        const user = await User.findOne({ _id: decoded.id, refreshTokens: refreshToken });

        if (!user) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your_fallback_secret', { expiresIn: '1h' });
        const newRefreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET || 'refresh_fallback_secret', { expiresIn: '7d' });

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

// Forgot Password - Initiate Recovery
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const user = await User.findOne({ email: email.toLowerCase() });
        
        // Security Best Practice: Always return generic success to prevent user enumeration
        if (!user) {
            return res.json({ message: 'If that email exists in our system, a reset link has been sent.' });
        }

        // Generate high-entropy secure token
        const token = crypto.randomBytes(32).toString('hex');
        
        // Store token and 15-minute expiry
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 Minutes
        
        await user.save();

        // Queue email via BullMQ dispatcher
        sendPasswordResetEmail(user, token).catch(err => console.error('[Auth] Password reset queue error:', err));

        res.json({ message: 'Reset link sent to your email.' });
    } catch (error) {
        res.status(500).json({ error: 'Recovery system failure' });
    }
});

// Reset Password - Commit Recovery
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }

        // Atomic check for valid token and non-expired window
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
        }

        // Update and Securely Hash the new password
        user.password = await bcrypt.hash(newPassword, 8);
        
        // Invalidate token immediately to prevent reuse (Security Hardening)
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();

        res.json({ message: 'Password has been reset successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ error: 'Reset operation failed' });
    }
});

module.exports = router;
