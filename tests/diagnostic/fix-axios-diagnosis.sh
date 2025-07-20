#!/bin/bash

echo "🔧 Test de diagnostic des problèmes Axios et de connexion"
echo "======================================================="

# 1. Test direct des services backend
echo ""
echo "1. Test des services backend (sans proxy):"
echo "----------------------------------------"

# Test service auth
echo -n "   Service Auth (8080): "
if timeout 3 curl -s http://localhost:8080/login -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"wrong"}' > /dev/null 2>&1; then
    echo "✅ ACCESSIBLE"
else
    echo "❌ INACCESSIBLE"
fi

# Test service profile
echo -n "   Service Profile (8081): "
if timeout 3 curl -s http://localhost:8081/profile/me -H "Authorization: Bearer fake" > /dev/null 2>&1; then
    echo "✅ ACCESSIBLE"
else
    echo "❌ INACCESSIBLE"
fi

# Test service interactions
echo -n "   Service Interactions (8082): "
if timeout 3 curl -s http://localhost:8082/api/matches -H "Authorization: Bearer fake" > /dev/null 2>&1; then
    echo "✅ ACCESSIBLE"
else
    echo "❌ INACCESSIBLE"
fi

# 2. Nettoyage et redémarrage du frontend
echo ""
echo "2. Nettoyage et redémarrage du frontend:"
echo "---------------------------------------"

# Tuer tous les processus vite
pkill -f "vite" 2>/dev/null || true
pkill -f "esbuild" 2>/dev/null || true
sleep 2

echo "   ✅ Processus Vite arrêtés"

# 3. Instructions pour résoudre les problèmes
echo ""
echo "3. Solution aux problèmes:"
echo "-------------------------"
echo "   📝 Problème identifié: Multiple instances de Vite + proxy mal configuré"
echo "   🔧 Actions effectuées:"
echo "      - Arrêt de tous les processus Vite en cours"
echo "      - Correction du proxy Vite (localhost au lieu de 127.0.0.1)"
echo "      - Configuration du port fixe 5173"
echo ""
echo "   ✅ Pour relancer le frontend:"
echo "      cd /home/akharn/way-d/frontend && npm run dev"
echo ""
echo "   🎯 URL à utiliser:"
echo "      - Local: http://localhost:5173"
echo "      - Réseau: http://157.180.36.122:5173"
echo ""
echo "   🔍 Pour tester la connexion:"
echo "      - Email: test@example.com"
echo "      - Password: password123"
echo ""
echo "   📊 Vérifications à faire:"
echo "      - F12 → Network → Voir les requêtes vers /api/auth/login"
echo "      - Vérifier que le proxy redirige bien vers localhost:8080"
echo "      - Vérifier que le token est bien stocké dans localStorage"

echo ""
echo "🚀 Prêt à redémarrer le frontend sur un seul port !"
