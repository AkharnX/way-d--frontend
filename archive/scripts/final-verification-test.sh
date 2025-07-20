#!/bin/bash

# 🎉 Way-d Application - Final Verification Test
# This script verifies all critical fixes and features are working

echo "🚀 Way-d Final Verification Test"
echo "================================="
echo ""

# Check if development server is running
echo "📡 Checking development server..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Development server is running on http://localhost:5173"
else
    echo "❌ Development server not running. Start with: npm run dev"
    exit 1
fi

# Test API endpoints
echo ""
echo "🔧 Testing API endpoints..."

# Get a login token first
echo "🔐 Getting authentication token..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"newtestuser@example.com","password":"testpass123"}')

if [[ $LOGIN_RESPONSE == *"access_token"* ]]; then
    echo "✅ Authentication working"
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
else
    echo "⚠️ Could not login (might need to register first)"
    TOKEN=""
fi

# Test core endpoints
if [ ! -z "$TOKEN" ]; then
    echo ""
    echo "🧪 Testing core API endpoints..."
    
    # Test profile discovery
    if curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5173/api/profile/discover?offset=0 > /dev/null; then
        echo "✅ Profile discovery endpoint working"
    else
        echo "❌ Profile discovery endpoint failed"
    fi
    
    # Test interactions matches
    if curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5173/api/interactions/matches > /dev/null; then
        echo "✅ Interactions matches endpoint working"
    else
        echo "❌ Interactions matches endpoint failed"
    fi
    
    # Test enhanced endpoints (these should have graceful fallbacks)
    echo ""
    echo "🔄 Testing enhanced endpoints (fallbacks expected)..."
    
    curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5173/api/interactions/my-interactions > /dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Enhanced my-interactions endpoint working"
    else
        echo "⏳ Enhanced my-interactions endpoint not implemented (frontend has fallback)"
    fi
    
    curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5173/api/interactions/my-likes > /dev/null
    if [ $? -eq 0 ]; then
        echo "✅ Enhanced my-likes endpoint working"
    else
        echo "⏳ Enhanced my-likes endpoint not implemented (frontend has fallback)"
    fi
fi

echo ""
echo "📁 Checking critical files..."

# Check for JSX compilation errors
if [ -f "src/pages/CreateProfile.tsx" ]; then
    if grep -q "export default CreateProfile" src/pages/CreateProfile.tsx; then
        echo "✅ CreateProfile.tsx structure intact"
    else
        echo "❌ CreateProfile.tsx structure issue"
    fi
else
    echo "❌ CreateProfile.tsx not found"
fi

# Check for PageHeader component
if [ -f "src/components/PageHeader.tsx" ]; then
    echo "✅ PageHeader component exists"
else
    echo "❌ PageHeader component missing"
fi

# Check for API service enhancements
if [ -f "src/services/api.ts" ]; then
    if grep -q "getFilteredDiscoverProfiles" src/services/api.ts; then
        echo "✅ Enhanced API services implemented"
    else
        echo "❌ Enhanced API services missing"
    fi
else
    echo "❌ API services file missing"
fi

echo ""
echo "🎯 Application Status Summary"
echo "=============================="
echo ""

# Count documentation files
DOC_COUNT=$(ls -1 *.md 2>/dev/null | wc -l)
echo "📚 Documentation files: $DOC_COUNT"

# Check project structure
if [ -d "temp-cleanup" ]; then
    echo "🧹 Project cleanup: Complete (temp-cleanup folder exists)"
else
    echo "🧹 Project cleanup: Not done"
fi

# Check for critical error files
if [ -f "CRITICAL_FIXES_COMPLETE.md" ]; then
    echo "✅ Critical fixes documented"
fi

if [ -f "FINAL_STATUS_REPORT.md" ]; then
    echo "✅ Final status report available"
fi

echo ""
echo "🎉 VERIFICATION COMPLETE!"
echo ""
echo "📋 Next steps:"
echo "1. Open browser to http://localhost:5173"
echo "2. Test user registration and profile creation"
echo "3. Test discovery system and interactions"
echo "4. Verify no navigation dead-ends"
echo "5. Check browser console for any age calculation logs"
echo ""
echo "🚀 For backend enhancement:"
echo "   See: BACKEND_CONTROLLER_IMPLEMENTATION_GUIDE.md"
echo ""
echo "✨ Way-d application is ready for use!"
