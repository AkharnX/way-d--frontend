#!/bin/bash

# Script pour créer un utilisateur de test avec un mot de passe correct
# Ce script utilise l'API d'inscription pour créer un utilisateur valide

echo "=== Création d'un utilisateur de test ==="
echo "Date: $(date)"
echo ""

# Couleurs pour la sortie
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Paramètres de l'utilisateur de test
TEST_EMAIL="validuser@example.com"
TEST_PASSWORD="TestPassword123!"
TEST_FIRST_NAME="Valid"
TEST_LAST_NAME="User"

echo -e "${YELLOW}Création de l'utilisateur de test...${NC}"
echo "Email: $TEST_EMAIL"
echo "Mot de passe: $TEST_PASSWORD"
echo ""

# Étape 1: Inscription
echo -e "${YELLOW}Étape 1: Inscription via API${NC}"
register_response=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"first_name\": \"$TEST_FIRST_NAME\",
    \"last_name\": \"$TEST_LAST_NAME\"
  }" \
  "http://localhost:5173/api/auth/register" \
  --connect-timeout 10 --max-time 30)

register_http_code=$(echo "$register_response" | tail -n1)
register_body=$(echo "$register_response" | head -n -1)

if [ "$register_http_code" = "201" ] || [ "$register_http_code" = "200" ]; then
  echo -e "${GREEN}✅ Inscription réussie${NC}"
  echo "Réponse: $register_body"
elif [ "$register_http_code" = "400" ]; then
  echo -e "${YELLOW}ℹ️ Utilisateur existe déjà (c'est OK)${NC}"
  echo "Réponse: $register_body"
else
  echo -e "${RED}❌ Échec de l'inscription (HTTP $register_http_code)${NC}"
  echo "Réponse: $register_body"
  exit 1
fi

echo ""

# Étape 2: Vérification email (si nécessaire)
echo -e "${YELLOW}Étape 2: Vérification email${NC}"
echo "Pour simplifier, nous allons marquer l'email comme vérifié directement dans la base de données..."

# Récupérer l'ID de l'utilisateur
user_id=$(docker exec -it wayd-postgres psql -U wayd_user -d wayd_db -t -c "SELECT id FROM users WHERE email = '$TEST_EMAIL';" 2>/dev/null | tr -d ' ' | head -n1)

if [ -n "$user_id" ]; then
  echo "ID utilisateur trouvé: $user_id"
  
  # Vérifier si l'email est déjà vérifié
  verified=$(docker exec -it wayd-postgres psql -U wayd_user -d wayd_db -t -c "SELECT verified FROM email_verifications WHERE user_id = '$user_id';" 2>/dev/null | tr -d ' ' | head -n1)
  
  if [ "$verified" = "t" ]; then
    echo -e "${GREEN}✅ Email déjà vérifié${NC}"
  else
    echo "Création de la vérification email..."
    docker exec -it wayd-postgres psql -U wayd_user -d wayd_db -c "INSERT INTO email_verifications (id, user_id, verification_code, verified, created_at) VALUES (gen_random_uuid(), '$user_id', '123456', true, CURRENT_TIMESTAMP) ON CONFLICT (user_id) DO UPDATE SET verified = true;" 2>/dev/null
    
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}✅ Email vérifié${NC}"
    else
      echo -e "${RED}❌ Échec de la vérification email${NC}"
    fi
  fi
else
  echo -e "${RED}❌ Impossible de trouver l'ID utilisateur${NC}"
fi

echo ""

# Étape 3: Test de connexion
echo -e "${YELLOW}Étape 3: Test de connexion${NC}"
login_response=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }" \
  "http://localhost:5173/api/auth/login" \
  --connect-timeout 10 --max-time 30)

login_http_code=$(echo "$login_response" | tail -n1)
login_body=$(echo "$login_response" | head -n -1)

if [ "$login_http_code" = "200" ]; then
  echo -e "${GREEN}✅ Connexion réussie${NC}"
  echo "Réponse: $login_body"
  
  # Extraire le token
  access_token=$(echo "$login_body" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
  if [ -n "$access_token" ]; then
    echo ""
    echo -e "${GREEN}🔑 Token d'accès obtenu:${NC}"
    echo "${access_token:0:50}..."
    
    # Étape 4: Test d'endpoint protégé
    echo ""
    echo -e "${YELLOW}Étape 4: Test d'endpoint protégé${NC}"
    me_response=$(curl -s -w "\n%{http_code}" \
      -H "Authorization: Bearer $access_token" \
      "http://localhost:5173/api/auth/me" \
      --connect-timeout 10 --max-time 30)
    
    me_http_code=$(echo "$me_response" | tail -n1)
    me_body=$(echo "$me_response" | head -n -1)
    
    if [ "$me_http_code" = "200" ]; then
      echo -e "${GREEN}✅ Endpoint protégé accessible${NC}"
      echo "Réponse: $me_body"
    else
      echo -e "${RED}❌ Échec de l'endpoint protégé (HTTP $me_http_code)${NC}"
      echo "Réponse: $me_body"
    fi
  fi
else
  echo -e "${RED}❌ Échec de la connexion (HTTP $login_http_code)${NC}"
  echo "Réponse: $login_body"
fi

echo ""
echo -e "${GREEN}=== Utilisateur de test créé avec succès ===${NC}"
echo "Vous pouvez maintenant utiliser ces identifiants pour tester l'application :"
echo "Email: $TEST_EMAIL"
echo "Mot de passe: $TEST_PASSWORD"
echo ""
echo "Testez maintenant sur : http://localhost:5173/refresh-token-test"
