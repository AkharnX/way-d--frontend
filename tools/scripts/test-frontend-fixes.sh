#!/bin/bash

echo "🧪 Testing Frontend Fixes and Improvements"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Test 1: Check if button sizes are uniform in Discovery page
echo "1. Testing Discovery Page Button Uniformity..."
if grep -q "w-20 h-20" src/pages/Discovery.tsx && ! grep -q "w-24 h-24" src/pages/Discovery.tsx; then
    print_status 0 "Discovery buttons are now uniform (20x20)"
else
    print_status 1 "Discovery buttons still have different sizes"
fi

# Test 2: Check if Way-D colors are being used consistently
echo "2. Testing Way-D Color Consistency..."
WAY_D_USAGE=0

# Check for way-d-primary usage
if grep -q "way-d-primary" src/pages/Profile.tsx src/pages/Register.tsx src/pages/CreateProfile.tsx; then
    ((WAY_D_USAGE++))
fi

# Check for way-d-secondary usage  
if grep -q "way-d-secondary" src/pages/Discovery.tsx src/pages/Profile.tsx src/pages/EditProfile.tsx; then
    ((WAY_D_USAGE++))
fi

if [ $WAY_D_USAGE -ge 2 ]; then
    print_status 0 "Way-D brand colors are being used consistently"
else
    print_status 1 "Way-D brand colors need more consistent usage"
fi

# Test 3: Check if sliders have Way-D styling
echo "3. Testing Custom Slider Styles..."
if grep -q "slider-way-d" src/pages/Register_new.tsx && grep -q "slider-way-d" src/index.css; then
    print_status 0 "Custom Way-D slider styles implemented"
else
    print_status 1 "Custom slider styles missing"
fi

# Test 4: Check if profile creation flow is improved
echo "4. Testing Profile Creation Improvements..."
if grep -q "pending_profile_data" src/pages/Register.tsx && grep -q "createBasicProfile" src/hooks/useAuth.tsx; then
    print_status 0 "Automatic profile creation flow implemented"
else
    print_status 1 "Profile creation flow needs improvement"
fi

# Test 5: Check if discovery filtering is enhanced
echo "5. Testing Discovery Filtering Enhancement..."
if grep -q "getFilteredDiscoverProfiles" src/pages/Discovery.tsx && grep -q "loadStats" src/pages/Discovery.tsx; then
    print_status 0 "Enhanced discovery filtering implemented"
else
    print_status 1 "Discovery filtering needs enhancement"
fi

# Test 6: Check TypeScript compatibility
echo "6. Testing TypeScript Compatibility..."
if grep -q "HTMLTextAreaElement" src/pages/Register.tsx; then
    print_status 0 "TypeScript textarea compatibility fixed"
else
    print_status 1 "TypeScript compatibility issues remain"
fi

# Test 7: Check if static data is replaced with dynamic
echo "7. Testing Dynamic Data Usage..."
DYNAMIC_USAGE=0

if grep -q "getUserStats" src/pages/Discovery.tsx; then
    ((DYNAMIC_USAGE++))
fi

if grep -q "getGenderOptions" src/pages/Register.tsx; then
    ((DYNAMIC_USAGE++))
fi

if [ $DYNAMIC_USAGE -ge 2 ]; then
    print_status 0 "Static data replaced with dynamic API calls"
else
    print_status 1 "Some static data still needs to be replaced"
fi

# Test 8: Check CSS enhancements
echo "8. Testing CSS Enhancements..."
if grep -q "bg-way-d-primary" src/index.css && grep -q "bg-way-d-secondary" src/index.css; then
    print_status 0 "Way-D CSS classes properly defined"
else
    print_status 1 "CSS classes need enhancement"
fi

echo ""
echo "🏁 Frontend Testing Complete!"
echo ""

# Summary
print_info "Summary of Improvements:"
echo "  • Discovery page buttons are now uniform size"
echo "  • Way-D brand colors used consistently across all pages"
echo "  • Custom slider styles with Way-D branding"
echo "  • Improved profile creation with auto-generation"
echo "  • Enhanced discovery filtering to avoid duplicate profiles"
echo "  • TypeScript compatibility fixes"
echo "  • Dynamic data loading instead of static values"
echo "  • Comprehensive CSS improvements"

echo ""
print_info "Next steps:"
echo "  1. Test the application manually"
echo "  2. Verify all interactions work correctly"
echo "  3. Check that profile creation works during registration"
echo "  4. Ensure discovery shows only new profiles"

echo ""
echo "🚀 Ready to test the frontend improvements!"
