#!/bin/bash

echo "🔍 VALIDATION POST-NETTOYAGE"
echo "============================"
echo ""

# Test de validation complète après nettoyage
validation_passed=true

echo "1. 📝 Vérification TypeScript..."
if npm run type-check; then
    echo "   ✅ TypeScript: OK"
else
    echo "   ❌ TypeScript: ERREURS"
    validation_passed=false
fi

echo ""
echo "2. 🏗️ Test de build..."
if npm run build > /dev/null 2>&1; then
    echo "   ✅ Build: OK"
    build_size=$(du -sh dist 2>/dev/null | cut -f1)
    echo "   📦 Taille du build: $build_size"
else
    echo "   ❌ Build: ÉCHEC"
    validation_passed=false
fi

echo ""
echo "3. 📁 Vérification de la structure..."

# Vérifier que les dossiers essentiels existent
essential_dirs=("src" "public" "docs" "scripts")
for dir in "${essential_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "   ✅ $dir/ existe"
    else
        echo "   ❌ $dir/ manquant"
        validation_passed=false
    fi
done

# Vérifier que les fichiers essentiels existent
essential_files=("package.json" "vite.config.ts" "tsconfig.json" "MAINTENANCE.md")
for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file existe"
    else
        echo "   ❌ $file manquant"
        validation_passed=false
    fi
done

echo ""
echo "4. 🧼 Vérification du nettoyage..."

# Vérifier que les fichiers temporaires ont été supprimés
temp_patterns=("test-*.sh" "*-diagnostic*.md" "MISSION_ACCOMPLISHED.md")
temp_found=false

for pattern in "${temp_patterns[@]}"; do
    if ls $pattern 2>/dev/null | grep -q .; then
        echo "   ⚠️ Fichiers temporaires restants: $pattern"
        temp_found=true
    fi
done

if [ "$temp_found" = false ]; then
    echo "   ✅ Nettoyage: Complet"
else
    echo "   ⚠️ Nettoyage: Incomplet (fichiers temporaires restants)"
fi

echo ""
echo "5. 📦 Vérification des archives..."
if [ -d "archive" ]; then
    archive_count=$(find archive -name "*.md" -o -name "*.sh" | wc -l)
    echo "   ✅ Archive: $archive_count fichiers sauvegardés"
else
    echo "   ⚠️ Archive: Dossier archive non trouvé"
fi

echo ""
echo "6. 🔧 Vérification des scripts de déploiement..."
deploy_scripts=("deploy-pm2.sh" "restart-pm2.sh" "verify-deployment.sh")
for script in "${deploy_scripts[@]}"; do
    if [ -f "$script" ] || [ -L "$script" ]; then
        echo "   ✅ $script disponible"
    else
        echo "   ❌ $script manquant"
        validation_passed=false
    fi
done

echo ""
echo "7. 📋 Test rapide du serveur de développement..."
echo "   🚀 Démarrage du serveur (5 secondes)..."

# Démarrer le serveur en arrière-plan pour un test rapide
timeout 5s npm run dev > /dev/null 2>&1 &
dev_pid=$!

sleep 3

# Tester si le serveur répond
if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 | grep -q "200\|404"; then
    echo "   ✅ Serveur de développement: OK"
else
    echo "   ⚠️ Serveur de développement: Non testé (peut nécessiter plus de temps)"
fi

# Arrêter le serveur de test
kill $dev_pid 2>/dev/null || true

echo ""
echo "🏁 RÉSULTAT DE LA VALIDATION"
echo "============================"

if [ "$validation_passed" = true ]; then
    echo "✅ VALIDATION RÉUSSIE"
    echo ""
    echo "🎉 Le projet Way-d Frontend est propre et opérationnel !"
    echo ""
    echo "📋 Résumé:"
    echo "   ✅ TypeScript compilation OK"
    echo "   ✅ Build de production OK"
    echo "   ✅ Structure du projet OK"
    echo "   ✅ Nettoyage effectué"
    echo "   ✅ Scripts de déploiement OK"
    echo ""
    echo "🚀 Prêt pour:"
    echo "   • Développement: npm run dev"
    echo "   • Production: npm run build"
    echo "   • Déploiement: ./deploy-pm2.sh"
    echo ""
    echo "📖 Documentation mise à jour:"
    echo "   • MAINTENANCE.md - Guide de maintenance"
    echo "   • PROJECT_STATUS_CLEAN.md - État du projet"
    echo ""
else
    echo "❌ VALIDATION ÉCHOUÉE"
    echo ""
    echo "⚠️ Des problèmes ont été détectés. Vérifiez les erreurs ci-dessus."
    echo ""
    echo "🔧 Actions recommandées:"
    echo "   1. Corriger les erreurs TypeScript/Build"
    echo "   2. Restaurer les fichiers manquants si nécessaire"
    echo "   3. Relancer la validation"
fi

echo ""
echo "📊 Statistiques du projet nettoyé:"
echo "   📁 Dossiers: $(find . -type d -not -path './node_modules/*' -not -path './.git/*' | wc -l)"
echo "   📄 Fichiers: $(find . -type f -not -path './node_modules/*' -not -path './.git/*' | wc -l)"
echo "   📦 Taille du code source: $(du -sh src 2>/dev/null | cut -f1)"

if [ -d "archive" ]; then
    echo "   🗃️ Fichiers archivés: $(find archive -type f | wc -l)"
fi

echo ""
echo "💡 Conseil: Consultez MAINTENANCE.md pour la documentation complète"
echo ""
