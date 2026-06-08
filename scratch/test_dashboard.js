'use strict';
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function runDashboardTests() {
  console.log('Running Dashboard Analytics Certification Tests...');

  let token = '';

  // 1. Setup Auth
  try {
    const signupRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Dashboard Analytics Tester',
      email: `dash_tester_${Date.now()}@nirnaypath.local`,
      password: 'Password123!'
    });
    token = signupRes.data.token;
  } catch (error) {
    console.error('Test setup failed (auth error):', error.response?.data || error.message);
    process.exit(1);
  }

  // 2. Add some mock activity: complete a subtopic
  try {
    await axios.post(`${BASE_URL}/learn/progress`, {
      subtopic: 'Preamble',
      completed: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Completed topic "Preamble" in Learn Hub.');
  } catch (error) {
    console.error('Error adding mock learn progress:', error.message);
  }

  // 3. Add some mock activity: take a topic test and submit it
  try {
    console.log('Attempting to create a mock test session...');
    const sessionRes = await axios.post(`${BASE_URL}/tests/sessions`, {
      testType: 'topic',
      exam: 'SSC CGL',
      subject: 'Aptitude',
      topic: 'Percentage & Profit Loss' // use the exact topic from sample questions
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const sessionId = sessionRes.data.session.id;
    console.log(`Mock test session created with ID: ${sessionId}`);
    
    // Submit right away (0 correct, 0% accuracy)
    const submitRes = await axios.post(`${BASE_URL}/tests/sessions/${sessionId}/submit`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Submitted mock test successfully.', submitRes.data.result);
  } catch (error) {
    console.error('Error completing mock test:', error.response?.data || error.message);
  }

  // 4. Retrieve dashboard summary
  try {
    console.log('\n--- 4. Fetching Dashboard Summary Statistics ---');
    const res = await axios.get(`${BASE_URL}/dashboard/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Status:', res.status);
    const stats = res.data.stats;
    console.log('Tests Attempted:', stats.testsAttempted);
    console.log('Average Accuracy:', stats.accuracy, '%');
    console.log('Learning Progress Progress:', stats.learningProgress, '%');
    console.log('Recent Activity count:', stats.recentActivity.length);
    if (stats.recentActivity.length > 0) {
      console.log('First Activity Label:', stats.recentActivity[0].label);
    }
    console.log('Performance Trend points count:', stats.performanceTrend.length);
    console.log('Strong Topics:', stats.strongTopics);
    console.log('Weak Topics:', stats.weakTopics);

    if (res.status === 200 && stats.testsAttempted === 1 && stats.learningProgress > 0 && stats.recentActivity.length > 0) {
      console.log('✅ DASHBOARD SUMMARY: PASS');
    } else {
      console.log('❌ DASHBOARD SUMMARY: FAIL');
    }
  } catch (error) {
    console.error('Error fetching dashboard summary:', error.response?.data || error.message);
    console.log('❌ DASHBOARD SUMMARY: FAIL');
  }
}

runDashboardTests().catch(err => {
  console.error('Fatal test error:', err);
});
