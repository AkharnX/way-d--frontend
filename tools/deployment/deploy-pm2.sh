#!/bin/bash

# 🚀 Way-d PM2 Deployment Script
# Déploie l'application avec PM2 pour qu'elle reste active même après fermeture du terminal

set -e

# Navigate to the frontend directory
cd "$(dirname "$0")/../.."

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════════════════════════════╗"
echo "║                           🚀 WAY-D PM2 DEPLOYMENT 🚀                               ║"
echo "╚══════════════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Vérifier que PM2 est installé
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 Installing PM2...${NC}"
    npm install -g pm2
fi

# Arrêter l'ancienne instance si elle existe
echo -e "${YELLOW}🛑 Stopping existing instances...${NC}"
pm2 stop way-d-frontend 2>/dev/null || echo "No existing frontend instance"
pm2 delete way-d-frontend 2>/dev/null || echo "No frontend instance to delete"

# Choisir le mode de déploiement
echo -e "${BLUE}Choose deployment mode:${NC}"
echo "1. Development mode (with hot reload)"
echo "2. Production mode (optimized build on port 5173)"
echo "3. Development mode (simple)"
read -p "Enter your choice (1-3): " deploy_mode

case $deploy_mode in
    1)
        echo -e "${GREEN}🔄 Starting development server with hot reload...${NC}"
        pm2 start "npm run dev" --name "way-d-frontend" --watch --ignore-watch="node_modules dist"
        ;;
    2)
        echo -e "${GREEN}🏗️ Building for production...${NC}"
        npm run build
        
        # Installer serve si nécessaire
        if ! npm list serve --depth=0 > /dev/null 2>&1; then
            echo -e "${BLUE}📦 Installing serve locally...${NC}"
            npm install serve --save-dev
        fi
        
        echo -e "${GREEN}🚀 Starting production server on port 5173...${NC}"
        pm2 start "npx serve -s dist -p 5173" --name "way-d-frontend"
        ;;
    3)
        echo -e "${YELLOW}🔄 Starting development mode...${NC}"
        pm2 start "npm run dev" --name "way-d-frontend"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice. Starting development mode.${NC}"
        pm2 start "npm run dev" --name "way-d-frontend"
        ;;
esac

# Configurer PM2 pour démarrer au boot
echo -e "${YELLOW}⚙️  Configuring PM2 startup...${NC}"
pm2 save
pm2 startup || echo "PM2 startup configuration attempted"

# Afficher le statut
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo
pm2 list
echo
echo -e "${CYAN}📊 Application Status:${NC}"
echo -e "${GREEN}Frontend HTTPS: https://localhost (if HTTPS mode selected)${NC}"
echo -e "${GREEN}Frontend HTTP: http://localhost:5173${NC}"
echo -e "${BLUE}PM2 Status: pm2 status${NC}"
echo -e "${BLUE}PM2 Logs: pm2 logs way-d-frontend${NC}"
echo -e "${BLUE}PM2 Monitor: pm2 monit${NC}"

echo
echo -e "${PURPLE}🎉 Way-d is now deployed and will stay running even if you close the terminal!${NC}"
