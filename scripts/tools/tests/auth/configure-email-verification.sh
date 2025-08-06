#!/bin/bash

# Script de configuration du mode de vérification d'email pour Way-d

echo "🔧 Configuration du mode de vérification d'email Way-d"
echo "===================================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Chemin du fichier .env
ENV_FILE="/home/akharn/way-d/backend/way-d--auth/.env"

# Fonction pour afficher le menu
show_menu() {
    echo ""
    echo -e "${BLUE}Sélectionnez le mode de vérification d'email:${NC}"
    echo "1. Mode Production (vérification email obligatoire)"
    echo "2. Mode Développement (vérification email activée)"
    echo "3. Mode Développement (vérification email désactivée)"
    echo "4. Afficher la configuration actuelle"
    echo "5. Redémarrer les services backend"
    echo "6. Quitter"
    echo ""
}

# Fonction pour lire la configuration actuelle
read_current_config() {
    if [ -f "$ENV_FILE" ]; then
        APP_ENV=$(grep "^APP_ENV=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"')
        SKIP_EMAIL=$(grep "^SKIP_EMAIL_VERIFICATION=" "$ENV_FILE" | cut -d'=' -f2 | tr -d '"')
        
        echo -e "${BLUE}Configuration actuelle:${NC}"
        echo "APP_ENV: ${APP_ENV:-"non défini"}"
        echo "SKIP_EMAIL_VERIFICATION: ${SKIP_EMAIL:-"non défini"}"
        
        if [ "$APP_ENV" = "production" ]; then
            echo -e "${GREEN}Mode: Production (vérification email obligatoire)${NC}"
        elif [ "$SKIP_EMAIL" = "true" ]; then
            echo -e "${YELLOW}Mode: Développement (vérification email désactivée)${NC}"
        else
            echo -e "${BLUE}Mode: Développement (vérification email activée)${NC}"
        fi
    else
        echo -e "${RED}Fichier .env non trouvé: $ENV_FILE${NC}"
        echo "Création du fichier .env..."
        create_env_file
    fi
}

# Fonction pour créer le fichier .env
create_env_file() {
    cat > "$ENV_FILE" << 'EOF'
# Configuration de la base de données
DB_HOST=wayd-postgres
DB_PORT=5432
DB_USER=wayd_user
DB_PASSWORD=test
DB_NAME=wayd_auth
DB_SSL_MODE=disable

# Configuration JWT
JWT_SECRET_KEY=your-super-secret-jwt-key-here-change-in-production
JWT_REFRESH_SECRET_KEY=your-super-secret-refresh-jwt-key-here-change-in-production

# Configuration Email (optionnel)
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# Configuration de l'environnement
APP_ENV=development
SKIP_EMAIL_VERIFICATION=false
EOF
    echo -e "${GREEN}Fichier .env créé avec la configuration par défaut${NC}"
}

# Fonction pour configurer le mode production
set_production_mode() {
    sed -i 's/^APP_ENV=.*/APP_ENV=production/' "$ENV_FILE"
    sed -i 's/^SKIP_EMAIL_VERIFICATION=.*/SKIP_EMAIL_VERIFICATION=false/' "$ENV_FILE"
    echo -e "${GREEN}✅ Mode Production configuré${NC}"
    echo "- Vérification email obligatoire"
    echo "- Codes de vérification envoyés par email uniquement"
}

# Fonction pour configurer le mode développement avec vérification
set_dev_mode_with_verification() {
    sed -i 's/^APP_ENV=.*/APP_ENV=development/' "$ENV_FILE"
    sed -i 's/^SKIP_EMAIL_VERIFICATION=.*/SKIP_EMAIL_VERIFICATION=false/' "$ENV_FILE"
    echo -e "${BLUE}✅ Mode Développement (avec vérification) configuré${NC}"
    echo "- Vérification email activée"
    echo "- Codes de vérification affichés dans la console"
}

# Fonction pour configurer le mode développement sans vérification
set_dev_mode_without_verification() {
    sed -i 's/^APP_ENV=.*/APP_ENV=development/' "$ENV_FILE"
    sed -i 's/^SKIP_EMAIL_VERIFICATION=.*/SKIP_EMAIL_VERIFICATION=true/' "$ENV_FILE"
    echo -e "${YELLOW}✅ Mode Développement (sans vérification) configuré${NC}"
    echo "- Vérification email désactivée"
    echo "- Accès direct aux ressources protégées après connexion"
}

# Fonction pour redémarrer les services
restart_services() {
    echo -e "${BLUE}🔄 Redémarrage des services backend...${NC}"
    cd /home/akharn/way-d/backend
    docker-compose down
    docker-compose up -d
    echo -e "${GREEN}✅ Services redémarrés${NC}"
}

# Vérifier que le fichier .env existe
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️ Fichier .env non trouvé${NC}"
    create_env_file
fi

# Boucle principale
while true; do
    read_current_config
    show_menu
    
    read -p "Votre choix (1-6): " choice
    
    case $choice in
        1)
            set_production_mode
            echo -e "${YELLOW}💡 N'oubliez pas de redémarrer les services (option 5)${NC}"
            ;;
        2)
            set_dev_mode_with_verification
            echo -e "${YELLOW}💡 N'oubliez pas de redémarrer les services (option 5)${NC}"
            ;;
        3)
            set_dev_mode_without_verification
            echo -e "${YELLOW}💡 N'oubliez pas de redémarrer les services (option 5)${NC}"
            ;;
        4)
            # Configuration affichée au début de la boucle
            ;;
        5)
            restart_services
            ;;
        6)
            echo -e "${GREEN}Au revoir !${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}Choix invalide. Veuillez sélectionner 1-6.${NC}"
            ;;
    esac
done
