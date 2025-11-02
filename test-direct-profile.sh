#!/bin/bash

# Connexion
LOGIN_RESPONSE=$(curl -s -X POST http://127.0.0.1:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@wayd.com","password":"Test123!"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

echo "Token: ${TOKEN:0:50}..."

# Test différents endpoints
echo -e "\n=== Test /profile/me ==="
curl -s -X GET http://127.0.0.1:8081/profile/me \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n=== Test /me ==="
curl -s -X GET http://127.0.0.1:8081/me \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n=== Test POST /profile ==="
curl -s -X POST http://127.0.0.1:8081/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Test bio",
    "height": 175,
    "city": "Abidjan",
    "country": "CI"
  }'

echo -e "\n\n=== Test POST / ==="
curl -s -X POST http://127.0.0.1:8081/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Test bio",
    "height": 175,
    "city": "Abidjan",
    "country": "CI"
  }'
