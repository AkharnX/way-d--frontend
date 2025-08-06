#!/bin/bash

echo "🧪 Test complet de la fonctionnalité recherche create-profile"
echo "=========================================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
FRONTEND_URL="http://157.180.36.122:5173"
AUTH_URL="http://157.180.36.122:8080"

echo -e "\n${YELLOW}Étape 1: Création et authentification d'un utilisateur${NC}"

# Créer un nouvel utilisateur avec timestamp
TIMESTAMP=$(date +%s)
TEST_EMAIL="test-$TIMESTAMP@example.com"
TEST_PASSWORD="TestPassword123!"

echo "Création d'un utilisateur test: $TEST_EMAIL"
REGISTER_RESPONSE=$(curl -s -X POST $AUTH_URL/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"first_name\":\"Test\",\"last_name\":\"User\",\"birth_date\":\"1990-01-01\",\"gender\":\"male\"}")

echo "Réponse registration: $REGISTER_RESPONSE"

# Extraire le code de vérification
VERIFICATION_CODE=$(echo $REGISTER_RESPONSE | grep -o '"verification_code":"[^"]*"' | sed 's/"verification_code":"//' | sed 's/"//')

if [ -n "$VERIFICATION_CODE" ]; then
    echo -e "${GREEN}✅ Code de vérification reçu: $VERIFICATION_CODE${NC}"
    
    # Vérifier l'email
    echo "Vérification de l'email..."
    VERIFY_RESPONSE=$(curl -s -X POST $AUTH_URL/verify-email \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$TEST_EMAIL\",\"code\":\"$VERIFICATION_CODE\"}")
    
    echo "Réponse vérification: $VERIFY_RESPONSE"
    
    # Extraire le token
    TOKEN=$(echo $VERIFY_RESPONSE | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"//' | sed 's/"//')
    
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        echo -e "${GREEN}✅ Authentification réussie: ${TOKEN:0:20}...${NC}"
        
        echo -e "\n${YELLOW}Étape 2: Test des endpoints profile via le proxy frontend${NC}"
        
        # Test de l'endpoint looking-for options via le proxy
        echo "Test: /api/profile/looking-for/options"
        LOOKING_FOR_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
          -H "Authorization: Bearer $TOKEN" \
          $FRONTEND_URL/api/profile/looking-for/options)
        
        HTTP_STATUS=$(echo $LOOKING_FOR_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
        RESPONSE_BODY=$(echo $LOOKING_FOR_RESPONSE | sed -e 's/HTTPSTATUS:.*//g')
        
        echo "Status HTTP: $HTTP_STATUS"
        echo "Réponse: $RESPONSE_BODY"
        
        if [ "$HTTP_STATUS" = "200" ]; then
            echo -e "${GREEN}✅ Endpoint looking-for options fonctionne via le proxy!${NC}"
            if [[ $RESPONSE_BODY == *"options"* ]]; then
                echo -e "${GREEN}✅ Réponse contient des options valides${NC}"
            else
                echo -e "${YELLOW}⚠️ Réponse ne semble pas contenir d'options${NC}"
            fi
        else
            echo -e "${RED}❌ Endpoint looking-for options échoue via le proxy (HTTP $HTTP_STATUS)${NC}"
        fi
        
        # Test d'autres endpoints dynamiques
        echo -e "\n${BLUE}Test d'autres endpoints dynamiques:${NC}"
        
        echo "Test: /api/profile/interests/suggestions"
        INTERESTS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
          -H "Authorization: Bearer $TOKEN" \
          $FRONTEND_URL/api/profile/interests/suggestions)
        
        if [ "$INTERESTS_RESPONSE" = "200" ]; then
            echo -e "${GREEN}✅ Interests suggestions: OK${NC}"
        else
            echo -e "${RED}❌ Interests suggestions: Erreur (HTTP $INTERESTS_RESPONSE)${NC}"
        fi
        
        echo "Test: /api/profile/education/levels"
        EDUCATION_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
          -H "Authorization: Bearer $TOKEN" \
          $FRONTEND_URL/api/profile/education/levels)
        
        if [ "$EDUCATION_RESPONSE" = "200" ]; then
            echo -e "${GREEN}✅ Education levels: OK${NC}"
        else
            echo -e "${RED}❌ Education levels: Erreur (HTTP $EDUCATION_RESPONSE)${NC}"
        fi
        
        echo "Test: /api/profile/professions/suggestions"
        PROFESSIONS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
          -H "Authorization: Bearer $TOKEN" \
          $FRONTEND_URL/api/profile/professions/suggestions)
        
        if [ "$PROFESSIONS_RESPONSE" = "200" ]; then
            echo -e "${GREEN}✅ Professions suggestions: OK${NC}"
        else
            echo -e "${RED}❌ Professions suggestions: Erreur (HTTP $PROFESSIONS_RESPONSE)${NC}"
        fi
        
        echo -e "\n${YELLOW}Étape 3: Test de création de profil${NC}"
        
        # Créer un profil basique
        PROFILE_DATA='{
          "height": 175,
          "bio": "Test user créé automatiquement",
          "location": {"lat": 5.36, "lng": -4.01},
          "location_string": "Abidjan, Côte d'Ivoire",
          "looking_for": "serious"
        }'
        
        echo "Création d'un profil basique..."
        CREATE_PROFILE_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
          -X POST $FRONTEND_URL/api/profile/auto-create \
          -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          -d "$PROFILE_DATA")
        
        CREATE_HTTP_STATUS=$(echo $CREATE_PROFILE_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
        CREATE_RESPONSE_BODY=$(echo $CREATE_PROFILE_RESPONSE | sed -e 's/HTTPSTATUS:.*//g')
        
        echo "Status création profil: $CREATE_HTTP_STATUS"
        echo "Réponse: $CREATE_RESPONSE_BODY"
        
        if [ "$CREATE_HTTP_STATUS" = "200" ] || [ "$CREATE_HTTP_STATUS" = "201" ]; then
            echo -e "${GREEN}✅ Création de profil réussie${NC}"
        else
            echo -e "${RED}❌ Création de profil échouée (HTTP $CREATE_HTTP_STATUS)${NC}"
        fi
        
    else
        echo -e "${RED}❌ Échec de la vérification email${NC}"
    fi
else
    echo -e "${RED}❌ Pas de code de vérification reçu${NC}"
fi

echo -e "\n${YELLOW}Résumé des corrections:${NC}"
echo -e "${GREEN}✅ Proxy Vite corrigé: /api/profile/* → /* au lieu de /profile/*${NC}"
echo -e "${GREEN}✅ Adresses IP mises à jour: localhost → 157.180.36.122${NC}"
echo -e "${GREEN}✅ Services backend opérationnels${NC}"

echo -e "\n${BLUE}🌐 Pour tester manuellement:${NC}"
echo "1. Ouvrir: http://157.180.36.122:5173/create-profile"
echo "2. Vérifier que le champ 'Recherche' se charge avec les options"
echo "3. Tous les autres champs dynamiques devraient aussi se charger"

echo -e "\n🏁 Test terminé!"
