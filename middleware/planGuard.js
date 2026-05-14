const User = require('../models/user');
const TestResult = require('../models/testResult');
const plans = require('../config/plans');

/**
 * Enterprise Plan Guard Middleware
 * Enforces multi-tier billing logic, usage quotas, and expiry validation
 */
const requirePlan = (requiredFeature) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user._id);
            if (!user) return res.status(404).json({ error: 'User not found' });

            const userPlan = user.plan || 'free';
            const now = new Date();

            // 1. Subscription Expiry & Status Check
            if (userPlan !== 'free') {
                if (user.subscriptionEnd && now > user.subscriptionEnd) {
                    // Update user status to expired in background
                    user.subscriptionStatus = 'expired';
                    user.plan = 'free';
                    await user.save();
                    
                    return res.status(403).json({ 
                        error: 'Subscription expired', 
                        code: 'PLAN_EXPIRED',
                        message: 'Your Pro access has expired. Please renew to continue.' 
                    });
                }
                
                if (user.subscriptionStatus === 'cancelled' && user.subscriptionEnd && now > user.subscriptionEnd) {
                    user.subscriptionStatus = 'expired';
                    user.plan = 'free';
                    await user.save();
                    return res.status(403).json({ error: 'Subscription cancelled and expired' });
                }

                // If active pro member, they pass all gates
                return next();
            }

            // 2. Free User Quota Logic (Feature Gating)
            
            // Sectional Tests Gate
            if (requiredFeature === 'sectional_tests') {
                const startOfWeek = new Date();
                startOfWeek.setDate(startOfWeek.getDate() - 7);
                
                const weeklyTests = await TestResult.countDocuments({
                    userId: user._id,
                    mode: 'section', // Ensure mode is correctly stored in TestResult
                    createdAt: { $gte: startOfWeek }
                });

                if (weeklyTests >= (plans.free.limits.sectionalTestsPerWeek || 2)) {
                    return res.status(403).json({ 
                        error: 'Weekly Limit Reached',
                        message: 'You have reached the free limit for sectional tests (2/week). Upgrade to Pro for unlimited attempts!',
                        limitReached: true,
                        code: 'LIMIT_REACHED'
                    });
                }
            }

            // Advanced Analytics Gate
            if (requiredFeature === 'advanced_analytics') {
                return res.status(403).json({ 
                    error: 'Pro Feature',
                    message: 'Advanced AI insights and readiness scores are available for Pro members only.',
                    code: 'PREMIUM_REQUIRED'
                });
            }

            next();
        } catch (error) {
            console.error('[PlanGuard] Error:', error);
            res.status(500).json({ error: 'Internal access control error' });
        }
    };
};

module.exports = { requirePlan };
