const TestResult = require('../models/TestResult');
const User = require('../models/User');

/**
 * NirnayPath Student Learning Profile Engine
 * Builds a multi-dimensional intelligence map for each student
 */
class StudentLearningProfileService {
    
    /**
     * Generate Comprehensive Learning Profile
     */
    static async getProfile(userId) {
        const results = await TestResult.find({ userId }).sort({ createdAt: -1 });
        
        if (results.length === 0) return null;

        const profile = {
            overallAccuracy: 0,
            learningVelocity: 0,
            topicMastery: {},
            difficultyHandling: { easy: 0, medium: 0, hard: 0 },
            timeEfficiency: 0,
            burnoutRisk: 0,
            forgettingCurve: []
        };

        let totalAccuracy = 0;
        let totalTimePerQ = 0;
        let totalQs = 0;

        results.forEach(res => {
            totalAccuracy += res.accuracy;
            totalQs += res.totalQuestions;
            if (res.timeTaken > 0) {
                totalTimePerQ += (res.timeTaken / res.totalQuestions);
            }

            // Aggregate Topic Mastery
            res.answers.forEach(ans => {
                const tid = ans.topicId || 'general';
                if (!profile.topicMastery[tid]) {
                    profile.topicMastery[tid] = { name: ans.topic, attempts: 0, correct: 0, lastSeen: res.createdAt };
                }
                profile.topicMastery[tid].attempts++;
                if (ans.isCorrect) profile.topicMastery[tid].correct++;
                if (res.createdAt > profile.topicMastery[tid].lastSeen) {
                    profile.topicMastery[tid].lastSeen = res.createdAt;
                }
            });
        });

        profile.overallAccuracy = totalAccuracy / results.length;
        profile.timeEfficiency = totalQs > 0 ? totalTimePerQ / results.length : 0;
        
        // Calculate Learning Velocity (Accuracy trend over last 10 tests)
        const recent = results.slice(0, 10);
        if (recent.length >= 2) {
            const first = recent[recent.length - 1].accuracy;
            const last = recent[0].accuracy;
            profile.learningVelocity = (last - first) / recent.length;
        }

        // Calculate Burnout Risk (Based on test frequency spikes vs consistency)
        const recentDates = recent.map(r => r.createdAt.getTime());
        if (recentDates.length > 5) {
            const spread = recentDates[0] - recentDates[recentDates.length - 1];
            const avgGap = spread / recentDates.length;
            if (avgGap < (3600 * 1000 * 4)) profile.burnoutRisk = 80; // Testing every 4 hours? High risk.
        }

        return profile;
    }

    /**
     * Identify Priority Revision Topics (Spaced Repetition)
     */
    static async getRevisionQueue(userId) {
        const profile = await this.getProfile(userId);
        if (!profile) return [];

        const now = new Date();
        const queue = [];

        Object.entries(profile.topicMastery).forEach(([id, data]) => {
            const accuracy = (data.correct / data.attempts) * 100;
            const daysSinceLast = (now - new Date(data.lastSeen)) / (1000 * 3600 * 24);
            
            // Forgetting Curve Logic:
            // 1. Weak topics (accuracy < 60) need revision every 2 days
            // 2. Medium topics (60-80) need revision every 7 days
            // 3. Strong topics (>80) need revision every 21 days
            let threshold = 21;
            if (accuracy < 60) threshold = 2;
            else if (accuracy < 80) threshold = 7;

            if (daysSinceLast >= threshold) {
                queue.push({
                    topicId: id,
                    name: data.name,
                    accuracy,
                    priority: accuracy < 60 ? 'HIGH' : 'MEDIUM'
                });
            }
        });

        return queue.sort((a, b) => a.accuracy - b.accuracy);
    }
}

module.exports = StudentLearningProfileService;
