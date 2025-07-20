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