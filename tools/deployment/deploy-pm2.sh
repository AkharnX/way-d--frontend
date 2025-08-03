#!/bin/bash

# 🚀 Way-d PM2 Deployment Script
# Déploie l'application avec PM2 pour qu'elle reste active même après fermeture du terminal

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════════════════════════════╗"
echo "║                           🚀 WAY-D PM2 DEPLOYMENT 🚀                               ║"
echo "╚══════════════════════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Vérifier que PM2 est installé
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 Installing PM2...${NC}"
    sudo npm install -g pm2
fi

# Arrêter l'ancienne instance si elle existe
echo -e "${YELLOW}🛑 Stopping existing instances...${NC}"
pm2 stop way-d-frontend 2>/dev/null || echo "No existing frontend instance"
pm2 delete way-d-frontend 2>/dev/null || echo "No frontend instance to delete"

# Vérifier si les certificats HTTPS existent
if [[ ! -f "../certs/localhost.crt" ]]; then
    echo -e "${YELLOW}🔐 Setting up HTTPS certificates...${NC}"
    cd ..
    ./setup-local-https.sh
    cd deployment
else
    echo -e "${GREEN}✅ HTTPS certificates already exist${NC}"
fi

# Choisir le mode de déploiement
echo -e "${CYAN}Choose deployment mode:${NC}"
echo "1. Development with HTTPS"
echo "2. Production with HTTPS"
echo "3. Standard HTTP (legacy)"
read -p "Enter your choice (1-3): " deploy_mode

case $deploy_mode in
    1)
        echo -e "${GREEN}🔒 Starting HTTPS development server with PM2...${NC}"
        # Utiliser la configuration HTTPS
        cp vite.config.https.ts vite.config.ts 2>/dev/null || echo "Using existing config"
        pm2 start "npm run dev" --name "way-d-frontend" --watch --ignore-watch="node_modules dist"
        ;;
    2)
        echo -e "${GREEN}🏗️ Building for production with HTTPS...${NC}"
        npm run build
        
        # Installer serve si nécessaire
        if ! npm list serve --depth=0 > /dev/null 2>&1; then
            echo -e "${BLUE}📦 Installing serve locally...${NC}"
            npm install serve --save-dev
        fi
        
        echo -e "${GREEN}🔒 Starting HTTPS production server with PM2...${NC}"
        pm2 start "npx serve -s dist -p 5173 --ssl-cert certs/localhost.crt --ssl-key certs/localhost.key" --name "way-d-frontend"
        ;;
    3)
        echo -e "${YELLOW}⚠️ Starting HTTP mode (not secure)...${NC}"
        read -p "Build for production? (y/n): " build_prod
        if [ "$build_prod" = "y" ]; then
            npm run build
            if ! npm list serve --depth=0 > /dev/null 2>&1; then
                npm install serve --save-dev
            fi
            pm2 start "npx serve -s dist -p 5173" --name "way-d-frontend"
        else
            pm2 start "npm run dev" --name "way-d-frontend"
        fi
        ;;
    *)
        echo -e "${RED}❌ Invalid choice. Defaulting to HTTPS development.${NC}"
        cp vite.config.https.ts vite.config.ts 2>/dev/null || echo "Using existing config"
        pm2 start "npm run dev" --name "way-d-frontend" --watch --ignore-watch="node_modules dist"
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
