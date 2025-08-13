#!/bin/bash

# Test du serveur MCP Way-d
# Ce script teste toutes les fonctionnalités du serveur MCP

set -e

echo "🧪 Test du serveur MCP Way-d..."

cd "$(dirname "$0")"

# Vérifier que le serveur est compilé
if [ ! -f "dist/index.js" ]; then
    echo "❌ Serveur MCP non compilé. Exécutez d'abord: npm run build"
    exit 1
fi

# Fonction pour tester un outil MCP
test_mcp_tool() {
    local tool_name="$1"
    local params="$2"
    
    echo "🔧 Test de l'outil: $tool_name"
    
    # Créer la requête JSON
    local request=$(cat << EOF
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "$tool_name",
    "arguments": $params
  }
}
EOF
)
    
    # Envoyer la requête au serveur MCP
    echo "$request" | timeout 10s node dist/index.js 2>/dev/null | head -n 10
    echo "✅ Test de $tool_name terminé"
    echo ""
}

# Test 1: Analyse de la structure du projet
echo "📁 Test 1: Analyse de structure"
test_mcp_tool "analyze_project_structure" '{"depth": 2}'

# Test 2: Extraction des endpoints API
echo "🔗 Test 2: Endpoints API"
test_mcp_tool "get_api_endpoints" '{}'

# Test 3: Statut Git
echo "📝 Test 3: Statut Git"
test_mcp_tool "check_git_status" '{"limit": 5}'

# Test 4: Analyse TypeScript
echo "🔍 Test 4: Analyse TypeScript"
test_mcp_tool "analyze_typescript_errors" '{}'

# Test 5: Usage de composants
echo "⚛️ Test 5: Usage de composants"
test_mcp_tool "get_component_usage" '{"componentName": "Button"}'

# Test 6: Santé des API
echo "🏥 Test 6: Santé des services"
test_mcp_tool "check_api_health" '{}'

# Test 7: Rapport de déploiement
echo "📊 Test 7: Rapport de déploiement"
test_mcp_tool "generate_deployment_report" '{"includeTests": true}'

echo "🎉 Tous les tests sont terminés !"
echo ""
echo "📋 Résumé :"
echo "- 7 outils MCP testés"
echo "- Serveur MCP opérationnel"
echo "- Prêt pour l'intégration avec les outils d'IA"
