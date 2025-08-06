#!/bin/bash

# Script pour nettoyer toutes les données statiques du frontend Way-D
echo "🧹 Nettoyage des données statiques dans le frontend Way-D..."

# Rechercher tous les fichiers avec des données statiques problématiques
echo "🔍 Recherche des données statiques..."

# Chercher les occurrences de données statiques
echo "Fichiers avec des données statiques trouvés :"
grep -r "reçu.*\d.*nouveau\|nouveau.*J'aime\|nouveau.*match\|Sarah\|Marie\|Jean\|Pierre" src/ --include="*.tsx" --include="*.ts" || echo "Aucune donnée statique problématique trouvée dans les fichiers TS/TSX"

# Chercher des useState avec des objets contenant des chiffres hardcodés
echo -e "\n📊 Recherche des useState avec des valeurs numériques hardcodées..."
grep -r "useState.*{.*:.*[0-9]" src/ --include="*.tsx" --include="*.ts" || echo "Aucun useState avec des valeurs numériques hardcodées trouvé"

# Chercher des messages de fausses notifications
echo -e "\n📢 Recherche des fausses notifications..."
grep -r "Vous avez reçu\|3 nouveaux\|Nouveau match avec\|2 nouveaux messages" src/ --include="*.tsx" --include="*.ts" || echo "Aucune fausse notification trouvée"

# Chercher des conseils du jour statiques
echo -e "\n💡 Recherche des conseils du jour statiques..."
grep -r "Conseil du jour\|40%\|Complétez votre profil avec plus de photos" src/ --include="*.tsx" --include="*.ts" || echo "Aucun conseil statique trouvé"

# Chercher des stats hardcodées
echo -e "\n📈 Recherche des statistiques hardcodées..."
grep -r "totalLikes.*[1-9]\|totalMatches.*[1-9]\|newMessages.*[1-9]\|profileViews.*[1-9]" src/ --include="*.tsx" --include="*.ts" || echo "Aucune statistique hardcodée trouvée"

echo -e "\n✅ Analyse terminée!"
echo -e "\n📝 Actions recommandées :"
echo "1. Remplacer toutes les données statiques par des données dynamiques"
echo "2. Masquer les fonctionnalités non implémentées"
echo "3. Utiliser des états de chargement appropriés"
echo "4. Afficher des messages informatifs quand aucune donnée n'est disponible"

echo -e "\n🎯 Prochaines étapes :"
echo "- Le Dashboard a été mis à jour avec des données dynamiques"
echo "- Vérifiez les autres composants listés ci-dessus"
echo "- Testez l'application pour vous assurer qu'aucune donnée fausse n'apparaît"
