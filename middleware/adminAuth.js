const User = require('../models/user');

const adminAuth = async (req, res, next) => {
    try {
        // req.user is already attached by the 'auth' middleware
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }

        // Check if user is active
        const user = await User.findById(req.user._id);
        if (!user || !user.isActive) {
            return res.status(403).json({ error: 'Account is inactive or banned.' });
        }

        next();
    } catch (error) {
        res.status(500).json({ error: 'Admin authorization failed' });
    }
};

module.exports = adminAuth;
