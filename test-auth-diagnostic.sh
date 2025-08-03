#!/bin/bash

# Auth Diagnostic Test Script
# This script tests the authentication diagnostic tools

set -e

echo "🔐 Way-D Authentication Diagnostic Test"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    ((TESTS_TOTAL++))
    log_info "Running test: $test_name"
    
    if eval "$test_command"; then
        log_success "$test_name"
    else
        log_error "$test_name"
    fi
}

# Test 1: Check if diagnostic components exist
log_info "Test 1: Checking diagnostic components"
if [[ -f "src/components/TokenDiagnostic.tsx" ]]; then
    log_success "TokenDiagnostic component exists"
    ((TESTS_PASSED++))
else
    log_error "TokenDiagnostic component missing"
    ((TESTS_FAILED++))
fi
((TESTS_TOTAL++))

if [[ -f "src/components/RequestLogsViewer.tsx" ]]; then
    log_success "RequestLogsViewer component exists"
    ((TESTS_PASSED++))
else
    log_error "RequestLogsViewer component missing"
    ((TESTS_FAILED++))
fi
((TESTS_TOTAL++))

# Test 2: Check if diagnostic utilities exist
log_info "Test 2: Checking diagnostic utilities"
if [[ -f "src/utils/requestLogger.ts" ]]; then
    log_success "Request logger utility exists"
    ((TESTS_PASSED++))
else
    log_error "Request logger utility missing"
    ((TESTS_FAILED++))
fi
((TESTS_TOTAL++))

if [[ -f "src/utils/authFlowDiagnostic.ts" ]]; then
    log_success "Auth flow diagnostic utility exists"
    ((TESTS_PASSED++))
else
    log_error "Auth flow diagnostic utility missing"
    ((TESTS_FAILED++))
fi
((TESTS_TOTAL++))

# Test 3: Check if routes are configured
log_info "Test 3: Checking route configuration"
if grep -q "token-diagnostic" src/App.tsx; then
    log_success "Token diagnostic route configured"
    ((TESTS_PASSED++))
else
    log_error "Token diagnostic route missing"
    ((TESTS_FAILED++))
fi
((TESTS_TOTAL++))

if grep -q "request-logs" src/App.tsx; then
    log_success "Request logs route configured"
    ((TESTS_PASSED++))
else
    log_error "Request logs route missing"
    ((TESTS_FAILED++))
fi
((TESTS_TOTAL++))

# Test 4: Check TypeScript compilation
log_info "Test 4: Checking TypeScript compilation"
if npm run build > /tmp/build.log 2>&1; then
    log_success "TypeScript compilation successful"
    ((TESTS_PASSED++))
else
    log_error "TypeScript compilation failed"
    echo "Build log:"
    cat /tmp/build.log | tail -20
    ((TESTS_FAILED++))
fi
((TESTS_TOTAL++))

# Test 5: Test token utilities
log_info "Test 5: Testing token utilities"
if node test-token-utils.js > /tmp/token-test.log 2>&1; then
    log_success "Token utilities test passed"
    ((TESTS_PASSED++))
else
    log_error "Token utilities test failed"
    echo "Token test log:"
    cat /tmp/token-test.log
    ((TESTS_FAILED++))
fi
((TESTS_TOTAL++))

# Test 6: Check if development server can start
log_info "Test 6: Testing development server startup"
timeout 30s npm run dev > /tmp/dev-server.log 2>&1 &
DEV_PID=$!
sleep 5

if ps -p $DEV_PID > /dev/null; then
    log_success "Development server started successfully"
    ((TESTS_PASSED++))
    kill $DEV_PID
else
    log_error "Development server failed to start"
    echo "Dev server log:"
    cat /tmp/dev-server.log | tail -10
    ((TESTS_FAILED++))
fi
((TESTS_TOTAL++))

# Test 7: Test diagnostic page accessibility
log_info "Test 7: Testing diagnostic page accessibility"
npm run dev > /tmp/dev-server.log 2>&1 &
DEV_PID=$!
sleep 8

# Test if diagnostic pages are accessible
if timeout 10s curl -s "http://localhost:5173/token-diagnostic" > /dev/null; then
    log_success "Token diagnostic page accessible"
    ((TESTS_PASSED++))
else
    log_error "Token diagnostic page not accessible"
    ((TESTS_FAILED++))
fi
((TESTS_TOTAL++))

if timeout 10s curl -s "http://localhost:5173/request-logs" > /dev/null; then
    log_success "Request logs page accessible"
    ((TESTS_PASSED++))
else
    log_error "Request logs page not accessible"
    ((TESTS_FAILED++))
fi
((TESTS_TOTAL++))

# Clean up
if ps -p $DEV_PID > /dev/null; then
    kill $DEV_PID
fi

# Test 8: Check plan documentation
log_info "Test 8: Checking documentation"
if [[ -f "auth-diagnostics-plan.md" ]]; then
    log_success "Diagnostic plan documentation exists"
    ((TESTS_PASSED++))
else
    log_error "Diagnostic plan documentation missing"
    ((TESTS_FAILED++))
fi
((TESTS_TOTAL++))

# Summary
echo ""
echo "🎯 Test Summary"
echo "==============="
echo -e "Total tests: ${BLUE}$TESTS_TOTAL${NC}"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"

if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "${GREEN}🎉 All tests passed! Authentication diagnostic system is ready.${NC}"
    
    echo ""
    echo "🚀 Next Steps:"
    echo "1. Start the dev server: npm run dev"
    echo "2. Navigate to http://localhost:5173/token-diagnostic"
    echo "3. Run diagnostic tests to identify 401 errors"
    echo "4. Check request logs at http://localhost:5173/request-logs"
    echo "5. Follow recommendations from auth-diagnostics-plan.md"
    
    exit 0
else
    success_rate=$((TESTS_PASSED * 100 / TESTS_TOTAL))
    echo -e "${YELLOW}⚠️  $TESTS_FAILED tests failed. Success rate: $success_rate%${NC}"
    
    echo ""
    echo "🔧 Issues to fix:"
    echo "- Review failed tests above"
    echo "- Check build errors and TypeScript issues"
    echo "- Ensure all diagnostic components are properly implemented"
    
    exit 1
fi
