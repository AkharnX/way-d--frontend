# 🚀 Way-d Quick Start Guide

## Installation Ultra-Rapide

```bash
# 1. Installation automatique
./setup.sh

# 2. Démarrer l'app
./way-d-control.sh
# Puis choisir option 1 (Start Application)

# 3. Vider la BDD si besoin
./clear-db.sh
```

## Accès à l'Application

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001 (si configuré)

## Scripts Principaux

| Script | Description |
|--------|-------------|
| `./way-d-control.sh` | 🎯 Contrôle principal de l'app |
| `./tests/run-tests.sh` | 🧪 Suite de tests complète |
| `./clear-db.sh` | 🧹 Nettoyer les BDD |
| `./setup.sh` | 🛠️ Installation initiale |

## Structure Organisée

```
📁 way-d/frontend/
├── 🎯 Scripts de contrôle
├── 🧪 tests/           (32 scripts organisés)
├── 🚀 deployment/      (Scripts de déploiement)
├── 📝 logs/            (Logs de l'app)
└── 💻 src/             (Code source)
```

## Tests par Catégorie

- **auth/** - Authentification (9 scripts)
- **api/** - Backend & CORS (7 scripts) 
- **integration/** - Tests full-stack (3 scripts)
- **validation/** - Validation finale (4 scripts)
- **diagnostic/** - Debug & analysis (2 scripts)
- **utils/** - Nettoyage & outils (7 scripts)

## Status de l'App

✅ **Problème résolu** : Infinite loop refresh tokens  
✅ **PM2 configuré** : App persistante même après fermeture terminal  
✅ **Tests organisés** : 32 scripts rangés par catégorie  
✅ **BDD nettoyable** : Script de vidage des données  

## Commandes Rapides

```bash
# Démarrer
./way-d-control.sh → Option 1

# Tests auth
./tests/run-tests.sh → Option 1

# Nettoyer BDD
./clear-db.sh

# Status
./way-d-control.sh → Option 4

# Voir logs
./way-d-control.sh → Option 11
```

**C'est parti ! 🚀**
