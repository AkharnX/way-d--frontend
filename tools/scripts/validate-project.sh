#!/bin/bash
# Way-d Project Organization Validation Script

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Way-d Project Organization Check${NC}"
echo "======================================"

# Check required files
echo -e "\n${YELLOW}📁 Checking project structure...${NC}"

required_files=(
    "package.json"
    "vite.config.ts"
    "tailwind.config.js"
    "README.md"
    "way-d.sh"
    "src/App.tsx"
    "src/main.tsx"
    "deployment/ecosystem.config.cjs"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ✅ $file"
    else
        echo -e "  ❌ $file"
        missing_files+=("$file")
    fi
done

# Check directories
echo -e "\n${YELLOW}📂 Checking directory structure...${NC}"

required_dirs=(
    "src/components"
    "src/pages" 
    "src/services"
    "deployment"
    "docs"
    "tests"
    "scripts"
    "archive"
    "logs"
)

missing_dirs=()
for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "  ✅ $dir/"
    else
        echo -e "  ❌ $dir/"
        missing_dirs+=("$dir")
    fi
done

# Check if node_modules exists
echo -e "\n${YELLOW}📦 Checking dependencies...${NC}"
if [ -d "node_modules" ]; then
    echo -e "  ✅ node_modules/ (dependencies installed)"
else
    echo -e "  ⚠️  node_modules/ (run: npm install)"
fi

# Check key pages
echo -e "\n${YELLOW}📄 Checking key pages...${NC}"

key_pages=(
    "src/pages/Home.tsx"
    "src/pages/Login.tsx"
    "src/pages/Register.tsx" 
    "src/pages/Dashboard.tsx"
    "src/pages/Discovery.tsx"
    "src/pages/CreateProfile.tsx"
)

for page in "${key_pages[@]}"; do
    if [ -f "$page" ]; then
        echo -e "  ✅ $(basename $page)"
    else
        echo -e "  ❌ $(basename $page)"
    fi
done

# Check configuration files
echo -e "\n${YELLOW}⚙️  Checking configuration...${NC}"

if [ -f "vite.config.ts" ]; then
    if grep -q "defineConfig" "vite.config.ts"; then
        echo -e "  ✅ Vite configuration valid"
    else
        echo -e "  ❌ Vite configuration invalid"
    fi
fi

if [ -f "tailwind.config.js" ]; then
    echo -e "  ✅ Tailwind CSS configured"
fi

if [ -f "postcss.config.js" ]; then
    if grep -q "tailwindcss" "postcss.config.js"; then
        echo -e "  ✅ PostCSS configuration valid"
    else
        echo -e "  ❌ PostCSS configuration invalid"
    fi
fi

# Check scripts
echo -e "\n${YELLOW}🔧 Checking scripts...${NC}"

if [ -x "way-d.sh" ]; then
    echo -e "  ✅ Main management script executable"
else
    echo -e "  ❌ Main management script not executable"
fi

# Test build
echo -e "\n${YELLOW}🏗️  Testing build...${NC}"
if npm run build > /dev/null 2>&1; then
    echo -e "  ✅ Build successful"
    build_size=$(du -sh dist 2>/dev/null | cut -f1)
    echo -e "  📊 Build size: ${build_size:-"Unknown"}"
else
    echo -e "  ❌ Build failed"
fi

# Summary
echo -e "\n${BLUE}📊 Summary${NC}"
echo "=========="

if [ ${#missing_files[@]} -eq 0 ] && [ ${#missing_dirs[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ Project structure is complete and organized!${NC}"
    echo -e "\n${GREEN}🚀 Ready to run:${NC}"
    echo -e "  ./way-d.sh dev    # Start development"
    echo -e "  ./way-d.sh deploy # Deploy to production"
    echo -e "  ./way-d.sh help   # See all commands"
else
    echo -e "${RED}⚠️  Some files/directories are missing:${NC}"
    for file in "${missing_files[@]}"; do
        echo -e "  - $file"
    done
    for dir in "${missing_dirs[@]}"; do
        echo -e "  - $dir/"
    done
fi

echo -e "\n${BLUE}📚 Documentation:${NC}"
echo -e "  - README.md - Main documentation"
echo -e "  - PROJECT_STRUCTURE.md - Project organization"
echo -e "  - MAINTENANCE.md - Maintenance guide"
echo -e "  - docs/ - Detailed documentation"

echo ""
