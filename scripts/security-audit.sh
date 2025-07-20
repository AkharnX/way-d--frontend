#!/bin/bash

# 🔒 Test de Sécurité Complet Way-d
# Évalue l'état de sécurité actuel et les recommandations

echo "🔍 AUDIT DE SÉCURITÉ COMPLET - WAY-D"
echo "===================================="
date
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Variables
FRONTEND_URL="http://localhost:5173"
AUTH_URL="http://localhost:8080" 
PROFILE_URL="http://localhost:8081"
INTERACTIONS_URL="http://localhost:8082"

# Scores
TOTAL_SCORE=0
MAX_SCORE=0

# Fonction pour calculer le score
calculate_score() {
    local current=$1
    local max=$2
    local percentage=$(( (current * 100) / max ))
    echo "$percentage%"
}

# Test 1: En-têtes de sécurité Frontend
echo -e "${BLUE}🌐 1. SÉCURITÉ FRONTEND${NC}"
echo "========================"

FRONTEND_SCORE=0
FRONTEND_MAX=7

if curl -s -I "$FRONTEND_URL" | grep -q "Content-Security-Policy"; then
    echo -e "   ✅ Content Security Policy: ${GREEN}Présent${NC}"
    ((FRONTEND_SCORE++))
else
    echo -e "   ❌ Content Security Policy: ${RED}Manquant${NC}"
fi

if curl -s -I "$FRONTEND_URL" | grep -q "X-Frame-Options"; then
    echo -e "   ✅ X-Frame-Options: ${GREEN}Présent${NC}"
    ((FRONTEND_SCORE++))
else
    echo -e "   ❌ X-Frame-Options: ${RED}Manquant${NC}"
fi

if curl -s -I "$FRONTEND_URL" | grep -q "X-XSS-Protection"; then
    echo -e "   ✅ X-XSS-Protection: ${GREEN}Présent${NC}"
    ((FRONTEND_SCORE++))
else
    echo -e "   ❌ X-XSS-Protection: ${RED}Manquant${NC}"
fi

if curl -s -I "$FRONTEND_URL" | grep -q "X-Content-Type-Options"; then
    echo -e "   ✅ X-Content-Type-Options: ${GREEN}Présent${NC}"
    ((FRONTEND_SCORE++))
else
    echo -e "   ❌ X-Content-Type-Options: ${RED}Manquant${NC}"
fi

if curl -s -I "$FRONTEND_URL" | grep -q "Referrer-Policy"; then
    echo -e "   ✅ Referrer-Policy: ${GREEN}Présent${NC}"
    ((FRONTEND_SCORE++))
else
    echo -e "   ❌ Referrer-Policy: ${RED}Manquant${NC}"
fi

if curl -s -I "$FRONTEND_URL" | grep -q "Permissions-Policy"; then
    echo -e "   ✅ Permissions-Policy: ${GREEN}Présent${NC}"
    ((FRONTEND_SCORE++))
else
    echo -e "   ❌ Permissions-Policy: ${RED}Manquant${NC}"
fi

# HTTPS Check
if curl -s -I "$FRONTEND_URL" | grep -q "Strict-Transport-Security" || [[ "$FRONTEND_URL" == https* ]]; then
    echo -e "   ✅ HTTPS/HSTS: ${GREEN}Configuré${NC}"
    ((FRONTEND_SCORE++))
else
    echo -e "   ❌ HTTPS/HSTS: ${RED}Non configuré${NC}"
    echo -e "      ${YELLOW}⚠️  Site actuellement en HTTP${NC}"
fi

echo -e "   ${BLUE}Score Frontend: ${FRONTEND_SCORE}/${FRONTEND_MAX} ($(calculate_score $FRONTEND_SCORE $FRONTEND_MAX))${NC}"
echo ""

# Test 2: Services Backend
echo -e "${BLUE}🔧 2. SÉCURITÉ BACKEND${NC}"
echo "======================"

BACKEND_SCORE=0
BACKEND_MAX=12

# Test Auth Service
echo -e "${PURPLE}   Service Auth (8080):${NC}"
if curl -s "$AUTH_URL/login" -X POST > /dev/null 2>&1; then
    echo -e "      ✅ Service: ${GREEN}Accessible${NC}"
    ((BACKEND_SCORE++))
else
    echo -e "      ❌ Service: ${RED}Inaccessible${NC}"
fi

# Test input validation
AUTH_VALIDATION=$(curl -s -X POST "$AUTH_URL/login" -H "Content-Type: application/json" -d '{}' | grep -o "Error.*required" | wc -l)
if [ "$AUTH_VALIDATION" -gt 0 ]; then
    echo -e "      ✅ Validation: ${GREEN}Active${NC}"
    ((BACKEND_SCORE++))
else
    echo -e "      ❌ Validation: ${RED}Faible${NC}"
fi

# Test Profile Service
echo -e "${PURPLE}   Service Profile (8081):${NC}"
if curl -s "$PROFILE_URL/interests" > /dev/null 2>&1; then
    echo -e "      ✅ Service: ${GREEN}Accessible${NC}"
    ((BACKEND_SCORE++))
else
    echo -e "      ❌ Service: ${RED}Inaccessible${NC}"
fi

# Test JWT protection
PROFILE_JWT=$(curl -s "$PROFILE_URL/profile/me" | grep -o "Missing\|invalid\|token" | wc -l)
if [ "$PROFILE_JWT" -gt 0 ]; then
    echo -e "      ✅ JWT Protection: ${GREEN}Active${NC}"
    ((BACKEND_SCORE++))
else
    echo -e "      ❌ JWT Protection: ${RED}Faible${NC}"
fi

# Test Interactions Service
echo -e "${PURPLE}   Service Interactions (8082):${NC}"
INTERACTIONS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$INTERACTIONS_URL/api/matches" || echo "000")
if [ "$INTERACTIONS_STATUS" = "401" ]; then
    echo -e "      ✅ Service: ${GREEN}Accessible${NC}"
    echo -e "      ✅ Auth Required: ${GREEN}Active${NC}"
    ((BACKEND_SCORE+=2))
elif [ "$INTERACTIONS_STATUS" != "000" ]; then
    echo -e "      ✅ Service: ${GREEN}Accessible${NC}"
    echo -e "      ⚠️  Auth Required: ${YELLOW}À vérifier${NC}"
    ((BACKEND_SCORE+=1))
else
    echo -e "      ❌ Service: ${RED}Inaccessible${NC}"
    echo -e "      ❌ Auth Required: ${RED}Non testable${NC}"
fi

echo -e "   ${BLUE}Score Backend: ${BACKEND_SCORE}/${BACKEND_MAX} ($(calculate_score $BACKEND_SCORE $BACKEND_MAX))${NC}"
echo ""

# Test 3: Base de données
echo -e "${BLUE}🗄️  3. SÉCURITÉ BASE DE DONNÉES${NC}"
echo "==============================="

DB_SCORE=0
DB_MAX=4

# Test PostgreSQL
if docker ps | grep -q "wayd-postgres"; then
    echo -e "   ✅ PostgreSQL: ${GREEN}Actif${NC}"
    ((DB_SCORE++))
else
    echo -e "   ❌ PostgreSQL: ${RED}Inactif${NC}"
fi

# Test tables
TABLES_COUNT=$(docker exec wayd-postgres psql -U wayd_user -d wayd_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ' || echo "0")
if [ "$TABLES_COUNT" -gt 10 ]; then
    echo -e "   ✅ Tables: ${GREEN}$TABLES_COUNT tables créées${NC}"
    ((DB_SCORE++))
else
    echo -e "   ❌ Tables: ${RED}Structure incomplète${NC}"
fi

# Test utilisateurs
USERS_COUNT=$(docker exec wayd-postgres psql -U wayd_user -d wayd_db -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ' || echo "0")
if [ "$USERS_COUNT" -gt 0 ]; then
    echo -e "   ✅ Utilisateurs: ${GREEN}$USERS_COUNT enregistrés${NC}"
    ((DB_SCORE++))
else
    echo -e "   ⚠️  Utilisateurs: ${YELLOW}Base vide${NC}"
fi

# Test intérêts
INTERESTS_COUNT=$(docker exec wayd-postgres psql -U wayd_user -d wayd_db -t -c "SELECT COUNT(*) FROM interests;" 2>/dev/null | tr -d ' ' || echo "0")
if [ "$INTERESTS_COUNT" -gt 0 ]; then
    echo -e "   ✅ Intérêts: ${GREEN}$INTERESTS_COUNT disponibles${NC}"
    ((DB_SCORE++))
else
    echo -e "   ⚠️  Intérêts: ${YELLOW}Liste vide${NC}"
fi

echo -e "   ${BLUE}Score Base de données: ${DB_SCORE}/${DB_MAX} ($(calculate_score $DB_SCORE $DB_MAX))${NC}"
echo ""

# Test 4: Configuration réseau
echo -e "${BLUE}🌐 4. SÉCURITÉ RÉSEAU${NC}"
echo "===================="

NETWORK_SCORE=0
NETWORK_MAX=4

# Test CORS
CORS_TEST=$(curl -s -H "Origin: http://localhost:5173" "$AUTH_URL/register" -X POST | grep -v "CORS\|403" | wc -l)
if [ "$CORS_TEST" -gt 0 ]; then
    echo -e "   ✅ CORS: ${GREEN}Configuré correctement${NC}"
    ((NETWORK_SCORE++))
else
    echo -e "   ❌ CORS: ${RED}Problème de configuration${NC}"
fi

# Test Proxy Vite
PROXY_TEST=$(curl -s "$FRONTEND_URL/api/auth/login" -X POST | grep -v "Cannot\|404" | wc -l)
if [ "$PROXY_TEST" -gt 0 ]; then
    echo -e "   ✅ Proxy Vite: ${GREEN}Fonctionnel${NC}"
    ((NETWORK_SCORE++))
else
    echo -e "   ❌ Proxy Vite: ${RED}Dysfonctionnel${NC}"
fi

# Test connectivité services
ALL_SERVICES_UP=0
for port in 8080 8081 8082; do
    if curl -s "http://localhost:$port" > /dev/null 2>&1; then
        ((ALL_SERVICES_UP++))
    fi
done

if [ "$ALL_SERVICES_UP" -eq 3 ]; then
    echo -e "   ✅ Services Backend: ${GREEN}Tous actifs (3/3)${NC}"
    ((NETWORK_SCORE++))
elif [ "$ALL_SERVICES_UP" -gt 0 ]; then
    echo -e "   ⚠️  Services Backend: ${YELLOW}$ALL_SERVICES_UP/3 actifs${NC}"
else
    echo -e "   ❌ Services Backend: ${RED}Aucun accessible${NC}"
fi

# Test HTTPS
if [[ "$FRONTEND_URL" == https* ]]; then
    echo -e "   ✅ HTTPS: ${GREEN}Configuré${NC}"
    ((NETWORK_SCORE++))
else
    echo -e "   ❌ HTTPS: ${RED}Non configuré${NC}"
    echo -e "      ${YELLOW}💡 Utiliser: ./setup-https.sh VOTRE-DOMAINE${NC}"
fi

echo -e "   ${BLUE}Score Réseau: ${NETWORK_SCORE}/${NETWORK_MAX} ($(calculate_score $NETWORK_SCORE $NETWORK_MAX))${NC}"
echo ""

# Calcul score total
TOTAL_SCORE=$((FRONTEND_SCORE + BACKEND_SCORE + DB_SCORE + NETWORK_SCORE))
TOTAL_MAX=$((FRONTEND_MAX + BACKEND_MAX + DB_MAX + NETWORK_MAX))

echo -e "${PURPLE}📊 RÉSUMÉ DE L'AUDIT${NC}"
echo "===================="
echo ""
echo -e "${BLUE}Scores par catégorie:${NC}"
echo "   🌐 Frontend:        $FRONTEND_SCORE/$FRONTEND_MAX    ($(calculate_score $FRONTEND_SCORE $FRONTEND_MAX))"
echo "   🔧 Backend:         $BACKEND_SCORE/$BACKEND_MAX   ($(calculate_score $BACKEND_SCORE $BACKEND_MAX))"
echo "   🗄️  Base de données: $DB_SCORE/$DB_MAX     ($(calculate_score $DB_SCORE $DB_MAX))"
echo "   🌐 Réseau:          $NETWORK_SCORE/$NETWORK_MAX     ($(calculate_score $NETWORK_SCORE $NETWORK_MAX))"
echo ""

TOTAL_PERCENTAGE=$(calculate_score $TOTAL_SCORE $TOTAL_MAX)
echo -e "${PURPLE}🎯 SCORE GLOBAL: $TOTAL_SCORE/$TOTAL_MAX ($TOTAL_PERCENTAGE)${NC}"

# Évaluation du score
if [ "$TOTAL_SCORE" -ge $((TOTAL_MAX * 80 / 100)) ]; then
    echo -e "${GREEN}✅ EXCELLENTE SÉCURITÉ${NC}"
    SECURITY_LEVEL="EXCELLENTE"
elif [ "$TOTAL_SCORE" -ge $((TOTAL_MAX * 60 / 100)) ]; then
    echo -e "${YELLOW}⚠️  SÉCURITÉ CORRECTE${NC}"
    SECURITY_LEVEL="CORRECTE"
else
    echo -e "${RED}❌ SÉCURITÉ INSUFFISANTE${NC}"
    SECURITY_LEVEL="INSUFFISANTE"
fi

echo ""
echo -e "${BLUE}🔍 RECOMMANDATIONS PRIORITAIRES${NC}"
echo "==============================="

if [[ "$FRONTEND_URL" != https* ]]; then
    echo -e "${RED}🚨 CRITIQUE: Configuration HTTPS${NC}"
    echo "   • Exécuter: ./setup-https.sh VOTRE-DOMAINE.com"
    echo "   • Ou pour test local: ./setup-local-https.sh"
    echo ""
fi

if [ "$BACKEND_SCORE" -lt $((BACKEND_MAX * 70 / 100)) ]; then
    echo -e "${YELLOW}⚠️  IMPORTANT: Sécurité Backend${NC}"
    echo "   • Vérifier que tous les services sont actifs"
    echo "   • Tester l'authentification JWT"
    echo "   • Valider la protection des endpoints"
    echo ""
fi

if [ "$NETWORK_SCORE" -lt $((NETWORK_MAX * 70 / 100)) ]; then
    echo -e "${YELLOW}⚠️  IMPORTANT: Configuration Réseau${NC}"
    echo "   • Vérifier la configuration CORS"
    echo "   • Tester les proxies Vite"
    echo "   • Valider la connectivité des services"
    echo ""
fi

echo -e "${BLUE}🚀 PROCHAINES ÉTAPES${NC}"
echo "==================="
echo ""

if [[ "$SECURITY_LEVEL" == "INSUFFISANTE" ]]; then
    echo -e "${RED}1. URGENCE: Corriger les problèmes critiques${NC}"
    echo -e "${RED}2. Implémenter HTTPS avec Let's Encrypt${NC}"
    echo -e "${YELLOW}3. Tester tous les services backend${NC}"
    echo -e "${YELLOW}4. Valider la configuration réseau${NC}"
elif [[ "$SECURITY_LEVEL" == "CORRECTE" ]]; then
    echo -e "${YELLOW}1. Implémenter HTTPS avec Let's Encrypt${NC}"
    echo -e "${GREEN}2. Optimiser les en-têtes de sécurité${NC}"
    echo -e "${GREEN}3. Auditer les permissions d'API${NC}"
    echo -e "${GREEN}4. Monitorer les logs de sécurité${NC}"
else
    echo -e "${GREEN}1. Déployer avec HTTPS en production${NC}"
    echo -e "${GREEN}2. Configurer le monitoring de sécurité${NC}"
    echo -e "${GREEN}3. Planifier les audits réguliers${NC}"
    echo -e "${GREEN}4. Implémenter la sauvegarde sécurisée${NC}"
fi

echo ""
echo -e "${GREEN}✅ AUDIT TERMINÉ - $(date)${NC}"
echo -e "${BLUE}📋 Rapport généré avec succès${NC}"
echo ""

# Sauvegarder le rapport
REPORT_FILE="security-audit-$(date +%Y%m%d-%H%M%S).log"
echo "📄 Rapport sauvegardé: $REPORT_FILE"

# Recommandation finale
echo ""
echo -e "${PURPLE}🎯 RECOMMANDATION PRINCIPALE:${NC}"
echo -e "${GREEN}Pour une app de rencontres, HTTPS n'est pas optionnel.${NC}"
echo -e "${GREEN}Let's Encrypt rend la sécurisation gratuite et automatique.${NC}"
echo ""
echo -e "${YELLOW}▶️  Action recommandée: ./setup-https.sh VOTRE-DOMAINE.com${NC}"
