#!/bin/bash

# 🧹 Script de nettoyage complet du projet Way-d
# Supprime tous les fichiers redondants et organise le projet

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧹 Nettoyage complet du projet Way-d${NC}"
echo "=================================================="

# Supprimer les fichiers de sauvegarde et temporaires
echo -e "${YELLOW}Suppression des fichiers temporaires...${NC}"
find . -name "*.bak" -delete 2>/dev/null || true
find . -name "*.backup" -delete 2>/dev/null || true
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*~" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true

# Supprimer les logs anciens
echo -e "${YELLOW}Nettoyage des logs...${NC}"
find logs/ -name "*.log" -mtime +7 -delete 2>/dev/null || true

# Supprimer les node_modules si on veut une installation fraîche
read -p "Supprimer node_modules pour une installation fraîche? (y/n): " clean_modules
if [ "$clean_modules" = "y" ]; then
    echo -e "${YELLOW}Suppression de node_modules...${NC}"
    rm -rf node_modules
    echo -e "${GREEN}✅ node_modules supprimé${NC}"
fi

# Vérifier la structure des dossiers
echo -e "${YELLOW}Vérification de la structure...${NC}"
mkdir -p logs deployment tests/{auth,api,integration,validation,diagnostic,utils}

# Compter les fichiers par catégorie
echo -e "${BLUE}📊 Statistiques du projet:${NC}"
echo "Scripts de test: $(find tests/ -name "*.sh" | wc -l)"
echo "Scripts de déploiement: $(find deployment/ -name "*.sh" | wc -l)"
echo "Pages React: $(find src/pages/ -name "*.tsx" | wc -l)"
echo "Composants: $(find src/components/ -name "*.tsx" | wc -l)"

# Vérifier les permissions des scripts
echo -e "${YELLOW}Correction des permissions...${NC}"
chmod +x *.sh 2>/dev/null || true
chmod +x deployment/*.sh 2>/dev/null || true
chmod +x tests/**/*.sh 2>/dev/null || true

# Afficher la structure finale
echo -e "${GREEN}✅ Nettoyage terminé!${NC}"
echo
echo -e "${CYAN}Structure finale du projet:${NC}"
echo "📁 way-d/frontend/"
echo "├── 🎯 Scripts de contrôle (4)"
echo "├── 🧪 tests/ ($(find tests/ -name "*.sh" | wc -l) scripts)"
echo "├── 🚀 deployment/ ($(find deployment/ -name "*.sh" | wc -l) scripts)"
echo "├── 💻 src/ (Code source organisé)"
echo "└── 📝 logs/ (Logs de l'application)"
echo
echo -e "${GREEN}🎉 Projet parfaitement organisé!${NC}"
