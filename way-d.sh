#!/bin/bash
# Way-d Frontend Management Script
# Usage: ./way-d.sh [command]

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_help() {
    echo -e "${BLUE}Way-d Frontend Management${NC}"
    echo ""
    echo "Usage: ./way-d.sh [command]"
    echo ""
    echo "Commands:"
    echo "  dev          Start development server"
    echo "  build        Build for production"
    echo "  test         Run tests"
    echo "  lint         Run linting"
    echo "  clean        Clean build artifacts"
    echo "  deploy       Deploy with PM2"
    echo "  stop         Stop PM2 process"
    echo "  restart      Restart PM2 process"
    echo "  logs         Show PM2 logs"
    echo "  status       Show application status"
    echo "  install      Install dependencies"
    echo "  setup        Initial setup"
    echo "  help         Show this help"
}

case "$1" in
    "dev")
        echo -e "${GREEN}🚀 Starting development server...${NC}"
        npm run dev
        ;;
    "build")
        echo -e "${GREEN}🏗️  Building for production...${NC}"
        npm run build
        ;;
    "test")
        echo -e "${GREEN}🧪 Running tests...${NC}"
        cd tests && ./run-tests.sh
        ;;
    "lint")
        echo -e "${GREEN}🔍 Running linter...${NC}"
        npm run lint
        ;;
    "clean")
        echo -e "${YELLOW}🧹 Cleaning build artifacts...${NC}"
        rm -rf dist
        rm -rf node_modules/.vite
        echo "✅ Clean complete"
        ;;
    "deploy")
        echo -e "${GREEN}🚀 Deploying with PM2...${NC}"
        npm run build
        pm2 start deployment/ecosystem.config.cjs
        ;;
    "stop")
        echo -e "${YELLOW}⏹️  Stopping PM2 process...${NC}"
        pm2 stop way-d-frontend
        ;;
    "restart")
        echo -e "${GREEN}🔄 Restarting PM2 process...${NC}"
        pm2 restart way-d-frontend
        ;;
    "logs")
        echo -e "${GREEN}📋 Showing PM2 logs...${NC}"
        pm2 logs way-d-frontend
        ;;
    "status")
        echo -e "${GREEN}📊 Application status:${NC}"
        pm2 status
        echo ""
        echo -e "${BLUE}Development server:${NC}"
        curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:5173 || echo "Not responding"
        ;;
    "install")
        echo -e "${GREEN}📦 Installing dependencies...${NC}"
        npm install
        ;;
    "setup")
        echo -e "${GREEN}🔧 Initial setup...${NC}"
        npm install
        mkdir -p logs
        echo "✅ Setup complete"
        ;;
    "help"|"")
        print_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        print_help
        exit 1
        ;;
esac
