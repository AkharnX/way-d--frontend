# 💖 Way-d - Application de Rencontres Moderne

<p align="center">
  <img src="public/logo-name-blue.png" alt="Way-d Logo" width="300"/>
</p>

<p align="center">
  <strong>🚀 Application de rencontres complète et moderne</strong><br>
  Développée avec React, TypeScript et une architecture microservices
</p>

<p align="center">
  <a href="#-démarrage-rapide">Démarrage</a> •
  <a href="#-fonctionnalités">Fonctionnalités</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-documentation">Documentation</a>
</p>

---

## ✨ Statut du Projet

🟢 **Production Ready** - Application complète et fonctionnelle

| Component | Status | Description |
|-----------|--------|-------------|
| 🎨 **Frontend** | ✅ Complet | Interface React moderne et responsive |
| 🔐 **Authentication** | ✅ Sécurisé | JWT avec refresh automatique |
| 👤 **Profils** | ✅ Fonctionnel | Création, modification, photos |
| 🎯 **Découverte** | ✅ Intelligent | Filtrage avancé sans répétition |
| 💬 **Messages** | ✅ Temps réel | Chat entre utilisateurs |
| 📱 **Mobile** | ✅ Responsive | Design mobile-first |

## 🚀 Démarrage Rapide

### Prérequis
- **Node.js** 18+ 
- **npm** ou **yarn**
- **Backend services** (Auth, Profile, Interactions)

### Installation

```bash
# Cloner le repository
git clone https://github.com/AkharnX/way-d--frontend.git
cd way-d--frontend

# Installation des dépendances
npm install

# Lancement en développement
./way-d.sh dev
```

🌐 **L'application sera disponible sur http://localhost:5173**

## 🎯 Fonctionnalités

### 🔐 **Authentification Sécurisée**
- Login/Register avec validation
- JWT avec refresh automatique
- Vérification email
- Gestion de session robuste

### 👤 **Gestion des Profils**
- Création de profil complet
- Upload et gestion de photos
- Informations personnelles sécurisées
- Géolocalisation pour proximité

### 🎯 **Découverte Intelligente**
- Algorithme de matching avancé
- Filtres par âge, distance, intérêts
- Système like/dislike
- Évite la répétition des profils

### 💬 **Messagerie Temps Réel**
- Chat instantané entre matches
- Historique des conversations
- Statut en ligne
- Notifications push

### 📱 **Experience Mobile**
- Design responsive parfait
- PWA (Progressive Web App)
- Performance optimisée
- Navigation intuitive

## 🏗️ Architecture

```
Frontend (React + TypeScript)
├── 🎨 Interface Moderne
├── 🔄 State Management
├── 📡 API Services
└── 🎯 Component System

Backend Microservices
├── 🔐 Auth Service (Port 8080)
├── 👤 Profile Service (Port 8081)
└── 💬 Interactions Service (Port 8082)
```

### **Technologies Utilisées**

| Catégorie | Technologies |
|-----------|--------------|
| **Frontend** | React 19, TypeScript, Tailwind CSS |
| **Build** | Vite, PostCSS, ESLint |
| **Routing** | React Router v6 |
| **HTTP** | Axios, Proxy API |
| **Icons** | Lucide React |
| **Deployment** | PM2, Node.js |

## 📊 Structure du Projet

```
way-d-frontend/
├── 🎨 src/                    # Code source principal
│   ├── components/           # Composants réutilisables
│   ├── pages/               # Pages de l'application
│   ├── services/            # Services API
│   └── types/               # Types TypeScript
├── 🚀 deployment/            # Scripts de déploiement
├── 🧪 tests/                 # Tests automatisés
├── 📚 docs/                  # Documentation
├── 🛠️ scripts/               # Scripts de maintenance
└── 📦 archive/               # Fichiers historiques
```

## 🎮 Scripts Disponibles

### Script Principal `./way-d.sh`
```bash
./way-d.sh dev        # Démarrage développement
./way-d.sh build      # Build production
./way-d.sh deploy     # Déploiement PM2
./way-d.sh test       # Exécution des tests
./way-d.sh status     # Statut de l'application
./way-d.sh help       # Aide complète
```

### Git Management `./git-push.sh`
```bash
./git-push.sh push "Message de commit"   # Push rapide
./git-push.sh pull                       # Pull des changements
./git-push.sh status                     # Statut Git
```

## 📱 Pages Principales

| Page | Description | Status |
|------|-------------|---------|
| **🏠 Home** | Page d'accueil avec branding Way-d | ✅ |
| **🔐 Login/Register** | Authentification utilisateur | ✅ |
| **📊 Dashboard** | Tableau de bord personnel | ✅ |
| **🎯 Discovery** | Découverte de profils | ✅ |
| **👤 Profile** | Gestion du profil utilisateur | ✅ |
| **💬 Messages** | Messagerie instantanée | ✅ |
| **⚙️ Settings** | Paramètres et préférences | ✅ |

## 🔧 Configuration

### Variables d'Environnement
```env
VITE_API_AUTH_URL=http://localhost:8080
VITE_API_PROFILE_URL=http://localhost:8081
VITE_API_INTERACTIONS_URL=http://localhost:8082
```

### Ports par Défaut
- **Frontend**: 5173
- **Auth Service**: 8080
- **Profile Service**: 8081
- **Interactions Service**: 8082

## 🧪 Tests

```bash
# Exécuter tous les tests
./way-d.sh test

# Tests spécifiques
cd tests && ./run-tests.sh
```

## 📚 Documentation

- 📖 [Guide de Démarrage Rapide](docs/QUICKSTART.md)
- 🏗️ [Structure du Projet](PROJECT_STRUCTURE.md)
- 🔧 [Guide de Maintenance](MAINTENANCE.md)
- 🌐 [Configuration HTTPS](docs/HTTPS_LETSENCRYPT_CONFIG.md)
- 🔌 [Configuration des Ports](docs/PORT_CONFIGURATION.md)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

Développé avec ❤️ par l'équipe Way-d

---

<p align="center">
  <strong>🚀 Prêt à lancer votre application de rencontres ?</strong><br>
  <a href="#-démarrage-rapide">Commencez maintenant !</a>
</p>

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

- `docs/` - Documentation technique détaillée
- `archive/` - Historique du développement
- `development-tools/` - Outils et scripts utiles

## 🚀 Déploiement

L'application est prête pour le déploiement en production avec :
- Build optimisé
- Configuration HTTPS
- Gestion des erreurs
- Monitoring intégré

## 🔒 Sécurité

- Authentification JWT sécurisée
- Validation des données côté client
- Protection CSRF
- Headers de sécurité configurés
- Chiffrement HTTPS

## 🤝 Support

Pour toute question ou problème :
1. Vérifiez la documentation dans `docs/`
2. Consultez les logs de développement
3. Utilisez les outils de debug dans `development-tools/`

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests d'intégration
npm run test:integration

# Coverage
npm run test:coverage
```

---

**Way-d** - Créer des connexions authentiques ❤️