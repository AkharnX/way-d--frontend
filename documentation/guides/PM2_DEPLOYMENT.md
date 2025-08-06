# Déploiement Way-d Frontend avec PM2

Ce document explique comment déployer l'application frontend Way-d avec PM2 sur le port 5173, avec une configuration Nginx comme reverse proxy.

## Prérequis

- Node.js et npm installés
- PM2 installé globalement (`npm install -g pm2`)
- Nginx configuré (optionnel, pour le reverse proxy)

## Étapes de déploiement

### 1. Nettoyer le projet

Avant de déployer, il est recommandé de nettoyer les fichiers temporaires et les builds précédents :

```bash
./clean-and-organize.sh
# Sélectionnez l'option 2 pour nettoyer les fichiers temporaires
```

### 2. Déployer avec PM2

Le script `deploy-pm2.sh` automatise le processus de déploiement :

```bash
cd /home/akharn/way-d/frontend
./deploy-pm2.sh
```

Ce script effectue les actions suivantes :
- Nettoyage du projet
- Installation des dépendances
- Construction de l'application
- Configuration du port 5173 dans Vite et Nginx
- Démarrage de l'application avec PM2

### 3. Vérification du déploiement

Après le déploiement, vous pouvez vérifier l'état de l'application :

```bash
# Vérifier le statut PM2
pm2 status

# Consulter les logs
pm2 logs way-d-frontend
```

L'application sera accessible à :
- http://localhost:5173 (direct)
- https://localhost (via Nginx, si configuré)

### 4. Commandes utiles

- Redémarrer l'application : `pm2 restart way-d-frontend`
- Arrêter l'application : `pm2 stop way-d-frontend`
- Supprimer l'application de PM2 : `pm2 delete way-d-frontend`

## Configuration du Reverse Proxy

Nginx est configuré pour rediriger les requêtes HTTPS entrantes vers l'application frontend sur le port 5173. La configuration se trouve dans `/home/akharn/way-d/nginx.conf`.

## Résolution des problèmes

Si l'application ne démarre pas correctement :

1. Vérifiez les logs PM2 : `pm2 logs way-d-frontend`
2. Vérifiez la configuration du port dans `vite.config.ts`
3. Assurez-vous que le port 5173 est libre

Pour toute autre assistance, référez-vous à la documentation complète dans le dossier `/home/akharn/way-d/frontend/documentation`.
