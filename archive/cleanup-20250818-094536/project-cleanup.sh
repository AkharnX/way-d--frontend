#!/bin/bash

echo "🧹 NETTOYAGE COMPLET DU PROJET WAY-D FRONTEND"
echo "=============================================="
echo ""

# Créer un dossier archive avant nettoyage
mkdir -p archive/cleanup-$(date +%Y%m%d-%H%M%S)
ARCHIVE_DIR="archive/cleanup-$(date +%Y%m%d-%H%M%S)"

echo "📦 Création d'une archive de sauvegarde dans: $ARCHIVE_DIR"

# 1. NETTOYER LES FICHIERS DE RAPPORT ET DOCUMENTATION TEMPORAIRE
echo ""
echo "📄 1. Nettoyage des rapports temporaires..."

# Liste des fichiers de rapport à archiver
REPORT_FILES=(
    "401_ERROR_DIAGNOSTIC_README.md"
    "ALL_UNIMPLEMENTED_FEATURES_ELIMINATED.md"
    "AUTHENTICATION_IMPLEMENTATION_COMPLETE.md"
    "AUTH_DIAGNOSTIC_GUIDE.md"
    "AUTH_DIAGNOSTIC_IMPLEMENTATION_COMPLETE.md"
    "BACKEND_HEALTH_ENDPOINTS_COMPLETE.md"
    "DISCOVERY_FILTERING_OPTIMIZATION_COMPLETE.md"
    "FRONTEND_HEALTH_MONITORING_COMPLETE.md"
    "IMPROVEMENTS_REPORT.md"
    "MISSION_ACCOMPLISHED.md"
    "ORGANIZATION_COMPLETE_REPORT.md"
    "PRODUCTION_500_ERROR_RESOLVED.md"
    "PROFILE_FIXES_RAPPORT.md"
    "PROJECT_SETUP_COMPLETE.md"
    "SERVICE_AUTH_FONCTIONNEL_FINAL.md"
    "SETUP_COMPLETE.md"
    "SILENT_ERROR_HANDLING_RAPPORT.md"
    "STATIC_DATA_CLEANUP_COMPLETE.md"
    "UNIMPLEMENTED_FEATURES_FIXED.md"
    "UX_WORKFLOW_FIXES_COMPLETE.md"
    "auth-diagnostics-plan.md"
)

for file in "${REPORT_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   📄 Archivage: $file"
        mv "$file" "$ARCHIVE_DIR/"
    fi
done

# 2. NETTOYER LES SCRIPTS DE TEST ET DEBUG
echo ""
echo "🧪 2. Nettoyage des scripts de test temporaires..."

TEST_SCRIPTS=(
    "apply-fixes.sh"
    "clean-and-organize.sh"
    "complete-auth-diagnostic.sh"
    "diagnose-api-and-logs.sh"
    "final-cleanup.sh"
    "final-status.sh"
    "fix-and-commit.sh"
    "fix-ux-comprehensive.sh"
    "fix-ux-issues.sh"
    "organize-project.sh"
    "skip-ts-build.sh"
    "system-test-complete.sh"
    "system-test.sh"
    "test-api-fixes.sh"
    "test-auth-diagnostic.sh"
    "test-auth-e2e.sh"
    "test-complete-fixes.sh"
    "test-create-profile-complete.sh"
    "test-create-profile-fix.sh"
    "test-discovery-filtering.sh"
    "test-discovery-flow.js"
    "test-endpoints-dynamic.sh"
    "test-final-integration.sh"
    "test-health-endpoints.sh"
    "test-localized-data-integration.sh"
    "test-profile-fixes.sh"
    "test-registration-fix.js"
    "test-silent-errors-quick.sh"
    "test-silent-errors.sh"
    "test-token-utils.js"
    "verify-organization.sh"
)

for script in "${TEST_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        echo "   🧪 Archivage: $script"
        mv "$script" "$ARCHIVE_DIR/"
    fi
done

# 3. NETTOYER LES LOGS
echo ""
echo "📋 3. Nettoyage des logs..."

if [ -d "logs" ]; then
    echo "   📋 Archivage du dossier logs/"
    mv logs "$ARCHIVE_DIR/"
fi

# 4. NETTOYER LES BUILDS ET CACHES
echo ""
echo "🗂️ 4. Nettoyage des builds et caches..."

# Supprimer dist (sera regénéré)
if [ -d "dist" ]; then
    echo "   🗂️ Suppression: dist/"
    rm -rf dist
fi

# Nettoyer node_modules cache (optionnel)
if [ -d "node_modules/.cache" ]; then
    echo "   🗂️ Suppression: node_modules/.cache"
    rm -rf node_modules/.cache
fi

# 5. ORGANISER LA DOCUMENTATION
echo ""
echo "📚 5. Organisation de la documentation..."

# Garder seulement les docs essentiels à la racine
ESSENTIAL_DOCS=(
    "README.md"
    "README_EN.md"
    "CONTRIBUTING.md"
    "LICENSE"
    "MAINTENANCE_GUIDE.md"
)

# Déplacer docs moins importants vers docs/
if [ ! -d "docs/archived-reports" ]; then
    mkdir -p "docs/archived-reports"
fi

# 6. NETTOYER LE MCP SERVER (s'il n'est pas utilisé)
echo ""
echo "🔧 6. Vérification du serveur MCP..."

if [ -d "mcp-server" ]; then
    echo "   ❓ Le dossier mcp-server existe. Le garder ? (y/N)"
    read -p "   " keep_mcp
    if [[ ! "$keep_mcp" =~ ^[Yy]$ ]]; then
        echo "   🔧 Archivage: mcp-server/"
        mv mcp-server "$ARCHIVE_DIR/"
    fi
fi

# 7. NETTOYER LES FICHIERS TEMPORAIRES ET OUTILS
echo ""
echo "🛠️ 7. Nettoyage des outils temporaires..."

# Déplacer les outils vers archive si pas nécessaires
if [ -d "tools" ]; then
    echo "   🛠️ Archivage: tools/"
    mv tools "$ARCHIVE_DIR/"
fi

# Déplacer les tests vers archive (garder seulement tests/ officiel)
if [ -d "tests" ] && [ "$(ls -A tests)" ]; then
    echo "   🧪 Le dossier tests/ est conservé (tests officiels)"
else
    echo "   🧪 Le dossier tests/ est vide ou inexistant"
fi

# 8. CRÉER UN NOUVEAU FICHIER DE MAINTENANCE
echo ""
echo "📝 8. Création du guide de maintenance..."

cat > MAINTENANCE.md << 'EOF'
# Guide de Maintenance - Way-d Frontend

## 🧹 Dernière Mise à Jour
Projet nettoyé le $(date +"%d/%m/%Y à %H:%M")

## 📁 Structure du Projet

```
way-d-frontend/
├── src/                    # Code source principal
│   ├── components/         # Composants React réutilisables
│   ├── pages/             # Pages/routes de l'application
│   ├── services/          # Services API et logique métier
│   ├── hooks/             # Hooks React customisés
│   ├── utils/             # Utilitaires et helpers
│   ├── types/             # Définitions TypeScript
│   └── assets/            # Resources statiques
├── public/                # Fichiers publics statiques
├── docs/                  # Documentation du projet
├── scripts/               # Scripts de build et déploiement
├── dist/                  # Build de production (généré)
└── archive/               # Archives des anciens fichiers
```

## 🚀 Scripts Disponibles

### Développement
```bash
npm run dev                # Serveur de développement
npm run build             # Build de production
npm run preview           # Aperçu du build
npm run type-check        # Vérification TypeScript
```

### Déploiement
```bash
./deploy-pm2.sh           # Déploiement avec PM2
./restart-pm2.sh          # Redémarrage PM2
./verify-deployment.sh    # Vérification du déploiement
```

### Maintenance
```bash
./way-d-maintenance.sh    # Scripts de maintenance
./start-backend-services.sh  # Démarrer les services backend
./stop-backend-services.sh   # Arrêter les services backend
```

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **Routing**: React Router v6

### Backend Services
- **Auth Service**: 8080 - Authentification et utilisateurs
- **Profile Service**: 8081 - Gestion des profils
- **Interactions Service**: 8082 - Likes, matches, messages
- **Events Service**: 8083 - Événements et rencontres
- **Payments Service**: 8084 - Abonnements et paiements
- **Notifications Service**: 8085 - Notifications push
- **Moderation Service**: 8086 - Modération de contenu
- **Analytics Service**: 8087 - Statistiques et analytics
- **Admin Service**: 8088 - Administration

## 🔧 Configuration

### Variables d'Environnement
Copier `.env.example` vers `.env` et configurer :
```bash
cp .env.example .env
```

### Proxy Vite
Les appels API sont proxifiés via `vite.config.ts` :
- `/api/auth` → `http://localhost:8080`
- `/api/profile` → `http://localhost:8081`
- `/api/interactions` → `http://localhost:8082`

## 📦 Dépendances Principales

### Production
- React 18.x
- React Router 6.x
- Axios (API calls)
- Tailwind CSS
- Lucide React (icônes)

### Développement
- TypeScript 5.x
- Vite 5.x
- ESLint + Prettier
- PostCSS

## 🐛 Debugging

### Logs de Développement
Les logs sont visibles dans la console du navigateur avec préfixes :
- `🔐 Auth` - Authentification
- `👤 Profile` - Gestion des profils
- `💬 Messages` - Interactions
- `🔍 Discovery` - Découverte de profils

### Endpoints de Santé
- Auth: `GET /api/auth/health`
- Profile: `GET /api/profile/health`
- Interactions: `GET /api/interactions/health`

## 📈 Performance

### Métriques Cibles
- First Contentful Paint < 2s
- Time to Interactive < 3s
- Lighthouse Score > 90

### Optimisations
- Code splitting automatique (Vite)
- Images optimisées
- Gestion d'état efficace
- Mise en cache des requêtes API

## 🔒 Sécurité

### Authentification
- JWT avec refresh tokens
- Stockage sécurisé (localStorage)
- Expiration automatique des sessions

### API
- HTTPS obligatoire en production
- CORS configuré
- Validation des entrées
- Rate limiting côté backend

## 🌍 Internationalisation

### Langues Supportées
- Français (principal)
- Support pour l'anglais (fallback)

### Localisation
- Format de date: DD/MM/YYYY
- Devise: Franc CFA (XOF)
- Fuseau horaire: GMT+0 (Côte d'Ivoire)

## 📱 Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Approche Mobile-First
Toutes les interfaces sont d'abord conçues pour mobile.

## 🚨 Résolution de Problèmes

### Problèmes Courants

1. **Erreurs 404 sur les endpoints**
   - Vérifier que les services backend sont démarrés
   - Contrôler la configuration du proxy Vite

2. **Erreurs d'authentification**
   - Vérifier les tokens dans localStorage
   - Contrôler l'expiration des sessions

3. **Problèmes de build**
   - Nettoyer le cache: `rm -rf node_modules/.cache`
   - Réinstaller: `rm -rf node_modules && npm install`

### Support
- Documentation: `docs/`
- Issues GitHub: Repository Issues
- Logs: Console navigateur + Network tab

## 📋 Checklist de Déploiement

- [ ] Tests passent: `npm run test`
- [ ] Build réussit: `npm run build`
- [ ] TypeScript OK: `npm run type-check`
- [ ] Variables d'environnement configurées
- [ ] Services backend opérationnels
- [ ] Certificats SSL valides (production)
- [ ] Monitoring actif

---

*Guide mis à jour automatiquement lors du nettoyage du projet*
EOF

# 9. RÉSUMÉ FINAL
echo ""
echo "✅ NETTOYAGE TERMINÉ !"
echo "===================="
echo ""
echo "📊 Résumé des actions:"
echo "   📄 $(ls -1 $ARCHIVE_DIR/*.md 2>/dev/null | wc -l) rapports archivés"
echo "   🧪 $(ls -1 $ARCHIVE_DIR/*.sh $ARCHIVE_DIR/*.js 2>/dev/null | wc -l) scripts archivés"
echo "   📦 Archives sauvegardées dans: $ARCHIVE_DIR"
echo "   📝 Guide de maintenance créé: MAINTENANCE.md"
echo ""
echo "📁 Structure finale du projet:"
tree -L 2 -a -I 'node_modules|.git|archive' || ls -la

echo ""
echo "🎯 Projet nettoyé et organisé !"
echo "📖 Consultez MAINTENANCE.md pour la documentation à jour"
echo ""
echo "🚀 Prochaines étapes recommandées:"
echo "   1. npm run build              # Tester la compilation"
echo "   2. npm run dev               # Tester en développement"
echo "   3. git add . && git commit   # Valider les changements"
echo ""
