#!/bin/bash

echo "=== Nettoyage automatique des tokens ==="
echo "Date: $(date)"
echo ""

# Couleurs pour la sortie
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Étape 1: Nettoyage des tokens expirés côté serveur ===${NC}"

# Nettoyer les sessions expirées (plus de 7 jours)
echo -e "${YELLOW}Nettoyage des sessions expirées...${NC}"
cd /home/akharn/way-d/backend && docker exec -it wayd-postgres psql -U wayd_user -d wayd_db -c "DELETE FROM sessions WHERE created_at < NOW() - INTERVAL '7 days';"

echo ""
echo -e "${BLUE}=== Étape 2: Test de création d'utilisateur ===${NC}"

# Créer un utilisateur de test avec un mot de passe connu
echo -e "${YELLOW}Création d'un utilisateur de test...${NC}"

# Générer un hash bcrypt pour le mot de passe "TestPassword123!"
USER_ID=$(uuidgen)
PASSWORD_HASH='$2a$12$LQv3c1yqBwEHxv978zsj.eVcXkIg1zKUyqKFLGvLlOHoLZOYSNy6C'  # Hash pour "TestPassword123!"
USER_EMAIL="cleanuser@example.com"

echo "Création de l'utilisateur: $USER_EMAIL"
echo "User ID: $USER_ID"

# Insérer l'utilisateur dans la base de données
docker exec -it wayd-postgres psql -U wayd_user -d wayd_db -c "
INSERT INTO users (id, email, password_hash, first_name, last_name, birth_date, gender, created_at, updated_at) 
VALUES (
    '$USER_ID',
    '$USER_EMAIL',
    '$PASSWORD_HASH',
    'Clean',
    'User',
    '1990-01-01',
    'other',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET 
    password_hash = '$PASSWORD_HASH',
    updated_at = NOW();
"

# Vérifier l'email
echo -e "${YELLOW}Vérification de l'email...${NC}"
docker exec -it wayd-postgres psql -U wayd_user -d wayd_db -c "
INSERT INTO email_verifications (id, user_id, verification_code, verified, created_at) 
VALUES (
    '$(uuidgen)',
    '$USER_ID',
    '123456',
    true,
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET 
    verified = true;
"

echo ""
echo -e "${BLUE}=== Étape 3: Test de connexion ===${NC}"

# Test de connexion avec curl (avec timeout pour éviter les blocages)
echo -e "${YELLOW}Test de connexion avec l'utilisateur créé...${NC}"

LOGIN_RESPONSE=$(timeout 10 curl -s -X POST "http://localhost:5173/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_EMAIL\",\"password\":\"TestPassword123!\"}")

if [ $? -eq 0 ] && [ -n "$LOGIN_RESPONSE" ]; then
    echo -e "${GREEN}✅ Connexion réussie !${NC}"
    echo "Réponse: $LOGIN_RESPONSE"
else
    echo -e "${RED}❌ Connexion échouée ou timeout${NC}"
    echo "Testez manuellement sur: http://localhost:5173/token-diagnostic"
fi

echo ""
echo -e "${BLUE}=== Étape 4: Instructions pour les tests manuels ===${NC}"

echo -e "${GREEN}Utilisateur de test créé:${NC}"
echo "  Email: $USER_EMAIL"
echo "  Mot de passe: TestPassword123!"
echo ""

echo -e "${GREEN}Pages de test disponibles:${NC}"
echo "  1. Token Diagnostic: http://localhost:5173/token-diagnostic"
echo "  2. Refresh Token Test: http://localhost:5173/refresh-token-test"
echo "  3. User Creation Test: http://localhost:5173/user-creation-test"
echo "  4. Complete Workflow: http://localhost:5173/workflow-test"

echo ""
echo -e "${GREEN}Étapes recommandées:${NC}"
echo "  1. Allez sur /token-diagnostic"
echo "  2. Cliquez sur 'Nettoyer Tokens'"
echo "  3. Cliquez sur 'Login Fresh'"
echo "  4. Testez les refresh tokens"

echo ""
echo "=== Nettoyage terminé ==="
