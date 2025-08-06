# 🔐 Authentication Diagnostic Tools - Quick Start Guide

## Overview
Ces outils de diagnostic ont été créés pour analyser et résoudre les erreurs 401 "Login failed" et "MISSING OR INVALID TOKENS" dans l'application Way-D.

## 🛠️ Available Tools

### 1. Token Diagnostic Tool
**URL:** http://localhost:5173/token-diagnostic

**Features:**
- ✅ Analyse des tokens JWT (access & refresh)
- ✅ Validation de l'expiration des tokens
- ✅ Test de connectivité backend
- ✅ Test de récupération utilisateur actuel
- ✅ Test de rafraîchissement des tokens
- ✅ Actions de nettoyage et test de login

**Usage:**
1. Démarrer le serveur: `npm run dev`
2. Naviguer vers `/token-diagnostic`
3. Cliquer sur "Run Full Diagnostic" pour un diagnostic complet
4. Cliquer sur "Auth Flow Test" pour tester le flux d'authentification
5. Utiliser "Test Login" pour tester des identifiants spécifiques

### 2. Request Logs Viewer
**URL:** http://localhost:5173/request-logs

**Features:**
- 📊 Visualisation en temps réel des requêtes HTTP
- 🔍 Filtrage par type (All/Auth/Errors)
- 📈 Analyse des échecs de connexion
- 💾 Export des logs en JSON
- 🔄 Actualisation automatique

**Usage:**
1. Naviguer vers `/request-logs`
2. Utiliser les filtres pour voir différents types de requêtes
3. Cliquer sur une requête pour voir les détails
4. Analyser les erreurs courantes dans la section "Login Analysis"

### 3. Command Line Diagnostic
**Script:** `./test-auth-diagnostic.sh`

**Features:**
- ✅ Validation de l'installation des outils
- ✅ Test de compilation TypeScript
- ✅ Test de démarrage du serveur
- ✅ Test d'accessibilité des pages de diagnostic

## 🚨 Common Issues & Solutions

### Issue 1: 401 on Login Attempts
**Symptoms:**
- Login requests fail with 401 status
- "Login failed: Request failed with status code 401"

**Diagnostic Steps:**
1. Use Token Diagnostic → "Auth Flow Test"
2. Check Request Logs for failed login attempts
3. Look for backend connectivity issues

**Likely Causes:**
- Backend service not running
- Incorrect API endpoint configuration
- CORS issues
- Invalid request format

### Issue 2: Token Refresh Loops
**Symptoms:**
- Infinite refresh attempts in console
- Multiple simultaneous refresh requests
- "Request retry failed" errors

**Diagnostic Steps:**
1. Use Token Diagnostic → "Run Full Diagnostic"
2. Check "Token Refresh" test results
3. Monitor Request Logs for refresh patterns

**Likely Causes:**
- Broken interceptor logic
- Invalid refresh token format
- Backend refresh endpoint issues

### Issue 3: Missing/Invalid Tokens
**Symptoms:**
- "MISSING OR INVALID TOKENS" errors
- Tokens not stored in localStorage
- Token cleanup not working properly

**Diagnostic Steps:**
1. Use Token Diagnostic → Check token presence and validity
2. Test "Clear All Tokens" functionality
3. Verify token storage mechanisms

## 🔧 Quick Fixes

### Fix 1: Clear All Auth Data
```bash
# In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Fix 2: Reset Backend Connection
```bash
# Restart backend services
cd ../backend/way-d--auth && go run main.go
cd ../backend/way-d--profile && go run main.go
cd ../backend/way-d--interactions && go run main.go
```

### Fix 3: Rebuild Frontend
```bash
npm run build
npm run dev
```

## 📊 Monitoring & Analysis

### Real-time Monitoring
1. Keep Request Logs Viewer open during testing
2. Monitor Auth filter for authentication-specific requests
3. Watch for patterns in failed requests

### Periodic Health Checks
1. Use Token Diagnostic every session
2. Run `./test-auth-diagnostic.sh` after code changes
3. Monitor login success rates

### Export Data for Analysis
1. Export request logs from Request Logs Viewer
2. Save diagnostic reports from Token Diagnostic
3. Share logs with development team for deeper analysis

## 🎯 Success Metrics

### Healthy Auth System Indicators:
- ✅ 100% token diagnostic tests pass
- ✅ 0 failed login attempts for valid credentials
- ✅ Smooth token refresh without loops
- ✅ Clean token storage and cleanup
- ✅ Proper error handling and user feedback

### Warning Signs:
- ❌ Repeated 401 errors on valid login attempts
- ❌ Token refresh failures
- ❌ Inconsistent auth state
- ❌ Infinite loops in request interceptors

## 🚀 Next Steps

1. **Immediate Actions:**
   - Run `./test-auth-diagnostic.sh`
   - Check Token Diagnostic tool
   - Monitor Request Logs during login attempts

2. **Investigation:**
   - Identify specific error patterns
   - Test with known good credentials
   - Compare backend logs with frontend logs

3. **Resolution:**
   - Follow recommendations from diagnostic tools
   - Implement fixes based on identified issues
   - Re-test with diagnostic tools

4. **Validation:**
   - Ensure all diagnostic tests pass
   - Verify smooth user experience
   - Monitor for recurring issues

---

**💡 Pro Tip:** Keep the Request Logs Viewer open in a separate tab while testing to see real-time authentication requests and responses.
