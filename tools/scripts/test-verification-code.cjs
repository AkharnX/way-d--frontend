#!/usr/bin/env node

// Test script to verify the verification code functionality

const https = require('https');
const http = require('http');

const testRegistration = () => {
  const data = JSON.stringify({
    email: "testverification@example.com",
    password: "password123",
    first_name: "Test",
    last_name: "Verification",
    birth_date: "1990-01-01",
    gender: "male"
  });

  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  console.log('🧪 Testing registration endpoint...');
  
  const req = http.request(options, (res) => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(body);
        console.log('📥 Response:', JSON.stringify(response, null, 2));
        
        if (response.verification_code) {
          console.log('✅ SUCCESS: Verification code received:', response.verification_code);
        } else {
          console.log('❌ ISSUE: No verification code in response');
        }
      } catch (e) {
        console.log('❌ ERROR: Invalid JSON response:', body);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Request error:', e.message);
  });

  req.setTimeout(5000, () => {
    console.log('⏰ Request timeout');
    req.destroy();
  });

  req.write(data);
  req.end();
};

const testResendVerification = () => {
  const data = JSON.stringify({
    email: "test@example.com"
  });

  const options = {
    hostname: 'localhost',
    port: 8080,
    path: '/resend-verification',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  console.log('\n🧪 Testing resend verification endpoint...');
  
  const req = http.request(options, (res) => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(body);
        console.log('📥 Response:', JSON.stringify(response, null, 2));
        
        if (response.verification_code) {
          console.log('✅ SUCCESS: Verification code received:', response.verification_code);
        } else {
          console.log('❌ ISSUE: No verification code in response');
        }
      } catch (e) {
        console.log('❌ ERROR: Invalid JSON response:', body);
      }
    });
  });

  req.on('error', (e) => {
    console.error('❌ Request error:', e.message);
  });

  req.setTimeout(5000, () => {
    console.log('⏰ Request timeout');
    req.destroy();
  });

  req.write(data);
  req.end();
};

// Run tests
console.log('🚀 Starting verification code tests...\n');

// Test registration first, then resend after a delay
testRegistration();

setTimeout(() => {
  testResendVerification();
}, 2000);
