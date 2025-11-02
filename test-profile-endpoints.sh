#!/bin/bash

TOKEN=$(curl -s -X POST http://127.0.0.1:8080/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@wayd.com","password":"Test123!"}' | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

echo "=== Endpoint: GET /me ==="
curl -s -X GET "http://127.0.0.1:8081/me" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n=== Endpoint: GET /profile ==="
curl -s -X GET "http://127.0.0.1:8081/profile" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n=== Endpoint: GET /profiles/me ==="
curl -s -X GET "http://127.0.0.1:8081/profiles/me" \
  -H "Authorization: Bearer $TOKEN"

echo -e "\n\n=== Endpoint: POST /profiles ==="
curl -s -X POST "http://127.0.0.1:8081/profiles" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bio":"Test","height":175,"city":"Abidjan","country":"CI"}'

