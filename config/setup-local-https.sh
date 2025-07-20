#!/bin/bash

# 🔒 Configuration HTTPS local avec certificat auto-signé pour le développement
# Usage: ./setup-local-https.sh

echo "🔒 Configuration HTTPS local pour développement Way-d"
echo "=================================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Répertoires
CERT_DIR="./certs"
NGINX_DIR="./nginx"

echo "📁 Création des répertoires..."
mkdir -p $CERT_DIR
mkdir -p $NGINX_DIR

# Génération du certificat auto-signé
echo "🔐 Génération du certificat SSL auto-signé..."

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout $CERT_DIR/localhost.key \
    -out $CERT_DIR/localhost.crt \
    -subj "/C=FR/ST=Dev/L=Local/O=Way-d/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,DNS:127.0.0.1,IP:127.0.0.1"

echo -e "${GREEN}✅ Certificat généré dans $CERT_DIR/${NC}"

# Configuration Nginx locale
echo "⚙️  Création de la configuration Nginx locale..."

cat > $NGINX_DIR/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Logs
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    # Redirection HTTP vers HTTPS
    server {
        listen 80;
        server_name localhost 127.0.0.1;
        return 301 https://$host$request_uri;
    }
    
    # Configuration HTTPS
    server {
        listen 443 ssl http2;
        server_name localhost 127.0.0.1;
        
        # Certificats SSL
        ssl_certificate /etc/nginx/certs/localhost.crt;
        ssl_certificate_key /etc/nginx/certs/localhost.key;
        
        # Configuration SSL moderne
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        
        # En-têtes de sécurité
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' wss: https: ws://localhost:*; frame-ancestors 'none';" always;
        
        # Frontend (React/Vite)
        location / {
            proxy_pass http://host.docker.internal:5173;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
        
        # API Backend - Service Auth
        location /api/auth/ {
            proxy_pass http://host.docker.internal:8080/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # API Backend - Service Profile
        location /api/profile/ {
            proxy_pass http://host.docker.internal:8081/profile/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # API Backend - Service Interactions
        location /api/interactions/ {
            proxy_pass http://host.docker.internal:8082/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

# Docker Compose pour Nginx HTTPS local
cat > $NGINX_DIR/docker-compose.yml << EOF
version: '3.8'

services:
  nginx-https:
    image: nginx:alpine
    container_name: wayd-nginx-https
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ../certs:/etc/nginx/certs:ro
    restart: unless-stopped
    extra_hosts:
      - "host.docker.internal:host-gateway"
    networks:
      - wayd-network

networks:
  wayd-network:
    external: false
EOF

echo -e "${GREEN}✅ Configuration Nginx créée${NC}"

# Script de démarrage
cat > start-https-dev.sh << 'EOF'
#!/bin/bash

echo "🚀 Démarrage de Way-d en mode HTTPS de développement"
echo "=================================================="

# Vérifier que les services backend sont actifs
echo "🔍 Vérification des services backend..."
cd /home/akharn/way-d/backend
if ! docker-compose ps | grep -q "Up"; then
    echo "📦 Démarrage des services backend..."
    docker-compose up -d
    sleep 5
fi

# Démarrer le frontend
echo "🌐 Démarrage du frontend..."
cd /home/akharn/way-d/frontend
npm run dev &
FRONTEND_PID=$!

# Attendre que le frontend soit prêt
sleep 3

# Démarrer Nginx HTTPS
echo "🔒 Démarrage de Nginx HTTPS..."
cd nginx
docker-compose up -d

echo ""
echo "🎉 Way-d est maintenant accessible en HTTPS !"
echo "============================================"
echo ""
echo "🌐 URL principale:"
echo "   https://localhost"
echo ""
echo "⚠️  Certificat auto-signé:"
echo "   Votre navigateur affichera un avertissement"
echo "   Cliquez sur 'Avancé' puis 'Continuer vers localhost'"
echo ""
echo "🔍 Services:"
echo "   Frontend: http://localhost:5173 (développement)"
echo "   HTTPS Proxy: https://localhost (production-like)"
echo ""
echo "🛑 Pour arrêter:"
echo "   docker-compose down (dans nginx/)"
echo "   kill $FRONTEND_PID (frontend)"
echo ""

# Attendre l'interruption
trap "echo '🛑 Arrêt des services...'; cd nginx && docker-compose down; kill $FRONTEND_PID 2>/dev/null; exit" INT
wait
EOF

chmod +x start-https-dev.sh

echo ""
echo -e "${GREEN}🎉 Configuration HTTPS locale terminée !${NC}"
echo "========================================"
echo ""
echo -e "${BLUE}📁 Fichiers créés:${NC}"
echo "   • $CERT_DIR/localhost.crt (certificat)"
echo "   • $CERT_DIR/localhost.key (clé privée)"
echo "   • $NGINX_DIR/nginx.conf (configuration Nginx)"
echo "   • $NGINX_DIR/docker-compose.yml (Docker Compose)"
echo "   • start-https-dev.sh (script de démarrage)"
echo ""
echo -e "${BLUE}🚀 Pour démarrer en HTTPS:${NC}"
echo "   ./start-https-dev.sh"
echo ""
echo -e "${BLUE}🌐 Votre site sera accessible sur:${NC}"
echo "   https://localhost"
echo ""
echo -e "${YELLOW}⚠️  Note sur le certificat auto-signé:${NC}"
echo "   Le navigateur affichera un avertissement de sécurité"
echo "   C'est normal pour un certificat auto-signé"
echo "   Cliquez sur 'Avancé' puis 'Continuer vers localhost'"
echo ""
echo -e "${GREEN}✅ Configuration terminée !${NC}"
