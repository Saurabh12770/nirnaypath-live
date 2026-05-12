const StudentLearningProfileService = require('./studentLearningProfileService');

/**
 * NirnayPath Adaptive Learning & Personalization Engine
 * Handles intelligent question selection and learning paths
 */
class AdaptiveLearningService {
    
    /**
     * Select questions adaptively for a test session
     * @param {string} userId 
     * @param {Array} allQuestions Pool of available questions
     * @param {number} count Number of questions needed
     * @returns {Array} Selected and randomized questions
     */
    static async selectQuestions(userId, allQuestions, count) {
        const profile = await StudentLearningProfileService.getProfile(userId);
        
        // If new user, use balanced randomization
        if (!profile) {
            return this.shuffle(allQuestions).slice(0, Math.min(count, allQuestions.length));
        }

        const { topicMastery, overallAccuracy } = profile;

        // 1. Calculate Topic Weights
        // Lower accuracy -> Higher weight
        const topicWeights = {};
        const topicsInPool = [...new Set(allQuestions.map(q => q.topic))];
        
        topicsInPool.forEach(topic => {
            const mastery = Object.values(topicMastery).find(m => m.name === topic);
            if (mastery) {
                const accuracy = (mastery.correct / mastery.attempts) * 100;
                // Inverse weight: (100 - accuracy) + base weight
                topicWeights[topic] = (100 - accuracy) + 10;
            } else {
                topicWeights[topic] = 50; // Neutral for unseen topics
            }
        });

        // 2. Calculate Difficulty Weights
        // Based on overall accuracy
        let targetDifficulty = { easy: 0.33, medium: 0.34, hard: 0.33 };
        if (overallAccuracy > 80) {
            targetDifficulty = { easy: 0.1, medium: 0.4, hard: 0.5 };
        } else if (overallAccuracy > 60) {
            targetDifficulty = { easy: 0.2, medium: 0.5, hard: 0.3 };
        } else if (overallAccuracy < 40) {
            targetDifficulty = { easy: 0.7, medium: 0.2, hard: 0.1 };
        }

        // 3. Score and Filter Pool
        const scoredPool = allQuestions.map(q => {
            const topicWeight = topicWeights[q.topic] || 10;
            const diffWeight = targetDifficulty[q.difficulty] || 0.1;
            return {
                question: q,
                score: topicWeight * diffWeight * (0.8 + Math.random() * 0.4) // Randomness factor to prevent repetition fatigue
            };
        });

        // 4. Return top 'count' scored questions
        return scoredPool
            .sort((a, b) => b.score - a.score)
            .slice(0, Math.min(count, scoredPool.length))
            .map(item => item.question);
    }

    /**
     * Generate a personalized daily study plan
     */
    static async generateDailyPlan(userId) {
        const profile = await StudentLearningProfileService.getProfile(userId);
        const revisionQueue = await StudentLearningProfileService.getRevisionQueue(userId);

        const plan = {
            date: new Date(),
            focusArea: 'General Improvement',
            tasks: [],
            recommendations: []
        };

        if (profile) {
            const weakTopics = Object.values(profile.topicMastery)
                .filter(t => (t.correct / t.attempts) < 0.6)
                .sort((a, b) => (a.correct / a.attempts) - (b.correct / b.attempts));

            if (weakTopics.length > 0) {
                plan.focusArea = `Mastering ${weakTopics[0].name}`;
                plan.tasks.push({
                    type: 'DRILL',
                    topic: weakTopics[0].name,
                    reason: 'Your accuracy in this topic is currently below 60%.'
                });
            }

            if (revisionQueue.length > 0) {
                plan.tasks.push({
                    type: 'REVISION',
                    topic: revisionQueue[0].name,
                    reason: 'Time for a quick refresher to maintain retention.'
                });
            }
        }

        return plan;
    }

    /**
     * Get Intelligent Practice Recommendations
     */
    static async getRecommendations(userId) {
        const profile = await StudentLearningProfileService.getRevisionQueue(userId);
        const recommendations = [];

        // 1. Weak Topic Correction
        const weak = profile.filter(p => p.priority === 'HIGH');
        if (weak.length > 0) {
            recommendations.push({
                type: 'WEAKNESS_CORRECTION',
                title: 'Targeted Practice Needed',
                message: `You are struggling with ${weak[0].name}. Try a focused drill to improve.`,
                action: `/drills?topic=${weak[0].topicId}`
            });
        }

        // 2. Retention Maintenance
        const maintenance = profile.filter(p => p.priority === 'MEDIUM');
        if (maintenance.length > 0) {
            recommendations.push({
                type: 'RETENTION_BOOST',
                title: 'Maintain Your Edge',
                message: `It's been a while since you practiced ${maintenance[0].name}. A quick review is recommended.`,
                action: `/drills?topic=${maintenance[0].topicId}`
            });
        }

        return recommendations;
    }

    static shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}

module.exports = AdaptiveLearningService;
