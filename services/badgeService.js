/**
 * NirnayPath Badge Evaluation Service
 * Evaluates conditions to award badges to users based on their performance and activity.
 */

const BADGE_CONFIG = {
    'streak7': { name: '7-Day Warrior', description: 'Maintain a 7-day test streak', icon: '🔥' },
    'test30': { name: 'Prolific Learner', description: 'Complete 30 mock tests', icon: '📚' },
    'perfect100': { name: 'Century Club', description: 'Achieve 100% accuracy in a test', icon: '🎯' },
    'test100': { name: 'Nirnay Path Hero', description: 'Complete 100 mock tests', icon: '🏆' }
};

/**
 * Evaluates and returns any new badges earned by the user.
 * @param {Object} user - The mongoose user document
 * @param {Object} testResult - The recent test result document
 * @param {Number} totalTests - Total tests taken by user (provided by caller)
 */
function evaluateBadges(user, testResult, totalTests) {
    const newBadges = [];
    const currentBadges = user.badges || [];

    // 1. 7-Day Streak Badge
    if (user.streakCount >= 7 && !currentBadges.includes('streak7')) {
        newBadges.push('streak7');
    }

    // 2. 30 Tests Badge
    if (totalTests >= 30 && !currentBadges.includes('test30')) {
        newBadges.push('test30');
    }

    // 3. 100 Tests Badge
    if (totalTests >= 100 && !currentBadges.includes('test100')) {
        newBadges.push('test100');
    }

    // 4. Perfect Score Badge
    if (testResult.accuracy === 100 && !currentBadges.includes('perfect100')) {
        newBadges.push('perfect100');
    }

    return newBadges;
}

module.exports = {
    evaluateBadges,
    BADGE_CONFIG
};
