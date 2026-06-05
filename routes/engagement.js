'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const DailyChallenge = require('../models/DailyChallenge');
const StudyGroup = require('../models/StudyGroup');
const PeerBattle = require('../models/PeerBattle');
const CommunityDiscussion = require('../models/CommunityDiscussion');
const GoalTracker = require('../models/GoalTracker');
const Question = require('../models/question');
const GrowthService = require('../services/growthService');
const TestResult = require('../models/testResult');

/* ─── DAILY CHALLENGES ─────────────────────────────────────────────── */

/**
 * GET /api/engagement/challenge
 * Fetch today's challenge question.
 */
router.get('/challenge', auth, async (req, res) => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        let challenge = await DailyChallenge.findOne({ date: todayStr }).populate('questionId');

        if (!challenge) {
            // Find a random question to seed today's challenge
            const randomQuestion = await Question.findOne();
            if (!randomQuestion) {
                return res.status(404).json({ error: 'No questions available to generate challenge.' });
            }

            challenge = new DailyChallenge({
                date: todayStr,
                questionId: randomQuestion._id,
                rewardCredits: 20,
                completedUsers: []
            });
            await challenge.save();
            challenge = await DailyChallenge.findOne({ date: todayStr }).populate('questionId');
        }

        const isCompleted = challenge.completedUsers.some(
            u => u.userId.toString() === req.user._id.toString()
        );

        res.json({
            date: challenge.date,
            rewardCredits: challenge.rewardCredits,
            question: challenge.questionId,
            isCompleted
        });
    } catch (err) {
        console.error('[ENGAGEMENT] Daily challenge fetch error:', err.message);
        res.status(500).json({ error: 'Failed to retrieve daily challenge.' });
    }
});

/**
 * POST /api/engagement/challenge/submit
 * Submit daily challenge response.
 */
router.post('/challenge/submit', auth, async (req, res) => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const { answerIndex } = req.body;

        const challenge = await DailyChallenge.findOne({ date: todayStr }).populate('questionId');
        if (!challenge) {
            return res.status(404).json({ error: 'Daily challenge not active.' });
        }

        const alreadyCompleted = challenge.completedUsers.some(
            u => u.userId.toString() === req.user._id.toString()
        );
        if (alreadyCompleted) {
            return res.status(400).json({ error: 'You have already completed today\'s challenge.' });
        }

        const isCorrect = parseInt(answerIndex) === challenge.questionId.correctAnswer;

        if (isCorrect) {
            challenge.completedUsers.push({ userId: req.user._id, completedAt: new Date() });
            await challenge.save();

            // Credit user wallet
            await GrowthService.adjustWallet(req.user._id, {
                rewardCredits: challenge.rewardCredits,
                amount: 0,
                type: 'credit',
                source: 'reward',
                description: `Completed daily challenge for ${todayStr}`
            });

            // Update goal tracker progress
            await updateGoalProgress(req.user._id, { minutes: 5 });

            return res.json({ correct: true, rewardCredits: challenge.rewardCredits });
        }

        res.json({ correct: false, message: 'Incorrect. Try reviewing the topic details!' });
    } catch (err) {
        console.error('[ENGAGEMENT] Challenge submit error:', err.message);
        res.status(500).json({ error: 'Failed to process challenge submission.' });
    }
});

/* ─── STUDY GROUPS ─────────────────────────────────────────────────── */

/**
 * POST /api/engagement/groups
 * Create a new study group.
 */
router.post('/groups', auth, async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Study group name is required.' });
        }

        const group = new StudyGroup({
            name,
            description,
            creatorId: req.user._id,
            members: [{ userId: req.user._id, role: 'creator', joinedAt: new Date() }],
            targetXP: 10000,
            currentXP: 0
        });

        await group.save();
        res.json({ message: 'Study group created successfully', group });
    } catch (err) {
        console.error('[ENGAGEMENT] Create group error:', err.message);
        res.status(400).json({ error: err.message });
    }
});

/**
 * GET /api/engagement/groups
 * List all study groups.
 */
router.get('/groups', auth, async (req, res) => {
    try {
        const groups = await StudyGroup.find({}).limit(50).lean();
        res.json(groups);
    } catch (err) {
        console.error('[ENGAGEMENT] List groups error:', err.message);
        res.status(500).json({ error: 'Failed to list study groups.' });
    }
});

/**
 * POST /api/engagement/groups/:id/join
 * Join an existing study group.
 */
router.post('/groups/:id/join', auth, async (req, res) => {
    try {
        const group = await StudyGroup.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ error: 'Study group not found.' });
        }

        const isMember = group.members.some(m => m.userId.toString() === req.user._id.toString());
        if (isMember) {
            return res.status(400).json({ error: 'You are already a member of this study group.' });
        }

        group.members.push({ userId: req.user._id, role: 'member', joinedAt: new Date() });
        await group.save();

        res.json({ message: 'Successfully joined study group', group });
    } catch (err) {
        console.error('[ENGAGEMENT] Join group error:', err.message);
        res.status(500).json({ error: 'Failed to join group.' });
    }
});

/* ─── PEER BATTLES ─────────────────────────────────────────────────── */

/**
 * POST /api/engagement/battles
 * Initiate a head-to-head battle with a friend or peer.
 */
router.post('/battles', auth, async (req, res) => {
    try {
        const { opponentId } = req.body;
        if (!opponentId) {
            return res.status(400).json({ error: 'opponentId is required.' });
        }

        // Generate 5 random questions for this battle
        const questions = await Question.find().limit(5).select('_id').lean();
        if (questions.length === 0) {
            return res.status(400).json({ error: 'No questions available for matchmaking.' });
        }

        const battle = new PeerBattle({
            challengerId: req.user._id,
            opponentId,
            status: 'pending',
            questions: questions.map(q => q._id),
            challengerScore: 0,
            opponentScore: 0
        });

        await battle.save();
        res.json({ message: 'Battle initiated successfully', battle });
    } catch (err) {
        console.error('[ENGAGEMENT] Peer battle initiation error:', err.message);
        res.status(500).json({ error: 'Failed to create battle.' });
    }
});

/**
 * POST /api/engagement/battles/:id/submit
 * Submit scores for completed battle session.
 */
router.post('/battles/:id/submit', auth, async (req, res) => {
    try {
        const { score } = req.body;
        const battle = await PeerBattle.findById(req.params.id);
        if (!battle) {
            return res.status(404).json({ error: 'Battle match not found.' });
        }

        const isChallenger = battle.challengerId.toString() === req.user._id.toString();
        const isOpponent = battle.opponentId.toString() === req.user._id.toString();

        if (!isChallenger && !isOpponent) {
            return res.status(403).json({ error: 'Access denied: not a participant of this battle.' });
        }

        if (isChallenger) {
            battle.challengerScore = score;
        } else {
            battle.opponentScore = score;
            battle.status = 'completed'; // Asynchronously marked complete on opponent response
        }

        // Determine winner if both scores recorded
        if (battle.challengerScore > 0 && battle.opponentScore > 0) {
            battle.status = 'completed';
            if (battle.challengerScore > battle.opponentScore) {
                battle.winnerId = battle.challengerId;
            } else if (battle.opponentScore > battle.challengerScore) {
                battle.winnerId = battle.opponentId;
            }
            // Reward winner
            if (battle.winnerId) {
                await GrowthService.adjustWallet(battle.winnerId, {
                    rewardCredits: 30,
                    amount: 0,
                    type: 'credit',
                    source: 'reward',
                    description: 'Won head-to-head peer battle'
                });
            }
        }

        await battle.save();
        res.json({ message: 'Score updated', battle });
    } catch (err) {
        console.error('[ENGAGEMENT] Battle submission error:', err.message);
        res.status(500).json({ error: 'Failed to update battle score.' });
    }
});

/**
 * GET /api/engagement/battles
 * Get pending and active battles.
 */
router.get('/battles', auth, async (req, res) => {
    try {
        const list = await PeerBattle.find({
            $or: [
                { challengerId: req.user._id },
                { opponentId: req.user._id }
            ]
        }).sort({ createdAt: -1 }).limit(10).lean();
        res.json(list);
    } catch (err) {
        console.error('[ENGAGEMENT] List battles error:', err.message);
        res.status(500).json({ error: 'Failed to retrieve battles.' });
    }
});

/* ─── COMMUNITY DISCUSSIONS ────────────────────────────────────────── */

/**
 * POST /api/engagement/discussions
 * Start a discussion thread on a question or topic.
 */
router.post('/discussions', auth, async (req, res) => {
    try {
        const { targetId, targetType, title, text } = req.body;
        if (!targetId || !title || !text) {
            return res.status(400).json({ error: 'targetId, title, and text are required.' });
        }

        const disc = new CommunityDiscussion({
            targetId,
            targetType: targetType || 'general',
            title,
            authorId: req.user._id,
            authorName: req.user.name,
            text,
            upvotes: [],
            comments: []
        });

        await disc.save();
        res.json({ message: 'Discussion posted successfully', discussion: disc });
    } catch (err) {
        console.error('[ENGAGEMENT] Post discussion error:', err.message);
        res.status(500).json({ error: 'Failed to publish discussion thread.' });
    }
});

/**
 * GET /api/engagement/discussions/:targetId
 * Get discussion threads for a target element.
 */
router.get('/discussions/:targetId', auth, async (req, res) => {
    try {
        const threads = await CommunityDiscussion.find({ targetId: req.params.targetId })
            .sort({ createdAt: -1 })
            .lean();
        res.json(threads);
    } catch (err) {
        console.error('[ENGAGEMENT] Fetch discussions error:', err.message);
        res.status(500).json({ error: 'Failed to retrieve discussion threads.' });
    }
});

/**
 * POST /api/engagement/discussions/:id/comments
 * Post a comment inside a discussion thread.
 */
router.post('/discussions/:id/comments', auth, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Comment content text is required.' });
        }

        const disc = await CommunityDiscussion.findById(req.params.id);
        if (!disc) {
            return res.status(404).json({ error: 'Discussion thread not found.' });
        }

        disc.comments.push({
            authorId: req.user._id,
            authorName: req.user.name,
            text,
            upvotes: [],
            createdAt: new Date()
        });

        await disc.save();
        res.json(disc);
    } catch (err) {
        console.error('[ENGAGEMENT] Post comment error:', err.message);
        res.status(500).json({ error: 'Failed to post reply comment.' });
    }
});

/* ─── GOAL & HABIT TRACKING ───────────────────────────────────────── */

/**
 * GET /api/engagement/goals
 * Fetch user goal completion state and streak.
 */
router.get('/goals', auth, async (req, res) => {
    try {
        const tracker = await getOrCreateGoalTracker(req.user._id);
        res.json(tracker);
    } catch (err) {
        console.error('[ENGAGEMENT] Get goals error:', err.message);
        res.status(500).json({ error: 'Failed to retrieve goal tracker.' });
    }
});

/**
 * POST /api/engagement/goals/progress
 * Update daily goals explicitly (e.g. studied for N minutes).
 */
router.post('/goals/progress', auth, async (req, res) => {
    try {
        const { minutes = 0, mocks = 0 } = req.body;
        const tracker = await updateGoalProgress(req.user._id, { minutes, mocks });
        res.json(tracker);
    } catch (err) {
        console.error('[ENGAGEMENT] Update goals error:', err.message);
        res.status(500).json({ error: 'Failed to update goal progress.' });
    }
});

/* ─── HELPER FUNCTIONS ──────────────────────────────────────────────── */

async function getOrCreateGoalTracker(userId) {
    let tracker = await GoalTracker.findOne({ userId });
    if (!tracker) {
        tracker = new GoalTracker({
            userId,
            dailyMockGoal: 1,
            dailyMockCount: 0,
            dailyMinutesGoal: 30,
            dailyMinutesCount: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastActiveDate: null
        });
        await tracker.save();
    }
    return tracker;
}

async function updateGoalProgress(userId, { minutes = 0, mocks = 0 }) {
    const tracker = await getOrCreateGoalTracker(userId);
    const todayStr = new Date().toISOString().split('T')[0];
    const prevActiveDate = tracker.lastActiveDate; // Capture previous value before mutation

    // Reset counts if active day has rolled over
    if (tracker.lastActiveDate !== todayStr) {
        // Calculate streak maintenance before reset
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (tracker.lastActiveDate === yesterdayStr) {
            // Keep streak alive
        } else if (tracker.lastActiveDate !== null) {
            // Streak broken
            tracker.currentStreak = 0;
        }

        tracker.dailyMockCount = 0;
        tracker.dailyMinutesCount = 0;
        tracker.lastActiveDate = todayStr;
    }

    tracker.dailyMockCount += mocks;
    tracker.dailyMinutesCount += minutes;

    // Check if daily goals are fully met to increment/sustain streak
    const mockMet = tracker.dailyMockCount >= tracker.dailyMockGoal;
    const minutesMet = tracker.dailyMinutesCount >= tracker.dailyMinutesGoal;

    if (mockMet && minutesMet) {
        // Double check we haven't already marked streak up today
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        // Compare against the captured prevActiveDate to see if last active day was yesterday
        if (tracker.currentStreak === 0 || prevActiveDate === yesterdayStr) {
            tracker.currentStreak += 1;
            if (tracker.currentStreak > tracker.longestStreak) {
                tracker.longestStreak = tracker.currentStreak;
            }
        }
    }

    await tracker.save();
    return tracker;
}

/**
 * GET /api/engagement/smart-feed
 * Generates personalized, contextual recommendation cards/banners
 * using only existing learner data (no schema changes).
 */
router.get('/smart-feed', auth, async (req, res) => {
    try {
        const userId = req.user._id;
        const feed = [];

        // 1. Fetch data concurrently
        const [lastTest, allTests, tracker] = await Promise.all([
            TestResult.findOne({ userId }).sort({ createdAt: -1 }).lean(),
            TestResult.find({ userId }).select('subject accuracy totalQuestions correct').lean(),
            GoalTracker.findOne({ userId }).lean()
        ]);

        // 2. Nudge based on Streak status
        if (tracker) {
            const streak = tracker.currentStreak || 0;
            if (streak > 0) {
                feed.push({
                    id: 'streak-status',
                    type: 'success',
                    icon: '🔥',
                    message: `You're on a <strong>${streak}-day streak</strong>! Keep the momentum going today.`,
                    actionText: 'Keep Streak Alive',
                    actionLink: '#practice-zone',
                    priority: 90
                });
            } else {
                feed.push({
                    id: 'streak-status',
                    type: 'info',
                    icon: '🎯',
                    message: 'Start a study streak! Complete a test today to start your streak.',
                    actionText: 'Take a Test',
                    actionLink: '#practice-zone',
                    priority: 50
                });
            }
        }

        // 3. Nudge based on Last Test
        if (lastTest) {
            const dateStr = new Date(lastTest.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            let type = 'info';
            let message = '';

            if (lastTest.accuracy >= 80) {
                type = 'success';
                message = `Excellent job on your last <strong>${lastTest.subject.toUpperCase()}</strong> test on ${dateStr} (${lastTest.accuracy}% accuracy)! Ready to raise the bar?`;
            } else if (lastTest.accuracy < 50) {
                type = 'warning';
                message = `Your last <strong>${lastTest.subject.toUpperCase()}</strong> test on ${dateStr} was challenging (${lastTest.accuracy}% accuracy). Let's review the concepts.`;
            } else {
                message = `You scored <strong>${lastTest.score}/${lastTest.totalQuestions}</strong> in <strong>${lastTest.subject.toUpperCase()}</strong> on ${dateStr}. Keep practicing to perfect this subject!`;
            }

            feed.push({
                id: 'last-test',
                type: type,
                icon: '📊',
                message: message,
                actionText: 'Review Test',
                actionLink: `javascript:Dashboard.viewResult('${lastTest._id}')`,
                priority: 80
            });
        } else {
            // No tests taken yet
            feed.push({
                id: 'welcome-nudge',
                type: 'primary',
                icon: '🚀',
                message: 'Welcome to NirnayPath! Let\'s begin by taking a diagnostic mock test.',
                actionText: 'Start Test',
                actionLink: '#popular-exams',
                priority: 100
            });
        }

        // 4. Calculate Weak Topic (Subject) from all test results
        if (allTests && allTests.length > 0) {
            const subjectData = {};
            allTests.forEach(test => {
                if (test.subject) {
                    const sub = test.subject.trim();
                    if (!subjectData[sub]) {
                        subjectData[sub] = { total: 0, correct: 0 };
                    }
                    subjectData[sub].total += test.totalQuestions || 0;
                    subjectData[sub].correct += test.correct || 0;
                }
            });

            let weakSubject = null;
            let lowestAccuracy = 100;

            for (const sub in subjectData) {
                if (subjectData[sub].total > 0) {
                    const accuracy = Math.round((subjectData[sub].correct / subjectData[sub].total) * 100);
                    if (accuracy < lowestAccuracy) {
                        lowestAccuracy = accuracy;
                        weakSubject = sub;
                    }
                }
            }

            // Only nudge if the lowest accuracy is below 70% to be meaningful
            if (weakSubject && lowestAccuracy < 70) {
                feed.push({
                    id: 'weak-subject',
                    type: 'warning',
                    icon: '💡',
                    message: `Focus Area: Accuracy in <strong>${weakSubject.toUpperCase()}</strong> is currently at <strong>${lowestAccuracy}%</strong>. Take a quick drill to improve!`,
                    actionText: 'Practice Drills',
                    actionLink: '#practice-zone',
                    priority: 85
                });
            }
        }

        // Sort by priority descending
        feed.sort((a, b) => b.priority - a.priority);

        res.json({ feed });
    } catch (err) {
        console.error('[ENGAGEMENT] Smart feed calculation error:', err.message);
        res.status(500).json({ error: 'Failed to generate smart feed.' });
    }
});

module.exports = router;
module.exports.updateGoalProgress = updateGoalProgress;
