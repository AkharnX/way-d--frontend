#!/bin/bash
# Way-d Frontend Git Management Script

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_help() {
    echo -e "${BLUE}Way-d Frontend Git Management${NC}"
    echo ""
    echo "Usage: ./git-push.sh [command] [message]"
    echo ""
    echo "Commands:"
    echo "  push [message]   Add, commit and push changes"
    echo "  pull             Pull latest changes"
    echo "  status           Show git status"
    echo "  help             Show this help"
}

case "$1" in
    "push")
        message="${2:-"Update: $(date '+%Y-%m-%d %H:%M:%S')"}"
        echo -e "${GREEN}🔄 Adding all changes...${NC}"
        git add .
        
        echo -e "${GREEN}📝 Committing with message: ${message}${NC}"
        git commit -m "$message"
        
        echo -e "${GREEN}🚀 Pushing to GitHub...${NC}"
        git push origin main
        
        echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
        ;;
    "pull")
        echo -e "${GREEN}⬇️  Pulling latest changes...${NC}"
        git pull origin main
        echo -e "${GREEN}✅ Pull complete!${NC}"
        ;;
    "status")
        echo -e "${GREEN}📊 Git status:${NC}"
        git status
        echo ""
        echo -e "${BLUE}Recent commits:${NC}"
        git log --oneline -5
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
