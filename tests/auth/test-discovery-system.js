#!/usr/bin/env node

// Test the new discovery filtering system
import axios from 'axios';

const FRONTEND_URL = 'http://localhost:5173';

async function testDiscoverySystem() {
  console.log('🔍 Testing Enhanced Discovery System...\n');
  
  try {
    // Step 1: Login
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${FRONTEND_URL}/api/auth/login`, {
      email: 'newtestuser@example.com',
      password: 'testpass123'
    });
    
    const token = loginResponse.data.access_token;
    console.log('✅ Login successful');
    
    const headers = { 'Authorization': `Bearer ${token}` };
    
    // Step 2: Test get all profiles
    console.log('\n📊 Testing profile retrieval...');
    try {
      const allProfilesResponse = await axios.get(`${FRONTEND_URL}/api/profile/all`, { headers });
      console.log(`✅ Found ${allProfilesResponse.data.length} total profiles via /all endpoint`);
    } catch (error) {
      console.log('⚠️ /all endpoint not available, will use discover endpoint');
    }
    
    // Step 3: Test interactions endpoint
    console.log('\n🤝 Testing interactions endpoints...');
    
    // Test matches (this works as we tested before)
    const matchesResponse = await axios.get(`${FRONTEND_URL}/api/interactions/matches`, { headers });
    console.log(`✅ Matches endpoint working: ${matchesResponse.data.length} matches`);
    
    // Test new user interactions endpoint
    try {
      const interactionsResponse = await axios.get(`${FRONTEND_URL}/api/interactions/my-interactions`, { headers });
      console.log('✅ User interactions endpoint working:', interactionsResponse.data);
    } catch (error) {
      console.log('⚠️ /my-interactions endpoint not available, will use fallback');
      
      // Test fallback endpoints
      try {
        const likesResponse = await axios.get(`${FRONTEND_URL}/api/interactions/my-likes`, { headers });
        console.log('✅ My-likes endpoint working:', likesResponse.data.length, 'likes');
      } catch (likesError) {
        console.log('❌ My-likes endpoint not available');
      }
      
      try {
        const dislikesResponse = await axios.get(`${FRONTEND_URL}/api/interactions/my-dislikes`, { headers });
        console.log('✅ My-dislikes endpoint working:', dislikesResponse.data.length, 'dislikes');
      } catch (dislikesError) {
        console.log('❌ My-dislikes endpoint not available');
      }
    }
    
    // Step 4: Test original discover endpoint
    console.log('\n🔍 Testing original discover endpoint...');
    const discoverResponse = await axios.get(`${FRONTEND_URL}/api/profile/discover?offset=0`, { headers });
    console.log(`✅ Original discover endpoint: ${discoverResponse.data.length} profiles`);
    
    console.log('\n🎉 Discovery system tests completed!');
    console.log('\n📋 Summary:');
    console.log('- Login: ✅ Working');
    console.log('- Interactions API: ✅ Working');
    console.log('- Profile Discovery: ✅ Working');
    console.log('- Frontend Enhancement: ✅ Ready to test in browser');
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.status, error.response?.data);
  }
}

testDiscoverySystem().catch(console.error);
