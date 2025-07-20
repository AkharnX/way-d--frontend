// Quick test for the token cleanup functions
// This can be run in browser console

console.log('=== Testing Token Cleanup Functions ===');

// Test 1: Check if functions exist
console.log('1. Checking if cleanup functions exist...');
import('./src/services/api.ts').then(api => {
  console.log('✅ validateAndCleanupTokens:', typeof api.validateAndCleanupTokens);
  console.log('✅ cleanupTokens:', typeof api.cleanupTokens);
  console.log('✅ isTokenValid:', typeof api.isTokenValid);
  console.log('✅ ensureValidToken:', typeof api.ensureValidToken);
});

// Test 2: Check current tokens
console.log('2. Current localStorage tokens:');
console.log('Access token:', localStorage.getItem('access_token') ? 'Present' : 'Not found');
console.log('Refresh token:', localStorage.getItem('refresh_token') ? 'Present' : 'Not found');
console.log('User email:', localStorage.getItem('user_email') ? 'Present' : 'Not found');

// Test 3: Test cleanup function
console.log('3. Testing cleanup function...');
// Note: Uncomment the following line to test cleanup
// localStorage.clear(); console.log('Tokens cleared');

console.log('=== Test Complete ===');
console.log('Go to /token-diagnostic to test interactively');
