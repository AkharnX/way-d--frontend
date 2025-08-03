import axios from 'axios';

async function testAuth() {
  console.log('Testing authentication workflow...');
  
  try {
    // Test 1: Try to login with existing user
    console.log('\n1. Testing login...');
    const loginResponse = await axios.post('http://localhost:8080/login', {
      email: 'testuser@example.com',
      password: 'TestPassword123!'
    }, {
      timeout: 5000
    });
    
    console.log('Login successful:', loginResponse.data);
    const token = loginResponse.data.access_token;
    
    // Test 2: Try to access /me endpoint
    console.log('\n2. Testing /me endpoint...');
    const meResponse = await axios.get('http://localhost:8080/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 5000
    });
    
    console.log('Me endpoint successful:', meResponse.data);
    
    // Test 3: Try to access profile service
    console.log('\n3. Testing profile service...');
    const profileResponse = await axios.get('http://localhost:8081/profile/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 5000
    });
    
    console.log('Profile service successful:', profileResponse.data);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testAuth();
