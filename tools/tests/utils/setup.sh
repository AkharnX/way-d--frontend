#!/bin/bash

# 🛠️ Way-d Setup Script
# Installation et configuration initiale de l'environnement

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                   🛠️  WAY-D SETUP WIZARD 🛠️                   ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${YELLOW}🚀 Setting up Way-d development environment...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

# Install dependencies
echo -e "${YELLOW}📦 Installing npm dependencies...${NC}"
npm install

# Install PM2 globally
echo -e "${YELLOW}⚙️  Installing PM2 process manager...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    echo -e "${GREEN}✅ PM2 installed${NC}"
else
    echo -e "${GREEN}✅ PM2 already installed${NC}"
fi

# Setup PM2 startup
echo -e "${YELLOW}🔧 Configuring PM2 startup...${NC}"
pm2 startup || echo "PM2 startup configuration attempted"
pm2 save

# Make all scripts executable
echo -e "${YELLOW}🔐 Setting script permissions...${NC}"
find . -name "*.sh" -exec chmod +x {} \;

# Create necessary directories
echo -e "${YELLOW}📁 Creating directories...${NC}"
mkdir -p logs deployment tests/{auth,api,integration,validation,diagnostic,utils}

# Setup git hooks if .git exists
if [ -d ".git" ]; then
    echo -e "${YELLOW}🔗 Setting up git hooks...${NC}"
    # Add pre-commit hook for linting
    mkdir -p .git/hooks
    echo '#!/bin/bash
npm run lint' > .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
fi

echo -e "${GREEN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    ✅ SETUP COMPLETE! ✅                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${CYAN}🎉 Way-d is ready to use!${NC}"
echo
echo -e "${YELLOW}Quick Start Commands:${NC}"
echo "• Start app:        ./way-d-control.sh"
echo "• Run tests:        ./tests/run-tests.sh"
echo "• Clean database:   ./clear-db.sh"
echo "• View structure:   tree -I node_modules"
echo
echo -e "${BLUE}Frontend will be available at: http://localhost:5173${NC}"
echo -e "${BLUE}Backend should be available at: http://localhost:3001${NC}"
echo
echo -e "${GREEN}Happy coding! 🚀${NC}"
