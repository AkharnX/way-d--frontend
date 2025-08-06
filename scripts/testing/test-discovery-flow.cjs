#!/usr/bin/env node

const axios = require('axios');

async function testDiscoveryFlow() {
  console.log('🧪 Testing Discovery Flow...');
  console.log('===============================\n');

  const API_BASE = 'http://localhost:8080';
  const PROFILE_API_BASE = 'http://localhost:8081';
  
  try {
    // Step 1: Login with test user
    console.log('🔐 Step 1: Logging in...');
    const loginResponse = await axios.post(`${API_BASE}/login`, {
      email: 'test@example.com',
      password: 'testpass123'
    });
    
    console.log('✅ Login successful');
    const token = loginResponse.data.access_token;
    console.log('🎫 Token received:', token.substring(0, 20) + '...');
    
    const headers = { 'Authorization': `Bearer ${token}` };
    
    // Step 2: Test profile discover endpoint
    console.log('\n📊 Step 2: Testing profile discovery...');
    try {
      const discoverResponse = await axios.get(`${PROFILE_API_BASE}/profile/discover`, { 
        headers,
        params: { offset: 0, limit: 10 }
      });
      console.log(`✅ Discovery successful: ${discoverResponse.data.length} profiles found`);
      console.log('📋 Sample profile data:', JSON.stringify(discoverResponse.data[0], null, 2));
    } catch (discoverError) {
      console.log('❌ Discovery failed:', discoverError.response?.status, discoverError.response?.data);
    }
    
    // Step 3: Test profile /all endpoint
    console.log('\n📊 Step 3: Testing profile /all endpoint...');
    try {
      const allResponse = await axios.get(`${PROFILE_API_BASE}/profile/all`, { headers });
      console.log(`✅ All profiles successful: ${allResponse.data.length} profiles found`);
    } catch (allError) {
      console.log('❌ All profiles failed:', allError.response?.status, allError.response?.data);
    }
    
    // Step 4: Test user profile
    console.log('\n👤 Step 4: Testing user profile...');
    try {
      const profileResponse = await axios.get(`${PROFILE_API_BASE}/profile/me`, { headers });
      console.log('✅ User profile loaded:', profileResponse.data.first_name, profileResponse.data.last_name);
    } catch (profileError) {
      console.log('❌ User profile failed:', profileError.response?.status, profileError.response?.data);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    if (error.response) {
      console.log('🔍 Response status:', error.response.status);
      console.log('🔍 Response data:', error.response.data);
    }
  }
}

testDiscoveryFlow();
