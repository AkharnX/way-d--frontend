#!/bin/bash

echo "🔧 CORRECTION COMPLÈTE UX ET WORKFLOW WAY-D"
echo "=============================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "\n${YELLOW}Phase 1: Vérification des services${NC}"

# Vérifier les services backend
echo "Vérification des services backend..."
services=(
    "auth:8080:/health"
    "profile:8081:/health" 
    "interactions:8082:/health"
)

for service in "${services[@]}"
do
    IFS=':' read -r name port path <<< "$service"
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port$path")
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ $name service (port $port): OK${NC}"
    else
        echo -e "${RED}❌ $name service (port $port): Erreur (HTTP $response)${NC}"
    fi
done

echo -e "\n${YELLOW}Phase 2: Test du proxy Vite${NC}"
PROXY_AUTH=$(curl -s -m 3 "http://localhost:5173/api/auth/health" | grep -o '"status":"ok"' | head -1)
PROXY_PROFILE=$(curl -s -m 3 "http://localhost:5173/api/profile/health" | grep -o '"status":"ok"' | head -1)

if [ "$PROXY_AUTH" = '"status":"ok"' ]; then
    echo -e "${GREEN}✅ Proxy Auth: Fonctionnel${NC}"
else
    echo -e "${RED}❌ Proxy Auth: Non fonctionnel${NC}"
fi

if [ "$PROXY_PROFILE" = '"status":"ok"' ]; then
    echo -e "${GREEN}✅ Proxy Profile: Fonctionnel${NC}"
else
    echo -e "${RED}❌ Proxy Profile: Non fonctionnel${NC}"
fi

echo -e "\n${YELLOW}Phase 3: Identification des corrections à appliquer${NC}"

echo -e "${BLUE}📝 Problèmes UX identifiés:${NC}"
echo "1. Navigation disparaît sur certaines pages"
echo "2. Inconsistances dans les formulaires CreateProfile vs EditProfile"
echo "3. Headers de pages incohérents"
echo "4. Workflow d'authentification fragmenté"
echo "5. Données qui ne se chargent pas (endpoints dynamiques)"

echo -e "\n${BLUE}🔧 Corrections planifiées:${NC}"
echo "1. Standardiser les layouts avec AppLayout partout"
echo "2. Unifier les composants de formulaire" 
echo "3. Corriger les endpoints dynamiques (looking-for, interests, etc.)"
echo "4. Améliorer la cohérence visuelle des headers"
echo "5. Optimiser le workflow d'inscription/profil"

echo -e "\n${GREEN}✅ Script de diagnostic terminé${NC}"
echo -e "${YELLOW}📋 Étapes suivantes:${NC}"
echo "1. Corriger les routes pour utiliser AppLayout de manière cohérente"
echo "2. Unifier CreateProfile et EditProfile avec le même système de champs"
echo "3. Standardiser les headers de page"
echo "4. Tester tous les endpoints dynamiques"
echo "5. Valider le workflow complet"

echo -e "\n🚀 Démarrage des corrections automatiques..."
