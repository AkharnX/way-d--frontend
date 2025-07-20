#!/bin/bash

echo "🔧 Rebuilding Way-d Profile Service with SQL Corrections..."

cd /home/akharn/way-d/backend

# Arrêter le service profile
echo "📴 Stopping wayd-profile service..."
docker stop wayd-profile

# Rebuilder l'image profile
echo "🏗️ Rebuilding profile service..."
docker-compose build wayd-profile

# Redémarrer le service
echo "🚀 Starting wayd-profile service..."
docker-compose up -d wayd-profile

# Attendre le démarrage
echo "⏳ Waiting for service to start..."
sleep 5

# Vérifier les logs
echo "📋 Checking service logs..."
docker logs wayd-profile --tail=10

echo "✅ Profile service rebuild complete!"
