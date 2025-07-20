#!/bin/bash

# 🚀 Way-d Master Control Script
# Gestionnaire principal pour tous les aspects de l'application

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════════════════════════════════╗"
    echo "║                           🚀 WAY-D MASTER CONTROL CENTER 🚀                          ║"
    echo "║                              Dating App Management Suite                             ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_menu() {
    echo -e "${YELLOW}🎯 Main Operations:${NC}"
    echo
    echo "1.  🏃‍♂️ Start Application (Frontend + Backend)"
    echo "2.  🛑 Stop Application"
    echo "3.  🔄 Restart Application"
    echo "4.  📊 Status Check"
    echo
    echo -e "${BLUE}🧪 Testing & Development:${NC}"
    echo "5.  🧪 Run Test Suite"
    echo "6.  🔍 Run Diagnostics"
    echo "7.  🧹 Clean Database"
    echo "8.  👤 Create Test User"
    echo
    echo -e "${PURPLE}🛠️  Maintenance:${NC}"
    echo "9.  📦 Install/Update Dependencies"
    echo "10. 🔧 Fix Common Issues"
    echo "11. 📝 View Logs"
    echo "12. 🗂️  Project Structure"
    echo "13. 🧹 Clean Project Files"
    echo
    echo -e "${GREEN}🚀 Deployment:${NC}"
    echo "14. 📱 Deploy with PM2"
    echo "15. ⚙️  Configure Services"
    echo "16. 🔐 Setup SSL/Domain"
    echo
    echo "0.  👋 Exit"
    echo
}

start_application() {
    echo -e "${GREEN}🚀 Starting Way-d Application...${NC}"
    
    # Vérifier PM2
    if ! command -v pm2 &> /dev/null; then
        echo -e "${YELLOW}Installing PM2...${NC}"
        sudo npm install -g pm2
    fi
    
    # Démarrer le frontend
    echo -e "${BLUE}Starting frontend...${NC}"
    pm2 start "npm run dev" --name "way-d-frontend" || pm2 restart way-d-frontend
    
    # Vérifier si le backend est déjà en cours
    if curl -s http://localhost:3001/health > /dev/null; then
        echo -e "${GREEN}✅ Backend is already running${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend not detected - you may need to start it manually${NC}"
    fi
    
    echo -e "${GREEN}✅ Application started!${NC}"
    echo -e "${CYAN}Frontend: http://localhost:5173 (REQUIRED PORT)${NC}"
    echo -e "${CYAN}Backend:  http://localhost:3001${NC}"
    echo -e "${YELLOW}⚠️  Note: Frontend MUST run on port 5173 for backend compatibility${NC}"
}

stop_application() {
    echo -e "${RED}🛑 Stopping Way-d Application...${NC}"
    
    pm2 stop way-d-frontend 2>/dev/null || echo "Frontend was not running"
    pm2 delete way-d-frontend 2>/dev/null || echo "Frontend process cleaned"
    
    echo -e "${GREEN}✅ Application stopped!${NC}"
}

restart_application() {
    echo -e "${YELLOW}🔄 Restarting Way-d Application...${NC}"
    stop_application
    sleep 2
    start_application
}

check_status() {
    echo -e "${BLUE}📊 Way-d Application Status${NC}"
    echo "================================"
    
    # PM2 Status
    echo -e "${YELLOW}PM2 Processes:${NC}"
    pm2 list || echo "PM2 not running"
    echo
    
    # Port checks avec avertissement sur le port
    echo -e "${YELLOW}Port Status:${NC}"
    if curl -s http://localhost:5173 > /dev/null; then
        echo -e "${GREEN}✅ Frontend (5173): Running${NC}"
    else
        echo -e "${RED}❌ Frontend (5173): Not responding${NC}"
        echo -e "${YELLOW}⚠️  CRITICAL: Frontend must run on port 5173 for backend compatibility!${NC}"
    fi
    
    if curl -s http://localhost:3001/health > /dev/null; then
        echo -e "${GREEN}✅ Backend (3001): Running${NC}"
    else
        echo -e "${RED}❌ Backend (3001): Not responding${NC}"
    fi
    
    # Vérification si un autre processus utilise le port 5173
    if lsof -i :5173 > /dev/null 2>&1; then
        echo -e "${GREEN}Port 5173: In use (good if it's Way-d)${NC}"
        lsof -i :5173
    else
        echo -e "${YELLOW}Port 5173: Available${NC}"
    fi
    
    # Database check (if applicable)
    echo
    echo -e "${YELLOW}System Resources:${NC}"
    echo "Memory: $(free -h | awk '/^Mem:/ {print $3 "/" $2}')"
    echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)% used"
}

run_test_suite() {
    echo -e "${GREEN}🧪 Launching Test Suite...${NC}"
    ./tests/run-tests.sh
}

run_diagnostics() {
    echo -e "${BLUE}🔍 Running Diagnostics...${NC}"
    
    # Run diagnostic scripts
    for script in tests/diagnostic/*.sh; do
        if [ -f "$script" ]; then
            echo -e "${YELLOW}Running: $(basename "$script")${NC}"
            chmod +x "$script"
            bash "$script"
            echo "---"
        fi
    done
}

clean_database() {
    echo -e "${YELLOW}🧹 Cleaning Database...${NC}"
    ./clear-db.sh
}

create_test_user() {
    echo -e "${GREEN}👤 Creating Test User...${NC}"
    
    if [ -f "tests/auth/create-test-user.sh" ]; then
        chmod +x tests/auth/create-test-user.sh
        bash tests/auth/create-test-user.sh
    else
        echo -e "${RED}Test user creation script not found${NC}"
    fi
}

install_dependencies() {
    echo -e "${PURPLE}📦 Installing/Updating Dependencies...${NC}"
    
    echo "Updating npm packages..."
    npm install
    npm update
    
    echo "Checking for security vulnerabilities..."
    npm audit fix || echo "Some vulnerabilities may require manual fixing"
    
    echo -e "${GREEN}✅ Dependencies updated!${NC}"
}

fix_common_issues() {
    echo -e "${YELLOW}🔧 Fixing Common Issues...${NC}"
    
    # Fix file permissions
    echo "Fixing script permissions..."
    find tests/ -name "*.sh" -exec chmod +x {} \;
    find deployment/ -name "*.sh" -exec chmod +x {} \; 2>/dev/null || true
    
    # Clear npm cache
    echo "Clearing npm cache..."
    npm cache clean --force
    
    # Fix node_modules if needed
    if [ ! -d "node_modules" ]; then
        echo "Installing missing node_modules..."
        npm install
    fi
    
    echo -e "${GREEN}✅ Common issues fixed!${NC}"
}

view_logs() {
    echo -e "${BLUE}📝 Application Logs${NC}"
    echo "==================="
    
    echo -e "${YELLOW}Choose log to view:${NC}"
    echo "1. PM2 Logs"
    echo "2. Application Output Log"
    echo "3. Monitor Log"
    echo "4. Error Log"
    
    read -p "Choice (1-4): " log_choice
    
    case $log_choice in
        1) pm2 logs --lines 50 ;;
        2) [ -f "server-output.log" ] && tail -50 server-output.log || echo "Log not found" ;;
        3) [ -f "server-monitor.log" ] && tail -50 server-monitor.log || echo "Log not found" ;;
        4) [ -f "logs/err.log" ] && tail -50 logs/err.log || echo "Error log not found" ;;
        *) echo "Invalid choice" ;;
    esac
}

show_project_structure() {
    echo -e "${CYAN}🗂️  Way-d Project Structure${NC}"
    echo "============================="
    
    if command -v tree &> /dev/null; then
        tree -I node_modules -L 3
    else
        echo "Structure overview:"
        ls -la
        echo
        echo "Main directories:"
        find . -maxdepth 2 -type d | grep -E "(src|tests|deployment|logs)" | sort
    fi
}

clean_project_files() {
    echo -e "${YELLOW}🧹 Cleaning Project Files...${NC}"
    ./cleanup-project.sh
}

deploy_with_pm2() {
    echo -e "${GREEN}📱 Deploying with PM2...${NC}"
    ./deployment/deploy-pm2.sh
}

main() {
    # Create necessary directories
    mkdir -p logs deployment
    
    print_header
    
    while true; do
        print_menu
        read -p "Choose an option (0-16): " choice
        
        case $choice in
            1) start_application ;;
            2) stop_application ;;
            3) restart_application ;;
            4) check_status ;;
            5) run_test_suite ;;
            6) run_diagnostics ;;
            7) clean_database ;;
            8) create_test_user ;;
            9) install_dependencies ;;
            10) fix_common_issues ;;
            11) view_logs ;;
            12) show_project_structure ;;
            13) clean_project_files ;;
            14) deploy_with_pm2 ;;
            15) echo "Configure services feature coming soon..." ;;
            16) echo "SSL/Domain setup feature coming soon..." ;;
            0)
                echo -e "${GREEN}Goodbye! 👋${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option. Please choose 0-16.${NC}"
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
