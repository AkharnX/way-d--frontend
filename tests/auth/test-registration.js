#!/usr/bin/env node

import fetch from 'node-fetch';

async function testRegistration() {
  try {
    console.log('Testing user registration...');
    
    const response = await fetch('http://localhost:8080/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testuser' + Date.now() + '@example.com',
        password: 'TestPassword123!',
        first_name: 'Test',
        last_name: 'User'
      })
    });
    
    const data = await response.text();
    console.log('Response status:', response.status);
    console.log('Response body:', data);
    
    if (response.ok) {
      console.log('✅ Registration successful');
    } else {
      console.log('❌ Registration failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testRegistration();
