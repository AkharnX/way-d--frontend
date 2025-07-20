#!/bin/bash

# Script pour corriger les classes CSS Tailwind invalides

echo "🔧 Correction des classes CSS Tailwind..."

# Corriger bg-primary-dark -> bg-primary-dark (couleur #021533)
find src/ -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | xargs sed -i 's/bg-primary-dark/bg-slate-900/g'

# Corriger text-primary-dark -> text-slate-900 
find src/ -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | xargs sed -i 's/text-primary-dark/text-slate-900/g'

# Corriger bg-primary-light -> bg-primary-light (couleur #40BDE0)  
find src/ -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | xargs sed -i 's/bg-primary-light/bg-cyan-400/g'

# Corriger text-primary-light -> text-cyan-400
find src/ -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" | xargs sed -i 's/text-primary-light/text-cyan-400/g'

echo "✅ Classes CSS corrigées !"

# Vérifier s'il reste des occurrences
echo "🔍 Vérification des occurrences restantes..."
REMAINING=$(grep -r "primary-dark\|primary-light" src/ | grep -v "primary-dark:" | grep -v "primary-light:" | wc -l)

if [ $REMAINING -eq 0 ]; then
    echo "✅ Toutes les classes ont été corrigées !"
else
    echo "⚠️ Il reste $REMAINING occurrences à corriger manuellement"
    grep -r "primary-dark\|primary-light" src/ | grep -v "primary-dark:" | grep -v "primary-light:" | head -5
fi
