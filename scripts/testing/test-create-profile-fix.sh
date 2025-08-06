#!/bin/bash

echo "🔧 Test de la correction du proxy Vite pour create-profile"
echo "=================================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
FRONTEND_URL="http://157.180.36.122:5173"
AUTH_API_URL="http://157.180.36.122:8080"
PROFILE_API_URL="http://157.180.36.122:8081"

echo -e "\n${YELLOW}Étape 1: Test des services backend directement${NC}"
echo "Test Auth Service Health..."
AUTH_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" $AUTH_API_URL/health)
if [ "$AUTH_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ Auth Service: OK (HTTP $AUTH_HEALTH)${NC}"
else
    echo -e "${RED}❌ Auth Service: Erreur (HTTP $AUTH_HEALTH)${NC}"
fi

echo "Test Profile Service Health..."
PROFILE_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" $PROFILE_API_URL/health)
if [ "$PROFILE_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ Profile Service: OK (HTTP $PROFILE_HEALTH)${NC}"
else
    echo -e "${RED}❌ Profile Service: Erreur (HTTP $PROFILE_HEALTH)${NC}"
fi

echo -e "\n${YELLOW}Étape 2: Test de l'endpoint looking-for options avec authentification${NC}"
# D'abord, essayons avec un utilisateur test
TEST_EMAIL="test@example.com"
TEST_PASSWORD="TestPassword123!"

echo "Login avec utilisateur test..."
LOGIN_RESPONSE=$(curl -s -X POST $AUTH_API_URL/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

echo "Réponse login: $LOGIN_RESPONSE"

# Extraire le token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"//' | sed 's/"//')

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo -e "${GREEN}✅ Token obtenu: ${TOKEN:0:20}...${NC}"
    
    echo "Test direct de l'endpoint looking-for options..."
    LOOKING_FOR_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
      -H "Authorization: Bearer $TOKEN" \
      $PROFILE_API_URL/profile/looking-for/options)
    
    HTTP_STATUS=$(echo $LOOKING_FOR_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    RESPONSE_BODY=$(echo $LOOKING_FOR_RESPONSE | sed -e 's/HTTPSTATUS:.*//g')
    
    echo "Status HTTP: $HTTP_STATUS"
    echo "Réponse: $RESPONSE_BODY"
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Endpoint looking-for options fonctionne directement${NC}"
    else
        echo -e "${RED}❌ Endpoint looking-for options échoue (HTTP $HTTP_STATUS)${NC}"
    fi
else
    echo -e "${RED}❌ Impossible d'obtenir un token d'authentification${NC}"
    echo "Création d'un nouvel utilisateur test..."
    
    # Créer un nouvel utilisateur
    REGISTER_RESPONSE=$(curl -s -X POST $AUTH_API_URL/register \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"test-$(date +%s)@example.com\",\"password\":\"$TEST_PASSWORD\",\"first_name\":\"Test\",\"last_name\":\"User\",\"birth_date\":\"1990-01-01\",\"gender\":\"male\"}")
    
    echo "Réponse registration: $REGISTER_RESPONSE"
fi

echo -e "\n${YELLOW}Étape 3: Redémarrage du serveur frontend pour prendre en compte la nouvelle config${NC}"
echo "Vous devez redémarrer le serveur Vite pour que les modifications du proxy prennent effet."
echo "Utilisez: Ctrl+C puis npm run dev"

echo -e "\n${YELLOW}Étape 4: Test via le proxy frontend (après redémarrage)${NC}"
echo "Une fois le serveur redémarré, testez l'endpoint via le proxy:"
echo "curl -s -H \"Authorization: Bearer \$TOKEN\" $FRONTEND_URL/api/profile/looking-for/options"

echo -e "\n${GREEN}✅ Corrections apportées:${NC}"
echo "1. Correction du proxy /api/profile: transformation de '/api/profile' vers '' au lieu de '/profile'"
echo "2. Mise à jour des adresses IP: localhost → 157.180.36.122"
echo "3. Les requêtes /api/profile/looking-for/options vont maintenant vers /profile/looking-for/options"

echo -e "\n${YELLOW}📝 Actions suivantes:${NC}"
echo "1. Redémarrer le serveur de développement Vite"
echo "2. Tester la page create-profile"
echo "3. Vérifier que le champ 'Recherche' se charge correctement"

echo -e "\n🏁 Test terminé!"
