#!/bin/bash

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                  🧹 WAY-D PROJECT CLEANUP 🧹                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

PROJECT_ROOT="/home/akharn/way-d/frontend"
cd "$PROJECT_ROOT"

echo -e "${YELLOW}🗂️ NETTOYAGE ET ORGANISATION DU PROJET${NC}"
echo ""

# 1. Supprimer les fichiers de sauvegarde et doublons
echo -e "${GREEN}1. Suppression des fichiers de sauvegarde...${NC}"
rm -f vite.config.backup.ts
rm -f vite.config.https.backup.ts  
rm -f vite.config.clean.ts
rm -f vite.config.minimal.ts
rm -f vite.config.simple.ts
echo "   ✅ Fichiers de config en double supprimés"

# 2. Supprimer les scripts HTTPS non utilisés (on garde la version simple)
echo -e "${GREEN}2. Suppression des scripts HTTPS redondants...${NC}"
rm -f server-https-pm2.js
rm -f server-https-pm2.cjs  
rm -f setup-https.sh
rm -f start-https-dev.sh
rm -f deploy-https-pm2.sh
echo "   ✅ Scripts HTTPS redondants supprimés"

# 3. Nettoyer les fichiers de documentation en double
echo -e "${GREEN}3. Organisation de la documentation...${NC}"
rm -f HTTPS_DEPLOYMENT_SUCCESS.md
rm -f HTTPS_SUMMARY.md  
rm -f deployment-complete.sh
rm -f PROJECT_ORGANIZATION_COMPLETE.md
echo "   ✅ Documentation redondante nettoyée"

# 4. Organiser les scripts utilitaires
echo -e "${GREEN}4. Réorganisation des scripts...${NC}"
mkdir -p scripts
mv cleanup-database-secure.sh scripts/ 2>/dev/null || true
mv cleanup-project.sh scripts/ 2>/dev/null || true
mv clear-db.sh scripts/ 2>/dev/null || true
mv security-analysis.sh scripts/ 2>/dev/null || true
mv security-audit.sh scripts/ 2>/dev/null || true  
mv security-summary.sh scripts/ 2>/dev/null || true
mv setup-local-https.sh scripts/ 2>/dev/null || true
mv way-d-control.sh scripts/ 2>/dev/null || true
mv server-simple.cjs scripts/ 2>/dev/null || true
echo "   ✅ Scripts déplacés vers /scripts/"

# 5. Nettoyer les fichiers d'ecosystem PM2 en double
echo -e "${GREEN}5. Nettoyage PM2...${NC}"
rm -f ecosystem.config.js  # Garder seulement celui dans deployment/
echo "   ✅ Fichiers PM2 dupliqués supprimés"

# 6. Organiser les fichiers de configuration
echo -e "${GREEN}6. Organisation des configs...${NC}"
mkdir -p config
mv vite.config.https.ts config/ 2>/dev/null || true
echo "   ✅ Configs organisées"

# 7. Nettoyer le dossier nginx inutilisé
echo -e "${GREEN}7. Nettoyage Nginx...${NC}"
rm -rf nginx/
echo "   ✅ Dossier nginx supprimé"

# 8. Créer un dossier docs propre  
echo -e "${GREEN}8. Réorganisation documentation...${NC}"
mkdir -p docs/archive
mv docs/ALWAYS_UP_GUIDE.md docs/archive/ 2>/dev/null || true
mv docs/BACKEND_ASSESSMENT.md docs/archive/ 2>/dev/null || true
mv docs/CORRECTIONS_FINALES.md docs/archive/ 2>/dev/null || true
mv docs/CORS_SOLUTION.md docs/archive/ 2>/dev/null || true
mv docs/DEBUG_GUIDE.md docs/archive/ 2>/dev/null || true
mv docs/FINAL_CORS_SOLUTION.md docs/archive/ 2>/dev/null || true
mv docs/LOGIN_REDIRECT_FIX.md docs/archive/ 2>/dev/null || true
mv docs/REFRESH_TOKEN_SOLUTION_COMPLETE.md docs/archive/ 2>/dev/null || true
mv docs/SOLUTION_FINALE_CONNEXION.md docs/archive/ 2>/dev/null || true
mv docs/SOLUTION_FINALE.md docs/archive/ 2>/dev/null || true
mv docs/SOLUTION_SUMMARY.md docs/archive/ 2>/dev/null || true
echo "   ✅ Documentation ancienne archivée"

# 9. Nettoyer les README en double
echo -e "${GREEN}9. Nettoyage README...${NC}"
rm -f docs/README.md  # Garder seulement le README principal
echo "   ✅ README dupliqués supprimés"

echo ""
echo -e "${GREEN}✅ NETTOYAGE TERMINÉ !${NC}"
echo ""

# Afficher la nouvelle structure
echo -e "${BLUE}📂 NOUVELLE STRUCTURE ORGANISÉE:${NC}"
echo ""
tree -I 'node_modules|dist|.git' -L 2 || ls -la

echo ""
echo -e "${GREEN}🎉 Projet Way-d nettoyé et organisé !${NC}"
echo -e "${YELLOW}📁 Scripts utilitaires: ${NC}./scripts/"
echo -e "${YELLOW}📁 Documentation: ${NC}./docs/"  
echo -e "${YELLOW}📁 Configs: ${NC}./config/"
echo -e "${YELLOW}📁 Déploiement: ${NC}./deployment/"
