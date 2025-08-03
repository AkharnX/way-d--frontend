#!/bin/bash

# Way-D Frontend - Script de Maintenance Principal
# Centralise toutes les opérations de maintenance

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Fonction d'aide
show_help() {
    echo "🛠️  Way-D Frontend - Maintenance"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands disponibles:"
    echo "  dev         Démarrer le serveur de développement"
    echo "  build       Build de production"
    echo "  test        Lancer tous les tests"
    echo "  diagnostic  Diagnostic complet du système"
    echo "  clean       Nettoyer le projet"
    echo "  validate    Valider l'intégrité du projet"
    echo "  status      Afficher le statut du projet"
    echo "  help        Afficher cette aide"
    echo ""
    echo "Exemples:"
    echo "  $0 dev       # Démarre le serveur de développement"
    echo "  $0 test      # Lance la suite de tests"
    echo "  $0 clean     # Nettoie et organise le projet"
}

# Fonction de statut
show_status() {
    log_info "Vérification du statut du projet Way-D Frontend..."
    echo ""
    
    # Vérification des dépendances
    if [ -f "package.json" ]; then
        log_success "package.json trouvé"
    else
        log_error "package.json manquant"
    fi
    
    # Vérification node_modules
    if [ -d "node_modules" ]; then
        log_success "Dépendances installées"
    else
        log_warning "Dépendances non installées - Exécutez: npm install"
    fi
    
    # Vérification de la structure
    if [ -d "src" ] && [ -d "tools" ] && [ -d "documentation" ]; then
        log_success "Structure du projet organisée"
    else
        log_warning "Structure du projet incomplète"
    fi
    
    # Vérification des scripts
    if [ -f "tools/scripts/way-d.sh" ]; then
        log_success "Scripts de maintenance disponibles"
    else
        log_error "Scripts de maintenance manquants"
    fi
}

# Fonction de développement
start_dev() {
    log_info "Démarrage du serveur de développement..."
    
    # Vérifier les dépendances
    if [ ! -d "node_modules" ]; then
        log_info "Installation des dépendances..."
        npm install
    fi
    
    # Démarrer Vite
    log_success "Démarrage de Vite..."
    npm run dev
}

# Fonction de build
build_project() {
    log_info "Build de production..."
    
    # Vérifier les dépendances
    if [ ! -d "node_modules" ]; then
        log_info "Installation des dépendances..."
        npm install
    fi
    
    # Nettoyer le dossier dist
    if [ -d "dist" ]; then
        log_info "Nettoyage du dossier dist..."
        rm -rf dist
    fi
    
    # Build
    log_info "Compilation TypeScript et build Vite..."
    npm run build
    
    log_success "Build terminé! Fichiers dans ./dist/"
}

# Fonction de test
run_tests() {
    log_info "Lancement des tests..."
    
    # Tests frontend
    if [ -f "tools/scripts/test-frontend-fixes.sh" ]; then
        log_info "Tests des corrections frontend..."
        bash tools/scripts/test-frontend-fixes.sh
    fi
    
    # Tests complets
    if [ -f "tools/scripts/test-all-fixes.js" ]; then
        log_info "Tests complets..."
        node tools/scripts/test-all-fixes.js
    fi
    
    log_success "Tests terminés!"
}

# Fonction de diagnostic
run_diagnostic() {
    log_info "Diagnostic complet du système..."
    
    if [ -f "tools/scripts/production-diagnostic.sh" ]; then
        bash tools/scripts/production-diagnostic.sh
    else
        log_warning "Script de diagnostic non trouvé"
    fi
}

# Fonction de nettoyage
clean_project() {
    log_info "Nettoyage du projet..."
    
    # Nettoyer node_modules
    if [ -d "node_modules" ]; then
        log_info "Suppression de node_modules..."
        rm -rf node_modules
    fi
    
    # Nettoyer dist
    if [ -d "dist" ]; then
        log_info "Suppression de dist..."
        rm -rf dist
    fi
    
    # Réinstaller les dépendances
    log_info "Réinstallation des dépendances..."
    npm install
    
    log_success "Nettoyage terminé!"
}

# Fonction de validation
validate_project() {
    log_info "Validation de l'intégrité du projet..."
    
    if [ -f "tools/scripts/validate-project.sh" ]; then
        bash tools/scripts/validate-project.sh
    else
        # Validation basique
        log_info "Vérification de la structure..."
        
        # Vérifications essentielles
        [ -f "package.json" ] && log_success "package.json OK" || log_error "package.json manquant"
        [ -f "vite.config.ts" ] && log_success "vite.config.ts OK" || log_error "vite.config.ts manquant"
        [ -d "src" ] && log_success "Dossier src OK" || log_error "Dossier src manquant"
        [ -f "src/App.tsx" ] && log_success "App.tsx OK" || log_error "App.tsx manquant"
        
        log_info "Validation terminée"
    fi
}

# Script principal
case "${1:-help}" in
    "dev")
        start_dev
        ;;
    "build")
        build_project
        ;;
    "test")
        run_tests
        ;;
    "diagnostic")
        run_diagnostic
        ;;
    "clean")
        clean_project
        ;;
    "validate")
        validate_project
        ;;
    "status")
        show_status
        ;;
    "help"|*)
        show_help
        ;;
esac
