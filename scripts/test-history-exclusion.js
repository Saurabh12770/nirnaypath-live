const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const TestResult = require('../models/testResult');
const User = require('../models/user');
const QuestionService = require('../services/questionService');
const context = require('../utils/context');
const CacheLayer = require('../services/cacheLayer');

// Mock cache layer so we don't get the same 10 questions in a loop
CacheLayer.getSnapshot = () => null;

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nirnaypath');
        console.log('Connected to MongoDB.');

        // Create dummy user
        const dummyUser = await User.create({
            name: 'History Test User',
            email: `historytest_${Date.now()}@test.com`,
            password: 'password123',
            plan: 'free',
            phone: '0000000000'
        });

        console.log(`Created dummy user: ${dummyUser._id}`);

        const subject = 'english'; // Adjust if needed
        const test1QuestionIds = new Set();

        // Run 5 tests
        for (let i = 1; i <= 5; i++) {
            await context.run({ userId: dummyUser._id }, async () => {
                console.log(`\n--- Running Test #${i} ---`);
                
                const response = await QuestionService.getTestQuestions({
                    userId: dummyUser._id,
                    subject,
                    count: 10
                });
                
                const questions = Array.isArray(response) ? response : (response.questions || []);
                console.log(`Received ${questions.length} questions for Test #${i}.`);
                
                if (i === 1) {
                    questions.forEach(q => test1QuestionIds.add(q._id ? q._id.toString() : String(q.id)));
                }

                // Create TestResult to simulate submitted test
                const answers = questions.map(q => ({
                    questionId: q._id ? q._id.toString() : String(q.id),
                    selected: null,
                    correct: null
                }));

                await TestResult.create({
                    userId: dummyUser._id,
                    sessionId: `dummy-session-${Date.now()}-${i}`,
                    testName: 'Simulated Test',
                    exam: 'General',
                    subject,
                    score: 0,
                    totalQuestions: answers.length,
                    correct: 0,
                    incorrect: 0,
                    unattempted: answers.length,
                    accuracy: 0,
                    answers,
                    timeTaken: 100,
                    createdAt: new Date()
                });

                console.log(`Submitted Test #${i}.`);
            });
            // Sleep slightly to ensure createdAt sorting works
            await new Promise(r => setTimeout(r, 100));
        }

        console.log(`\n--- Running Test #6 (Should exclude Test 1-5 questions) ---`);
        await context.run({ userId: dummyUser._id }, async () => {
            const response = await QuestionService.getTestQuestions({
                userId: dummyUser._id,
                subject,
                count: 10
            });
            
            const questions = Array.isArray(response) ? response : (response.questions || []);
            console.log(`Received ${questions.length} questions for Test #6.`);
            
            let violation = false;
            for (const q of questions) {
                const id = q._id ? q._id.toString() : String(q.id);
                if (test1QuestionIds.has(id)) {
                    console.error(`❌ VIOLATION: Question ${id} from Test #1 reappeared in Test #6!`);
                    violation = true;
                }
            }

            if (!violation) {
                console.log(`✅ SUCCESS: None of the questions from Test #1 appeared in Test #6!`);
            }
        });

        // Cleanup
        await User.findByIdAndDelete(dummyUser._id);
        await TestResult.deleteMany({ userId: dummyUser._id });
        console.log(`\nCleanup complete.`);
        process.exit(0);
    } catch (err) {
        console.error('Error during test:', err);
        process.exit(1);
    }
}

run();
