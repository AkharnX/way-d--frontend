#!/bin/bash

# Script pour configurer SSL avec Let's Encrypt
# À exécuter APRÈS avoir configuré le DNS et déployé l'application

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     WAY-D SSL SETUP - LET'S ENCRYPT                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Demander le nom de domaine
read -p "Entrez votre nom de domaine (ex: way-d.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}❌ Erreur: Le nom de domaine est requis${NC}"
    exit 1
fi

echo -e "${YELLOW}Domaine configuré: $DOMAIN${NC}"
echo ""

# Vérifier si certbot est installé
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}▶ Installation de Certbot...${NC}"
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
    echo -e "${GREEN}✅ Certbot installé${NC}"
fi

# Obtenir le certificat SSL
echo -e "${YELLOW}▶ Obtention du certificat SSL...${NC}"
echo -e "${YELLOW}   (Assurez-vous que votre DNS pointe vers ce serveur)${NC}"
echo ""

sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certificat SSL obtenu avec succès !${NC}"
    echo ""
    echo "🔒 Votre site est maintenant accessible en HTTPS:"
    echo "   https://$DOMAIN"
    echo "   https://www.$DOMAIN"
    echo ""
    echo "📝 Le renouvellement automatique est configuré."
    echo "   Testez-le avec: sudo certbot renew --dry-run"
else
    echo -e "${RED}❌ Échec de l'obtention du certificat${NC}"
    echo ""
    echo "Vérifiez que:"
    echo "  1. Votre DNS pointe bien vers ce serveur"
    echo "  2. Les ports 80 et 443 sont ouverts"
    echo "  3. Nginx est en cours d'exécution"
    exit 1
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"