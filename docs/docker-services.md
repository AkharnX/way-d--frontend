# Guide de Démarrage Docker - Way-d Backend

Ce guide explique comment démarrer et gérer tous les services backend Way-d avec Docker.

## 🚀 Démarrage Rapide

### 1. Démarrage de tous les services
```bash
cd /home/akharn/way-d
./start-all-services.sh
```

### 2. Vérification des services
```bash
./check-services.sh
```

### 3. Arrêt des services
```bash
docker-compose down
```

## 🛠️ Commandes Docker Utiles

### Gestion des Services
```bash
# Démarrer tous les services
./start-all-services.sh

# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v

# Redémarrer un service spécifique
docker-compose restart auth-service

# Voir les logs d'un service
docker-compose logs -f auth-service

# Voir l'état des conteneurs
docker-compose ps
```

### Construction et Débogage
```bash
# Reconstruire tous les services
docker-compose build --no-cache

# Reconstruire un service spécifique
docker-compose build auth-service

# Entrer dans un conteneur
docker-compose exec auth-service /bin/sh

# Voir les logs de tous les services
docker-compose logs -f
```

## 📊 Services et Ports

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| Auth | 8080 | http://localhost:8080 | Service d'authentification |
| Profile | 8081 | http://localhost:8081 | Gestion des profils utilisateur |
| Interactions | 8082 | http://localhost:8082 | Likes, matches, messages |
| Events | 8083 | http://localhost:8083 | Événements communautaires |
| Payments | 8084 | http://localhost:8084 | Paiements et abonnements |
| Notifications | 8085 | http://localhost:8085 | Notifications push/email |
| Moderation | 8086 | http://localhost:8086 | Modération de contenu |
| Analytics | 8087 | http://localhost:8087 | Analytiques et métriques |
| Administration | 8088 | http://localhost:8088 | Administration système |

### Infrastructure
| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Base de données avec PostGIS |
| Redis | 6379 | Cache et sessions |

## 🔍 Vérifications de Santé

### Test manuel des endpoints
```bash
# Vérifier le service Auth
curl http://localhost:8080/health

# Vérifier tous les services
for port in 8080 8081 8082 8083 8084 8085 8086 8087 8088; do
  echo "Testing port $port:"
  curl -s http://localhost:$port/health || echo "Service on port $port is down"
done
```

### Script automatique
```bash
./check-services.sh
```

## 🐛 Dépannage

### Problèmes Courants

**1. Service ne démarre pas**
```bash
# Voir les logs spécifiques
docker-compose logs service-name

# Redémarrer le service
docker-compose restart service-name
```

**2. Base de données non accessible**
```bash
# Vérifier PostgreSQL
docker-compose logs postgres

# Se connecter à la base
docker-compose exec postgres psql -U wayd_user -d wayd_main
```

**3. Port déjà utilisé**
```bash
# Voir quel processus utilise le port
lsof -i :8080

# Arrêter tous les services
docker-compose down
```

**4. Problèmes PostGIS**
```bash
# Vérifier l'extension PostGIS
docker-compose exec postgres psql -U wayd_user -d wayd_profiles -c "SELECT PostGIS_version();"
```

### Nettoyage Complet
```bash
# Arrêter et supprimer tout
docker-compose down -v --remove-orphans

# Supprimer les images
docker-compose down --rmi all

# Nettoyer Docker
docker system prune -a
```

## 📝 Logs et Monitoring

### Voir les logs
```bash
# Logs de tous les services
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f auth-service

# Dernières 100 lignes
docker-compose logs --tail=100 auth-service
```

### Monitoring des ressources
```bash
# Utilisation des ressources
docker stats

# Espace disque utilisé
docker system df
```

## 🔧 Configuration des Services

### Variables d'environnement
Chaque service utilise ces variables :
- `DB_HOST=postgres`
- `DB_PORT=5432`
- `DB_USER=wayd_user`
- `DB_PASSWORD=wayd_password`
- `DB_NAME=wayd_[service_name]`
- `JWT_SECRET=your-secret-key`

### Configuration spécifique
- **Payments**: `STRIPE_SECRET_KEY`
- **Notifications**: `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`

## 🚀 Intégration Frontend

### Depuis le frontend Way-d
```bash
cd /home/akharn/way-d/frontend

# Démarrer backend avec Docker
npm run start:docker

# Vérifier les services
npm run check:services

# Voir les logs
npm run logs:docker

# Arrêter les services
npm run stop:docker
```

### Test d'intégration
```bash
# Démarrer backend
npm run start:docker

# Démarrer frontend
npm run dev

# L'application complète sera disponible sur http://localhost:5173
```

## 📋 Commandes de Maintenance

### Sauvegarde de la base de données
```bash
docker-compose exec postgres pg_dump -U wayd_user wayd_main > backup.sql
```

### Restauration
```bash
docker-compose exec -T postgres psql -U wayd_user wayd_main < backup.sql
```

### Mise à jour des services
```bash
# Arrêter les services
docker-compose down

# Mettre à jour le code
git pull

# Reconstruire et démarrer
./start-all-services.sh
```

---

**Note**: Tous les services sont configurés pour redémarrer automatiquement en cas d'échec avec Docker Compose.
