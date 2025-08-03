# Authentication Diagnostics & Cleanup Plan

## 🚨 Current Issues
- **401 "Login failed"** errors on login attempts
- **"MISSING OR INVALID TOKENS"** errors in various scenarios
- Complex authentication flow between useAuth and SecurityProvider
- Token refresh mechanism potentially causing infinite loops

## 📋 Diagnostic Use Cases

### Use Case 1: Fresh Login Attempt
**Scenario**: New user or user with cleared storage tries to login
**Expected**: Successful login with tokens stored and user data retrieved
**Current Issue**: 401 errors on login endpoint

**Test Steps**:
1. Clear all localStorage/sessionStorage
2. Navigate to login page
3. Enter valid credentials
4. Monitor network requests and token flow

### Use Case 2: Token Refresh Flow
**Scenario**: User with expired access token but valid refresh token
**Expected**: Automatic token refresh and request retry
**Current Issue**: Potential infinite loops or refresh failures

**Test Steps**:
1. Set expired access token
2. Set valid refresh token
3. Make authenticated request
4. Monitor refresh token exchange

### Use Case 3: Invalid/Expired Refresh Token
**Scenario**: Both access and refresh tokens are invalid/expired
**Expected**: Clean logout and redirect to login
**Current Issue**: May not be properly clearing state

**Test Steps**:
1. Set invalid tokens
2. Make authenticated request
3. Verify clean logout and redirect

### Use Case 4: Email Verification Flow
**Scenario**: User logs in but email not verified
**Expected**: Temporary user state with verification prompts
**Current Issue**: May be causing 403/401 confusion

**Test Steps**:
1. Login with unverified email account
2. Check user state handling
3. Verify token management

## 🔧 Cleanup Tasks

### Priority 1: Critical Auth Flow Issues

#### Task 1.1: Login Endpoint Analysis
- [ ] Verify backend auth service is responding correctly
- [ ] Check if login request format matches backend expectations
- [ ] Validate CORS and proxy configuration
- [ ] Test with direct backend calls (bypass proxy)

#### Task 1.2: Token Storage & Retrieval
- [ ] Audit all `localStorage` operations for tokens
- [ ] Ensure consistent token key naming
- [ ] Verify token format validation
- [ ] Add token expiration checking

#### Task 1.3: Request Interceptor Cleanup
- [ ] Review axios interceptor logic for infinite loops
- [ ] Simplify token refresh mechanism
- [ ] Add better error handling and logging
- [ ] Prevent multiple simultaneous refresh attempts

### Priority 2: State Management Issues

#### Task 2.1: useAuth Hook Simplification
- [ ] Separate initialization logic from reactive effects
- [ ] Clarify user state management (null vs temp user)
- [ ] Improve error handling consistency
- [ ] Add debugging utilities

#### Task 2.2: SecurityProvider Integration
- [ ] Review interaction between useAuth and SecurityProvider
- [ ] Ensure single source of truth for auth state
- [ ] Simplify route protection logic
- [ ] Add auth state debugging

#### Task 2.3: API Service Organization
- [ ] Consolidate axios instance configuration
- [ ] Standardize error handling across all APIs
- [ ] Implement consistent retry logic
- [ ] Add request/response logging utilities

### Priority 3: User Experience & Debugging

#### Task 3.1: Error Message Improvements
- [ ] Create user-friendly error messages
- [ ] Add specific error codes for different auth failures
- [ ] Implement error recovery suggestions
- [ ] Add context-aware error handling

#### Task 3.2: Debugging & Monitoring Tools
- [ ] Create auth state inspector component
- [ ] Add token diagnostic utilities
- [ ] Implement request flow visualization
- [ ] Create auth troubleshooting page

#### Task 3.3: Testing & Validation
- [ ] Create comprehensive auth flow tests
- [ ] Add unit tests for token utilities
- [ ] Implement integration tests for login flow
- [ ] Add e2e tests for complete user journeys

## 🛠️ Implementation Strategy

### Phase 1: Immediate Fixes (High Priority)
1. **Token Diagnostic Tool**: Create utilities to inspect current token state
2. **Login Request Analysis**: Debug the actual login request/response
3. **Interceptor Simplification**: Fix potential infinite loops
4. **Basic Error Handling**: Improve immediate user feedback

### Phase 2: Structural Improvements (Medium Priority)
1. **Auth State Consolidation**: Single source of truth
2. **Request Flow Standardization**: Consistent API patterns
3. **Error Recovery**: Automatic and manual recovery options
4. **Documentation**: Clear auth flow documentation

### Phase 3: Enhanced Features (Low Priority)
1. **Advanced Debugging**: Visual debugging tools
2. **Performance Optimization**: Reduce unnecessary requests
3. **Security Enhancements**: Additional token validation
4. **User Experience**: Smooth transitions and feedback

## 📊 Success Metrics

### Technical Metrics
- [ ] Zero 401 errors on valid login attempts
- [ ] Successful token refresh without loops
- [ ] Clean logout and state clearing
- [ ] Proper handling of all auth edge cases

### User Experience Metrics
- [ ] Smooth login/logout experience
- [ ] Clear error messages and recovery options
- [ ] Fast authentication checks
- [ ] Reliable session management

## 🚀 Next Steps

1. **Create Token Diagnostic Tool** - Immediate insight into current issues
2. **Implement Login Request Logger** - Understand exact failure points
3. **Fix Interceptor Logic** - Eliminate infinite loops
4. **Add Comprehensive Error Handling** - Better user feedback
5. **Test All Use Cases** - Validate fixes work for all scenarios

---

*This plan will be updated as we discover and resolve issues.*
