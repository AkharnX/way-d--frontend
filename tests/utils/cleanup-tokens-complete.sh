#!/bin/bash

echo "=== NETTOYAGE COMPLET DES TOKENS ==="
echo "Date: $(date)"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== PROBLÈME IDENTIFIÉ ===${NC}"
echo -e "${RED}❌ Tokens client: b43948a8-4518-4891-a9a8-1217d15922b7, 86af7369-ba29-4209-9af3-cf5fadb84e25${NC}"
echo -e "${GREEN}✅ Tokens DB: 26a05914-b976-4716-a26e-561d3b12273b, 14971197-6578-4559-be35-89bc9d8dd34a${NC}"
echo ""

echo -e "${BLUE}=== ÉTAPE 1: NETTOYER LA BASE DE DONNÉES ===${NC}"
echo -e "${YELLOW}Suppression de toutes les sessions anciennes...${NC}"
docker exec -it wayd-postgres psql -U wayd_user -d wayd_db -c "DELETE FROM sessions;"

echo ""
echo -e "${BLUE}=== ÉTAPE 2: REDÉMARRER LE SERVICE AUTH ===${NC}"
echo -e "${YELLOW}Redémarrage du service d'authentification...${NC}"
docker restart wayd-auth

echo ""
echo -e "${BLUE}=== ÉTAPE 3: VÉRIFIER LE NETTOYAGE ===${NC}"
echo -e "${YELLOW}Vérification des sessions après nettoyage:${NC}"
sleep 2
docker exec -it wayd-postgres psql -U wayd_user -d wayd_db -c "SELECT COUNT(*) as session_count FROM sessions;"

echo ""
echo -e "${BLUE}=== ÉTAPE 4: INSTRUCTIONS POUR LE CLIENT ===${NC}"
echo -e "${GREEN}1. Ouvrez: http://localhost:5173/token-diagnostic${NC}"
echo -e "${GREEN}2. Cliquez sur 'Nettoyer Tokens' pour vider localStorage${NC}"
echo -e "${GREEN}3. Cliquez sur 'Login Fresh' pour créer une nouvelle session${NC}"
echo -e "${GREEN}4. Utilisez: testuser2@example.com / TestPassword123!${NC}"
echo ""

echo -e "${BLUE}=== ÉTAPE 5: VÉRIFICATION FINALE ===${NC}"
echo -e "${YELLOW}Services actifs:${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}"

echo ""
echo -e "${GREEN}=== NETTOYAGE TERMINÉ ===${NC}"
echo "Base de données nettoyée. Procédez maintenant au nettoyage côté client."
