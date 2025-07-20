#!/bin/bash

# 🧪 Way-d Test Suite Manager
# Gestionnaire centralisé pour tous les tests

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════════════════════════════╗"
    echo "║                           🧪 WAY-D TEST SUITE MANAGER 🧪                           ║"
    echo "╚══════════════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_menu() {
    echo -e "${YELLOW}Available Test Categories:${NC}"
    echo
    echo "1. 🔐 Authentication Tests (auth/)"
    echo "2. 🔗 API & Backend Tests (api/)"
    echo "3. 🔄 Integration Tests (integration/)"
    echo "4. ✅ Validation Tests (validation/)"
    echo "5. 🔍 Diagnostic Tests (diagnostic/)"
    echo "6. 🛠️  Utility Scripts (utils/)"
    echo "7. 🚀 Run All Tests"
    echo "8. 🧹 Clean Database"
    echo "9. 📊 Test Status Report"
    echo "0. Exit"
    echo
}

list_scripts() {
    local category=$1
    local dir="tests/$category"
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}Scripts in $category:${NC}"
        ls -la "$dir"/*.sh 2>/dev/null | awk '{print "  - " $9}' | sed 's|.*/||'
        echo
    else
        echo -e "${RED}Category $category not found${NC}"
    fi
}

run_category() {
    local category=$1
    local dir="tests/$category"
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}Running $category tests...${NC}"
        for script in "$dir"/*.sh; do
            if [ -f "$script" ]; then
                echo -e "${YELLOW}Executing: $(basename "$script")${NC}"
                chmod +x "$script"
                bash "$script" || echo -e "${RED}Script failed: $script${NC}"
                echo "---"
            fi
        done
    else
        echo -e "${RED}Category $category not found${NC}"
    fi
}

run_all_tests() {
    echo -e "${GREEN}🚀 Running ALL tests...${NC}"
    
    categories=("auth" "api" "integration" "validation" "diagnostic")
    
    for category in "${categories[@]}"; do
        echo -e "${BLUE}=== Running $category tests ===${NC}"
        run_category "$category"
        echo
    done
    
    echo -e "${GREEN}✅ All tests completed!${NC}"
}

clean_database() {
    echo -e "${YELLOW}🧹 Cleaning database...${NC}"
    
    # Run cleanup scripts
    if [ -f "tests/utils/cleanup-tokens-complete.sh" ]; then
        bash tests/utils/cleanup-tokens-complete.sh
    fi
    
    if [ -f "tests/utils/clean-refresh-tokens.sh" ]; then
        bash tests/utils/clean-refresh-tokens.sh
    fi
    
    echo -e "${GREEN}✅ Database cleaned!${NC}"
}

test_status_report() {
    echo -e "${BLUE}📊 Test Status Report${NC}"
    echo "===================="
    
    total_scripts=0
    for category in auth api integration validation diagnostic utils; do
        count=$(find "tests/$category" -name "*.sh" 2>/dev/null | wc -l)
        total_scripts=$((total_scripts + count))
        echo -e "${YELLOW}$category:${NC} $count scripts"
    done
    
    echo -e "${GREEN}Total: $total_scripts test scripts${NC}"
    echo
    
    # Check if backend is running
    if curl -s http://localhost:3001/health > /dev/null; then
        echo -e "${GREEN}✅ Backend server is running${NC}"
    else
        echo -e "${RED}❌ Backend server is not running${NC}"
    fi
    
    # Check if frontend is running
    if curl -s http://localhost:5173 > /dev/null; then
        echo -e "${GREEN}✅ Frontend server is running${NC}"
    else
        echo -e "${RED}❌ Frontend server is not running${NC}"
    fi
}

main() {
    print_header
    
    while true; do
        print_menu
        read -p "Choose an option (0-9): " choice
        
        case $choice in
            1)
                list_scripts "auth"
                read -p "Run auth tests? (y/n): " confirm
                [ "$confirm" = "y" ] && run_category "auth"
                ;;
            2)
                list_scripts "api"
                read -p "Run API tests? (y/n): " confirm
                [ "$confirm" = "y" ] && run_category "api"
                ;;
            3)
                list_scripts "integration"
                read -p "Run integration tests? (y/n): " confirm
                [ "$confirm" = "y" ] && run_category "integration"
                ;;
            4)
                list_scripts "validation"
                read -p "Run validation tests? (y/n): " confirm
                [ "$confirm" = "y" ] && run_category "validation"
                ;;
            5)
                list_scripts "diagnostic"
                read -p "Run diagnostic tests? (y/n): " confirm
                [ "$confirm" = "y" ] && run_category "diagnostic"
                ;;
            6)
                list_scripts "utils"
                read -p "Run utility scripts? (y/n): " confirm
                [ "$confirm" = "y" ] && run_category "utils"
                ;;
            7)
                run_all_tests
                ;;
            8)
                clean_database
                ;;
            9)
                test_status_report
                ;;
            0)
                echo -e "${GREEN}Goodbye! 👋${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option. Please choose 0-9.${NC}"
                ;;
        esac
        
        echo
        read -p "Press Enter to continue..."
        clear
        print_header
    done
}

# Run if executed directly
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi
