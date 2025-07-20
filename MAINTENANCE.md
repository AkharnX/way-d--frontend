# 🔧 Guide de Maintenance - Way-d

## 📋 Tâches de Maintenance Courantes

### Mise à jour des dépendances
```bash
npm update
npm audit fix
```

### Nettoyage du cache
```bash
npm run build -- --clean
rm -rf node_modules/.vite
```

### Tests de santé
```bash
# Vérifier que l'application démarre
npm run dev

# Tester les endpoints API
curl http://localhost:5173/api/health
```

### Logs et Debug
```bash
# Logs de développement
tail -f logs/app.log

# Analyse des performances
npm run build -- --analyze
```

## 🗂️ Structure des Fichiers

### Fichiers Essentiels à NE PAS Supprimer
- `package.json` - Configuration npm
- `vite.config.ts` - Configuration Vite
- `tsconfig.json` - Configuration TypeScript
- `tailwind.config.js` - Configuration CSS
- `src/` - Code source principal
- `public/` - Assets statiques

### Fichiers Archivés
- `archive/` - Historique du développement
- `docs/` - Documentation technique

### Outils de Développement
- `development-tools/` - Scripts utilitaires

## 📊 Monitoring

Surveiller :
- Performance du build
- Taille du bundle
- Erreurs TypeScript
- Sécurité des dépendances
