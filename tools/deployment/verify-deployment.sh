#!/bin/bash

# Script de vérification post-déploiement pour Way-d
# Ce script vérifie que le déploiement PM2 et la configuration Nginx sont corrects

# Couleurs pour la sortie
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                   🔍 WAY-D DEPLOYMENT VERIFICATION                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════════╝${NC}"

# Vérifier PM2
echo -e "${YELLOW}Vérification de PM2...${NC}"
if pm2 list | grep -q "way-d-frontend"; then
    status=$(pm2 info way-d-frontend | grep status | awk '{print $2}')
    if [ "$status" == "online" ]; then
        echo -e "${GREEN}✅ PM2 status: online${NC}"
    else
        echo -e "${RED}❌ PM2 status: $status${NC}"
        echo -e "${YELLOW}⚠️ Redémarrage de l'application...${NC}"
        pm2 restart way-d-frontend
    fi
else
    echo -e "${RED}❌ L'application n'est pas démarrée avec PM2.${NC}"
    echo -e "${YELLOW}⚠️ Démarrage de l'application...${NC}"
    cd /home/akharn/way-d/frontend && pm2 start tools/deployment/ecosystem.config.cjs --env production
fi

# Vérifier que l'application est accessible sur le port 5173
echo -e "${YELLOW}Vérification de l'accès direct à l'application (port 5173)...${NC}"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ | grep -q "200"; then
    echo -e "${GREEN}✅ Application accessible sur http://localhost:5173/${NC}"
else
    echo -e "${RED}❌ Application non accessible sur http://localhost:5173/${NC}"
fi

# Vérifier que le reverse proxy Nginx fonctionne
echo -e "${YELLOW}Vérification du reverse proxy Nginx...${NC}"
if curl -s -k -o /dev/null -w "%{http_code}" https://localhost/ | grep -q "200"; then
    echo -e "${GREEN}✅ Reverse proxy Nginx configuré correctement${NC}"
else
    echo -e "${RED}❌ Reverse proxy Nginx non fonctionnel${NC}"
    echo -e "${YELLOW}⚠️ Vérifiez la configuration Nginx et que Nginx est en cours d'exécution${NC}"
fi

# Vérifier les services backend
echo -e "${YELLOW}Vérification des services backend...${NC}"
services=("auth" "profile" "interactions")
for service in "${services[@]}"; do
    if curl -s http://localhost/api/$service/health | grep -q "ok"; then
        echo -e "${GREEN}✅ Service $service: OK${NC}"
    else
        echo -e "${RED}❌ Service $service: Non disponible${NC}"
    fi
done

# Afficher un résumé
echo -e "\n${BLUE}Résumé du déploiement:${NC}"
echo -e "- Frontend PM2: $(pm2 list | grep 'way-d-frontend' > /dev/null && echo "${GREEN}✅ Running${NC}" || echo "${RED}❌ Not running${NC}")"
echo -e "- Direct access: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ | grep -q "200" && echo "${GREEN}✅ OK${NC}" || echo "${RED}❌ Failed${NC}")"
echo -e "- Nginx proxy: $(curl -s -k -o /dev/null -w "%{http_code}" https://localhost/ | grep -q "200" && echo "${GREEN}✅ OK${NC}" || echo "${RED}❌ Failed${NC}")"

echo -e "\n${BLUE}Pour plus d'informations, consultez:${NC}"
echo -e "- Documentation de déploiement: ${YELLOW}/home/akharn/way-d/frontend/documentation/guides/PM2_DEPLOYMENT.md${NC}"
echo -e "- Configuration Nginx: ${YELLOW}/home/akharn/way-d/frontend/documentation/guides/NGINX_PROXY_CONFIG.md${NC}"
