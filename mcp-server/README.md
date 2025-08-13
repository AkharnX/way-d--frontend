# Way-d MCP Server

Un serveur Model Context Protocol (MCP) pour l'application de rencontres Way-d. Ce serveur permet aux outils d'IA d'avoir un accès structuré au projet pour une meilleure assistance au développement.

## 🚀 Fonctionnalités

- **Analyse de structure de projet** : Analyse complète de l'architecture Way-d
- **Extraction d'endpoints API** : Liste tous les endpoints des microservices
- **Intégration Git** : Statut des commits et branches
- **Analyse TypeScript** : Détection d'erreurs et suggestions de correctifs
- **Usage des composants** : Recherche d'utilisation des composants React
- **Santé des API** : Vérification du statut des services backend
- **Rapports de déploiement** : Analyse complète de l'état de déploiement

## 📦 Installation

```bash
cd mcp-server
npm install
```

## 🔧 Configuration

Le serveur MCP utilise la configuration suivante :

### Services Backend Way-d
- **Auth Service** : Port 8080
- **Profile Service** : Port 8081  
- **Interactions Service** : Port 8082
- **Events Service** : Port 8083
- **Payments Service** : Port 8084
- **Notifications Service** : Port 8085
- **Moderation Service** : Port 8086
- **Analytics Service** : Port 8087
- **Admin Service** : Port 8088

## 🛠️ Utilisation

### Démarrage en développement
```bash
npm run dev
```

### Build pour production
```bash
npm run build
npm start
```

### Mode watch
```bash
npm run watch
```

## 🔧 Outils Disponibles

### 1. analyze_project_structure
Analyse la structure complète du projet Way-d
```json
{
  "depth": 3
}
```

### 2. get_api_endpoints
Extrait tous les endpoints API du projet
```json
{
  "service": "auth" // optionnel
}
```

### 3. check_git_status
Vérifie le statut Git et les commits récents
```json
{
  "limit": 10
}
```

### 4. analyze_typescript_errors
Analyse les erreurs TypeScript et suggère des correctifs
```json
{
  "file": "src/services/api.ts" // optionnel
}
```

### 5. get_component_usage
Trouve toutes les utilisations d'un composant React
```json
{
  "componentName": "Button"
}
```

### 6. check_api_health
Vérifie la santé des services backend
```json
{
  "services": ["auth", "profile"] // optionnel
}
```

### 7. generate_deployment_report
Génère un rapport complet de déploiement
```json
{
  "includeTests": true
}
```

## 📚 Ressources

Le serveur MCP expose automatiquement tous les fichiers du projet comme ressources :
- Fichiers TypeScript/JavaScript (`.ts`, `.tsx`, `.js`, `.jsx`)
- Documentation Markdown (`.md`)
- Configuration JSON (`.json`)

## 🔗 Intégration avec les outils IA

### Configuration Claude Desktop
Ajoutez cette configuration à votre `claude_desktop_config.json` :

```json
{
  "mcpServers": {
    "way-d": {
      "command": "node",
      "args": ["/home/akharn/way-d/frontend/mcp-server/dist/index.js"],
      "cwd": "/home/akharn/way-d/frontend"
    }
  }
}
```

### Configuration VS Code
Pour utiliser avec GitHub Copilot dans VS Code, ajoutez à votre configuration :

```json
{
  "github.copilot.chat.welcomeMessage": "Serveur MCP Way-d connecté",
  "github.copilot.advanced": {
    "mcpServers": ["way-d"]
  }
}
```

## 🚀 Exemples d'usage

### Analyse rapide du projet
```typescript
// L'IA peut maintenant analyser automatiquement :
// - Structure des dossiers et fichiers
// - Dépendances et scripts npm
// - Configuration des services

await mcpServer.call('analyze_project_structure', { depth: 2 });
```

### Vérification de santé des services
```typescript
// Vérification automatique des 9 microservices Way-d
await mcpServer.call('check_api_health');
```

### Recherche d'utilisation de composants
```typescript
// Trouve tous les usages du composant ProfileCard
await mcpServer.call('get_component_usage', { 
  componentName: 'ProfileCard' 
});
```

## 🔧 Développement

### Structure du serveur
```
src/
├── index.ts          # Serveur MCP principal
├── handlers/         # Gestionnaires d'outils
├── resources/        # Gestionnaires de ressources
└── utils/           # Utilitaires
```

### Ajout d'un nouvel outil
1. Définir l'outil dans `ListToolsRequestSchema`
2. Ajouter le gestionnaire dans `CallToolRequestSchema`
3. Implémenter la logique métier
4. Tester avec les outils d'IA

## 📋 Scripts disponibles

```bash
npm run build        # Compile TypeScript
npm run dev         # Démarrage en développement
npm run start       # Démarrage en production
npm run watch       # Mode watch
npm run type-check  # Vérification des types
npm run clean       # Nettoie le dossier dist
```

## 🐛 Débogage

### Logs du serveur
Le serveur utilise `console.error` pour les logs système :
```bash
# Voir les logs en temps réel
npm run dev 2>&1 | tail -f
```

### Test des outils
```bash
# Test d'un outil spécifique
echo '{"method": "tools/call", "params": {"name": "check_git_status"}}' | npm run dev
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Ajouter des tests pour les nouveaux outils
4. Soumettre une pull request

## 📄 Licence

MIT - Voir le fichier [LICENSE](../LICENSE) pour plus de détails.

---

Développé avec 💜 pour Way-d par AkharnX
