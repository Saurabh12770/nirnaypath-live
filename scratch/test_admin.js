'use strict';
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function runAdminTests() {
  console.log('Running Admin Panel Certification Tests...');

  let token = '';

  // 1. Authenticate as Admin
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@nirnaypath.local',
      password: 'adminpassword123'
    });
    token = loginRes.data.token;
    console.log('Admin login status:', loginRes.status);
    console.log('Admin User Name:', loginRes.data.user.name);
    console.log('Admin User Role:', loginRes.data.user.role);
    if (loginRes.data.user.role === 'admin') {
      console.log('✅ ADMIN AUTH: PASS');
    } else {
      console.log('❌ ADMIN AUTH: FAIL');
    }
  } catch (error) {
    console.error('Admin authentication failed:', error.response?.data || error.message);
    console.log('❌ ADMIN AUTH: FAIL');
    process.exit(1);
  }

  // 2. Fetch Reports Summary
  try {
    console.log('\n--- 2. Fetching Admin Reports ---');
    const res = await axios.get(`${BASE_URL}/admin/reports`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Status:', res.status);
    console.log('Reports:', JSON.stringify(res.data.report, null, 2));
    if (res.status === 200 && res.data.success && res.data.report.totalQuestions > 0) {
      console.log('✅ ADMIN REPORTS: PASS');
    } else {
      console.log('❌ ADMIN REPORTS: FAIL');
    }
  } catch (error) {
    console.error('Reports fetch failed:', error.response?.data || error.message);
    console.log('❌ ADMIN REPORTS: FAIL');
  }

  // 3. Question Listing (Paginated)
  try {
    console.log('\n--- 3. Fetching Paginated Questions ---');
    const res = await axios.get(`${BASE_URL}/admin/questions?page=1&limit=2`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Status:', res.status);
    console.log('Total Questions in DB:', res.data.total);
    console.log('Pages count:', res.data.pages);
    console.log('Questions returned:', res.data.questions.length);
    if (res.status === 200 && res.data.success && res.data.questions.length === 2) {
      console.log('✅ QUESTION LISTING: PASS');
    } else {
      console.log('❌ QUESTION LISTING: FAIL');
    }
  } catch (error) {
    console.error('Question listing failed:', error.response?.data || error.message);
    console.log('❌ QUESTION LISTING: FAIL');
  }

  // 4. Question CRUD
  let dummyId = '';
  try {
    console.log('\n--- 4. Creating a Question ---');
    const createRes = await axios.post(`${BASE_URL}/admin/questions`, {
      exam: 'SSC CGL',
      subject: 'Aptitude',
      topic: 'Percentage',
      subtopic: 'Percentage',
      difficulty: 'easy',
      question: { en: 'What is 10% of 100?', hi: '100 का 10% क्या है?' },
      options: [
        { en: '10', hi: '10' },
        { en: '20', hi: '20' },
        { en: '30', hi: '30' },
        { en: '40', hi: '40' }
      ],
      answer: 0,
      explanation: { en: '10% of 100 is 10.', hi: '100 का 10% 10 होता है।' }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Create Status:', createRes.status);
    dummyId = createRes.data.question._id;
    console.log('Created Question ID:', dummyId);

    console.log('\n--- 5. Updating the Question ---');
    const updateRes = await axios.put(`${BASE_URL}/admin/questions/${dummyId}`, {
      difficulty: 'medium'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Update Status:', updateRes.status);
    console.log('Updated Difficulty:', updateRes.data.question.difficulty);

    console.log('\n--- 6. Deleting the Question ---');
    const deleteRes = await axios.delete(`${BASE_URL}/admin/questions/${dummyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Delete Status:', deleteRes.status);
    console.log('Delete Message:', deleteRes.data.message);

    if (createRes.status === 201 && updateRes.data.question.difficulty === 'medium' && deleteRes.status === 200) {
      console.log('✅ QUESTION CRUD: PASS');
    } else {
      console.log('❌ QUESTION CRUD: FAIL');
    }
  } catch (error) {
    console.error('Question CRUD failed:', error.response?.data || error.message);
    console.log('❌ QUESTION CRUD: FAIL');
  }

  // 5. Notes Editing (Study Content)
  try {
    console.log('\n--- 7. Saving/Updating Study Notes Content ---');
    const res = await axios.post(`${BASE_URL}/admin/content`, {
      exam: 'UPSC',
      subject: 'General-Studies',
      topic: 'Indian-Polity',
      subtopic: 'Preamble',
      introduction: 'Certified Introduction',
      detailedExplanation: '### Certified Explanation\nDetailed concepts.',
      revisionNotes: '* Certified Note 1'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Status:', res.status);
    console.log('Notes Subtopic Saved:', res.data.content.subtopic);
    console.log('Notes Intro Saved:', res.data.content.introduction);
    if (res.status === 200 && res.data.content.introduction === 'Certified Introduction') {
      console.log('✅ NOTES EDITING: PASS');
    } else {
      console.log('❌ NOTES EDITING: FAIL');
    }
  } catch (error) {
    console.error('Notes editing failed:', error.response?.data || error.message);
    console.log('❌ NOTES EDITING: FAIL');
  }

  // 6. User Management
  try {
    console.log('\n--- 8. Listing Users ---');
    const res = await axios.get(`${BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Status:', res.status);
    console.log('Users registered count:', res.data.users.length);
    if (res.status === 200 && res.data.users.length > 0) {
      console.log('✅ USER MANAGEMENT: PASS');
    } else {
      console.log('❌ USER MANAGEMENT: FAIL');
    }
  } catch (error) {
    console.error('User listing failed:', error.response?.data || error.message);
    console.log('❌ USER MANAGEMENT: FAIL');
  }

  // 7. Syllabus Editing (Verification)
  try {
    console.log('\n--- 9. Checking Syllabus Editing Endpoint ---');
    // Check if PUT /api/admin/syllabus or similar exists
    await axios.put(`${BASE_URL}/admin/syllabus`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('❌ SYLLABUS EDITING: PASS');
  } catch (error) {
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message || error.response?.data?.error || error.message);
    if (error.response?.status === 404) {
      console.log('✅ SYLLABUS EDITING: FAIL (Correctly identified as unimplemented / 404)');
    } else {
      console.log('❌ SYLLABUS EDITING: FAIL');
    }
  }
}

runAdminTests().catch(err => {
  console.error('Fatal test error:', err);
});
