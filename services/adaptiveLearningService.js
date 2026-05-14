const StudentLearningProfileService = require('./studentLearningProfileService');

/**
 * NirnayPath Adaptive Learning & Personalization Engine
 * Handles intelligent question selection and learning paths
 */
class AdaptiveLearningService {
    
    /**
     * Select questions adaptively for a test session
     * LEGACY WRAPPER: Now uses central QuestionSelectionService
     */
    static async selectQuestions(userId, allQuestions, count) {
        const QuestionSelectionService = require('../utils/questionSelectionService');
        const weightedPool = await this.scoreQuestions(userId, allQuestions);
        return QuestionSelectionService.select(weightedPool, count, { userId });
    }

    /**
     * Scores questions based on student profile without selecting them
     * Used as a pre-processor for QuestionSelectionService
     */
    static async scoreQuestions(userId, allQuestions) {
        if (!allQuestions || allQuestions.length === 0) return [];
        
        const StudentLearningProfileService = require('./studentLearningProfileService');
        const profile = await StudentLearningProfileService.getProfile(userId);
        
        // If new user, return pool as is (shuffling happens in SelectionService)
        if (!profile) {
            return allQuestions;
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

        // 3. Score Pool (Cloned to prevent mutation)
        const scoredPool = allQuestions.map(q => {
            const topicWeight = topicWeights[q.topic] || 10;
            const diffWeight = targetDifficulty[q.difficulty] || 0.1;
            const doc = q._doc || q;
            return {
                ...doc,
                selectionScore: topicWeight * diffWeight * (0.8 + Math.random() * 0.4)
            };
        });

        // Return all questions sorted by score
        return scoredPool.sort((a, b) => b.selectionScore - a.selectionScore);
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
        const cloned = [...array];
        for (let i = cloned.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
        }
        return cloned;
    }
}

module.exports = AdaptiveLearningService;
