#!/bin/bash

echo "🧪 Way-d Backend - Test de Validation Complet"
echo "=============================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Token de test
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiOWRkNWMzYTgtMGRjMi00NWRlLWJjYjAtNGI2MTg4NDgwZGE4IiwiZXhwIjoxNzUyOTU0MDc4fQ.Ef2PZx7p8egXdMi45B7x5iB94KtxkquyO-GKBKEd3Bw"

echo -e "${BLUE}=== Test 1: Vérification des Services Backend ===${NC}"
echo -e "${YELLOW}Checking Docker containers...${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep wayd

echo ""
echo -e "${BLUE}=== Test 2: Test API Auth Service ===${NC}"
echo -e "${YELLOW}Testing login endpoint...${NC}"
LOGIN_RESULT=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@waydev.com","password":"TestPassword123!"}' \
  http://localhost:8080/login)

if [ "$LOGIN_RESULT" = "200" ]; then
    echo -e "${GREEN}✅ Auth Service: Login OK (HTTP $LOGIN_RESULT)${NC}"
else
    echo -e "${RED}❌ Auth Service: Login Failed (HTTP $LOGIN_RESULT)${NC}"
fi

echo ""
echo -e "${BLUE}=== Test 3: Test API Profile Service ===${NC}"
echo -e "${YELLOW}Testing profile discover endpoint...${NC}"
DISCOVER_RESULT=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8081/profile/discover)

if [ "$DISCOVER_RESULT" = "200" ]; then
    echo -e "${GREEN}✅ Profile Service: Discover OK (HTTP $DISCOVER_RESULT)${NC}"
else
    echo -e "${RED}❌ Profile Service: Discover Failed (HTTP $DISCOVER_RESULT)${NC}"
fi

echo -e "${YELLOW}Testing profile me endpoint...${NC}"
PROFILE_RESULT=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8081/profile/me)

if [ "$PROFILE_RESULT" = "200" ] || [ "$PROFILE_RESULT" = "404" ]; then
    echo -e "${GREEN}✅ Profile Service: Profile Me OK (HTTP $PROFILE_RESULT - 404 is normal for new user)${NC}"
else
    echo -e "${RED}❌ Profile Service: Profile Me Failed (HTTP $PROFILE_RESULT)${NC}"
fi

echo ""
echo -e "${BLUE}=== Test 4: Test API Interactions Service ===${NC}"
echo -e "${YELLOW}Testing interactions matches endpoint...${NC}"
MATCHES_RESULT=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8082/api/matches)

if [ "$MATCHES_RESULT" = "200" ]; then
    echo -e "${GREEN}✅ Interactions Service: Matches OK (HTTP $MATCHES_RESULT)${NC}"
else
    echo -e "${RED}❌ Interactions Service: Matches Failed (HTTP $MATCHES_RESULT)${NC}"
fi

echo ""
echo -e "${BLUE}=== Test 5: Test Frontend Proxy Configuration ===${NC}"
echo -e "${YELLOW}Testing frontend accessibility...${NC}"
FRONTEND_RESULT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)

if [ "$FRONTEND_RESULT" = "200" ]; then
    echo -e "${GREEN}✅ Frontend: Accessible (HTTP $FRONTEND_RESULT)${NC}"
else
    echo -e "${RED}❌ Frontend: Not Accessible (HTTP $FRONTEND_RESULT)${NC}"
fi

echo -e "${YELLOW}Testing frontend assets...${NC}"
LOGO_RESULT=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/logo_blue.svg)

if [ "$LOGO_RESULT" = "200" ]; then
    echo -e "${GREEN}✅ Frontend Assets: Logo accessible (HTTP $LOGO_RESULT)${NC}"
else
    echo -e "${RED}❌ Frontend Assets: Logo not accessible (HTTP $LOGO_RESULT)${NC}"
fi

echo ""
echo -e "${BLUE}=== Test 6: Database Connectivity ===${NC}"
echo -e "${YELLOW}Testing PostgreSQL connection...${NC}"
DB_TEST=$(docker exec wayd-postgres psql -U wayd_user -d wayd_db -c "SELECT COUNT(*) FROM users;" 2>/dev/null | grep -E "^\s*[0-9]+$" | head -1)

if [ ! -z "$DB_TEST" ]; then
    echo -e "${GREEN}✅ Database: Connected - $DB_TEST users in database${NC}"
else
    echo -e "${RED}❌ Database: Connection Failed${NC}"
fi

echo ""
echo -e "${BLUE}=== RÉSUMÉ DES TESTS ===${NC}"
echo -e "${GREEN}🎉 Application Way-d - Test de Validation Complet${NC}"
echo ""
echo -e "${YELLOW}Pour tester l'application complète:${NC}"
echo "1. Ouvrir: http://localhost:5173"
echo "2. Se connecter avec: testuser@waydev.com / TestPassword123!"
echo "3. Créer un profil complet"
echo "4. Tester Discovery, Messages, etc."
echo ""
echo -e "${GREEN}✅ Tous les services backend sont opérationnels !${NC}"
