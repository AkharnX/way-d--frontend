#!/bin/bash

# Script de nettoyage et d'organisation pour le projet Way-d frontend
# Ce script nettoie le projet et organise les fichiers

# Couleurs pour la sortie
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Bannière
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                🧹 WAY-D FRONTEND CLEANUP & ORGANIZATION                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════════════╝${NC}"

# Vérifier que nous sommes dans le bon répertoire
if [[ ! -f "package.json" ]]; then
    echo -e "${RED}❌ Erreur: Ce script doit être exécuté depuis le répertoire racine du frontend.${NC}"
    echo -e "${YELLOW}Veuillez naviguer vers /home/akharn/way-d/frontend et réessayer.${NC}"
    exit 1
fi

# Fonction de nettoyage des fichiers temporaires
clean_temp_files() {
    echo -e "${YELLOW}🧹 Nettoyage des fichiers temporaires...${NC}"
    
    # Supprimer les fichiers temporaires et les builds précédents
    rm -rf dist node_modules/.vite .cache
    
    # Nettoyer les fichiers de logs anciens (plus de 7 jours)
    find ./logs -name "*.log" -type f -mtime +7 -delete
    
    echo -e "${GREEN}✅ Nettoyage des fichiers temporaires terminé.${NC}"
}

# Fonction de nettoyage du cache npm
clean_npm_cache() {
    echo -e "${YELLOW}🧹 Nettoyage du cache npm...${NC}"
    
    # Nettoyer le cache npm
    npm cache clean --force
    
    # Supprimer node_modules si demandé
    read -p "Voulez-vous supprimer node_modules? (y/n): " choice
    if [[ "$choice" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Suppression de node_modules...${NC}"
        rm -rf node_modules
        echo -e "${GREEN}✅ node_modules supprimé.${NC}"
    fi
    
    echo -e "${GREEN}✅ Nettoyage du cache npm terminé.${NC}"
}

# Fonction d'organisation des fichiers
organize_files() {
    echo -e "${YELLOW}📂 Organisation des fichiers...${NC}"
    
    # Créer les répertoires nécessaires
    mkdir -p logs docs documentation/reports documentation/guides
    
    # Déplacer les fichiers markdown dans la documentation
    find . -maxdepth 1 -name "*.md" -not -name "README.md" -type f -exec mv {} ./documentation/reports/ \;
    
    echo -e "${GREEN}✅ Organisation des fichiers terminée.${NC}"
}

# Fonction pour vérifier les services
check_services() {
    echo -e "${YELLOW}🔍 Vérification des services...${NC}"
    
    # Vérifier les services backend
    SERVICES_OK=0
    echo -e "Vérification de l'API Auth..."
    curl -s http://localhost:8080/health | grep -q "ok" && ((SERVICES_OK++)) && echo -e "${GREEN}✅ Auth API: OK${NC}" || echo -e "${RED}❌ Auth API: Non disponible${NC}"
    echo -e "Vérification de l'API Profile..."
    curl -s http://localhost:8081/health | grep -q "ok" && ((SERVICES_OK++)) && echo -e "${GREEN}✅ Profile API: OK${NC}" || echo -e "${RED}❌ Profile API: Non disponible${NC}"
    echo -e "Vérification de l'API Interactions..."
    curl -s http://localhost:8082/health | grep -q "ok" && ((SERVICES_OK++)) && echo -e "${GREEN}✅ Interactions API: OK${NC}" || echo -e "${RED}❌ Interactions API: Non disponible${NC}"
    
    # Vérifier si PM2 est en cours d'exécution
    if pm2 list | grep -q "way-d-frontend"; then
        echo -e "${GREEN}✅ PM2 Frontend: En cours d'exécution${NC}"
        echo -e "Port: 5173"
        echo -e "Status: $(pm2 info way-d-frontend | grep status | awk '{print $2}')"
    else
        echo -e "${YELLOW}⚠️ PM2 Frontend: Non démarré${NC}"
    fi
    
    echo -e "${GREEN}✅ Vérification des services terminée.${NC}"
}

# Menu principal
echo -e "${CYAN}Choisissez une option:${NC}"
echo -e "${WHITE}1) Nettoyage complet${NC}"
echo -e "${WHITE}2) Nettoyage des fichiers temporaires${NC}"
echo -e "${WHITE}3) Nettoyage du cache npm${NC}"
echo -e "${WHITE}4) Organisation des fichiers${NC}"
echo -e "${WHITE}5) Vérification des services${NC}"
echo -e "${WHITE}0) Quitter${NC}"

read -p "Option: " option

case $option in
    1)
        clean_temp_files
        clean_npm_cache
        organize_files
        check_services
        ;;
    2)
        clean_temp_files
        ;;
    3)
        clean_npm_cache
        ;;
    4)
        organize_files
        ;;
    5)
        check_services
        ;;
    0)
        echo -e "${BLUE}Au revoir!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Option invalide.${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✅ OPÉRATION TERMINÉE AVEC SUCCÈS                       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════════════════╝${NC}"