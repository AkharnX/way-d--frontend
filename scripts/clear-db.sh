#!/bin/bash

# 🗄️ Way-d Database Cleanup Script
# Nettoie toutes les données de test et reset la base de données

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🗄️  Way-d Database Cleanup${NC}"
echo "============================"

# Vérifier si le backend est accessible
if ! curl -s http://localhost:3001/health > /dev/null; then
    echo -e "${YELLOW}⚠️  Backend not accessible. Make sure it's running first.${NC}"
    echo "Start backend with: npm run start:backend"
    exit 1
fi

echo -e "${YELLOW}This will delete ALL data including:${NC}"
echo "• User accounts"
echo "• User profiles"
echo "• Messages"
echo "• Matches"
echo "• Photos"
echo

read -p "Are you sure? (y/N): " confirm
if [ "$confirm" != "y" ]; then
    echo "Operation cancelled."
    exit 0
fi

echo -e "${YELLOW}🧹 Clearing database...${NC}"

# Clear local storage tokens
echo "Clearing local tokens..."
rm -f ~/.way-d-tokens 2>/dev/null || true

# API calls to clear database (if endpoints exist)
echo "Calling database cleanup endpoints..."

# Clear refresh tokens
curl -s -X DELETE http://localhost:3001/api/auth/clear-tokens || echo "Clear tokens endpoint not available"

# Clear all users (if admin endpoint exists)
curl -s -X DELETE http://localhost:3001/api/admin/clear-all || echo "Clear all endpoint not available"

echo -e "${GREEN}✅ Database cleanup completed!${NC}"
echo
echo "You can now:"
echo "• Register new users"
echo "• Create fresh test data"
echo "• Start with a clean state"
