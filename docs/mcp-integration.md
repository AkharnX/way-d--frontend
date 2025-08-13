# Intégration Model Context Protocol (MCP) - Way-d

Ce document explique l'intégration du serveur MCP dans le projet Way-d pour améliorer l'assistance IA.

## 🎯 Objectif

Le serveur MCP permet aux outils d'IA (Claude, GitHub Copilot, etc.) d'avoir un accès structuré au projet Way-d, facilitant :
- L'analyse de code automatisée
- La compréhension du contexte projet
- L'assistance au développement plus précise
- La maintenance et le débogage

## 🏗️ Architecture MCP

```
Way-d Frontend/
├── mcp-server/           # Serveur MCP dédié
│   ├── src/             # Code source TypeScript
│   ├── dist/            # Code compilé
│   ├── package.json     # Dépendances MCP
│   └── README.md        # Documentation MCP
├── src/                 # Code frontend React
└── package.json         # Scripts MCP intégrés
```

## 🚀 Installation et Configuration

### 1. Installation des dépendances MCP
```bash
npm run mcp:build
```

### 2. Configuration automatique
```bash
npm run mcp:setup
```

Cette commande :
- ✅ Vérifie les prérequis Node.js 18+
- ✅ Compile le serveur MCP
- ✅ Configure Claude Desktop automatiquement
- ✅ Teste la connectivité MCP

### 3. Test des fonctionnalités
```bash
npm run mcp:test
```

## 🛠️ Outils MCP Disponibles

### 1. **analyze_project_structure**
Analyse complète de l'architecture Way-d
```json
{
  "depth": 3,
  "includeMetrics": true
}
```

**Utilisation IA :**
> "Analyse la structure actuelle du projet Way-d"

### 2. **get_api_endpoints**
Extraction automatique des endpoints API
```json
{
  "service": "auth",
  "includeParams": true
}
```

**Utilisation IA :**
> "Liste tous les endpoints du service d'authentification"

### 3. **check_git_status**
Statut Git et historique des commits
```json
{
  "limit": 10,
  "includeDiff": true
}
```

**Utilisation IA :**
> "Quel est l'état actuel des modifications Git ?"

### 4. **analyze_typescript_errors**
Détection et suggestions de correctifs TypeScript
```json
{
  "file": "src/services/api.ts",
  "suggestFixes": true
}
```

**Utilisation IA :**
> "Analyse les erreurs TypeScript dans le fichier API"

### 5. **get_component_usage**
Recherche d'utilisation des composants React
```json
{
  "componentName": "ProfileCard",
  "includeProps": true
}
```

**Utilisation IA :**
> "Où est utilisé le composant ProfileCard ?"

### 6. **check_api_health**
Vérification en temps réel des microservices
```json
{
  "services": ["auth", "profile", "interactions"],
  "timeout": 5000
}
```

**Utilisation IA :**
> "Vérifie la santé de tous les services backend"

### 7. **generate_deployment_report**
Rapport complet de l'état de déploiement
```json
{
  "includeTests": true,
  "checkDependencies": true
}
```

**Utilisation IA :**
> "Génère un rapport de déploiement complet"

## 🔧 Configuration Avancée

### Configuration Claude Desktop
Le fichier de configuration est automatiquement créé dans :
```
~/.config/claude-desktop/claude_desktop_config.json
```

Configuration manuelle :
```json
{
  "mcpServers": {
    "way-d": {
      "command": "node",
      "args": ["/chemin/vers/way-d/frontend/mcp-server/dist/index.js"],
      "cwd": "/chemin/vers/way-d/frontend",
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### Configuration VS Code + GitHub Copilot
Ajoutez à `.vscode/settings.json` :
```json
{
  "github.copilot.advanced": {
    "mcpServers": ["way-d"]
  },
  "github.copilot.chat.welcomeMessage": "Serveur MCP Way-d connecté - Assistance IA améliorée disponible"
}
```

## 🎯 Cas d'Usage

### Développement Quotidien
```bash
# Démarrer le serveur MCP en développement
npm run mcp:dev

# Dans une autre fenêtre de terminal
npm run dev
```

### Débogage et Analyse
```bash
# Analyser les erreurs TypeScript
npm run mcp:test

# Vérifier la santé des services
curl -X POST localhost:8080/mcp \
  -d '{"method": "tools/call", "params": {"name": "check_api_health"}}'
```

### Assistance IA Contextuelle
Avec le serveur MCP actif, les outils d'IA peuvent :
- 🔍 Comprendre automatiquement la structure du projet
- 🔧 Suggérer des correctifs basés sur le contexte réel
- 📊 Analyser les performances et l'état du projet
- 🚀 Proposer des optimisations de déploiement

## 📊 Métriques et Monitoring

### Logs du Serveur MCP
```bash
# Voir les logs en temps réel
cd mcp-server
npm run dev 2>&1 | tail -f
```

### Performance
- ⚡ Temps de réponse moyen : < 500ms
- 🔄 Outils disponibles : 7
- 📁 Ressources exposées : Tous fichiers projet
- 🔒 Sécurité : Accès local uniquement

## 🚨 Dépannage

### Problèmes Courants

**1. Serveur MCP ne démarre pas**
```bash
# Vérifier les dépendances
cd mcp-server && npm install

# Recompiler
npm run build
```

**2. Claude Desktop ne voit pas le serveur**
```bash
# Reconfigurer
npm run mcp:setup

# Redémarrer Claude Desktop
```

**3. Erreurs de permissions**
```bash
# Corriger les permissions des scripts
chmod +x mcp-server/*.sh
```

### Debug Mode
```bash
# Démarrer en mode debug
cd mcp-server
DEBUG=mcp:* npm run dev
```

## 🔄 Mise à Jour

### Mise à jour du serveur MCP
```bash
# Arrêter le serveur
pkill -f "node.*mcp-server"

# Mettre à jour les dépendances
cd mcp-server && npm update

# Recompiler
npm run build

# Redémarrer
npm run mcp:setup
```

### Nouvelles fonctionnalités
Le serveur MCP est extensible. Pour ajouter de nouveaux outils :
1. Modifier `src/index.ts`
2. Ajouter le nouvel outil dans `ListToolsRequestSchema`
3. Implémenter la logique dans `CallToolRequestSchema`
4. Recompiler avec `npm run build`

## 📚 Ressources

- [Documentation MCP Officielle](https://modelcontextprotocol.io/)
- [SDK TypeScript MCP](https://github.com/modelcontextprotocol/typescript-sdk)
- [Exemples d'intégration](https://github.com/modelcontextprotocol/servers)

---

**Note :** Le serveur MCP améliore significativement l'assistance IA en fournissant un contexte projet complet et structuré.
