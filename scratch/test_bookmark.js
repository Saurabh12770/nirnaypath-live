'use strict';
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function runBookmarkTests() {
  console.log('Running Bookmarks Certification Tests...');

  let token = '';

  // 1. Setup Auth
  try {
    const signupRes = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Bookmark Tester',
      email: `bookmark_tester_${Date.now()}@nirnaypath.local`,
      password: 'Password123!'
    });
    token = signupRes.data.token;
  } catch (error) {
    console.error('Test setup failed (auth error):', error.response?.data || error.message);
    process.exit(1);
  }

  // Get a sample question ID to bookmark
  let questionId = '';
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@nirnaypath.local',
      password: 'adminpassword123'
    });
    const adminToken = loginRes.data.token;
    const qListRes = await axios.get(`${BASE_URL}/admin/questions?page=1&limit=1`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    questionId = qListRes.data.questions[0]._id;
    console.log('Using sample question ID for bookmark test:', questionId);
  } catch (error) {
    console.error('Failed to get sample question:', error.message);
    process.exit(1);
  }

  let bookmarkId = '';

  // 2. Toggle Bookmark ON
  try {
    console.log('\n--- 2. Toggling Bookmark ON ---');
    const res = await axios.post(`${BASE_URL}/bookmarks`, {
      type: 'question',
      targetId: questionId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Status:', res.status);
    console.log('Response Message:', res.data.message);
    console.log('Is Bookmarked:', res.data.bookmarked);
    if (res.status === 201 && res.data.bookmarked === true) {
      console.log('✅ BOOKMARK TOGGLE ON: PASS');
    } else {
      console.log('❌ BOOKMARK TOGGLE ON: FAIL');
    }
  } catch (error) {
    console.error('Bookmark toggle ON failed:', error.response?.data || error.message);
    console.log('❌ BOOKMARK TOGGLE ON: FAIL');
  }

  // 3. List Bookmarks
  try {
    console.log('\n--- 3. Listing Bookmarks ---');
    const res = await axios.get(`${BASE_URL}/bookmarks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Status:', res.status);
    console.log('Bookmarks Count:', res.data.bookmarks.length);
    if (res.data.bookmarks.length > 0) {
      bookmarkId = res.data.bookmarks[0].id;
      console.log('First Bookmark ID:', bookmarkId);
      console.log('First Bookmark Details:', res.data.bookmarks[0].details);
    }
    if (res.status === 200 && res.data.bookmarks.length === 1 && res.data.bookmarks[0].targetId === questionId) {
      console.log('✅ BOOKMARK LISTING: PASS');
    } else {
      console.log('❌ BOOKMARK LISTING: FAIL');
    }
  } catch (error) {
    console.error('Bookmark listing failed:', error.response?.data || error.message);
    console.log('❌ BOOKMARK LISTING: FAIL');
  }

  // 4. Toggle Bookmark OFF (hitting post again with same params deletes it)
  try {
    console.log('\n--- 4. Toggling Bookmark OFF (via same POST endpoint) ---');
    const res = await axios.post(`${BASE_URL}/bookmarks`, {
      type: 'question',
      targetId: questionId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Status:', res.status);
    console.log('Response Message:', res.data.message);
    console.log('Is Bookmarked:', res.data.bookmarked);
    
    // Verify list is empty now
    const getRes = await axios.get(`${BASE_URL}/bookmarks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Bookmarks count after toggle OFF:', getRes.data.bookmarks.length);

    if (res.status === 200 && res.data.bookmarked === false && getRes.data.bookmarks.length === 0) {
      console.log('✅ BOOKMARK TOGGLE OFF: PASS');
    } else {
      console.log('❌ BOOKMARK TOGGLE OFF: FAIL');
    }
  } catch (error) {
    console.error('Bookmark toggle OFF failed:', error.response?.data || error.message);
    console.log('❌ BOOKMARK TOGGLE OFF: FAIL');
  }
}

runBookmarkTests().catch(err => {
  console.error('Fatal test error:', err);
});
