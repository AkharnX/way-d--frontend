# 🚀 Way-d - Configuration des Ports

## Port Frontend OBLIGATOIRE : 5173

⚠️ **IMPORTANT** : L'application frontend Way-d **DOIT** fonctionner sur le port **5173**.

### Pourquoi le port 5173 ?

Le backend de Way-d est configuré pour accepter les connexions CORS uniquement depuis le port **5173**. 
Utiliser un autre port causera des erreurs CORS et empêchera la communication avec le backend.

### Configuration des Ports

```
Frontend:  http://localhost:5173  ✅ OBLIGATOIRE
Backend:   http://localhost:3001  ✅ CONFIGURÉ
```

### Vérification de la Configuration

#### 1. Vite Config (vite.config.ts)
```typescript
export default defineConfig({
  server: {
    port: 5173,        // Port fixé à 5173
    host: '0.0.0.0',
    cors: {
      origin: true,
      credentials: true,
    },
  }
})
```

#### 2. Package.json
```json
{
  "scripts": {
    "dev": "vite",     // Utilise automatiquement le port 5173
    "preview": "vite preview"
  }
}
```

### Commandes de Démarrage

#### Développement
```bash
npm run dev                    # Démarrage normal sur port 5173
./way-d-control.sh            # Option 1: Start Application
./deployment/deploy-pm2.sh    # Déploiement persistant PM2
```

#### Production avec PM2
```bash
# Mode développement persistant
pm2 start "npm run dev" --name "way-d-frontend"

# Mode production (avec build)
npm run build
pm2 start "serve -s dist -p 5173" --name "way-d-frontend"
```

### Dépannage Port

#### Vérifier si le port 5173 est libre
```bash
lsof -i :5173
# ou
netstat -tulpn | grep :5173
```

#### Libérer le port 5173 si occupé
```bash
# Trouver le processus
lsof -ti :5173

# Arrêter le processus
kill -9 $(lsof -ti :5173)

# Ou avec PM2
pm2 stop way-d-frontend
pm2 delete way-d-frontend
```

### Erreurs Communes

#### ❌ Port Incorrect
```
Error: CORS policy: No 'Access-Control-Allow-Origin' header
```
**Solution**: Vérifier que l'app fonctionne sur http://localhost:5173

#### ❌ Backend Non Accessible
```
Error: Network Error / Connection refused
```
**Solution**: Vérifier que le backend fonctionne sur http://localhost:3001

### Architecture Réseau

```
Frontend (React/Vite)  ←→  Backend API
Port 5173 (OBLIGATOIRE)    Port 3001

Proxy Configuration:
/api/auth        → http://localhost:8080
/api/profile     → http://localhost:8081  
/api/interactions → http://localhost:8082
```

### Scripts de Contrôle

- `way-d-control.sh` - Centre de contrôle principal
- `deployment/deploy-pm2.sh` - Déploiement PM2 persistant
- `tests/run-tests.sh` - Suite de tests

### Support

Si l'application ne fonctionne pas sur le port 5173, contactez l'équipe de développement.
Ne modifiez JAMAIS la configuration du port sans coordination avec l'équipe backend.

---

🎯 **Règle d'Or** : Port 5173 = Fonctionnement garanti ✅
