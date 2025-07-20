#!/bin/bash
# Test script for Way-d frontend

echo "Way-d Frontend Test Script"
echo "=========================="

# Check if development server is running
if curl -s http://localhost:5174 > /dev/null; then
    echo "✓ Development server is running on port 5174"
else
    echo "✗ Development server is not running"
    exit 1
fi

# Check if the main page loads
if curl -s http://localhost:5174 | grep -q "Vite + React"; then
    echo "✓ Main page loads correctly"
else
    echo "✗ Main page does not load correctly"
fi

# Check if the backend services are accessible
echo ""
echo "Backend Services:"
echo "=================="

# Check auth service
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "✓ Auth service (port 8080) is accessible"
else
    echo "✗ Auth service (port 8080) is not accessible"
fi

# Check profile service
if curl -s http://localhost:8081/health > /dev/null 2>&1; then
    echo "✓ Profile service (port 8081) is accessible"
else
    echo "✗ Profile service (port 8081) is not accessible"
fi

# Check interactions service
if curl -s http://localhost:8082/health > /dev/null 2>&1; then
    echo "✓ Interactions service (port 8082) is accessible"
else
    echo "✗ Interactions service (port 8082) is not accessible"
fi

echo ""
echo "Test completed!"
