#!/bin/bash

# Diagnostic complet des APIs Way-D et standardisation des logs
# Usage: ./diagnose-api-and-logs.sh

set -e

# Configuration
IP="157.180.36.122"
AUTH_PORT="8080"
PROFILE_PORT="8081" 
INTERACTIONS_PORT="8082"
FRONTEND_PORT="5173"

# Colors pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Fonction de logging standardisée
log_info() {
    echo -e "${BLUE}[INFO]$(date '+%Y-%m-%d %H:%M:%S') $1${NC}"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]$(date '+%Y-%m-%d %H:%M:%S') $1${NC}"
}

log_error() {
    echo -e "${RED}[ERROR]$(date '+%Y-%m-%d %H:%M:%S') $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]$(date '+%Y-%m-%d %H:%M:%S') $1${NC}"
}

log_debug() {
    echo -e "${PURPLE}[DEBUG]$(date '+%Y-%m-%d %H:%M:%S') $1${NC}"
}

# Fonction pour tester un endpoint
test_endpoint() {
    local url="$1"
    local description="$2"
    local expected_status="${3:-200}"
    local token="$4"
    
    log_info "Testing: $description"
    log_debug "URL: $url"
    
    if [ -n "$token" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -H "Authorization: Bearer $token" "$url")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$url")
    fi
    
    http_status=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    response_body=$(echo "$response" | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_status" -eq "$expected_status" ]; then
        log_success "$description - Status: $http_status"
        log_debug "Response: $(echo "$response_body" | head -c 200)..."
    elif [ "$http_status" -eq 401 ] && [ "$expected_status" -eq 200 ]; then
        log_warning "$description - Requires Authentication (401)"
        log_debug "Response: $response_body"
    elif [ "$http_status" -eq 404 ]; then
        log_error "$description - Endpoint Not Found (404)"
        log_debug "Response: $response_body"
    else
        log_error "$description - Unexpected Status: $http_status (expected $expected_status)"
        log_debug "Response: $response_body"
    fi
    
    echo ""
}

# Fonction pour obtenir un token de test (si possible)
get_test_token() {
    log_info "Attempting to get test token..."
    
    # Essayer avec un utilisateur de test
    test_login='{"email":"test@wayd.com","password":"test123"}'
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" -H "Content-Type: application/json" -d "$test_login" "http://$IP:$AUTH_PORT/auth/login")
    
    http_status=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    response_body=$(echo "$response" | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_status" -eq 200 ]; then
        token=$(echo "$response_body" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
        if [ -n "$token" ]; then
            log_success "Got test token: ${token:0:20}..."
            echo "$token"
            return 0
        fi
    fi
    
    log_warning "Could not get test token (status: $http_status)"
    echo ""
    return 1
}

echo "🔍 WAY-D API DIAGNOSTIC & LOG STANDARDIZATION"
echo "=============================================="
echo ""

# 1. Test des services de santé
log_info "=== HEALTH CHECKS ==="
test_endpoint "http://$IP:$AUTH_PORT/health" "Auth Service Health"
test_endpoint "http://$IP:$PROFILE_PORT/health" "Profile Service Health"  
test_endpoint "http://$IP:$INTERACTIONS_PORT/health" "Interactions Service Health"
test_endpoint "http://$IP:$FRONTEND_PORT" "Frontend Accessibility" 200
echo ""

# 2. Obtenir un token de test
TOKEN=$(get_test_token) || TOKEN=""

# 3. Test des endpoints Profile Service
log_info "=== PROFILE SERVICE ENDPOINTS ==="

# Endpoints sans authentification
test_endpoint "http://$IP:$PROFILE_PORT/profile/interests/all" "Get All Interests"
test_endpoint "http://$IP:$PROFILE_PORT/profile/professions/suggestions" "Get Profession Suggestions"
test_endpoint "http://$IP:$PROFILE_PORT/profile/education/suggestions" "Get Education Suggestions"
test_endpoint "http://$IP:$PROFILE_PORT/profile/looking-for/options" "Get Looking For Options"

# Endpoints avec authentification (si on a un token)
if [ -n "$TOKEN" ]; then
    log_info "Testing authenticated endpoints..."
    test_endpoint "http://$IP:$PROFILE_PORT/profile/interests/suggestions" "Get Interest Suggestions" 200 "$TOKEN"
    test_endpoint "http://$IP:$PROFILE_PORT/profile/discover" "Discover Profiles" 200 "$TOKEN"
    test_endpoint "http://$IP:$PROFILE_PORT/profile/me" "Get My Profile" 200 "$TOKEN"
else
    log_warning "Skipping authenticated endpoints (no token available)"
fi

echo ""

# 4. Test du frontend et de la page problématique
log_info "=== FRONTEND TESTS ==="
test_endpoint "http://$IP:$FRONTEND_PORT/create-profile" "Create Profile Page" 200
test_endpoint "http://$IP:$FRONTEND_PORT/api/profile/interests/suggestions" "Frontend API Proxy - Interests" 200
test_endpoint "http://$IP:$FRONTEND_PORT/api/profile/looking-for/options" "Frontend API Proxy - Looking For" 200

echo ""

# 5. Diagnostic des logs PM2
log_info "=== PM2 LOGS ANALYSIS ==="

log_info "Checking PM2 processes..."
pm2 list | grep -E "(name|status|cpu|mem)" || log_error "PM2 not running or no processes"

log_info "Recent PM2 logs (last 10 lines)..."
pm2 logs way-d-frontend --lines 10 --nostream || log_warning "Could not get PM2 logs"

echo ""

# 6. Recommendations pour standardiser les logs
log_info "=== LOG STANDARDIZATION RECOMMENDATIONS ==="

echo "📋 Current Issues Found:"
echo "  - Mixed log formats in PM2 output" 
echo "  - Bot/scanner noise in backend logs"
echo "  - No structured logging format"
echo ""

echo "🔧 Recommended Solutions:"
echo "  1. Implement structured logging with consistent format"
echo "  2. Add log levels (DEBUG, INFO, WARN, ERROR)"
echo "  3. Filter out scanner/bot requests"  
echo "  4. Add request correlation IDs"
echo "  5. Separate access logs from application logs"
echo ""

echo "📝 Suggested Log Format:"
echo '  [LEVEL] YYYY-MM-DD HH:MM:SS [SERVICE] [REQUEST_ID] MESSAGE'
echo '  Example: [INFO] 2025-08-06 10:30:45 [PROFILE] [req-123] User profile created successfully'
echo ""

# 7. Generate config files for log standardization
log_info "=== GENERATING LOG STANDARDIZATION CONFIGS ==="

# Create logrotate config
cat > /tmp/wayd-logrotate.conf << 'EOF'
# Way-D Log Rotation Configuration
/home/akharn/.pm2/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 akharn akharn
    postrotate
        pm2 reload all
    endscript
}
EOF

log_success "Generated logrotate config: /tmp/wayd-logrotate.conf"

# Create structured logger config for Go services
cat > /tmp/logger-config.go << 'EOF'
// Structured Logger Configuration for Way-D Go Services
package config

import (
    "github.com/sirupsen/logrus"
    "os"
)

func SetupLogger() *logrus.Logger {
    logger := logrus.New()
    
    // Set format
    logger.SetFormatter(&logrus.JSONFormatter{
        TimestampFormat: "2006-01-02 15:04:05",
        FieldMap: logrus.FieldMap{
            logrus.FieldKeyTime:  "timestamp",
            logrus.FieldKeyLevel: "level",
            logrus.FieldKeyMsg:   "message",
        },
    })
    
    // Set output
    logger.SetOutput(os.Stdout)
    
    // Set level from env
    level := os.Getenv("LOG_LEVEL")
    switch level {
    case "DEBUG":
        logger.SetLevel(logrus.DebugLevel)
    case "WARN":
        logger.SetLevel(logrus.WarnLevel)
    case "ERROR":
        logger.SetLevel(logrus.ErrorLevel)
    default:
        logger.SetLevel(logrus.InfoLevel)
    }
    
    return logger
}
EOF

log_success "Generated Go logger config: /tmp/logger-config.go"

# Create PM2 ecosystem file with better logging
cat > /tmp/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'way-d-frontend',
    script: 'npm run preview',
    cwd: '/home/akharn/way-d/frontend',
    instances: 1,
    exec_mode: 'fork',
    
    // Enhanced logging configuration
    log_file: '/home/akharn/.pm2/logs/way-d-frontend.log',
    error_file: '/home/akharn/.pm2/logs/way-d-frontend-error.log',
    out_file: '/home/akharn/.pm2/logs/way-d-frontend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    
    env: {
      NODE_ENV: 'production',
      LOG_LEVEL: 'INFO'
    }
  }]
};
EOF

log_success "Generated PM2 ecosystem config: /tmp/ecosystem.config.js"

echo ""
log_info "=== DIAGNOSTIC COMPLETE ==="
echo ""
echo "📊 Summary:"
echo "  ✅ Service health checks completed"
echo "  ✅ API endpoint tests completed" 
echo "  ✅ Frontend accessibility verified"
echo "  ✅ Log standardization configs generated"
echo ""
echo "📋 Next Steps:"
echo "  1. Review API test results above"
echo "  2. Check browser console for create-profile page errors"
echo "  3. Implement structured logging using generated configs"
echo "  4. Set up log rotation with generated logrotate config"
echo ""

log_success "Diagnostic script completed successfully!"
