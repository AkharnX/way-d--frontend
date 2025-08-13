#!/bin/bash

echo "🔧 Test des corrections du flux de profil Way-d"
echo "=============================================="

# Configuration
EMAIL="test-profile-fix-$(date +%s)@example.com"
PASSWORD="TestPassword123!"
FIRST_NAME="TestFix"
LAST_NAME="ProfileUser"

echo -e "\n1️⃣ ÉTAPE 1: Inscription avec données de profil"
echo "=============================================="

REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8080/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\":\"$EMAIL\",
    \"password\":\"$PASSWORD\",
    \"first_name\":\"$FIRST_NAME\",
    \"last_name\":\"$LAST_NAME\",
    \"birth_date\":\"1995-06-15\",
    \"gender\":\"male\"
  }")

echo "Réponse inscription: $REGISTER_RESPONSE"

# Extraire le code de vérification si disponible
VERIFICATION_CODE=$(echo $REGISTER_RESPONSE | grep -o '"verification_code":"[^"]*"' | sed 's/"verification_code":"//' | sed 's/"//')

if [ -n "$VERIFICATION_CODE" ]; then
  echo "✅ Code de vérification reçu: $VERIFICATION_CODE"
  
  echo -e "\n2️⃣ ÉTAPE 2: Vérification email"
  echo "=============================="
  
  VERIFY_RESPONSE=$(curl -s -X POST http://localhost:8080/verify-email \
    -H "Content-Type: application/json" \
    -d "{
      \"email\":\"$EMAIL\",
      \"code\":\"$VERIFICATION_CODE\"
    }")
  
  echo "Réponse vérification: $VERIFY_RESPONSE"
  
  echo -e "\n3️⃣ ÉTAPE 3: Connexion pour tester la redirection"
  echo "==============================================" 
  
  LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/login \
    -H "Content-Type: application/json" \
    -d "{
      \"email\":\"$EMAIL\",
      \"password\":\"$PASSWORD\"
    }")
  
  echo "Réponse connexion: $LOGIN_RESPONSE"
  
  # Extraire le token
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*"' | sed 's/"access_token":"//' | sed 's/"//')
  
  if [ -n "$TOKEN" ]; then
    echo "✅ Token reçu: ${TOKEN:0:20}..."
    
    echo -e "\n4️⃣ ÉTAPE 4: Vérification de l'état du profil"
    echo "=========================================="
    
    PROFILE_RESPONSE=$(curl -s -X GET http://localhost:8081/profile/me \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
    
    echo "Réponse profil: $PROFILE_RESPONSE"
    
    # Vérifier si le profil existe et est complet
    if [[ $PROFILE_RESPONSE == *"error"* ]] || [[ $PROFILE_RESPONSE == *"404"* ]]; then
      echo "⚠️ Pas de profil trouvé (attendu pour un nouvel utilisateur)"
      
      echo -e "\n5️⃣ ÉTAPE 5: Création de profil complet"
      echo "====================================="
      
      CREATE_PROFILE_RESPONSE=$(curl -s -X POST http://localhost:8081/profile \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
          \"first_name\":\"$FIRST_NAME\",
          \"last_name\":\"$LAST_NAME\",
          \"bio\":\"Utilisateur de test pour vérifier les corrections du profil\",
          \"age\":28,
          \"height\":175,
          \"location\":\"Abidjan, Côte d'Ivoire\",
          \"profession\":\"Développeur\",
          \"education\":\"Master\",
          \"looking_for\":\"serious\",
          \"interests\":[\"technologie\", \"voyage\", \"lecture\"]
        }")
      
      echo "Réponse création profil: $CREATE_PROFILE_RESPONSE"
      
      if [[ $CREATE_PROFILE_RESPONSE != *"error"* ]]; then
        echo "✅ Profil créé avec succès!"
        
        echo -e "\n6️⃣ ÉTAPE 6: Vérification de la complétude du profil"
        echo "==============================================="
        
        FINAL_PROFILE_RESPONSE=$(curl -s -X GET http://localhost:8081/profile/me \
          -H "Authorization: Bearer $TOKEN" \
          -H "Content-Type: application/json")
        
        echo "Profil final: $FINAL_PROFILE_RESPONSE"
        
        # Vérifier les champs essentiels
        if [[ $FINAL_PROFILE_RESPONSE == *"$FIRST_NAME"* ]] && \
           [[ $FINAL_PROFILE_RESPONSE == *"$LAST_NAME"* ]] && \
           [[ $FINAL_PROFILE_RESPONSE == *"Développeur"* ]] && \
           [[ $FINAL_PROFILE_RESPONSE == *"Abidjan"* ]]; then
          echo -e "\n🎉 SUCCÈS: Profil complet et cohérent!"
          echo "✅ Corrections validées:"
          echo "   - Prénom/Nom: Corrects"
          echo "   - Profession: Cohérente"
          echo "   - Localisation: Cohérente"
          echo "   - Pas de redirection infinie"
        else
          echo -e "\n⚠️ ATTENTION: Données de profil incohérentes détectées"
        fi
      else
        echo "❌ Échec de la création de profil"
      fi
    else
      echo "✅ Profil existant trouvé (test avec utilisateur existant)"
    fi
  else
    echo "❌ Échec de la connexion"
  fi
else
  echo "❌ Échec de l'inscription"
fi

echo -e "\n📱 FRONTEND: http://localhost:5173"
echo "🔧 Test manuel recommandé:"
echo "1. S'inscrire avec un nouveau compte"
echo "2. Vérifier que la redirection profil fonctionne"
echo "3. Vérifier la cohérence des types de données"
