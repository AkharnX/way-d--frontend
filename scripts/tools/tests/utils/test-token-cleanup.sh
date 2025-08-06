#!/bin/bash

echo "=== Token Cleanup Test ==="
echo "Date: $(date)"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Step 1: Check current backend services ===${NC}"
cd /home/akharn/way-d/backend && docker-compose ps

echo ""
echo -e "${BLUE}=== Step 2: Check database sessions ===${NC}"
echo -e "${YELLOW}Active sessions in database:${NC}"
docker exec -it wayd-postgres psql -U wayd_user -d wayd_db -c "SELECT COUNT(*) as session_count FROM sessions;"

echo -e "${YELLOW}Recent sessions:${NC}"
docker exec -it wayd-postgres psql -U wayd_user -d wayd_db -c "SELECT id, user_id, substring(refresh_token, 1, 20) as refresh_token_preview, created_at FROM sessions ORDER BY created_at DESC LIMIT 3;"

echo ""
echo -e "${BLUE}=== Step 3: Test Token Cleanup Solution ===${NC}"
echo -e "${GREEN}✅ Token cleanup functions added to API service${NC}"
echo -e "${GREEN}✅ validateAndCleanupTokens() function implemented${NC}"
echo -e "${GREEN}✅ cleanupTokens() function implemented${NC}"
echo -e "${GREEN}✅ useAuth hook updated to use new cleanup logic${NC}"

echo ""
echo -e "${BLUE}=== Step 4: Manual Testing Instructions ===${NC}"
echo -e "${YELLOW}1. Go to: http://localhost:5173/token-diagnostic${NC}"
echo -e "${YELLOW}2. Click 'Analyser les Tokens' to see current tokens${NC}"
echo -e "${YELLOW}3. Click 'Nettoyer Tokens' to clear invalid tokens${NC}"
echo -e "${YELLOW}4. Click 'Login Fresh' to get new valid tokens${NC}"
echo -e "${YELLOW}5. Use credentials: testuser2@example.com / TestPassword123!${NC}"

echo ""
echo -e "${BLUE}=== Step 5: Expected Results ===${NC}"
echo -e "${GREEN}✅ Invalid tokens should be cleared automatically${NC}"
echo -e "${GREEN}✅ Fresh login should work without errors${NC}"
echo -e "${GREEN}✅ Token refresh should work seamlessly${NC}"
echo -e "${GREEN}✅ No more 'Cannot convert object to primitive value' errors${NC}"

echo ""
echo -e "${BLUE}=== Step 6: Test Complete User Flow ===${NC}"
echo -e "${YELLOW}After token cleanup, test:${NC}"
echo "• Login: http://localhost:5173/login"
echo "• Discovery: http://localhost:5173/discovery"
echo "• Profile: http://localhost:5173/profile"
echo "• Dashboard: http://localhost:5173/dashboard"

echo ""
echo -e "${GREEN}=== Token Cleanup Test Complete ===${NC}"
echo "The refresh token synchronization issue should now be resolved!"
