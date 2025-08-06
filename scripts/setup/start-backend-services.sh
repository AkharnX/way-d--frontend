#!/bin/bash

# Quick Backend Services Starter for Auth Diagnostic Testing
# This script starts the necessary backend services to test authentication

echo "🚀 Starting Way-D Backend Services for Auth Testing"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if we're in the right directory structure
if [[ ! -d "../backend" ]]; then
    echo -e "${RED}❌ Backend directory not found. Please run from frontend directory.${NC}"
    exit 1
fi

# Function to start a service
start_service() {
    local service_name="$1"
    local service_dir="$2"
    local port="$3"
    
    echo -e "${YELLOW}Starting $service_name on port $port...${NC}"
    
    if [[ -d "$service_dir" ]]; then
        cd "$service_dir"
        
        # Check if port is already in use
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name already running on port $port${NC}"
        else
            # Start the service in background
            nohup go run main.go > "/tmp/way-d-$service_name.log" 2>&1 &
            local pid=$!
            sleep 2
            
            # Check if service started successfully
            if ps -p $pid > /dev/null 2>&1; then
                echo -e "${GREEN}✅ $service_name started (PID: $pid)${NC}"
                echo $pid > "/tmp/way-d-$service_name.pid"
            else
                echo -e "${RED}❌ Failed to start $service_name${NC}"
                echo "Check log: /tmp/way-d-$service_name.log"
            fi
        fi
        
        cd - > /dev/null
    else
        echo -e "${RED}❌ $service_name directory not found: $service_dir${NC}"
    fi
}

# Start services
start_service "auth-service" "../backend/way-d--auth" "8080"
start_service "profile-service" "../backend/way-d--profile" "8081" 
start_service "interactions-service" "../backend/way-d--interactions" "8082"

echo ""
echo "⏳ Waiting for services to initialize..."
sleep 5

# Test services
echo ""
echo "🔍 Testing Service Health..."

test_service() {
    local service_name="$1"
    local url="$2"
    
    if timeout 5s curl -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service_name responding${NC}"
        return 0
    else
        echo -e "${RED}❌ $service_name not responding${NC}"
        return 1
    fi
}

# Test direct backend endpoints
SERVICES_OK=0
test_service "Auth Service" "http://localhost:8080/health" && ((SERVICES_OK++))
test_service "Profile Service" "http://localhost:8081/health" && ((SERVICES_OK++))
test_service "Interactions Service" "http://localhost:8082/health" && ((SERVICES_OK++))

echo ""
echo "📊 Backend Services Status"
echo "========================="
echo "Services running: $SERVICES_OK/3"

if [[ $SERVICES_OK -eq 3 ]]; then
    echo -e "${GREEN}🎉 All backend services are running!${NC}"
    echo ""
    echo "🔗 Service URLs:"
    echo "   • Auth Service: http://localhost:8080"
    echo "   • Profile Service: http://localhost:8081" 
    echo "   • Interactions Service: http://localhost:8082"
    echo ""
    echo "🎯 Now you can test the authentication diagnostic tools:"
    echo "   • Token Diagnostic: http://localhost:5173/token-diagnostic"
    echo "   • Request Logs: http://localhost:5173/request-logs"
    echo ""
    echo "🧪 Run complete diagnostic:"
    echo "   ./complete-auth-diagnostic.sh"
    
elif [[ $SERVICES_OK -gt 0 ]]; then
    echo -e "${YELLOW}⚠️  Some services are running, but not all.${NC}"
    echo "You can still test the diagnostic tools with partial functionality."
    
else
    echo -e "${RED}❌ No backend services are responding.${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check if Go is installed: go version"
    echo "2. Check service logs in /tmp/way-d-*.log"
    echo "3. Verify backend directory structure"
    echo "4. Check if ports 8080-8082 are available"
fi

echo ""
echo "📝 Service Management:"
echo "   • View logs: tail -f /tmp/way-d-*.log"
echo "   • Stop services: ./stop-backend-services.sh"
echo "   • Service PIDs stored in: /tmp/way-d-*.pid"
