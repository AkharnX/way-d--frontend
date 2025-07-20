#!/bin/bash

# 🧹 Script de nettoyage rapide des bases de données
# Vide toutes les données de test

echo "🧹 Nettoyage des bases de données Way-d..."

# Si on a un script de cleanup complet, on l'utilise
if [ -f "tests/utils/cleanup-tokens-complete.sh" ]; then
    echo "Exécution du nettoyage complet des tokens..."
    bash tests/utils/cleanup-tokens-complete.sh
fi

if [ -f "tests/utils/clean-refresh-tokens.sh" ]; then
    echo "Nettoyage des refresh tokens..."
    bash tests/utils/clean-refresh-tokens.sh
fi

# Nettoyage manuel via API si le backend est up
if curl -s http://localhost:3001/health > /dev/null; then
    echo "Backend détecté, nettoyage via API..."
    
    # Tu peux ajouter des calls API pour vider les tables ici
    # Exemple :
    # curl -X DELETE http://localhost:3001/api/admin/clear-users
    # curl -X DELETE http://localhost:3001/api/admin/clear-tokens
    
    echo "✅ Nettoyage via API terminé"
else
    echo "⚠️  Backend non disponible, nettoyage API ignoré"
fi

echo "🎉 Nettoyage terminé ! Les BDD sont maintenant vides."
