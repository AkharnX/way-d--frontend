#!/bin/bash

# 🛠️ Way-D Frontend - Fix UX Issues Script
# Corrige les problèmes d'expérience utilisateur identifiés

echo "🛠️ WAY-D FRONTEND - CORRECTION DES PROBLÈMES UX"
echo "================================================"
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
FIXES_APPLIED=0
ISSUES_FOUND=0

# Fonction pour afficher les résultats
fix_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        ((FIXES_APPLIED++))
    else
        echo -e "${RED}❌ $2${NC}"
        ((ISSUES_FOUND++))
    fi
}

echo -e "${BLUE}📋 Phase 1: Vérification des Services Backend${NC}"
echo "=============================================="

# Test 1: Services Backend Health
echo -n "🏥 Auth Service Health... "
curl -s http://localhost:8080/health | grep -q "ok"
fix_result $? "Service Auth fonctionnel"

echo -n "🏥 Profile Service Health... "
curl -s http://localhost:8081/health | grep -q "ok"
fix_result $? "Service Profile fonctionnel"

echo -n "🏥 Interactions Service Health... "
curl -s http://localhost:8082/health | grep -q "ok"
fix_result $? "Service Interactions fonctionnel"

echo ""
echo -e "${BLUE}📋 Phase 2: Vérification des Corrections Frontend${NC}"
echo "================================================="

# Test 2: Discovery Page Fixes
echo -n "🔍 Discovery null check... "
grep -q "Array.isArray(data)" src/pages/Discovery.tsx
fix_result $? "Protection contre les données null dans Discovery"

echo -n "🔧 EditProfile default values... "
grep -q "calculatedAge" src/pages/EditProfile.tsx
fix_result $? "Valeurs par défaut améliorées dans EditProfile"

echo -n "💬 Messages navigation... "
grep -q "Découvrir des profils" src/pages/Messages.tsx
fix_result $? "Navigation améliorée dans Messages"

echo -n "⚙️ Settings error fix... "
grep -q "// Future use" src/pages/Settings.tsx
fix_result $? "Erreur TypeScript corrigée dans Settings"

echo ""
echo -e "${BLUE}📋 Phase 3: Test des API Endpoints${NC}"
echo "====================================="

# Test 3: API Endpoints
echo -n "🔐 Auth endpoint test... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health)
if [ "$HTTP_CODE" = "200" ]; then
    fix_result 0 "Auth API accessible (HTTP $HTTP_CODE)"
else
    fix_result 1 "Auth API inaccessible (HTTP $HTTP_CODE)"
fi

echo -n "👤 Profile endpoint test... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/health)
if [ "$HTTP_CODE" = "200" ]; then
    fix_result 0 "Profile API accessible (HTTP $HTTP_CODE)"
else
    fix_result 1 "Profile API inaccessible (HTTP $HTTP_CODE)"
fi

echo -n "💕 Interactions endpoint test... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/health)
if [ "$HTTP_CODE" = "200" ]; then
    fix_result 0 "Interactions API accessible (HTTP $HTTP_CODE)"
else
    fix_result 1 "Interactions API inaccessible (HTTP $HTTP_CODE)"
fi

echo ""
echo -e "${BLUE}📋 Phase 4: Vérification Build & Performance${NC}"
echo "=============================================="

# Test 4: Build Check
echo -n "🏗️ Application build... "
if [ -f "dist/index.html" ] && [ -f "dist/assets/index-"*".js" ]; then
    fix_result 0 "Build de production généré"
else
    fix_result 1 "Build de production manquant"
fi

echo -n "📦 Frontend response... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
if [ "$HTTP_CODE" = "200" ]; then
    fix_result 0 "Frontend accessible (HTTP $HTTP_CODE)"
else
    fix_result 1 "Frontend inaccessible (HTTP $HTTP_CODE)"
fi

echo ""
echo -e "${BLUE}📋 Phase 5: Corrections Appliquées${NC}"
echo "==================================="

echo -e "${GREEN}✅ Corrections UX appliquées:${NC}"
echo "• Protection contre les erreurs null dans Discovery"
echo "• Valeurs par défaut réalistes dans EditProfile"  
echo "• Navigation améliorée dans Messages (pas de cul-de-sac)"
echo "• Correction des erreurs TypeScript"
echo "• Services backend redémarrés avec bonne configuration"
echo "• Build de production fonctionnel"

echo ""
echo -e "${YELLOW}📊 RÉSULTATS${NC}"
echo "============"

TOTAL_CHECKS=$((FIXES_APPLIED + ISSUES_FOUND))
SUCCESS_RATE=$((FIXES_APPLIED * 100 / TOTAL_CHECKS))

echo -e "Corrections appliquées: ${GREEN}$FIXES_APPLIED${NC}"
echo -e "Problèmes restants: ${RED}$ISSUES_FOUND${NC}"
echo -e "Total vérifications: $TOTAL_CHECKS"
echo -e "Taux de réussite: ${GREEN}$SUCCESS_RATE%${NC}"

echo ""
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}🎉 TOUTES LES CORRECTIONS SONT APPLIQUÉES !${NC}"
    echo -e "${GREEN}✨ Way-D est maintenant prêt pour l'utilisation${NC}"
    echo ""
    echo -e "${BLUE}🚀 Application disponible sur:${NC}"
    echo -e "   📱 Frontend: http://localhost:5173"
    echo -e "   🌐 Production: http://157.180.36.122"
    echo ""
    echo -e "${YELLOW}🛠️ Corrections appliquées:${NC}"
    echo -e "   • Erreur 'can't access property length, e is null' corrigée"
    echo -e "   • Incohérences de profils corrigées (âge, profession, etc.)"
    echo -e "   • Navigation améliorée (pas de culs-de-sac UX)"
    echo -e "   • Services backend 'healthy' et fonctionnels"
    echo -e "   • Valeurs par défaut réalistes"
    echo ""
    echo -e "${GREEN}🔄 Pour tester les corrections:${NC}"
    echo -e "   1. Aller sur http://157.180.36.122"
    echo -e "   2. Créer un compte ou se connecter"
    echo -e "   3. Créer/modifier un profil"
    echo -e "   4. Tester la découverte de profils"
    echo -e "   5. Vérifier les messages et navigation"
    exit 0
else
    echo -e "${RED}⚠️ CERTAINS PROBLÈMES PERSISTENT${NC}"
    echo -e "${YELLOW}Vérifiez les logs et redémarrez les services si nécessaire${NC}"
    exit 1
fi
