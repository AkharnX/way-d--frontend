#!/bin/bash

# 🔒 Test de sécurité Way-d - Comparaison HTTP vs HTTPS
echo "🔍 ANALYSE DE SÉCURITÉ WAY-D"
echo "============================"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${RED}❌ SITUATION ACTUELLE (HTTP seulement):${NC}"
echo "   • http://localhost:5173 - Données en clair"
echo "   • Navigateur affiche 'Non sécurisé'"
echo "   • Vulnérable aux attaques Man-in-the-Middle"
echo "   • Cookies de session exposés"
echo "   • Mots de passe visibles en transit"
echo "   • Pas de protection contre l'écoute réseau"
echo ""

echo -e "${GREEN}✅ AVEC HTTPS Let's Encrypt:${NC}"
echo "   • https://wayd.votredomaine.com - Chiffrement TLS 1.3"
echo "   • Cadenas vert dans le navigateur"  
echo "   • Protection contre Man-in-the-Middle"
echo "   • Cookies sécurisés automatiquement"
echo "   • Toutes les données chiffrées"
echo "   • Certificats gratuits et automatiques"
echo "   • Renouvellement tous les 90 jours"
echo "   • Reconnaissance par tous les navigateurs"
echo ""

echo -e "${BLUE}📊 IMPACT UTILISATEUR:${NC}"
echo "   • Confiance ↗️  (cadenas vert vs avertissement rouge)"
echo "   • Performance ↗️  (HTTP/2 vs HTTP/1.1)"
echo "   • Sécurité ↗️  (chiffrement vs texte clair)"
echo "   • SEO ↗️  (Google favorise HTTPS)"
echo "   • Conformité ↗️  (RGPD, normes de sécurité)"
echo ""

echo -e "${YELLOW}🎯 EXEMPLE CONCRET:${NC}"
echo ""
echo "Connexion utilisateur actuelle (HTTP):"
echo '   POST http://localhost:5173/api/auth/login'
echo '   {"email":"user@example.com","password":"motdepasse123"}'
echo "   → 👁️  VISIBLE par quiconque écoute le réseau"
echo ""
echo "Connexion utilisateur avec HTTPS:"
echo '   POST https://wayd.votredomaine.com/api/auth/login'
echo '   [DONNÉES CHIFFRÉES TLS 1.3]'
echo "   → 🔒 INVISIBLE même avec un sniffer réseau"
echo ""

echo -e "${BLUE}🚀 ÉTAPES POUR IMPLÉMENTER HTTPS:${NC}"
echo ""
echo "1. 🌐 Obtenir un domaine:"
echo "   • Acheter: wayd.votredomaine.com"
echo "   • Ou sous-domaine gratuit: wayd.ddns.net"
echo ""
echo "2. ⚙️  Configurer DNS:"
echo "   • A record: wayd.votredomaine.com → $(curl -s ifconfig.me 2>/dev/null || echo 'VOTRE_IP')"
echo ""
echo "3. 🔧 Installer HTTPS:"
echo "   sudo ./setup-https.sh wayd.votredomaine.com admin@votredomaine.com"
echo ""
echo "4. ✅ Tester la sécurité:"
echo "   • SSL Labs: https://www.ssllabs.com/ssltest/"
echo "   • Security Headers: https://securityheaders.com/"
echo ""

echo -e "${YELLOW}💡 ALTERNATIVE DÉVELOPPEMENT LOCAL:${NC}"
echo "   ./setup-local-https.sh"
echo "   → Certificat auto-signé pour tester HTTPS localement"
echo ""

echo -e "${GREEN}📈 RÉSULTATS ATTENDUS AVEC HTTPS:${NC}"
echo "   • SSL Labs Score: A+ (au lieu de F)"
echo "   • Security Headers: A+ (au lieu de F)"  
echo "   • Mozilla Observatory: 90+ (au lieu de 0)"
echo "   • Navigateur: 🔒 Sécurisé (au lieu de ⚠️ Non sécurisé)"
echo ""

echo -e "${BLUE}🔍 VÉRIFICATION ACTUELLE:${NC}"
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "   • Frontend HTTP: ${GREEN}✅ Accessible${NC} (mais non sécurisé)"
else
    echo -e "   • Frontend HTTP: ${RED}❌ Inaccessible${NC}"
fi

if curl -s http://localhost:8080/login -X POST > /dev/null 2>&1; then
    echo -e "   • Backend Auth: ${GREEN}✅ Accessible${NC} (mais non sécurisé)"
else
    echo -e "   • Backend Auth: ${RED}❌ Inaccessible${NC}"
fi

echo ""
echo -e "${GREEN}🎯 RECOMMANDATION:${NC}"
echo "   Pour un site de rencontres, HTTPS n'est pas optionnel."
echo "   Les utilisateurs s'attendent à voir le cadenas vert."
echo "   Let's Encrypt rend cela gratuit et automatique."
echo ""
echo -e "${YELLOW}▶️  Prochaine étape:${NC} ./setup-https.sh VOTRE-DOMAINE.com"
