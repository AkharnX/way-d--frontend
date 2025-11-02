#!/bin/bash

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     WAY-D DEPLOYMENT - PM2 + NGINX                    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erreur: Ce script doit être exécuté depuis /home/akharn/way-d/frontend${NC}"
    exit 1
fi

# Fonction pour afficher les résultats
print_step() {
    echo -e "\n${YELLOW}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Vérifier les dépendances
print_step "Vérification des dépendances..."

if ! command -v pm2 &> /dev/null; then
    print_error "PM2 n'est pas installé. Installation..."
    npm install -g pm2
fi
print_success "PM2 installé"

if ! command -v nginx &> /dev/null; then
    print_error "Nginx n'est pas installé. Installation..."
    sudo apt-get update
    sudo apt-get install -y nginx
fi
print_success "Nginx installé"

# 2. Créer les répertoires nécessaires
print_step "Création des répertoires..."

mkdir -p logs
mkdir -p nginx
print_success "Répertoires créés"

# 3. Build du frontend
print_step "Build du frontend pour la production..."

npm run build
if [ $? -eq 0 ]; then
    print_success "Build réussi"
else
    print_error "Échec du build"
    exit 1
fi

# 4. Arrêter l'ancienne instance PM2 si elle existe
print_step "Arrêt de l'ancienne instance PM2..."

pm2 stop way-d-frontend 2>/dev/null || true
pm2 delete way-d-frontend 2>/dev/null || true
print_success "Anciennes instances arrêtées"

# 5. Démarrer avec PM2
print_step "Démarrage de l'application avec PM2..."

pm2 start ecosystem.config.cjs
if [ $? -eq 0 ]; then
    print_success "Application démarrée avec PM2"
else
    print_error "Échec du démarrage PM2"
    exit 1
fi

pm2 save
print_success "Configuration PM2 sauvegardée"

# 6. Configurer Nginx
print_step "Configuration de Nginx..."

# Sauvegarder l'ancienne config si elle existe
if [ -f "/etc/nginx/sites-available/way-d" ]; then
    sudo cp /etc/nginx/sites-available/way-d /etc/nginx/sites-available/way-d.backup.$(date +%Y%m%d%H%M%S)
    print_success "Ancienne configuration sauvegardée"
fi

# Copier la nouvelle configuration
sudo cp nginx/way-d.conf /etc/nginx/sites-available/way-d
print_success "Configuration Nginx copiée"

# Créer le lien symbolique si nécessaire
if [ ! -L "/etc/nginx/sites-enabled/way-d" ]; then
    sudo ln -s /etc/nginx/sites-available/way-d /etc/nginx/sites-enabled/way-d
    print_success "Lien symbolique créé"
fi

# Supprimer la config par défaut si elle existe
if [ -L "/etc/nginx/sites-enabled/default" ]; then
    sudo rm /etc/nginx/sites-enabled/default
    print_success "Configuration par défaut supprimée"
fi

# Tester la configuration Nginx
print_step "Test de la configuration Nginx..."

sudo nginx -t
if [ $? -eq 0 ]; then
    print_success "Configuration Nginx valide"
    
    # Recharger Nginx
    sudo systemctl reload nginx
    print_success "Nginx rechargé"
else
    print_error "Configuration Nginx invalide"
    exit 1
fi

# 7. Vérifier que les services backend sont démarrés
print_step "Vérification des services backend..."

SERVICES_OK=true

# Auth
if curl -s http://127.0.0.1:8080/health > /dev/null 2>&1; then
    print_success "Auth Service (8080) - OK"
else
    print_error "Auth Service (8080) - NON DISPONIBLE"
    SERVICES_OK=false
fi

# Profile
if curl -s http://127.0.0.1:8081/health > /dev/null 2>&1; then
    print_success "Profile Service (8081) - OK"
else
    print_error "Profile Service (8081) - NON DISPONIBLE"
    SERVICES_OK=false
fi

# Interactions
if curl -s http://127.0.0.1:8082/health > /dev/null 2>&1; then
    print_success "Interactions Service (8082) - OK"
else
    echo -e "${YELLOW}⚠️  Interactions Service (8082) - NON DISPONIBLE${NC}"
fi

# 8. Configuration du démarrage automatique
print_step "Configuration du démarrage automatique..."

# PM2 startup
pm2 startup systemd -u $(whoami) --hp $(eval echo ~$(whoami))
print_success "PM2 configuré pour le démarrage automatique"

# Nginx
sudo systemctl enable nginx
print_success "Nginx configuré pour le démarrage automatique"

# 9. Afficher le statut
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  DÉPLOIEMENT TERMINÉ                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${GREEN}✅ Application déployée avec succès !${NC}"
echo ""
echo "📊 Statut des services:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
pm2 list
echo ""

echo "🌐 URLs:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Frontend: http://localhost (via Nginx)"
echo "Frontend direct: http://localhost:5173 (via PM2)"
echo "API Auth: http://localhost/api/auth"
echo "API Profile: http://localhost/api/profile"
echo "API Interactions: http://localhost/api/interactions"
echo ""

echo "📝 Commandes utiles:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "pm2 list                    # Voir les processus PM2"
echo "pm2 logs way-d-frontend     # Voir les logs"
echo "pm2 restart way-d-frontend  # Redémarrer l'app"
echo "pm2 stop way-d-frontend     # Arrêter l'app"
echo "sudo nginx -t               # Tester la config Nginx"
echo "sudo systemctl reload nginx # Recharger Nginx"
echo "sudo systemctl status nginx # Statut de Nginx"
echo ""

if [ "$SERVICES_OK" = false ]; then
    echo -e "${YELLOW}⚠️  ATTENTION: Certains services backend ne sont pas disponibles${NC}"
    echo -e "${YELLOW}   Démarrez-les avec: docker start wayd-auth wayd-profile wayd-interactions${NC}"
    echo ""
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"