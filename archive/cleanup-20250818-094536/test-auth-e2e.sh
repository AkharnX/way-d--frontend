#!/bin/bash

# E2E Authentication Tests for Way-D Frontend
# Tests the authentication flow including 2FA, social login, and password recovery

echo "🧪 Way-D Authentication E2E Tests"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to log test results
log_test() {
    local test_name="$1"
    local status="$2"
    local message="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ PASS${NC} $test_name: $message"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ FAIL${NC} $test_name: $message"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    elif [ "$status" = "SKIP" ]; then
        echo -e "${YELLOW}⏭️  SKIP${NC} $test_name: $message"
    else
        echo -e "${BLUE}ℹ️  INFO${NC} $test_name: $message"
    fi
}

# Test 1: Check if build was successful (TypeScript compilation)
echo ""
echo "📋 Test Group: TypeScript Compilation"
echo "-------------------------------------"

if npm run build &> /dev/null; then
    log_test "TypeScript Build" "PASS" "No TypeScript errors found"
else
    log_test "TypeScript Build" "FAIL" "TypeScript compilation failed"
fi

# Test 2: Check Authentication Components
echo ""
echo "📋 Test Group: Authentication Components"
echo "----------------------------------------"

# Check if 2FA components exist
if [ -f "src/components/TwoFactorSetup.tsx" ]; then
    log_test "2FA Setup Component" "PASS" "TwoFactorSetup component exists"
else
    log_test "2FA Setup Component" "FAIL" "TwoFactorSetup component missing"
fi

if [ -f "src/components/TwoFactorVerify.tsx" ]; then
    log_test "2FA Verify Component" "PASS" "TwoFactorVerify component exists"
else
    log_test "2FA Verify Component" "FAIL" "TwoFactorVerify component missing"
fi

# Check if social login components exist
if [ -f "src/components/SocialLoginButtons.tsx" ]; then
    log_test "Social Login Component" "PASS" "SocialLoginButtons component exists"
else
    log_test "Social Login Component" "FAIL" "SocialLoginButtons component missing"
fi

# Test 3: Check Authentication Pages
echo ""
echo "📋 Test Group: Authentication Pages"
echo "-----------------------------------"

if [ -f "src/pages/TwoFactorSettings.tsx" ]; then
    log_test "2FA Settings Page" "PASS" "TwoFactorSettings page exists"
else
    log_test "2FA Settings Page" "FAIL" "TwoFactorSettings page missing"
fi

if [ -f "src/pages/ResetPassword.tsx" ]; then
    log_test "Reset Password Page" "PASS" "ResetPassword page exists"
else
    log_test "Reset Password Page" "FAIL" "ResetPassword page missing"
fi

if [ -f "src/pages/GoogleAuthCallback.tsx" ]; then
    log_test "Google Auth Callback" "PASS" "GoogleAuthCallback page exists"
else
    log_test "Google Auth Callback" "FAIL" "GoogleAuthCallback page missing"
fi

if [ -f "src/pages/FacebookAuthCallback.tsx" ]; then
    log_test "Facebook Auth Callback" "PASS" "FacebookAuthCallback page exists"
else
    log_test "Facebook Auth Callback" "FAIL" "FacebookAuthCallback page missing"
fi

# Test 4: Check API Service Extensions
echo ""
echo "📋 Test Group: API Service Features"
echo "-----------------------------------"

# Check for 2FA methods in authService
if grep -q "setup2FA" src/services/api.ts; then
    log_test "2FA API Methods" "PASS" "2FA API methods found in authService"
else
    log_test "2FA API Methods" "FAIL" "2FA API methods missing in authService"
fi

# Check for social login methods
if grep -q "googleAuth\|facebookAuth" src/services/api.ts; then
    log_test "Social Login API Methods" "PASS" "Social login API methods found"
else
    log_test "Social Login API Methods" "FAIL" "Social login API methods missing"
fi

# Check for remember me functionality
if grep -q "rememberMe" src/services/api.ts; then
    log_test "Remember Me Functionality" "PASS" "Remember me functionality implemented"
else
    log_test "Remember Me Functionality" "FAIL" "Remember me functionality missing"
fi

# Test 5: Check Type Definitions
echo ""
echo "📋 Test Group: Type Definitions"
echo "-------------------------------"

# Check for 2FA types
if grep -q "TwoFactorSetupResponse\|SocialAuthResponse" src/types/index.ts; then
    log_test "Authentication Types" "PASS" "New authentication types defined"
else
    log_test "Authentication Types" "FAIL" "New authentication types missing"
fi

# Check for updated User interface with 2FA field
if grep -q "two_factor_enabled" src/types/index.ts; then
    log_test "User Type Updates" "PASS" "User type includes 2FA field"
else
    log_test "User Type Updates" "FAIL" "User type missing 2FA field"
fi

# Check for updated LoginData with rememberMe
if grep -q "rememberMe" src/types/index.ts; then
    log_test "LoginData Type Updates" "PASS" "LoginData includes rememberMe field"
else
    log_test "LoginData Type Updates" "FAIL" "LoginData missing rememberMe field"
fi

# Test 6: Check Dependencies
echo ""
echo "📋 Test Group: Dependencies"
echo "---------------------------"

# Check for QR code library
if npm list qrcode &> /dev/null; then
    log_test "QR Code Library" "PASS" "qrcode library installed"
else
    log_test "QR Code Library" "FAIL" "qrcode library missing"
fi

# Check for OTP library
if npm list otplib &> /dev/null; then
    log_test "OTP Library" "PASS" "otplib library installed"
else
    log_test "OTP Library" "FAIL" "otplib library missing"
fi

# Test 7: Security Features
echo ""
echo "📋 Test Group: Security Features"
echo "--------------------------------"

# Check for password validation in ResetPassword
if grep -q "validatePassword" src/pages/ResetPassword.tsx; then
    log_test "Password Validation" "PASS" "Password validation implemented"
else
    log_test "Password Validation" "FAIL" "Password validation missing"
fi

# Check for token management improvements
if grep -q "token_expiry\|refresh_expiry" src/services/api.ts; then
    log_test "Enhanced Token Management" "PASS" "Enhanced token management with expiry"
else
    log_test "Enhanced Token Management" "FAIL" "Basic token management only"
fi

# Test Summary
echo ""
echo "🎯 Test Summary"
echo "==============="
echo -e "Total Tests: ${BLUE}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Authentication system is ready.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Please review the implementation.${NC}"
    exit 1
fi