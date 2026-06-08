'use strict';
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function runAuthTests() {
  console.log('Running Authentication Certification Tests...');
  const randomEmail = `student_${Math.floor(Math.random() * 100000)}@nirnaypath.local`;
  const password = 'StudentPassword123!';
  const name = 'Certification Student';
  
  let token = '';

  // 1. Signup / Register
  try {
    console.log('\n--- 1. Signup / Register ---');
    const signupRes = await axios.post(`${BASE_URL}/auth/register`, {
      name,
      email: randomEmail,
      password
    });
    console.log('Signup Status:', signupRes.status);
    console.log('Signup Response:', JSON.stringify(signupRes.data, null, 2));
    if (signupRes.status === 201 && signupRes.data.success && signupRes.data.token) {
      console.log('✅ SIGNUP: PASS');
    } else {
      console.log('❌ SIGNUP: FAIL');
    }
  } catch (error) {
    console.error('Signup error:', error.response?.data || error.message);
    console.log('❌ SIGNUP: FAIL');
  }

  // 2. Login
  try {
    console.log('\n--- 2. Login ---');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: randomEmail,
      password
    });
    console.log('Login Status:', loginRes.status);
    console.log('Login Response:', JSON.stringify(loginRes.data, null, 2));
    if (loginRes.status === 200 && loginRes.data.success && loginRes.data.token) {
      token = loginRes.data.token;
      console.log('✅ LOGIN: PASS');
    } else {
      console.log('❌ LOGIN: FAIL');
    }
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    console.log('❌ LOGIN: FAIL');
  }

  // 3. Profile / Session Persistence
  try {
    console.log('\n--- 3. Profile Retrieval (Session Persistence) ---');
    if (!token) {
      throw new Error('No token available from login step');
    }
    const profileRes = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Profile Status:', profileRes.status);
    console.log('Profile Response:', JSON.stringify(profileRes.data, null, 2));
    if (profileRes.status === 200 && profileRes.data.success && profileRes.data.user.email === randomEmail) {
      console.log('✅ PROFILE (SESSION PERSISTENCE): PASS');
    } else {
      console.log('❌ PROFILE (SESSION PERSISTENCE): FAIL');
    }
  } catch (error) {
    console.error('Profile error:', error.response?.data || error.message);
    console.log('❌ PROFILE (SESSION PERSISTENCE): FAIL');
  }

  // 4. Invalid Login (Security check)
  try {
    console.log('\n--- 4. Login with Invalid Password ---');
    await axios.post(`${BASE_URL}/auth/login`, {
      email: randomEmail,
      password: 'WrongPassword!'
    });
    console.log('❌ INVALID LOGIN: FAIL (Expected 401 but request succeeded)');
  } catch (error) {
    console.log('Error status:', error.response?.status);
    console.log('Error message:', error.response?.data?.message || error.response?.data?.error);
    if (error.response?.status === 401) {
      console.log('✅ INVALID LOGIN: PASS (Correctly blocked with 401)');
    } else {
      console.log('❌ INVALID LOGIN: FAIL');
    }
  }
}

runAuthTests().catch(err => {
  console.error('Fatal test error:', err);
});
