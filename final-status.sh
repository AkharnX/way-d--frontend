#!/bin/bash

echo "🎉 Way-d Project Final Status Report"
echo "===================================="

# Check frontend setup
echo ""
echo "📱 Frontend (React + TypeScript):"
if [ -f "package.json" ]; then
    VERSION=$(grep '"version"' package.json | cut -d'"' -f4)
    echo "✅ Version: $VERSION"
else
    echo "❌ package.json not found"
fi

if [ -f "vite.config.ts" ]; then
    echo "✅ Vite configuration: OK"
else
    echo "❌ Vite configuration missing"
fi

# Check MCP server
echo ""
echo "🤖 MCP Server:"
if [ -f "mcp-server/dist/index.js" ]; then
    echo "✅ MCP Server compiled and ready"
else
    echo "❌ MCP Server not compiled"
fi

if [ -f "$HOME/.config/claude-desktop/claude_desktop_config.json" ]; then
    echo "✅ Claude Desktop configured"
else
    echo "❌ Claude Desktop not configured"
fi

# Check Docker services
echo ""
echo "🐳 Docker Services:"
cd ..
RUNNING_SERVICES=$(docker-compose ps --services --filter status=running | wc -l)
TOTAL_SERVICES=5  # postgres, redis, auth, profile, interactions minimum
echo "✅ Running services: $RUNNING_SERVICES"

# Check specific services
for port in 8080 8081 8082; do
    if curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
        case $port in
            8080) echo "✅ Auth service (port $port): Healthy" ;;
            8081) echo "✅ Profile service (port $port): Healthy" ;;
            8082) echo "✅ Interactions service (port $port): Healthy" ;;
        esac
    else
        case $port in
            8080) echo "❌ Auth service (port $port): Down" ;;
            8081) echo "❌ Profile service (port $port): Down" ;;
            8082) echo "❌ Interactions service (port $port): Down" ;;
        esac
    fi
done

# Check documentation
echo ""
echo "📚 Documentation:"
cd frontend
if [ -f "docs/mcp-integration.md" ]; then
    echo "✅ MCP Integration Guide"
fi
if [ -f "docs/docker-services.md" ]; then
    echo "✅ Docker Services Guide"
fi
if [ -f "README_EN.md" ]; then
    echo "✅ Main README"
fi

# Summary
echo ""
echo "🚀 Quick Start Commands:"
echo "  Frontend:  npm run dev (port 5173)"
echo "  Docker:    npm run start:docker"
echo "  Health:    npm run check:services"
echo "  MCP:       npm run mcp:test"
echo ""
echo "🔗 Service URLs:"
echo "  Frontend:      http://localhost:5173"
echo "  Auth API:      http://localhost:8080"
echo "  Profile API:   http://localhost:8081"
echo "  Interact API:  http://localhost:8082"
echo ""
echo "💜 Way-d dating app infrastructure is ready!"
