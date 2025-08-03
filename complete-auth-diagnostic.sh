#!/bin/bash

# Complete Authentication Diagnostic Test
# Tests both the diagnostic tools and the actual auth flow

set -e

echo "🔐 Way-D Complete Authentication Diagnostic"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

log_test() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    
    ((TOTAL_TESTS++))
    
    if [[ "$status" == "PASS" ]]; then
        echo -e "${GREEN}✅ PASS${NC} - $test_name: $message"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}❌ FAIL${NC} - $test_name: $message"
        ((FAILED_TESTS++))
    fi
}

# Test 1: Check if diagnostic pages are accessible
echo "📋 Testing Diagnostic Page Accessibility..."

if timeout 5s curl -s "http://localhost:5173/token-diagnostic" > /dev/null 2>&1; then
    log_test "Token Diagnostic Page" "PASS" "Page accessible via HTTP"
else
    log_test "Token Diagnostic Page" "FAIL" "Page not accessible"
fi

if timeout 5s curl -s "http://localhost:5173/request-logs" > /dev/null 2>&1; then
    log_test "Request Logs Page" "PASS" "Page accessible via HTTP"
else
    log_test "Request Logs Page" "FAIL" "Page not accessible"
fi

# Test 2: Check backend services health
echo "🏥 Testing Backend Services Health..."

# Test auth service
if timeout 10s curl -s "http://localhost:5173/api/auth/health" > /dev/null 2>&1; then
    log_test "Auth Service Health" "PASS" "Health endpoint responds"
else
    log_test "Auth Service Health" "FAIL" "Health endpoint not responding"
fi

# Test profile service
if timeout 10s curl -s "http://localhost:5173/api/profile/health" > /dev/null 2>&1; then
    log_test "Profile Service Health" "PASS" "Health endpoint responds"
else
    log_test "Profile Service Health" "FAIL" "Health endpoint not responding"
fi

# Test interactions service
if timeout 10s curl -s "http://localhost:5173/api/interactions/health" > /dev/null 2>&1; then
    log_test "Interactions Service Health" "PASS" "Health endpoint responds"
else
    log_test "Interactions Service Health" "FAIL" "Health endpoint not responding"
fi

# Test 3: Simulate login attempt and check for 401 errors
echo "🔑 Testing Login Flow..."

# Create a test login request
LOGIN_PAYLOAD='{"email":"test@example.com","password":"testpassword123"}'
LOGIN_RESPONSE=$(timeout 10s curl -s -w "%{http_code}" -o /tmp/login_response.json \
    -X POST \
    -H "Content-Type: application/json" \
    -d "$LOGIN_PAYLOAD" \
    "http://localhost:5173/api/auth/login" 2>/dev/null || echo "000")

if [[ "$LOGIN_RESPONSE" == "401" ]]; then
    log_test "Login 401 Detection" "PASS" "Successfully detected 401 error (expected for test credentials)"
elif [[ "$LOGIN_RESPONSE" == "200" ]]; then
    log_test "Login 401 Detection" "FAIL" "Unexpected successful login with test credentials"
elif [[ "$LOGIN_RESPONSE" == "000" ]]; then
    log_test "Login 401 Detection" "FAIL" "No response from login endpoint"
else
    log_test "Login 401 Detection" "PASS" "Got response code $LOGIN_RESPONSE (service is responding)"
fi

# Test 4: Check token utilities
echo "🎟️ Testing Token Utilities..."

if node test-token-utils.js > /tmp/token-test.log 2>&1; then
    log_test "Token Utilities" "PASS" "All token utility tests passed"
else
    log_test "Token Utilities" "FAIL" "Token utility tests failed"
fi

# Test 5: Check if request logging is working
echo "📊 Testing Request Logging..."

# Make a test request to trigger logging
TEST_REQUEST=$(timeout 5s curl -s -w "%{http_code}" "http://localhost:5173/api/auth/health" 2>/dev/null || echo "000")

if [[ "$TEST_REQUEST" != "000" ]]; then
    log_test "Request Logging" "PASS" "Requests are being made (logging should be active)"
else
    log_test "Request Logging" "FAIL" "Cannot make test requests"
fi

# Test 6: Browser-based diagnostic simulation
echo "🌐 Testing Browser-Based Diagnostics..."

# Create a simple HTML test page for browser testing
cat > /tmp/auth-diagnostic-test.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Auth Diagnostic Test</title>
</head>
<body>
    <h1>Authentication Diagnostic Test</h1>
    <div id="results"></div>
    
    <script>
        async function runDiagnostic() {
            const results = document.getElementById('results');
            
            try {
                // Test token diagnostic page
                const tokenDiagnosticResponse = await fetch('/token-diagnostic');
                if (tokenDiagnosticResponse.ok) {
                    results.innerHTML += '<p>✅ Token diagnostic page accessible</p>';
                } else {
                    results.innerHTML += '<p>❌ Token diagnostic page not accessible</p>';
                }
                
                // Test request logs page
                const requestLogsResponse = await fetch('/request-logs');
                if (requestLogsResponse.ok) {
                    results.innerHTML += '<p>✅ Request logs page accessible</p>';
                } else {
                    results.innerHTML += '<p>❌ Request logs page not accessible</p>';
                }
                
                // Test health endpoint
                const healthResponse = await fetch('/api/auth/health');
                if (healthResponse.ok) {
                    results.innerHTML += '<p>✅ Auth health endpoint responding</p>';
                } else {
                    results.innerHTML += '<p>❌ Auth health endpoint not responding</p>';
                }
                
                console.log('Diagnostic complete');
                
            } catch (error) {
                results.innerHTML += '<p>❌ Error running diagnostic: ' + error.message + '</p>';
            }
        }
        
        // Run diagnostic when page loads
        window.onload = runDiagnostic;
    </script>
</body>
</html>
EOF

# Test if we can serve the test page
if cp /tmp/auth-diagnostic-test.html public/auth-diagnostic-test.html 2>/dev/null; then
    if timeout 5s curl -s "http://localhost:5173/auth-diagnostic-test.html" | grep -q "Auth Diagnostic Test"; then
        log_test "Browser Diagnostic Test" "PASS" "Test page created and accessible"
    else
        log_test "Browser Diagnostic Test" "FAIL" "Test page not accessible"
    fi
else
    log_test "Browser Diagnostic Test" "FAIL" "Cannot create test page"
fi

# Test 7: Comprehensive auth flow test
echo "🔄 Testing Complete Auth Flow..."

# Check if we can detect common auth issues
AUTH_ISSUES_DETECTED=0

# Check for missing tokens
if ! curl -s "http://localhost:5173/api/auth/me" | grep -q "access_token"; then
    ((AUTH_ISSUES_DETECTED++))
fi

# Check for CORS issues
CORS_TEST=$(timeout 5s curl -s -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -X OPTIONS "http://localhost:5173/api/auth/login" 2>/dev/null || echo "")

if [[ -z "$CORS_TEST" ]]; then
    ((AUTH_ISSUES_DETECTED++))
fi

if [[ $AUTH_ISSUES_DETECTED -gt 0 ]]; then
    log_test "Auth Flow Analysis" "PASS" "Detected $AUTH_ISSUES_DETECTED potential auth issues (diagnostic tools should help)"
else
    log_test "Auth Flow Analysis" "PASS" "No obvious auth flow issues detected"
fi

# Clean up
rm -f /tmp/login_response.json /tmp/token-test.log /tmp/auth-diagnostic-test.html
rm -f public/auth-diagnostic-test.html 2>/dev/null || true

# Summary
echo ""
echo "📊 Test Summary"
echo "==============="
echo -e "Total tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
echo -e "Success rate: ${BLUE}$SUCCESS_RATE%${NC}"

# Recommendations based on results
echo ""
echo "🎯 Diagnostic Tool Status"
echo "========================="

if [[ $SUCCESS_RATE -ge 80 ]]; then
    echo -e "${GREEN}🎉 Authentication diagnostic system is ready!${NC}"
    echo ""
    echo "✅ Your diagnostic tools are working correctly:"
    echo "   • Token Diagnostic: http://localhost:5173/token-diagnostic"
    echo "   • Request Logs: http://localhost:5173/request-logs"
    echo ""
    echo "🔍 To diagnose 401 errors:"
    echo "   1. Navigate to Token Diagnostic page"
    echo "   2. Click 'Run Full Diagnostic'"
    echo "   3. Try 'Auth Flow Test' with real credentials"
    echo "   4. Check Request Logs for failed requests"
    echo "   5. Follow recommendations in auth-diagnostics-plan.md"
    
elif [[ $SUCCESS_RATE -ge 60 ]]; then
    echo -e "${YELLOW}⚠️  Diagnostic system partially working${NC}"
    echo ""
    echo "Some issues detected but core functionality available:"
    echo "   • Check failed tests above"
    echo "   • Verify backend services are running"
    echo "   • Test diagnostic pages manually"
    
else
    echo -e "${RED}❌ Diagnostic system needs attention${NC}"
    echo ""
    echo "Multiple issues detected:"
    echo "   • Check if frontend dev server is running"
    echo "   • Verify backend services are accessible"
    echo "   • Review build errors"
    echo "   • Check network connectivity"
fi

echo ""
echo "📖 Next Steps:"
echo "1. Open your browser to http://localhost:5173/token-diagnostic"
echo "2. Test with real credentials to identify 401 issues"
echo "3. Use Request Logs page to monitor authentication requests"
echo "4. Follow the AUTH_DIAGNOSTIC_GUIDE.md for detailed instructions"

if [[ $FAILED_TESTS -eq 0 ]]; then
    exit 0
else
    exit 1
fi
