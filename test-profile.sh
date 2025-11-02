#!/bin/bash

# Connexion et récupération du token
echo "1. Connexion..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@wayd.com","password":"Test123!"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Échec de connexion"
  echo "$LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Token reçu: ${TOKEN:0:50}..."

# Test du profil
echo -e "\n2. Récupération du profil..."
PROFILE_RESPONSE=$(curl -s -X GET http://localhost/api/profile/me \
  -H "Authorization: Bearer $TOKEN")

echo "$PROFILE_RESPONSE"

# Test de création de profil basique si nécessaire
if echo "$PROFILE_RESPONSE" | grep -q "profile not found"; then
  echo -e "\n3. Création du profil basique..."
  CREATE_RESPONSE=$(curl -s -X POST http://localhost/api/profile \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "bio": "Profil de test",
      "location": {
        "type": "Point",
        "coordinates": [-5.3471, 5.3364]
      },
      "city": "Abidjan",
      "country": "CI"
    }')
  echo "$CREATE_RESPONSE"
fi
