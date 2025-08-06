#!/bin/bash

# Script de redémarrage pour Way-d frontend avec PM2
# Redémarre l'application frontend Way-d avec PM2 sur le port 5173

# Couleurs pour la sortie
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                      🔄 WAY-D FRONTEND RESTART                             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════════╝${NC}"

# Arrêter l'application
echo -e "${YELLOW}Arrêt de l'application...${NC}"
pm2 stop way-d-frontend

# Vérifier la configuration actuelle
echo -e "${YELLOW}Vérification de la configuration...${NC}"
if [ -f "./tools/deployment/ecosystem.config.cjs" ]; then
    echo -e "${GREEN}✅ Configuration PM2 trouvée${NC}"
else
    echo -e "${YELLOW}⚠️ Configuration PM2 non trouvée, utilisation des paramètres par défaut${NC}"
fi

# Démarrer l'application
echo -e "${YELLOW}Démarrage de l'application...${NC}"
if [ -f "./tools/deployment/ecosystem.config.cjs" ]; then
    pm2 start tools/deployment/ecosystem.config.cjs --env production
else
    pm2 start "npm run preview" --name "way-d-frontend"
fi

# Sauvegarder la configuration PM2
pm2 save

echo -e "${GREEN}✅ L'application a été redémarrée avec succès sur le port 5173${NC}"
echo -e "${YELLOW}Pour vérifier l'état, exécutez: ${NC}pm2 status"
echo -e "${YELLOW}Pour consulter les logs, exécutez: ${NC}pm2 logs way-d-frontend"
