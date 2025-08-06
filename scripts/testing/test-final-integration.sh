#!/bin/bash

# 🧪 Way-D Frontend - Test d'Intégration Final
# Vérifie que toutes les améliorations fonctionnent correctement

echo "🧪 WAY-D FRONTEND - TEST D'INTÉGRATION FINAL"
echo "=============================================="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
TESTS_PASSED=0
TESTS_FAILED=0

# Fonction pour afficher les résultats
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ $2${NC}"
        ((TESTS_FAILED++))
    fi
}

echo -e "${BLUE}📋 Phase 1: Vérification de l'Infrastructure${NC}"
echo "================================================="

# Test 1: PM2 Status
echo -n "🔍 Vérification PM2 way-d-frontend... "
pm2 describe way-d-frontend > /dev/null 2>&1
test_result $? "PM2 process way-d-frontend"

# Test 2: Application Response
echo -n "🌐 Test de réponse HTTP... "
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 | grep -q "200"
test_result $? "Application répond sur port 5173"

# Test 3: Microservices Health
echo -n "🏥 Auth Service Health... "
curl -s http://localhost:8080/health | grep -q "ok"
test_result $? "Auth Service (8080) healthy"

echo -n "🏥 Profile Service Health... "
curl -s http://localhost:8081/health | grep -q "ok" 
test_result $? "Profile Service (8081) healthy"

echo -n "🏥 Interactions Service Health... "
curl -s http://localhost:8082/health | grep -q "ok"
test_result $? "Interactions Service (8082) healthy"

echo ""
echo -e "${BLUE}📋 Phase 2: Vérification des Fichiers${NC}"
echo "==========================================="

# Test 4: Fichiers critiques
echo -n "📄 Register.tsx consolidé... "
[ -f "src/pages/Register.tsx" ] && [ ! -f "src/pages/Register_new.tsx" ]
test_result $? "Page Register unifiée"

echo -n "📄 ModernDiscovery amélioré... "
grep -q "navigate.*messages" src/pages/ModernDiscovery.tsx
test_result $? "Navigation match → chat implémentée"

echo -n "📄 Messages avec notifications... "
grep -q "newMatchNotification" src/pages/Messages.tsx
test_result $? "Notifications nouveau match"

echo -n "📄 Settings dynamiques... "
grep -q "handleDeleteAccount\|handleLogout" src/pages/Settings.tsx
test_result $? "Settings fonctionnels"

echo ""
echo -e "${BLUE}📋 Phase 3: Vérification du Build${NC}"
echo "======================================"

# Test 5: Build Assets
echo -n "🏗️ Build assets générés... "
[ -d "dist" ] && [ -f "dist/index.html" ]
test_result $? "Build de production présent"

echo -n "📦 Assets optimisés... "
[ -f "dist/assets/index-"*.js ] && [ -f "dist/assets/index-"*.css ]
test_result $? "Assets JS/CSS optimisés"

echo ""
echo -e "${BLUE}📋 Phase 4: Tests Fonctionnels Avancés${NC}"
echo "============================================"

# Test 6: Content Checks
echo -n "🗺️ Localisation améliorée... "
grep -q "Sélectionnez votre pays\|🇫🇷 France" src/pages/Register.tsx
test_result $? "Sélecteur de pays avec drapeaux"

echo -n "💼 Profession en texte libre... "
grep -A 3 -B 3 'value={formData.occupation}' src/pages/Register.tsx | grep -q 'type="text"'
test_result $? "Profession en saisie libre"

echo -n "💬 Bouton message match... "
grep -q "Envoyer un message" src/pages/ModernDiscovery.tsx
test_result $? "Bouton message dans modal match"

echo -n "⚙️ Actions Settings... "
grep -q "Delete Account\|Logout" src/pages/Settings.tsx
test_result $? "Actions compte dans Settings"

echo ""
echo -e "${BLUE}📋 Phase 5: Test de Performance${NC}"
echo "===================================="

# Test 7: Performance Checks
echo -n "⚡ Temps de réponse < 500ms... "
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:5173)
if (( $(echo "$RESPONSE_TIME < 0.5" | bc -l) )); then
    test_result 0 "Temps de réponse: ${RESPONSE_TIME}s"
else
    test_result 1 "Temps de réponse trop lent: ${RESPONSE_TIME}s"
fi

echo -n "📊 Taille bundle raisonnable... "
BUNDLE_SIZE=$(find dist/assets -name "index-*.js" -exec wc -c {} \; | awk '{print $1}')
if [ "$BUNDLE_SIZE" -lt 500000 ]; then
    test_result 0 "Bundle JS: $(($BUNDLE_SIZE/1024))KB"
else
    test_result 1 "Bundle trop volumineux: $(($BUNDLE_SIZE/1024))KB"
fi

echo ""
echo -e "${YELLOW}📊 RÉSULTATS FINAUX${NC}"
echo "===================="

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
SUCCESS_RATE=$((TESTS_PASSED * 100 / TOTAL_TESTS))

echo -e "Tests passés: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests échoués: ${RED}$TESTS_FAILED${NC}"
echo -e "Total tests: $TOTAL_TESTS"
echo -e "Taux de réussite: ${GREEN}$SUCCESS_RATE%${NC}"

echo ""
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 TOUS LES TESTS SONT PASSÉS !${NC}"
    echo -e "${GREEN}✨ Way-D Frontend est prêt pour la production${NC}"
    echo ""
    echo -e "${BLUE}🚀 Application disponible sur:${NC}"
    echo -e "   📱 Frontend: http://localhost:5173"
    echo -e "   🔐 Auth API: http://localhost:8080"
    echo -e "   👤 Profile API: http://localhost:8081" 
    echo -e "   💬 Interactions API: http://localhost:8082"
    echo ""
    echo -e "${YELLOW}🛠️ Commandes utiles:${NC}"
    echo -e "   pm2 status              # État des services"
    echo -e "   pm2 logs way-d-frontend # Logs application"
    echo -e "   npm run dev             # Mode développement"
    echo -e "   npm run build           # Build production"
    exit 0
else
    echo -e "${RED}⚠️ CERTAINS TESTS ONT ÉCHOUÉ${NC}"
    echo -e "${YELLOW}Veuillez corriger les problèmes avant la mise en production${NC}"
    exit 1
fi
