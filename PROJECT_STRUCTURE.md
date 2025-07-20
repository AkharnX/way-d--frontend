# Way-d Frontend - Structure du Projet

## 📁 Organisation du Projet

```
way-d/frontend/
├── 📄 Configuration
│   ├── package.json          # Dépendances et scripts npm
│   ├── vite.config.ts        # Configuration Vite principale
│   ├── tailwind.config.js    # Configuration Tailwind CSS
│   ├── postcss.config.js     # Configuration PostCSS
│   ├── tsconfig.json         # Configuration TypeScript
│   └── eslint.config.js      # Configuration ESLint
│
├── 🚀 Scripts & Déploiement
│   ├── way-d.sh              # Script principal de gestion
│   ├── deployment/           # Scripts de déploiement PM2
│   └── scripts/              # Scripts de maintenance
│
├── 💻 Code Source
│   ├── src/
│   │   ├── components/       # Composants React réutilisables
│   │   ├── pages/           # Pages de l'application
│   │   ├── services/        # Services API
│   │   ├── hooks/           # Hooks React personnalisés
│   │   ├── types/           # Types TypeScript
│   │   ├── utils/           # Fonctions utilitaires
│   │   ├── App.tsx          # Composant principal
│   │   └── main.tsx         # Point d'entrée
│   │
│   ├── public/              # Assets statiques
│   │   ├── logo_blue.svg    # Logo Way-d bleu
│   │   ├── logo_white.svg   # Logo Way-d blanc
│   │   └── logo-name-blue.png # Logo avec nom
│   │
│   └── index.html           # Template HTML principal
│
├── 🧪 Tests & Validation
│   ├── tests/               # Tests organisés par type
│   │   ├── auth/           # Tests d'authentification
│   │   ├── api/            # Tests d'API
│   │   ├── integration/    # Tests d'intégration
│   │   └── validation/     # Tests de validation
│   │
│   └── run-tests.sh        # Script principal de tests
│
├── 📚 Documentation
│   ├── docs/               # Documentation complète
│   │   ├── QUICKSTART.md   # Guide de démarrage rapide
│   │   ├── PORT_CONFIGURATION.md # Configuration ports
│   │   └── HTTPS_LETSENCRYPT_CONFIG.md # Config HTTPS
│   │
│   ├── MAINTENANCE.md      # Guide de maintenance
│   └── README.md           # Documentation principale
│
├── 🏗️ Configuration Avancée  
│   ├── config/             # Configurations alternatives
│   │   ├── vite.config.https.ts    # Config HTTPS
│   │   └── vite.config.simple.ts   # Config simplifiée
│   │
│   └── certs/              # Certificats SSL/TLS
│
├── 📊 Monitoring & Logs
│   └── logs/               # Logs de l'application
│       ├── combined-0.log  # Logs combinés
│       ├── err-0.log       # Logs d'erreurs
│       └── out-0.log       # Logs de sortie
│
└── 📦 Archive & Historique
    └── archive/            # Fichiers archivés
        ├── documentation/  # Ancien docs
        ├── scripts/        # Anciens scripts
        └── tests/          # Anciens tests
```

## 🎯 Fichiers Clés

### Configuration Principale
- `vite.config.ts` - Configuration Vite avec proxy API
- `tailwind.config.js` - Styles et thème
- `package.json` - Dépendances et scripts

### Scripts de Gestion
- `way-d.sh` - Script principal (dev, build, deploy, test)
- `deployment/ecosystem.config.cjs` - Configuration PM2

### Code Source Principal
- `src/App.tsx` - Routeur et layout principal
- `src/pages/` - Pages de l'application
- `src/components/` - Composants réutilisables
- `src/services/api.ts` - Service API principal

## 🚀 Commandes Rapides

```bash
# Démarrage
./way-d.sh dev

# Build
./way-d.sh build

# Tests
./way-d.sh test

# Déploiement
./way-d.sh deploy

# Statut
./way-d.sh status
```

## 📋 Organisation des Fonctionnalités

### Pages Principales
- `Home.tsx` - Page d'accueil avec branding Way-d
- `Login.tsx` / `Register.tsx` - Authentification
- `Dashboard.tsx` - Tableau de bord utilisateur
- `Discovery.tsx` - Découverte de profils
- `CreateProfile.tsx` / `EditProfile.tsx` - Gestion profils
- `Messages.tsx` - Messagerie

### Composants Réutilisables
- `PageHeader.tsx` - En-tête de navigation
- `Navigation.tsx` - Menu principal
- `ProfileCard.tsx` - Carte de profil
- `StatsModal.tsx` - Modal de statistiques

### Services
- `api.ts` - Client API principal
- `auth.ts` - Service d'authentification
- `storage.ts` - Gestion localStorage

## 🛠️ Maintenance

Voir [MAINTENANCE.md](./MAINTENANCE.md) pour les guides de maintenance et dépannage.
