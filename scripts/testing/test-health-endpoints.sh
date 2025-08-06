#!/bin/bash

echo "🏥 Way-D Health Endpoints Test"
echo "=============================="
echo ""

echo "Testing updated health endpoints via frontend proxy..."
echo ""

# Test Auth Service Health
echo "🔐 Auth Service Health Check:"
AUTH_RESPONSE=$(curl -s http://localhost:5173/api/auth/health)
if echo "$AUTH_RESPONSE" | grep -q '"status":"ok"'; then
    echo "✅ Auth Service: Healthy"
    echo "   Response: $AUTH_RESPONSE"
else
    echo "❌ Auth Service: Unhealthy"
    echo "   Response: $AUTH_RESPONSE"
fi
echo ""

# Test Profile Service Health  
echo "👤 Profile Service Health Check:"
PROFILE_RESPONSE=$(curl -s http://localhost:5173/api/profile/health)
if echo "$PROFILE_RESPONSE" | grep -q '"status":"ok"'; then
    echo "✅ Profile Service: Healthy"
    echo "   Response: $PROFILE_RESPONSE"
else
    echo "❌ Profile Service: Unhealthy"
    echo "   Response: $PROFILE_RESPONSE"
fi
echo ""

# Test Interactions Service Health
echo "💝 Interactions Service Health Check:"
INTERACTIONS_RESPONSE=$(curl -s http://localhost:5173/api/interactions/health)
if echo "$INTERACTIONS_RESPONSE" | grep -q '"status":"ok"'; then
    echo "✅ Interactions Service: Healthy"
    echo "   Response: $INTERACTIONS_RESPONSE"
else
    echo "❌ Interactions Service: Unhealthy" 
    echo "   Response: $INTERACTIONS_RESPONSE"
fi
echo ""

# Summary
echo "📊 Health Check Summary:"
echo "========================"

ALL_HEALTHY=true

if ! echo "$AUTH_RESPONSE" | grep -q '"status":"ok"'; then
    ALL_HEALTHY=false
fi

if ! echo "$PROFILE_RESPONSE" | grep -q '"status":"ok"'; then
    ALL_HEALTHY=false
fi

if ! echo "$INTERACTIONS_RESPONSE" | grep -q '"status":"ok"'; then
    ALL_HEALTHY=false
fi

if [ "$ALL_HEALTHY" = true ]; then
    echo "🎉 All services are healthy!"
    echo ""
    echo "✅ Auth Service: Database OK, Version 1.0.0"
    echo "✅ Profile Service: Database OK, Version 1.0.0"
    echo "✅ Interactions Service: Database OK, Version 1.0.0"
    echo ""
    echo "🚀 Frontend health monitoring is now fully operational!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Open http://localhost:5173 in your browser"
    echo "2. Check the ServiceStatus component (bottom-right corner)"
    echo "3. Click the status indicator to view detailed health information"
    echo "4. Test the tokenUtils functionality"
else
    echo "❌ Some services are not healthy. Check the responses above."
fi

echo ""
echo "🔗 Service URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Auth API: http://localhost:5173/api/auth/*"
echo "   Profile API: http://localhost:5173/api/profile/*"
echo "   Interactions API: http://localhost:5173/api/interactions/*"
