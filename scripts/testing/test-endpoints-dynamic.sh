#!/bin/bash

echo "🧪 TEST DES ENDPOINTS DYNAMIQUES"
echo "================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Créer un utilisateur test et récupérer le token
echo -e "\n${YELLOW}1. Authentification utilisateur test${NC}"

TIMESTAMP=$(date +%s)
TEST_EMAIL="test-$TIMESTAMP@example.com"
TEST_PASSWORD="TestPassword123!"

echo "Création utilisateur: $TEST_EMAIL"

REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"first_name\":\"Test\",\"last_name\":\"User\",\"birth_date\":\"1990-01-01\",\"gender\":\"male\"}")

VERIFICATION_CODE=$(echo $REGISTER_RESPONSE | grep -o '"verification_code":"[^"]*"' | sed 's/"verification_code":"//' | sed 's/"//')

if [ -n "$VERIFICATION_CODE" ]; then
    echo -e "${GREEN}✅ Utilisateur créé, code: $VERIFICATION_CODE${NC}"
    
    # Vérifier email
    VERIFY_RESPONSE=$(curl -s -X POST http://localhost:8080/verify-email \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$TEST_EMAIL\",\"code\":\"$VERIFICATION_CODE\"}")
    
    TOKEN=$(echo $VERIFY_RESPONSE | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"//' | sed 's/"//')
    
    if [ -n "$TOKEN" ]; then
        echo -e "${GREEN}✅ Token obtenu: ${TOKEN:0:20}...${NC}"
        
        echo -e "\n${YELLOW}2. Test des endpoints dynamiques via proxy${NC}"
        
        endpoints=(
            "/api/profile/looking-for/options:Looking for options"
            "/api/profile/interests/suggestions:Interest suggestions"
            "/api/profile/education/levels:Education levels"
            "/api/profile/professions/suggestions:Profession suggestions"
            "/api/profile/gender/options:Gender options"
        )
        
        for endpoint_info in "${endpoints[@]}"
        do
            IFS=':' read -r endpoint description <<< "$endpoint_info"
            echo "Testing: $description..."
            
            RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
              -H "Authorization: Bearer $TOKEN" \
              "http://localhost:5173$endpoint")
            
            HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
            RESPONSE_BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS:.*//g')
            
            if [ "$HTTP_STATUS" = "200" ]; then
                echo -e "${GREEN}✅ $description: OK${NC}"
                # Vérifier si la réponse contient des données
                if [[ $RESPONSE_BODY == *"options"* ]] || [[ $RESPONSE_BODY == *"["* ]]; then
                    echo -e "   📦 Données disponibles: $(echo $RESPONSE_BODY | cut -c1-50)..."
                else
                    echo -e "${YELLOW}   ⚠️ Réponse vide ou inattendue${NC}"
                fi
            else
                echo -e "${RED}❌ $description: Erreur (HTTP $HTTP_STATUS)${NC}"
                echo -e "   📄 Réponse: $RESPONSE_BODY"
            fi
        done
        
        echo -e "\n${YELLOW}3. Test création profil basique${NC}"
        
        PROFILE_DATA='{
          "height": 175,
          "bio": "Test user automatique",
          "location_string": "Abidjan, Côte d'\''Ivoire",
          "looking_for": "serious"
        }'
        
        CREATE_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
          -X POST "http://localhost:5173/api/profile/auto-create" \
          -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json" \
          -d "$PROFILE_DATA")
        
        CREATE_STATUS=$(echo $CREATE_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
        CREATE_BODY=$(echo $CREATE_RESPONSE | sed -e 's/HTTPSTATUS:.*//g')
        
        if [ "$CREATE_STATUS" = "200" ] || [ "$CREATE_STATUS" = "201" ]; then
            echo -e "${GREEN}✅ Création profil: OK${NC}"
        else
            echo -e "${RED}❌ Création profil: Erreur (HTTP $CREATE_STATUS)${NC}"
            echo -e "   📄 Réponse: $CREATE_BODY"
        fi
        
        echo -e "\n${YELLOW}4. Test page create-profile via navigateur${NC}"
        echo -e "${GREEN}✅ Ouvrez: http://localhost:5173/create-profile${NC}"
        echo -e "   🔑 Email: $TEST_EMAIL"
        echo -e "   🔑 Password: $TEST_PASSWORD"
        echo -e "   📋 Vérifiez que tous les champs se chargent correctement"
        
    else
        echo -e "${RED}❌ Échec obtention token${NC}"
    fi
else
    echo -e "${RED}❌ Échec création utilisateur${NC}"
    echo "Réponse: $REGISTER_RESPONSE"
fi

echo -e "\n${GREEN}🎯 Test terminé !${NC}"
