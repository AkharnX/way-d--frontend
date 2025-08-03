#!/bin/bash

# 🔍 Way-d Port Verification Script
# Vérifie que l'application fonctionne sur le bon port

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Way-d Port Verification${NC}"
echo "=========================="

# Vérifier le port 5173 (Frontend)
echo -e "${YELLOW}Checking Frontend Port 5173...${NC}"
if curl -s http://localhost:5173 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is running on port 5173${NC}"
    
    # Tenter d'obtenir le titre de la page
    PAGE_TITLE=$(curl -s http://localhost:5173 | grep -o '<title>[^<]*' | sed 's/<title>//')
    if [ ! -z "$PAGE_TITLE" ]; then
        echo -e "   Page: $PAGE_TITLE"
    fi
else
    echo -e "${RED}❌ Frontend is NOT running on port 5173${NC}"
    echo -e "${YELLOW}   This will cause CORS errors with the backend!${NC}"
    
    # Vérifier si quelque chose d'autre utilise le port
    if lsof -i :5173 > /dev/null 2>&1; then
        echo -e "${YELLOW}   Port 5173 is occupied by:${NC}"
        lsof -i :5173
    else
        echo -e "${YELLOW}   Port 5173 is free - you need to start the app${NC}"
    fi
fi

echo

# Vérifier le port 3001 (Backend)
echo -e "${YELLOW}Checking Backend Port 3001...${NC}"
if curl -s http://localhost:3001/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is running on port 3001${NC}"
else
    echo -e "${YELLOW}⚠️  Backend is not running on port 3001${NC}"
    echo -e "   You may need to start the backend manually"
fi

echo

# Vérifier d'autres ports communs pour détecter des erreurs
echo -e "${YELLOW}Checking for apps on wrong ports...${NC}"
WRONG_PORTS=(3000 3001 4173 8080)

for port in "${WRONG_PORTS[@]}"; do
    if [ "$port" != "3001" ]; then  # Skip backend port
        if curl -s http://localhost:$port > /dev/null 2>&1; then
            echo -e "${RED}⚠️  Found application running on port $port${NC}"
            echo -e "   Make sure this is not the Way-d frontend!"
        fi
    fi
done

echo
echo -e "${BLUE}Summary:${NC}"
echo -e "${GREEN}✅ Correct setup: Frontend on 5173, Backend on 3001${NC}"
echo -e "${RED}❌ Wrong setup: Any other port configuration${NC}"

# Suggestions
echo
echo -e "${YELLOW}To start on correct port:${NC}"
echo "npm run dev                    # Uses port 5173"
echo "./way-d-control.sh            # Option 1"
echo "./deployment/deploy-pm2.sh    # Persistent deployment"

echo
echo -e "${YELLOW}To check configuration:${NC}"
echo "cat vite.config.ts | grep port  # Should show 5173"
echo "pm2 list                       # Check PM2 processes"
