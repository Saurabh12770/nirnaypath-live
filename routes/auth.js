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
            await user.save();
            console.log(`[Admin] ${email} logged in and was auto-promoted to admin.`);
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'your_fallback_secret');
        res.json({ user: { name: user.name, email: user.email, role: user.role }, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
