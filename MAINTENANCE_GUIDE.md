# 🛠️ Guide de Maintenance - Projet Way-d

## 📁 Structure du Projet Organisée

Le projet Way-d a été organisé selon une structure claire et maintenable :

```
way-d/frontend/
├── 📂 src/                     # Code source principal
├── 📂 public/                  # Assets statiques
├── 📂 documentation/           # Documentation centralisée
│   ├── reports/               # Rapports d'implémentation
│   ├── guides/                # Guides techniques
│   └── INDEX.md               # Index de navigation
├── 📂 scripts/                 # Scripts organisés
│   ├── maintenance/           # Scripts de maintenance
│   ├── testing/               # Scripts de test
│   └── setup/                 # Scripts d'installation
├── 📂 tests/                   # Tests organisés
├── 📂 logs/                    # Logs centralisés
└── 📂 archive/                 # Archives historiques
```

## 🚀 Commandes de Maintenance

### Développement
```bash
# Démarrer le serveur de développement
npm run dev

# Build de production
npm run build

# Prévisualiser le build
npm run preview
```

### Services Backend
```bash
# Démarrer tous les services
./scripts/setup/start-backend-services.sh

# Arrêter tous les services
./scripts/setup/stop-backend-services.sh
```

### Tests et Diagnostics
```bash
# Tests d'intégration complets
./scripts/testing/system-test-complete.sh

# Diagnostic d'authentification
./scripts/testing/test-auth-diagnostic.sh

# Tests des endpoints dynamiques
./scripts/testing/test-endpoints-dynamic.sh
```

### Maintenance
```bash
# Nettoyage général
./scripts/maintenance/clean-and-organize.sh

# Maintenance complète
./scripts/maintenance/way-d-maintenance.sh
```

## 📚 Documentation

### Index Principal
Consultez `documentation/INDEX.md` pour la navigation complète de la documentation.

### Rapports Importants
- **UX_WORKFLOW_FIXES_COMPLETE.md** - État des corrections UX
- **MISSION_ACCOMPLISHED.md** - Statut final du projet
- **SETUP_COMPLETE.md** - Configuration terminée

### Guides Techniques
- **AUTH_DIAGNOSTIC_GUIDE.md** - Diagnostic d'authentification
- **401_ERROR_DIAGNOSTIC_README.md** - Résolution erreurs 401

## 🔧 Maintenance Régulière

### Quotidienne
- [ ] Vérifier les logs dans `logs/`
- [ ] Tester l'application : `npm run dev`
- [ ] Vérifier les services backend

### Hebdomadaire
- [ ] Lancer les tests complets : `./scripts/testing/system-test-complete.sh`
- [ ] Mettre à jour les dépendances : `npm update`
- [ ] Nettoyer les fichiers temporaires

### Mensuelle
- [ ] Archiver les anciens logs
- [ ] Réviser la documentation
- [ ] Audit de sécurité : `npm audit`

## 📋 Logs et Monitoring

### Emplacements des Logs
- **Principal** : `logs/frontend.log`
- **Build** : Logs dans le terminal lors de `npm run build`
- **Services** : Logs PM2 pour les services backend

### Surveillance
```bash
# Surveiller les logs en temps réel
tail -f logs/frontend.log

# Vérifier la santé des services
curl http://localhost:8080/health  # Auth
curl http://localhost:8081/health  # Profile
curl http://localhost:8082/health  # Interactions
```

## 🚨 Résolution de Problèmes

### Problèmes Courants

1. **Erreurs 401** : Consultez `documentation/guides/401_ERROR_DIAGNOSTIC_README.md`
2. **Services non démarrés** : `./scripts/setup/start-backend-services.sh`
3. **Build échoue** : Vérifier `package.json` et les dépendances
4. **Proxy non fonctionnel** : Vérifier `vite.config.ts`

### Diagnostic Complet
```bash
# Diagnostic automatique
./scripts/testing/complete-auth-diagnostic.sh
```

## 🎯 État Actuel du Projet

### ✅ Fonctionnalités Opérationnelles
- Authentification utilisateur
- Création/édition de profils
- Système de découverte
- Messagerie et matching
- Navigation cohérente
- Données localisées (Côte d'Ivoire)

### 🏗️ Architecture Technique
- **Frontend** : React + TypeScript + Vite
- **Backend** : Microservices Go (ports 8080-8082)
- **Proxy** : Vite dev server
- **Base de données** : PostgreSQL
- **Authentification** : JWT avec refresh tokens

### 🌟 Status : PRODUCTION READY

Le projet est entièrement fonctionnel et prêt pour la production.

---

*Guide mis à jour le 6 août 2025*
*Pour des questions : consultez la documentation dans `documentation/`*
