'use strict';

const TestResult = require('../models/testResult');
const UserXP = require('../models/UserXP');
const AdaptiveLearningService = require('./adaptiveLearningService');
const RecommendationService = require('../server/services/recommendationService');

/**
 * NirnayPath AI Study Planner Service
 * Module B — AI Study Planner
 */
class AIStudyPlannerService {

    /**
     * Generate a personalized daily study plan based on weak topics, backlog status, and forgetting curves.
     * @param {string|ObjectId} userId
     * @returns {Promise<Object>} The daily study plan
     */
    static async generateDailyPlan(userId) {
        const [recommendations, spacedRepList] = await Promise.all([
            RecommendationService.generate(userId).catch(() => ({ weakTopics: [], recommendations: [], nextTest: [] })),
            AdaptiveLearningService.calculateSpacedRepetition(userId)
        ]);

        const weakTopics = recommendations?.weakTopics || [];
        const nextTestSuggestions = recommendations?.nextTest || [];

        // Backlog detection: Overdue spaced repetition topics (retention < 0.6) or weak topics (< 60% accuracy)
        const overdueTopics = spacedRepList.filter(item => item.isOverdue);
        const backlogTopics = spacedRepList.filter(item => item.mastery < 0.6 && item.daysSinceLastSeen >= 5);

        const tasks = [];
        let focusArea = 'General Practice & Revision';
        let estimatedMinutes = 45;

        // 1. If we have critical spaced repetition items (overdue)
        if (overdueTopics.length > 0) {
            const topDecayed = overdueTopics[0];
            focusArea = `Reviewing ${topDecayed.topicName}`;
            estimatedMinutes = 60; // Deep review
            tasks.push({
                type: 'SPACED_REVISION',
                topicId: topDecayed.topicId,
                topic: topDecayed.topicName,
                durationMinutes: 40,
                priority: 'HIGH',
                reason: `Retention probability has dropped to ${Math.round(topDecayed.retentionProbability * 100)}%. Immediate refresh recommended.`,
                actionUrl: `/drills?topic=${encodeURIComponent(topDecayed.topicId)}`
            });
        }

        // 2. If we have weak topics needing drills
        if (weakTopics.length > 0) {
            const topWeak = weakTopics[0];
            if (tasks.length === 0) {
                focusArea = `Mastering ${topWeak.topic}`;
                estimatedMinutes = 45;
            }
            tasks.push({
                type: 'WEAKNESS_DRILL',
                topicId: topWeak.topicId,
                topic: topWeak.topic,
                durationMinutes: 30,
                priority: tasks.length === 0 ? 'HIGH' : 'MEDIUM',
                reason: `Your topic accuracy is currently low at ${topWeak.accuracy}%. Targeted drill will optimize mastery.`,
                actionUrl: `/drills?topic=${encodeURIComponent(topWeak.topicId)}`
            });
        }

        // 3. Backlog tasks
        if (backlogTopics.length > 0) {
            const topBacklog = backlogTopics[0];
            tasks.push({
                type: 'BACKLOG_CLEARING',
                topicId: topBacklog.topicId,
                topic: topBacklog.topicName,
                durationMinutes: 20,
                priority: 'MEDIUM',
                reason: `Backlog detected: It has been ${Math.round(topBacklog.daysSinceLastSeen)} days since you practiced this low-mastery topic.`,
                actionUrl: `/drills?topic=${encodeURIComponent(topBacklog.topicId)}`
            });
        }

        // If user is fresh with zero history
        if (tasks.length === 0) {
            tasks.push({
                type: 'MOCK_START',
                topicId: 'general',
                topic: 'General Subjects',
                durationMinutes: 30,
                priority: 'HIGH',
                reason: 'Start building your learning profile by completing a general mock test today.',
                actionUrl: nextTestSuggestions[0]?.url || '/dashboard'
            });
        }

        // Accumulate minutes
        const totalDuration = tasks.reduce((sum, t) => sum + t.durationMinutes, 0);

        return {
            generatedAt: new Date(),
            userId: String(userId),
            focusArea,
            estimatedMinutes: totalDuration,
            tasks,
            backlogCount: backlogTopics.length + overdueTopics.length,
            recommendations: recommendations?.recommendations?.slice(0, 2) || []
        };
    }

    /**
     * Generate a comprehensive 7-day weekly schedule with proportional time allocations.
     * @param {string|ObjectId} userId
     * @returns {Promise<Object>} The weekly study schedule
     */
    static async generateWeeklySchedule(userId) {
        const [dailyPlan, spacedRepList] = await Promise.all([
            this.generateDailyPlan(userId),
            AdaptiveLearningService.calculateSpacedRepetition(userId)
        ]);

        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const schedule = {};

        // Extract topics and compute mastery gaps (1 - mastery)
        const sortedTopics = spacedRepList.sort((a, b) => a.mastery - b.mastery);
        const weakPool = sortedTopics.slice(0, 3);
        const mediumPool = sortedTopics.filter(t => t.mastery >= 0.6 && t.mastery < 0.8).slice(0, 3);
        const strongPool = sortedTopics.filter(t => t.mastery >= 0.8).slice(0, 2);

        days.forEach((day, index) => {
            const blocks = [];

            // Distribute blocks dynamically across days
            if (index === 5) {
                // Saturday: High-intensity testing day
                blocks.push({
                    name: 'Full Length Mock Exam',
                    durationMinutes: 120,
                    type: 'MOCK_TEST',
                    focus: 'Exam endurance & speed optimization',
                    actionUrl: '/test'
                });
            } else if (index === 6) {
                // Sunday: Lightweight review & active recall day
                blocks.push({
                    name: 'Weekly Performance Review',
                    durationMinutes: 30,
                    type: 'ANALYTICS_CHECK',
                    focus: 'Identify streak status & analytics trends',
                    actionUrl: '/performance-intelligence.html'
                });
                if (weakPool.length > 0) {
                    blocks.push({
                        name: 'Light Concept Revision',
                        durationMinutes: 20,
                        type: 'TUTOR_REVIEW',
                        focus: `Read summaries for ${weakPool[0].topicName}`,
                        actionUrl: `/drills?topic=${encodeURIComponent(weakPool[0].topicId)}`
                    });
                }
            } else {
                // Weekdays: Alternating focus between weaknesses, backlogs, and strengths
                const focusTopic = weakPool[index % Math.max(weakPool.length, 1)];
                const maintainTopic = mediumPool[index % Math.max(mediumPool.length, 1)] || strongPool[index % Math.max(strongPool.length, 1)];

                if (focusTopic) {
                    // Time allocation is proportional to mastery gap: lower mastery = more minutes
                    const gap = 1.0 - focusTopic.mastery;
                    const allocatedMins = Math.round(30 + gap * 30); // 30 to 60 mins

                    blocks.push({
                        name: `Targeted Practice: ${focusTopic.topicName}`,
                        durationMinutes: allocatedMins,
                        type: 'WEAKNESS_FOCUS',
                        focus: `Boost topic accuracy. Current mastery: ${Math.round(focusTopic.mastery * 100)}%`,
                        actionUrl: `/drills?topic=${encodeURIComponent(focusTopic.topicId)}`
                    });
                }

                if (maintainTopic) {
                    blocks.push({
                        name: `Retention Boost: ${maintainTopic.topicName}`,
                        durationMinutes: 20,
                        type: 'RETENTION_MAINTENANCE',
                        focus: `Maintain high memory level. Current retention: ${Math.round(maintainTopic.retentionProbability * 100)}%`,
                        actionUrl: `/drills?topic=${encodeURIComponent(maintainTopic.topicId)}`
                    });
                }
            }

            // Fallback for fresh users
            if (blocks.length === 0) {
                blocks.push({
                    name: 'Core Concepts & Introduction',
                    durationMinutes: 45,
                    type: 'GENERAL_REVISION',
                    focus: 'Review key syllabus guidelines and explore subject options',
                    actionUrl: '/about.html'
                });
            }

            schedule[day] = {
                dayName: day,
                totalMinutes: blocks.reduce((sum, b) => sum + b.durationMinutes, 0),
                blocks
            };
        });

        return {
            generatedAt: new Date(),
            userId: String(userId),
            dailyBacklogCount: dailyPlan.backlogCount,
            schedule
        };
    }
}

module.exports = AIStudyPlannerService;
