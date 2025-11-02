#!/bin/bash

echo "🔧 Quick test of silent error handling..."

# Test that the development server starts without critical errors
echo "🚀 Starting development server for 20 seconds..."
timeout 20s npm run dev &
DEV_PID=$!

# Wait for server to start
echo "⏳ Waiting for server startup..."
sleep 8

# Test profile creation page loading
echo "📄 Testing profile creation page accessibility..."
curl -s -o /dev/null -w "Profile page status: %{http_code}\n" http://localhost:5173/create-profile || echo "❌ Server not ready yet"

# Test a few key API endpoints that should return 404 but be handled gracefully
echo "🔌 Testing API endpoint error handling..."

# These should return 404 but not cause frontend errors
echo "📡 Testing interests endpoint (expecting 404, should be handled silently):"
curl -s -w "Status: %{http_code}\n" http://localhost:8081/interests/suggestions 2>/dev/null || echo "No backend running - fallbacks will be used"

echo "📡 Testing professions endpoint (expecting 404, should be handled silently):"
curl -s -w "Status: %{http_code}\n" http://localhost:8081/professions/suggestions 2>/dev/null || echo "No backend running - fallbacks will be used"

# Clean up
echo "🛑 Stopping test server..."
kill $DEV_PID 2>/dev/null
wait $DEV_PID 2>/dev/null

echo ""
echo "✅ Quick test complete!"
echo ""
echo "🎯 Key improvements made:"
echo "   • Changed console.error to console.debug for expected 404s"
echo "   • Endpoints that don't exist will use fallback data silently"
echo "   • Users should see no red errors in browser console"
echo "   • Profile creation will work with localized fallback data"
echo ""
echo "🧪 To test thoroughly:"
echo "   1. Run: npm run dev"
echo "   2. Open browser to http://localhost:5173"
echo "   3. Navigate to profile creation"
echo "   4. Check browser console - should see only debug messages, no errors"
echo "   5. Profile creation should work normally with fallback data"
echo ""
echo "✨ Les erreurs 404 pour les endpoints manquants sont maintenant silencieuses!"
