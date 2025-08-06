# 🔒 Way-d - Configuration HTTPS avec Let's Encrypt

## Pourquoi HTTPS avec Let's Encrypt ?

### ❌ Configuration HTTP actuelle (Insécurisée)
- Données transmises en clair
- Vulnérable aux attaques man-in-the-middle
- Navigateurs affichent "Site non sécurisé"
- Cookies de session exposés
- Pas de chiffrement des mots de passe

### ✅ Avantages de HTTPS avec Let's Encrypt
- **Gratuit** - Certificats SSL/TLS gratuits et automatiques
- **Chiffrement** - Toutes les données sont chiffrées
- **Authentification** - Vérification de l'identité du serveur
- **Intégrité** - Protection contre la modification des données
- **SEO** - Google favorise les sites HTTPS
- **Confiance** - Cadenas vert dans le navigateur

## Configuration Let's Encrypt

### 1. Prérequis
```bash
# Nom de domaine pointant vers votre serveur
# Exemple: wayd.example.com -> 157.180.36.122

# Ports ouverts
80   # HTTP (redirection vers HTTPS)
443  # HTTPS
8080 # Backend Auth
8081 # Backend Profile  
8082 # Backend Interactions
```

### 2. Installation Certbot
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

### 3. Configuration Nginx avec Let's Encrypt
```nginx
# /etc/nginx/sites-available/wayd
server {
    listen 80;
    server_name wayd.example.com www.wayd.example.com;
    
    # Redirection automatique vers HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name wayd.example.com www.wayd.example.com;
    
    # Certificats Let's Encrypt (seront générés automatiquement)
    ssl_certificate /etc/letsencrypt/live/wayd.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wayd.example.com/privkey.pem;
    
    # Configuration SSL moderne
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # En-têtes de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Frontend (React)
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
    
    # Backend APIs
    location /api/auth/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/profile/ {
        proxy_pass http://localhost:8081/profile/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/interactions/ {
        proxy_pass http://localhost:8082/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Scripts d'automatisation

### Script de déploiement HTTPS automatique
```bash
# Installation HTTPS avec Let's Encrypt (Production)
sudo ./setup-https.sh votre-domaine.com votre-email@exemple.com

# Test HTTPS local avec certificat auto-signé (Développement)
./setup-local-https.sh
```

## Options de Configuration HTTPS

### 1. 🚀 Production avec Let's Encrypt (Recommandé)
```bash
# Prérequis
- Domaine enregistré pointant vers votre serveur
- Serveur accessible publiquement
- Ports 80 et 443 ouverts

# Installation
sudo ./setup-https.sh wayd.mondomaine.com admin@mondomaine.com

# Résultat
✅ Certificat SSL/TLS gratuit et valide
✅ Renouvellement automatique
✅ Note A+ sur SSL Labs
✅ Confiance des navigateurs
```

### 2. 🧪 Développement Local avec HTTPS
```bash
# Installation
./setup-local-https.sh

# Démarrage
./start-https-dev.sh

# Résultat
✅ HTTPS local sur https://localhost
⚠️ Certificat auto-signé (avertissement navigateur)
✅ Test des fonctionnalités HTTPS
```

### 3. 🔧 Vite HTTPS intégré
```bash
# Utiliser la configuration HTTPS Vite
cp vite.config.https.ts vite.config.ts
npm run dev

# Résultat
✅ Serveur Vite avec HTTPS sur https://localhost:5173
⚠️ Certificat auto-signé
✅ Hot reload conservé
```

## Configuration des Services Backend pour HTTPS

### Mise à jour des variables d'environnement
```bash
# backend/way-d--auth/.env
FRONTEND_URL=https://votre-domaine.com
CORS_ORIGINS=https://votre-domaine.com,https://www.votre-domaine.com

# backend/way-d--profile/.env
FRONTEND_URL=https://votre-domaine.com
CORS_ORIGINS=https://votre-domaine.com,https://www.votre-domaine.com

# backend/way-d--interactions/.env
FRONTEND_URL=https://votre-domaine.com
CORS_ORIGINS=https://votre-domaine.com,https://www.votre-domaine.com
```

### Mise à jour du frontend pour HTTPS
```typescript
// src/services/api.ts
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api/auth'  // Via proxy Nginx
  : '/api/auth'; // Via proxy Vite

// Support des cookies sécurisés
const authApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## Tests de Sécurité HTTPS

### 1. SSL Labs Test
```bash
# Tester la configuration SSL
https://www.ssllabs.com/ssltest/analyze.html?d=votre-domaine.com

# Objectif: Note A ou A+
```

### 2. Security Headers Test
```bash
# Tester les en-têtes de sécurité
https://securityheaders.com/?q=https://votre-domaine.com

# Objectif: Note A ou A+
```

### 3. Test Mozilla Observatory
```bash
# Audit de sécurité complet
https://observatory.mozilla.org/analyze/votre-domaine.com

# Objectif: Score 90+
```

## Troubleshooting HTTPS

### ❌ Erreur "Certificat non valide"
```bash
# Vérification du certificat
openssl s_client -connect votre-domaine.com:443 -servername votre-domaine.com

# Solutions
1. Vérifier la résolution DNS
2. Renouveler le certificat: certbot renew
3. Vérifier la configuration Nginx
```

### ❌ Erreur "Mixed Content"
```bash
# Problème: Contenu HTTP sur page HTTPS
# Solution: Mettre à jour tous les liens vers HTTPS

# Vite config
define: {
  VITE_API_URL: JSON.stringify(
    process.env.NODE_ENV === 'production' 
      ? 'https://votre-domaine.com/api'
      : 'http://localhost:8080'
  )
}
```

### ❌ Problèmes de CORS avec HTTPS
```bash
# Backend: Mettre à jour les origines CORS
AllowOrigins: []string{
  "https://votre-domaine.com",
  "https://www.votre-domaine.com",
},

# Frontend: Utiliser HTTPS dans les requêtes
```

## Maintenance et Monitoring

### Surveillance des certificats
```bash
# Vérification manuelle
certbot certificates

# Monitoring automatique (optionnel)
# Configuration d'alertes de renouvellement
```

### Logs et Debugging
```bash
# Logs Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Logs Let's Encrypt
tail -f /var/log/letsencrypt/letsencrypt.log
```

## Performance et Optimisation

### Configuration SSL optimisée
```nginx
# Nginx SSL optimisations
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_buffer_size 8k;
ssl_stapling on;
ssl_stapling_verify on;
```

### Compression et mise en cache
```nginx
# Gzip compression
gzip on;
gzip_types text/plain application/json application/javascript text/css;

# Cache statique
location ~* \.(js|css|png|jpg|jpeg|gif|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## Conclusion

Le HTTPS avec Let's Encrypt offre :
- ✅ **Sécurité maximale** : Chiffrement TLS 1.3
- ✅ **Gratuité** : Certificats gratuits et automatiques  
- ✅ **Confiance** : Reconnu par tous les navigateurs
- ✅ **Performance** : HTTP/2 et optimisations
- ✅ **SEO** : Favorisé par Google
- ✅ **Conformité** : RGPD et standards de sécurité

**Recommandation** : Utilisez Let's Encrypt en production et les certificats auto-signés uniquement pour le développement local.
