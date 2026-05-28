'use strict';

const learningProfile = require('./studentLearningProfileService');

class AiLearningPlanner {
    /**
     * Generates a concrete personalized revision timeline based on weak areas.
     */
    async generateStudyPlan(userId) {
        const weakTopics = await learningProfile.predictWeaknesses(userId);
        const consistency = await learningProfile.getConsistencyScore(userId);

        const tasks = [];
        if (weakTopics.length > 0) {
            weakTopics.forEach((topic, idx) => {
                tasks.push({
                    day: idx + 1,
                    action: `Revise weak topic: ${topic}`,
                    reason: 'Success rate below 60% in past tests.'
                });
            });
        } else {
            tasks.push({
                day: 1,
                action: 'Maintain consistency: Take a random 10-question test',
                reason: 'No current weak topics identified.'
            });
        }

        return {
            consistencyScore: consistency,
            recommendationCount: tasks.length,
            schedule: tasks
        };
    }
}

module.exports = new AiLearningPlanner();
