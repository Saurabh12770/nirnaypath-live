'use strict';
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function runLearnTests() {
  console.log('Running Learn Hub Certification Tests...');

  let token = '';

  // First, we need to sign up/login to get a token because get study content is private
  try {
    const signupRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Learn Tester',
      email: `learn_tester_${Date.now()}@nirnaypath.local`,
      password: 'Password123!'
    });
    token = signupRes.data.token;
  } catch (error) {
    console.error('Test setup failed (auth error):', error.response?.data || error.message);
    process.exit(1);
  }

  // 1. Fetch all exams (Public)
  try {
    console.log('\n--- 1. Fetching all supported exams ---');
    const res = await axios.get(`${BASE_URL}/syllabus`);
    console.log('Status:', res.status);
    console.log(`Found ${res.data.exams.length} exams:`);
    res.data.exams.forEach(e => console.log(`  - [${e.id}] ${e.name} (${e.icon})`));
    if (res.status === 200 && res.data.success && res.data.exams.length > 0) {
      console.log('✅ SYLLABUS LIST: PASS');
    } else {
      console.log('❌ SYLLABUS LIST: FAIL');
    }
  } catch (error) {
    console.error('Error fetching exams:', error.response?.data || error.message);
    console.log('❌ SYLLABUS LIST: FAIL');
  }

  // 2. Fetch detailed syllabus for state-pcs (Public)
  try {
    console.log('\n--- 2. Fetching detailed syllabus for STATE-PCS ---');
    const res = await axios.get(`${BASE_URL}/syllabus/state-pcs`);
    console.log('Status:', res.status);
    console.log('Exam Name:', res.data.syllabus.name);
    console.log(`Subjects count: ${res.data.syllabus.subjects.length}`);
    if (res.data.syllabus.subjects.length > 0) {
      console.log('First Subject:', res.data.syllabus.subjects[0].name);
      console.log(`Topics in first subject: ${res.data.syllabus.subjects[0].topics.length}`);
    }
    if (res.status === 200 && res.data.success && res.data.syllabus.subjects.length > 0) {
      console.log('✅ SYLLABUS DETAILS: PASS');
    } else {
      console.log('❌ SYLLABUS DETAILS: FAIL');
    }
  } catch (error) {
    console.error('Error fetching state-pcs syllabus:', error.response?.data || error.message);
    console.log('❌ SYLLABUS DETAILS: FAIL');
  }

  // 3. Fetch study content (Private)
  try {
    console.log('\n--- 3. Fetching learning content for UPSC Indian Polity Preamble ---');
    const res = await axios.get(`${BASE_URL}/learn/content/upsc/General-Studies/Indian-Polity/Preamble`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Status:', res.status);
    const content = res.data.content;
    console.log('Content Introduction summary:', content.introduction.substring(0, 100));
    console.log('Important Facts count:', content.importantFacts?.length);
    console.log('Tables count:', content.tables?.length);
    if (content.tables && content.tables.length > 0) {
      console.log('Table Title:', content.tables[0].title);
    }
    if (res.status === 200 && res.data.success && content.introduction) {
      console.log('✅ STUDY CONTENT RENDERING: PASS');
    } else {
      console.log('❌ STUDY CONTENT RENDERING: FAIL');
    }
  } catch (error) {
    console.error('Error fetching learning content:', error.response?.data || error.message);
    console.log('❌ STUDY CONTENT RENDERING: FAIL');
  }

  // 4. Update progress
  try {
    console.log('\n--- 4. Updating progress for subtopic "Preamble" ---');
    const progressRes = await axios.post(`${BASE_URL}/learn/progress`, {
      subtopic: 'Preamble',
      completed: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Progress Update Status:', progressRes.status);
    console.log('Progress Map:', progressRes.data.learningProgress);
    if (progressRes.status === 200 && progressRes.data.learningProgress.Preamble === true) {
      console.log('✅ PROGRESS UPDATE: PASS');
    } else {
      console.log('❌ PROGRESS UPDATE: FAIL');
    }
  } catch (error) {
    console.error('Error updating progress:', error.response?.data || error.message);
    console.log('❌ PROGRESS UPDATE: FAIL');
  }
}

runLearnTests().catch(err => {
  console.error('Fatal test error:', err);
});
