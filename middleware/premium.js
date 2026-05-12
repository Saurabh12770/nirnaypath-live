const plans = require('../config/plans');

/**
 * Premium Access Control Middleware
 * Enforces plan-based feature gating and subscription validity
 */
const premium = (feature) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userPlan = req.user.plan || 'free';
        const planConfig = plans[userPlan];

        // 1. Basic Validity Check
        if (userPlan !== 'free') {
            const now = new Date();
            if (req.user.subscriptionEnd && req.user.subscriptionEnd < now) {
                return res.status(403).json({ 
                    error: 'Subscription expired', 
                    code: 'SUBSCRIPTION_EXPIRED',
                    message: 'Your pro plan has expired. Please renew to continue.'
                });
            }
            
            if (req.user.subscriptionStatus === 'expired') {
                 return res.status(403).json({ error: 'Subscription inactive' });
            }
        }

        // 2. Feature Gating
        if (feature === 'unlimited_drills') {
            if (userPlan === 'free') {
                // Free users are handled by the drill controller's quota logic
                // but we can add a hard gate here if needed.
            }
        }

        if (feature === 'sectional_tests') {
            if (userPlan === 'free') {
                return res.status(403).json({ 
                    error: 'Premium Feature', 
                    message: 'Sectional tests are available for Pro members only.' 
                });
            }
        }

        if (feature === 'advanced_analytics') {
            if (userPlan === 'free') {
                return res.status(403).json({ 
                    error: 'Premium Feature', 
                    message: 'Advanced AI insights require a Pro subscription.' 
                });
            }
        }

        next();
    };
};

module.exports = premium;
