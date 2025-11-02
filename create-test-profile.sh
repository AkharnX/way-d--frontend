#!/bin/bash

# Connexion
echo "1. Connexion..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@wayd.com","password":"Test123!"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Échec de connexion"
  exit 1
fi

echo "✅ Connecté"

# Création du profil
echo -e "\n2. Création du profil complet..."
PROFILE_RESPONSE=$(curl -s -X POST http://localhost/api/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Jeune professionnel à Abidjan, passionné de tech et de culture ivoirienne 🇨🇮",
    "height": 175,
    "location": {
      "type": "Point",
      "coordinates": [-4.0083, 5.3600]
    },
    "city": "Abidjan",
    "country": "CI",
    "occupation": "Développeur",
    "education": "Master",
    "looking_for": "serious",
    "interests": ["Tech", "Voyage", "Cuisine", "Sport"],
    "min_age": 22,
    "max_age": 32,
    "max_distance": 30
  }')

echo "$PROFILE_RESPONSE"

# Vérification
echo -e "\n3. Vérification du profil créé..."
curl -s -X GET http://localhost/api/profile/me \
  -H "Authorization: Bearer $TOKEN" | head -c 500

echo -e "\n\n✅ Profil créé avec succès!"
