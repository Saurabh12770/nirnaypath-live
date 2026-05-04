const User = require('../models/User');
const TestResult = require('../models/TestResult');

const requirePlan = (requiredPlan) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user._id);
            if (!user) return res.status(404).json({ error: 'User not found' });

            // If user has the required plan, allow access
            if (user.plan === requiredPlan || user.plan === 'pro_monthly') {
                // For 'pro_monthly', check if subscription is still valid
                if (user.plan === 'pro_monthly' && user.subscriptionEnd && new Date() > user.subscriptionEnd) {
                    // Subscription expired, downgrade to free
                    user.plan = 'free';
                    await user.save();
                } else {
                    return next();
                }
            }

            // If free user, check for usage limits
            if (req.originalUrl.includes('/api/section')) {
                // Sectional tests limit: 2 per week
                const startOfWeek = new Date();
                startOfWeek.setDate(startOfWeek.getDate() - 7);
                
                const weeklyTests = await TestResult.countDocuments({
                    userId: user._id,
                    mode: 'section',
                    createdAt: { $gte: startOfWeek }
                });

                if (weeklyTests >= 2) {
                    return res.status(403).json({ 
                        error: 'Weekly limit reached for sectional tests. Upgrade to Pro for unlimited access!',
                        limitReached: true
                    });
                }
            }

            // Add other gated features here (e.g., unlimited drills, video solutions)
            if (req.originalUrl.includes('/api/drill') && req.query.count > 20) {
                 return res.status(403).json({ 
                    error: 'Topic drills are limited to 20 questions for free users. Upgrade to Pro for unlimited questions!',
                    limitReached: true
                });
            }

            next();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
};

module.exports = { requirePlan };
