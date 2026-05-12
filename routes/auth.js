const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
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

// Forgot Password (Dummy implementation for now, should integrate with email service)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        // In a real app, generate token and send email
        res.json({ message: 'Reset link sent to your email.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
