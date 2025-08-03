#!/bin/bash

# Stop Backend Services Script
echo "🛑 Stopping Way-D Backend Services"
echo "================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

STOPPED=0

# Function to stop a service
stop_service() {
    local service_name="$1"
    local pid_file="/tmp/way-d-$service_name.pid"
    
    if [[ -f "$pid_file" ]]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            kill $pid
            sleep 2
            if ps -p $pid > /dev/null 2>&1; then
                kill -9 $pid
            fi
            echo -e "${GREEN}✅ Stopped $service_name (PID: $pid)${NC}"
            ((STOPPED++))
        else
            echo -e "${RED}❌ $service_name was not running${NC}"
        fi
        rm -f "$pid_file"
    else
        echo -e "${RED}❌ No PID file found for $service_name${NC}"
    fi
}

# Stop services
stop_service "auth-service"
stop_service "profile-service"
stop_service "interactions-service"

# Clean up any remaining processes
pkill -f "way-d--" 2>/dev/null || true

# Clean up log files
rm -f /tmp/way-d-*.log /tmp/way-d-*.pid

echo ""
echo "📊 Cleanup Summary"
echo "=================="
echo "Services stopped: $STOPPED"
echo "Log files cleaned up"
echo "PID files removed"
echo ""
echo -e "${GREEN}✅ Backend services cleanup complete${NC}"
