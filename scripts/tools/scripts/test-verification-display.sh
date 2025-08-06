#!/bin/bash

# Test de la fonctionnalité de vérification email

echo "🧪 Test de la fonctionnalité de vérification email"
echo "=================================================="

# Test 1: Inscription avec affichage du code
echo "📝 Test 1: Inscription d'un nouvel utilisateur"
curl -s -X POST http://157.180.36.122/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test'$(date +%s)'@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User",
    "birth_date": "1990-01-01",
    "gender": "male"
  }' | jq . || echo "❌ Erreur lors de l'inscription"

echo ""
echo "📤 Test 2: Renvoi du code de vérification"
curl -s -X POST http://157.180.36.122/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}' | jq . || echo "❌ Erreur lors du renvoi"

echo ""
echo "✅ Tests terminés"
echo ""
echo "🎯 Résultats attendus:"
echo "   - Le code de vérification doit apparaître dans la réponse"
echo "   - Status 201 pour l'inscription"
echo "   - Status 200 pour le renvoi (même si email pas configuré)"
echo "   - Champ 'verification_code' présent dans les réponses"
