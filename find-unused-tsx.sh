#!/bin/bash

# Script pour trouver les fichiers .tsx non utilisés

echo "🔍 Analyse des fichiers .tsx non utilisés"
echo "========================================"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fichiers à supprimer (confirmés comme vides ou non utilisés)
unused_files=()

# Vérifier les fichiers vides
echo -e "\n${YELLOW}📄 Fichiers vides:${NC}"
find src -name "*.tsx" -empty | while read file; do
    echo -e "  ${RED}❌ $file (vide)${NC}"
done

# Fichiers spécifiquement identifiés comme non utilisés
check_files=(
    "src/pages/DashboardFull.tsx"
    "src/pages/ProfileTest.tsx" 
    "src/pages/Profile_new.tsx"
    "src/components/HealthCheck.tsx"
    "src/components/StatsModal.tsx"
    "src/components/UndoAction.tsx"
)

echo -e "\n${YELLOW}🔍 Vérification des imports:${NC}"

for file in "${check_files[@]}"; do
    if [ -f "$file" ]; then
        # Extraire le nom du composant sans chemin et extension
        component_name=$(basename "$file" .tsx)
        
        # Chercher les imports de ce composant
        import_count=$(find src -name "*.tsx" -exec grep -l "import.*$component_name" {} \; 2>/dev/null | wc -l)
        
        if [ "$import_count" -eq 0 ]; then
            echo -e "  ${RED}❌ $file (non importé)${NC}"
            unused_files+=("$file")
        else
            echo -e "  ${GREEN}✅ $file (utilisé)${NC}"
        fi
    fi
done

echo -e "\n${YELLOW}📊 Résumé:${NC}"
if [ ${#unused_files[@]} -eq 0 ]; then
    echo -e "  ${GREEN}✅ Aucun fichier .tsx non utilisé trouvé${NC}"
else
    echo -e "  ${RED}❌ ${#unused_files[@]} fichier(s) non utilisé(s) trouvé(s):${NC}"
    for file in "${unused_files[@]}"; do
        echo -e "    - $file"
    done
fi
