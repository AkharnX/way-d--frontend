#!/bin/bash

echo "🔍 Test des API backend pour comprendre les données de profil"

# Récupérer un token d'accès (utilisateur test existant)
echo -e "\n📱 Test 1: Login pour obtenir un token"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPassword123!"}')

echo "Login response: $LOGIN_RESPONSE"

# Extraire le token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"//' | sed 's/"//')

if [ -z "$TOKEN" ]; then
  echo "❌ Aucun token reçu, tentative avec un autre utilisateur..."
  
  # Essayer de créer un nouvel utilisateur
  echo -e "\n📝 Création d'un nouvel utilisateur..."
  REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8080/register \
    -H "Content-Type: application/json" \
    -d '{"email":"debug@test.com","password":"Test123!","first_name":"Debug","last_name":"User","birth_date":"1990-01-01","gender":"male"}')
  
  echo "Register response: $REGISTER_RESPONSE"
  
  # Essayer de se connecter avec le nouvel utilisateur
  LOGIN_RESPONSE2=$(curl -s -X POST http://localhost:8080/login \
    -H "Content-Type: application/json" \
    -d '{"email":"debug@test.com","password":"Test123!"}')
  
  echo "Login response 2: $LOGIN_RESPONSE2"
  TOKEN=$(echo $LOGIN_RESPONSE2 | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"//' | sed 's/"//')
fi

if [ -z "$TOKEN" ]; then
  echo "❌ Impossible d'obtenir un token d'accès"
  exit 1
fi

echo "✅ Token obtenu: ${TOKEN:0:20}..."

echo -e "\n👤 Test 2: Récupération des données utilisateur"
USER_RESPONSE=$(curl -s \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/me)

echo "User data: $USER_RESPONSE"

echo -e "\n📊 Test 3: Récupération des données de profil"
PROFILE_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8081/profile/me)

HTTP_STATUS=$(echo $PROFILE_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
PROFILE_BODY=$(echo $PROFILE_RESPONSE | sed -e 's/HTTPSTATUS:.*//g')

echo "Profile HTTP Status: $HTTP_STATUS"
echo "Profile data: $PROFILE_BODY"

if [ "$HTTP_STATUS" = "404" ]; then
  echo -e "\n⚠️  Aucun profil trouvé (404) - C'est normal pour un nouvel utilisateur"
  echo "Le frontend devrait rediriger vers la création de profil"
elif [ "$HTTP_STATUS" = "200" ]; then
  echo -e "\n✅ Profil trouvé!"
  echo "Analysons les champs..."
  
  # Parser les champs importants
  if [[ $PROFILE_BODY == *"trait"* ]]; then
    echo "✓ Champ 'trait' présent (bio)"
  fi
  
  if [[ $PROFILE_BODY == *"occupation"* ]]; then
    echo "✓ Champ 'occupation' présent (profession)"
  fi
  
  if [[ $PROFILE_BODY == *"height"* ]]; then
    echo "✓ Champ 'height' présent"
  fi
  
  if [[ $PROFILE_BODY == *"birthdate"* ]]; then
    echo "✓ Champ 'birthdate' présent (pour calculer l'âge)"
  fi
  
  if [[ $PROFILE_BODY == *"location"* ]]; then
    echo "✓ Champ 'location' présent"
  fi
else
  echo -e "\n❌ Erreur lors de la récupération du profil: $HTTP_STATUS"
fi

echo -e "\n🏁 Test terminé"
