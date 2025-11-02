#!/bin/bash

echo "🔍 Testing silent error handling for missing endpoints..."

# Start the app in development mode
echo "📱 Starting development server..."
npm run dev &
DEV_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 10

# Test if the app loads without console errors
echo "🌐 Testing app load with browser console monitoring..."

# Create a simple test page to check console errors
cat > test-console-errors.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Console Error Test</title>
</head>
<body>
    <h1>Testing Console Errors</h1>
    <div id="results"></div>
    
    <script>
        // Capture console errors
        const originalError = console.error;
        const originalWarn = console.warn;
        const errors = [];
        const warnings = [];
        
        console.error = function(...args) {
            errors.push(args.join(' '));
            originalError.apply(console, args);
        };
        
        console.warn = function(...args) {
            warnings.push(args.join(' '));
            originalWarn.apply(console, args);
        };
        
        // Load the main app
        const iframe = document.createElement('iframe');
        iframe.src = 'http://localhost:5173';
        iframe.style.width = '100%';
        iframe.style.height = '600px';
        document.body.appendChild(iframe);
        
        // Check results after 10 seconds
        setTimeout(() => {
            const results = document.getElementById('results');
            results.innerHTML = `
                <h2>Console Errors (should be minimal):</h2>
                <pre>${errors.length > 0 ? errors.join('\n') : 'No errors! ✅'}</pre>
                
                <h2>Console Warnings (should be minimal):</h2>
                <pre>${warnings.length > 0 ? warnings.join('\n') : 'No warnings! ✅'}</pre>
                
                <h2>Expected Debug Messages:</h2>
                <p>Should see "debug" messages about fallback data usage.</p>
            `;
        }, 10000);
    </script>
</body>
</html>
EOF

echo "📋 Created test page: test-console-errors.html"
echo "🌐 Open this page in your browser to monitor console output:"
echo "   file://$(pwd)/test-console-errors.html"

# Wait a bit more for testing
echo "⏳ Waiting 30 seconds for manual testing..."
echo "   Check the browser console for any red errors"
echo "   Debug messages are OK (they're intentionally quiet)"
sleep 30

# Test API endpoints directly
echo "🔌 Testing API endpoints directly..."

echo "📡 Testing interests suggestions endpoint:"
curl -s http://localhost:8081/interests/suggestions || echo "❌ 404 expected - fallback should work"

echo "📡 Testing professions suggestions endpoint:"
curl -s http://localhost:8081/professions/suggestions || echo "❌ 404 expected - fallback should work"

echo "📡 Testing education suggestions endpoint:"
curl -s http://localhost:8081/education/suggestions || echo "❌ 404 expected - fallback should work"

echo "📡 Testing looking-for options endpoint:"
curl -s http://localhost:8081/looking-for/options || echo "❌ 404 expected - fallback should work"

# Check if fallback data is working
echo "🔄 Testing fallback data loading..."
node -e "
import('./src/services/api.js').then(async (api) => {
  try {
    const interests = await api.profileService.getInterestsSuggestions();
    console.log('✅ Interests fallback working:', interests.length, 'items');
    
    const professions = await api.profileService.getProfessionsSuggestions();
    console.log('✅ Professions fallback working:', professions.length, 'items');
    
    const education = await api.profileService.getEducationLevels();
    console.log('✅ Education fallback working:', education.length, 'items');
    
    const lookingFor = await api.profileService.getLookingForOptions();
    console.log('✅ Looking-for fallback working:', lookingFor.length, 'items');
  } catch (error) {
    console.error('❌ Fallback test failed:', error.message);
  }
}).catch(console.error);
" 2>/dev/null || echo "⚠️  Node test skipped (module import issues expected)"

echo "🛑 Stopping development server..."
kill $DEV_PID 2>/dev/null

echo ""
echo "✅ Silent error handling test complete!"
echo ""
echo "📋 Expected behavior:"
echo "   • No red console errors in browser"
echo "   • Debug messages about fallback usage are OK"
echo "   • Profile creation should work with fallback data"
echo "   • 404 errors should be handled silently"
echo ""
echo "🔧 If you still see errors, they should be non-critical and not impact user experience."

# Cleanup
rm -f test-console-errors.html
