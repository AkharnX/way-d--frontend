# Configuration du Reverse Proxy Nginx pour Way-d

Ce document explique comment le reverse proxy Nginx est configuré pour l'application Way-d.

## Architecture

L'architecture de déploiement de Way-d utilise Nginx comme reverse proxy pour :
- Rediriger le trafic HTTP vers HTTPS
- Servir l'application frontend
- Rediriger les requêtes API vers les bons services backend

```
       HTTPS (443)
           ↓
┌────────────────────┐
│      NGINX         │
│   Reverse Proxy    │
└────────────────────┘
           ↓
   ┌───────┴───────┐
   ↓               ↓
┌─────┐         ┌─────┐
│ 5173│         │ 808X│
└─────┘         └─────┘
Frontend        Backend APIs
 (Vite)         (Go services)
```

## Configuration de base

Le fichier de configuration principal se trouve dans `/home/akharn/way-d/nginx.conf`.

### Redirection du frontend

La configuration redige le trafic vers l'application frontend sur le port 5173 :

```nginx
location / {
    proxy_pass http://localhost:5173;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

### Redirection des API

Les requêtes API sont redirigées vers les services backend appropriés :

```nginx
location /api/auth/ {
    proxy_pass http://localhost:8080/;
    proxy_http_version 1.1;
    # Autres en-têtes...
}

location /api/profile/ {
    proxy_pass http://localhost:8081/;
    proxy_http_version 1.1;
    # Autres en-têtes...
}

location /api/interactions/ {
    proxy_pass http://localhost:8082/api/;
    proxy_http_version 1.1;
    # Autres en-têtes...
}
```

## Sécurité

La configuration inclut diverses mesures de sécurité :
- Redirection HTTP → HTTPS
- Headers de sécurité (HSTS, CSP, etc.)
- Configuration TLS optimisée

## Mise à jour de la configuration

Pour modifier la configuration Nginx :

1. Modifier le fichier `/home/akharn/way-d/nginx.conf`
2. Tester la syntaxe : `nginx -t`
3. Redémarrer Nginx : `docker restart wayd-nginx-https` ou `systemctl restart nginx`

## Ports utilisés

- **443** : HTTPS (Nginx)
- **80** : HTTP (redirection vers HTTPS)
- **5173** : Application frontend (Vite/PM2)
- **8080** : API Auth
- **8081** : API Profile
- **8082** : API Interactions

## Tests

Pour tester si le reverse proxy fonctionne correctement :

```bash
# Test du frontend
curl -k https://localhost/

# Test de l'API Auth
curl -k https://localhost/api/auth/health

# Test de l'API Profile
curl -k https://localhost/api/profile/health
```
