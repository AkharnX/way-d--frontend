#!/bin/bash

# Script pour tester les correctifs API dans le projet Way-d

echo "🔍 Test des correctifs API..."
echo "================================"

# Vérifier la présence des erreurs TypeScript dans api.ts
echo "Vérification des erreurs TypeScript..."
cd /home/akharn/way-d/frontend
npx tsc --noEmit --files src/services/api.ts

# Vérifier le résultat
if [ $? -eq 0 ]; then
  echo "✅ Pas d'erreurs TypeScript détectées dans api.ts"
else
  echo "❌ Des erreurs TypeScript persistent dans api.ts"
  exit 1
fi

echo "================================"
echo "✅ Test des correctifs API terminé avec succès!"
