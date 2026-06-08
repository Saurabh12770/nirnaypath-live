'use strict';
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function runTestCenterTests() {
  console.log('Running Test Center / Mock Test Certification Tests...');

  let token = '';

  // Setup Auth
  try {
    const signupRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Mock Exam Tester',
      email: `exam_tester_${Date.now()}@nirnaypath.local`,
      password: 'Password123!'
    });
    token = signupRes.data.token;
  } catch (error) {
    console.error('Test setup failed (auth error):', error.response?.data || error.message);
    process.exit(1);
  }

  let sessionId = '';
  let questionIds = [];

  // 1. Start a new test session (Topic Test for SSC CGL Aptitude Percentage)
  try {
    console.log('\n--- 1. Creating a Topic Test Session ---');
    const res = await axios.post(`${BASE_URL}/tests/sessions`, {
      testType: 'topic',
      exam: 'SSC CGL',
      subject: 'Aptitude',
      topic: 'Percentage'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Session Start Status:', res.status);
    const session = res.data.session;
    sessionId = session.id;
    questionIds = session.questions.map(q => q._id);
    
    console.log('Created Session ID:', sessionId);
    console.log('Questions count loaded:', session.questions.length);
    console.log('First Question ID:', questionIds[0]);
    console.log('First Question Options:', session.questions[0].options);
    console.log('Timer duration (seconds):', session.timeRemaining);

    if (res.status === 201 && session.questions.length > 0 && session.timeRemaining > 0) {
      console.log('✅ TEST SESSION START: PASS');
    } else {
      console.log('❌ TEST SESSION START: FAIL');
    }
  } catch (error) {
    console.error('Error starting session:', error.response?.data || error.message);
    console.log('❌ TEST SESSION START: FAIL');
    process.exit(1);
  }

  // 2. Autosave Answers (PUT /api/tests/sessions/:id)
  try {
    console.log('\n--- 2. Simulating Answers Autosave ---');
    // Save answer to the first question (e.g. index 1)
    const answers = {};
    answers[questionIds[0]] = 1; // select option index 1

    const saveRes = await axios.put(`${BASE_URL}/tests/sessions/${sessionId}`, {
      answers,
      timeRemaining: 580 // simulate 20s elapsed
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Autosave Response Status:', saveRes.status);
    
    // Retrieve session to verify saved state
    const getRes = await axios.get(`${BASE_URL}/tests/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Retrieved saved answers map:', getRes.data.session.answers);
    console.log('Retrieved remaining time:', getRes.data.session.timeRemaining);

    if (saveRes.status === 200 && getRes.data.session.answers[questionIds[0]] === 1) {
      console.log('✅ ANSWERS AUTOSAVE & NAVIGATION: PASS');
    } else {
      console.log('❌ ANSWERS AUTOSAVE & NAVIGATION: FAIL');
    }
  } catch (error) {
    console.error('Error saving answers:', error.response?.data || error.message);
    console.log('❌ ANSWERS AUTOSAVE & NAVIGATION: FAIL');
  }

  // 3. Submit and Grade
  let resultId = '';
  try {
    console.log('\n--- 3. Submitting and Grading Mock Test ---');
    const submitRes = await axios.post(`${BASE_URL}/tests/sessions/${sessionId}/submit`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Submit Response Status:', submitRes.status);
    const result = submitRes.data.result;
    resultId = result._id;

    console.log('Score:', result.score, '/', result.totalQuestions);
    console.log('Accuracy:', result.accuracy, '%');
    console.log('Duration taken (seconds):', result.duration);
    console.log('Strong Topics:', result.analysis.strongTopics);
    console.log('Weak Topics:', result.analysis.weakTopics);

    if (submitRes.status === 200 && result.score !== undefined && result.accuracy !== undefined) {
      console.log('✅ TEST SUBMISSION & GRADING: PASS');
    } else {
      console.log('❌ TEST SUBMISSION & GRADING: FAIL');
    }
  } catch (error) {
    console.error('Error submitting test:', error.response?.data || error.message);
    console.log('❌ TEST SUBMISSION & GRADING: FAIL');
  }

  // 4. Retrieve Graded Results Report (GET /api/tests/results/:id)
  try {
    console.log('\n--- 4. Fetching Graded Results Report ---');
    const resultRes = await axios.get(`${BASE_URL}/tests/results/${resultId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Results Status:', resultRes.status);
    console.log('Results Accuracy:', resultRes.data.result.accuracy);
    console.log('Result Session Questions count (Answers & Explanations included for review):', resultRes.data.session.questions.length);
    console.log('First Question Correct Answer Key:', resultRes.data.session.questions[0].answer);
    console.log('First Question Explanation (EN):', resultRes.data.session.questions[0].explanation?.en || resultRes.data.session.questions[0].explanation);

    if (resultRes.status === 200 && resultRes.data.session.questions[0].answer !== undefined) {
      console.log('✅ RESULTS DETAILS & REVIEW: PASS');
    } else {
      console.log('❌ RESULTS DETAILS & REVIEW: FAIL');
    }
  } catch (error) {
    console.error('Error fetching results:', error.response?.data || error.message);
    console.log('❌ RESULTS DETAILS & REVIEW: FAIL');
  }
}

runTestCenterTests().catch(err => {
  console.error('Fatal test error:', err);
});
