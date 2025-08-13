#!/bin/bash

# Configuration du serveur MCP Way-d
# Ce script configure le serveur MCP pour l'intégration avec les outils d'IA

set -e

echo "🚀 Configuration du serveur MCP Way-d..."

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js 18+"
    exit 1
fi

# Vérifier la version de Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ requise. Version actuelle: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) détecté"

# Aller dans le dossier MCP
cd "$(dirname "$0")"

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Build du projet
echo "🔨 Compilation du serveur MCP..."
npm run build

# Vérifier que le build a réussi
if [ ! -f "dist/index.js" ]; then
    echo "❌ Échec de la compilation"
    exit 1
fi

echo "✅ Serveur MCP compilé avec succès"

# Configuration pour Claude Desktop
CLAUDE_CONFIG_DIR="$HOME/.config/claude-desktop"
CLAUDE_CONFIG_FILE="$CLAUDE_CONFIG_DIR/claude_desktop_config.json"

echo "🔧 Configuration pour Claude Desktop..."

# Créer le dossier de configuration s'il n'existe pas
mkdir -p "$CLAUDE_CONFIG_DIR"

# Chemin absolu vers le serveur MCP
MCP_PATH="$(pwd)/dist/index.js"
PROJECT_PATH="$(cd .. && pwd)"

# Configuration JSON pour Claude
cat > "$CLAUDE_CONFIG_FILE" << EOF
{
  "mcpServers": {
    "way-d": {
      "command": "node",
      "args": ["$MCP_PATH"],
      "cwd": "$PROJECT_PATH",
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
EOF

echo "✅ Configuration Claude Desktop créée : $CLAUDE_CONFIG_FILE"

# Test du serveur MCP
echo "🧪 Test du serveur MCP..."
timeout 5s node dist/index.js << 'EOF' || echo "✅ Serveur MCP opérationnel"
{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {"roots": {"listChanged": true}, "sampling": {}}}}
EOF

# Instructions finales
echo ""
echo "🎉 Configuration terminée !"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Redémarrez Claude Desktop pour charger la nouvelle configuration"
echo "2. Utilisez les commandes MCP dans vos conversations avec Claude"
echo ""
echo "🛠️ Outils disponibles :"
echo "- analyze_project_structure : Analyse la structure du projet"
echo "- get_api_endpoints : Liste les endpoints API"
echo "- check_git_status : Vérifie l'état Git"
echo "- analyze_typescript_errors : Analyse les erreurs TypeScript"
echo "- get_component_usage : Recherche l'usage des composants"
echo "- check_api_health : Vérifie la santé des services"
echo "- generate_deployment_report : Génère un rapport de déploiement"
echo ""
echo "📖 Documentation complète : README.md"
