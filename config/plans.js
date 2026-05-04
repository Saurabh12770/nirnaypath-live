module.exports = {
    free: {
        id: 'free',
        name: 'Aspirant (Free)',
        price: 0,
        features: [
            'Daily Full Mocks',
            'Topic Drills (20 Qs)',
            'Basic Analytics',
            'Streak tracking'
        ],
        limits: {
            drillsPerDay: 5,
            sectionalTestsPerWeek: 2
        }
    },
    pro_monthly: {
        id: 'pro_monthly',
        name: 'Pro Path (Monthly)',
        price: 199,
        currency: 'INR',
        features: [
            'Unlimited Topic Drills',
            'Unlimited Sectional Tests',
            'Advanced AI Analytics',
            'Video Solutions (Beta)',
            'PYQ Mode (Previous Year)',
            'Ad-free Experience',
            'Priority Support'
        ],
        limits: {
            drillsPerDay: -1, // Unlimited
            sectionalTestsPerWeek: -1 // Unlimited
        }
    }
};
