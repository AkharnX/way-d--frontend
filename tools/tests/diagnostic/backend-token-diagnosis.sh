#!/bin/bash

echo "=== DIAGNOSTIC ET SOLUTION DES REFRESH TOKENS ==="
echo "Date: $(date)"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== ANALYSE DU PROBLÈME ===${NC}"
echo -e "${RED}❌ Le client utilise des tokens invalides qui ne sont pas dans la base${NC}"
echo -e "${RED}❌ Tokens client: b43948a8-4518-4891-a9a8-1217d15922b7, 86af7369-ba29-4209-9af3-cf5fadb84e25${NC}"
echo -e "${GREEN}✅ Tokens DB valides: 26a05914-b976-4716-a26e-561d3b12273b, 14971197-6578-4559-be35-89bc9d8dd34a${NC}"
echo ""

echo -e "${BLUE}=== VÉRIFICATION DES SERVICES ===${NC}"
echo -e "${YELLOW}Services Docker:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo -e "${BLUE}=== ANALYSE DES TOKENS JWT ===${NC}"
echo -e "${YELLOW}Sessions dans la base:${NC}"
docker exec -it wayd-postgres psql -U wayd_user -d wayd_db -c "SELECT substring(refresh_token, 1, 25) as token_preview, substring(access_token, 1, 50) as access_preview, created_at FROM sessions ORDER BY created_at DESC;"

echo ""
echo -e "${BLUE}=== LOGS RÉCENTS DU SERVICE AUTH ===${NC}"
echo -e "${YELLOW}Erreurs refresh token:${NC}"
docker logs wayd-auth --tail=5 | grep -E "(401|refresh|token|record not found)"

echo ""
echo -e "${BLUE}=== SOLUTION AUTOMATIQUE ===${NC}"
echo -e "${GREEN}1. Nettoyer les tokens invalides du localStorage${NC}"
echo -e "${GREEN}2. Forcer une nouvelle connexion${NC}"
echo -e "${GREEN}3. Synchroniser client et serveur${NC}"
echo ""

echo -e "${YELLOW}Instructions:${NC}"
echo "1. Ouvrez: http://localhost:5173/token-diagnostic"
echo "2. Cliquez sur 'Nettoyer Tokens'"
echo "3. Cliquez sur 'Login Fresh'"
echo "4. Utilisez: testuser2@example.com / TestPassword123!"
echo ""

echo -e "${BLUE}=== COMMANDES UTILES ===${NC}"
echo -e "${YELLOW}Nettoyer toutes les sessions:${NC}"
echo "docker exec -it wayd-postgres psql -U wayd_user -d wayd_db -c \"DELETE FROM sessions;\""
echo ""
echo -e "${YELLOW}Redémarrer le service auth:${NC}"
echo "docker restart wayd-auth"
echo ""

echo -e "${GREEN}=== SOLUTION PRÊTE ===${NC}"
echo "Le problème de désynchronisation des refresh tokens est identifié et la solution est disponible."
