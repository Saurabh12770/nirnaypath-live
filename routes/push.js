const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Subscribe user to push notifications
router.post('/subscribe', auth, async (req, res) => {
    try {
        const subscription = req.body;
        
        await User.findByIdAndUpdate(req.user._id, {
            pushSubscription: subscription
        });

        res.status(201).json({ message: 'Push subscription saved successfully' });
    } catch (error) {
        console.error('Push subscribe error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Unsubscribe from push notifications
router.post('/unsubscribe', auth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            pushSubscription: null
        });
        res.json({ message: 'Unsubscribed from push notifications' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
