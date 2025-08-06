#!/bin/bash

# 🧹 Script de nettoyage final du projet Way-d
# Organise et nettoie tous les fichiers de développement

echo "🧹 NETTOYAGE FINAL DU PROJET WAY-D"
echo "=================================="
echo ""

# Créer les dossiers d'organisation s'ils n'existent pas
echo "📁 Création des dossiers d'organisation..."

mkdir -p archive/{documentation,tests,scripts,config,deployment}
mkdir -p final-docs
mkdir -p development-tools

# 1. ARCHIVER LA DOCUMENTATION DE DÉVELOPPEMENT
echo ""
echo "📚 Archivage de la documentation de développement..."

mv APPLICATION_STATUS_COMPLETE.md archive/documentation/ 2>/dev/null
mv BACKEND_CONTROLLER_IMPLEMENTATION_GUIDE.md archive/documentation/ 2>/dev/null
mv BACKEND_CORRECTIONS_SUMMARY.md archive/documentation/ 2>/dev/null
mv BACKEND_FIXES_COMPLETE.md archive/documentation/ 2>/dev/null
mv CLEANUP_SUMMARY.md archive/documentation/ 2>/dev/null
mv CORRECTIONS_FINALES_COMPLETE.md archive/documentation/ 2>/dev/null
mv CRITICAL_FIXES_COMPLETE.md archive/documentation/ 2>/dev/null
mv HTTPS_DEPLOYMENT_SUCCESS.md archive/documentation/ 2>/dev/null
mv HTTPS_SUMMARY.md archive/documentation/ 2>/dev/null
mv NAVIGATION_ENHANCEMENT_COMPLETE.md archive/documentation/ 2>/dev/null
mv PROFILE_DATA_MAPPING_FIX.md archive/documentation/ 2>/dev/null
mv PROFILE_FIX_REPORT.md archive/documentation/ 2>/dev/null
mv PROJECT_CLEANUP_COMPLETE.md archive/documentation/ 2>/dev/null
mv PROJECT_COMPLETION_SUMMARY.md archive/documentation/ 2>/dev/null
mv PROJECT_ORGANIZATION_COMPLETE.md archive/documentation/ 2>/dev/null
mv SECURITY_ACTION_PLAN.md archive/documentation/ 2>/dev/null

# 2. GARDER SEULEMENT LA DOCUMENTATION FINALE ESSENTIELLE
echo "📄 Conservation de la documentation finale..."

mv FINAL_STATUS_REPORT.md final-docs/ 2>/dev/null

# 3. ARCHIVER LES SCRIPTS DE TEST ET DEBUG
echo "🧪 Archivage des scripts de test et debug..."

mv debug-*.js archive/tests/ 2>/dev/null
mv test-*.js archive/tests/ 2>/dev/null
mv test-*.sh archive/tests/ 2>/dev/null
mv final-verification-test.sh archive/tests/ 2>/dev/null

# 4. ARCHIVER LES SCRIPTS DE CONFIGURATION ET DÉPLOIEMENT
echo "⚙️ Archivage des scripts de configuration..."

mv *-https*.* archive/config/ 2>/dev/null
mv server-*.* archive/config/ 2>/dev/null
mv setup*.sh archive/scripts/ 2>/dev/null
mv cleanup*.sh archive/scripts/ 2>/dev/null
mv clear-db.sh archive/scripts/ 2>/dev/null
mv security-*.sh archive/scripts/ 2>/dev/null
mv deploy*.sh archive/deployment/ 2>/dev/null
mv way-d-control.sh archive/scripts/ 2>/dev/null

# 5. ARCHIVER LES CONFIGURATIONS MULTIPLES
echo "🔧 Archivage des configurations multiples..."

mv vite.config.clean.ts archive/config/ 2>/dev/null
mv vite.config.https.ts archive/config/ 2>/dev/null
mv vite.config.minimal.ts archive/config/ 2>/dev/null
mv vite.config.simple.ts archive/config/ 2>/dev/null
# Garder seulement vite.config.ts principal

# 6. NETTOYER LES DOSSIERS TEMPORAIRES
echo "🗑️ Nettoyage des dossiers temporaires..."

# Supprimer temp-cleanup s'il existe et n'est pas vide
if [ -d "temp-cleanup" ]; then
    echo "Suppression de temp-cleanup..."
    rm -rf temp-cleanup
fi

# Supprimer tests s'il existe (on a archivé les scripts)
if [ -d "tests" ] && [ "$(ls -A tests 2>/dev/null)" ]; then
    echo "Archivage du dossier tests..."
    mv tests/* archive/tests/ 2>/dev/null
    rmdir tests 2>/dev/null
fi

# 7. CRÉER LA DOCUMENTATION FINALE PROPRE
echo ""
echo "📝 Création de la documentation finale..."

cat > README.md << 'EOF'
# 🚀 Way-d - Application de Rencontres

## ✨ Application Prête à l'Emploi

Way-d est une application de rencontres moderne et complète, développée avec React + TypeScript et une architecture microservices robuste.

## 🎯 Statut : Production Ready ✅

- ✅ **Frontend React/TypeScript** - Interface moderne et responsive
- ✅ **Authentication sécurisée** - JWT avec refresh automatique
- ✅ **Système de profils** - Création, modification, photos
- ✅ **Découverte intelligente** - Filtrage avancé sans répétition
- ✅ **Système d'interactions** - Like/Dislike avec matching
- ✅ **Messages en temps réel** - Chat entre utilisateurs
- ✅ **Navigation fluide** - UX optimisée sans cul-de-sac

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Backend services (Auth, Profile, Interactions)

### Installation et Lancement

```bash
# Installation des dépendances
npm install

# Lancement en développement
npm run dev

# L'application sera accessible sur http://localhost:5173
```

### Production

```bash
# Build de production
npm run build

# Preview du build
npm run preview
```

## 📱 Fonctionnalités Principales

### 🔐 **Authentification**
- Inscription avec vérification email
- Connexion sécurisée JWT
- Gestion automatique des tokens

### 👤 **Profils Utilisateur**
- Création de profil complet
- Upload de photos multiples
- Gestion des préférences
- Localisation géographique

### 🔍 **Découverte**
- Algorithme de matching intelligent
- Filtrage par préférences
- Évitement des profils déjà vus
- Interface de swipe intuitive

### 💬 **Interactions**
- Système Like/Dislike
- Notifications de match instantanées
- Chat en temps réel
- Historique des interactions

## 🏗️ Architecture

```
Frontend (React/TypeScript)
├── Authentication Service (Port 8080)
├── Profile Service (Port 8081)
└── Interactions Service (Port 8082)
```

## 🛠️ Technologies

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Router**: React Router v6
- **API**: Axios avec intercepteurs
- **Icons**: Lucide React
- **Build**: Vite
- **Styling**: Tailwind CSS

## 📊 Performance

- ⚡ **Loading rapide** - Vite + optimisations
- 📱 **Mobile-first** - Design responsive
- 🔄 **Real-time** - Mises à jour instantanées  
- 🛡️ **Sécurisé** - JWT + validation côté client

## 🎨 Interface

Interface moderne avec:
- Design mobile-first responsive
- Animations fluides et transitions
- Feedback visuel immédiat
- Navigation intuitive
- Mode sombre/clair (à venir)

## 🔧 Configuration

Le projet utilise des variables d'environnement pour la configuration :

```env
VITE_API_BASE_URL=http://localhost
VITE_AUTH_PORT=8080
VITE_PROFILE_PORT=8081
VITE_INTERACTIONS_PORT=8082
```

## 📚 Documentation

- `final-docs/` - Documentation complète du projet
- `archive/` - Historique du développement et outils

## 🚀 Déploiement

L'application est prête pour le déploiement en production avec :
- Build optimisé
- Configuration HTTPS
- Gestion des erreurs
- Monitoring intégré

## 🤝 Support

Pour toute question ou problème :
1. Vérifiez la documentation dans `final-docs/`
2. Consultez les logs de développement
3. Utilisez les outils de debug dans `development-tools/`

---

**Way-d** - Créer des connexions authentiques ❤️
EOF

# 8. CRÉER UN GUIDE DE MAINTENANCE
cat > MAINTENANCE.md << 'EOF'
# 🔧 Guide de Maintenance - Way-d

## 📋 Tâches de Maintenance Courantes

### Mise à jour des dépendances
```bash
npm update
npm audit fix
```

### Nettoyage du cache
```bash
npm run build -- --clean
rm -rf node_modules/.vite
```

### Tests de santé
```bash
# Vérifier que l'application démarre
npm run dev

# Tester les endpoints API
curl http://localhost:5173/api/health
```

### Logs et Debug
```bash
# Logs de développement
tail -f logs/app.log

# Analyse des performances
npm run build -- --analyze
```

## 🗂️ Structure des Fichiers

### Fichiers Essentiels à NE PAS Supprimer
- `package.json` - Configuration npm
- `vite.config.ts` - Configuration Vite
- `tsconfig.json` - Configuration TypeScript
- `tailwind.config.js` - Configuration CSS
- `src/` - Code source principal
- `public/` - Assets statiques

### Fichiers Archivés
- `archive/` - Historique du développement
- `final-docs/` - Documentation finale

### Outils de Développement
- `development-tools/` - Scripts utilitaires

## 📊 Monitoring

Surveiller :
- Performance du build
- Taille du bundle
- Erreurs TypeScript
- Sécurité des dépendances

EOF

# 9. RÉSUMÉ FINAL
echo ""
echo "✅ NETTOYAGE TERMINÉ !"
echo ""
echo "📊 Résumé des actions :"

ARCHIVED_DOCS=$(find archive/documentation -name "*.md" 2>/dev/null | wc -l)
ARCHIVED_TESTS=$(find archive/tests -name "*.js" -o -name "*.sh" 2>/dev/null | wc -l)
ARCHIVED_CONFIGS=$(find archive/config -name "*.*" 2>/dev/null | wc -l)

echo "📚 Documentation archivée : $ARCHIVED_DOCS fichiers"
echo "🧪 Scripts de test archivés : $ARCHIVED_TESTS fichiers" 
echo "⚙️ Configurations archivées : $ARCHIVED_CONFIGS fichiers"

# Compter les fichiers restants à la racine
REMAINING_FILES=$(find . -maxdepth 1 -type f | wc -l)
echo "📁 Fichiers restants à la racine : $REMAINING_FILES"

echo ""
echo "🎯 Structure finale :"
echo "├── 📄 Fichiers essentiels (package.json, vite.config.ts, etc.)"
echo "├── 📂 src/ - Code source principal"
echo "├── 📂 public/ - Assets statiques"
echo "├── 📂 final-docs/ - Documentation finale"
echo "├── 📂 archive/ - Historique du développement"
echo "└── 📂 development-tools/ - Outils de développement"

echo ""
echo "🚀 Le projet est maintenant propre et organisé !"
echo "   Démarrez avec : npm run dev"
