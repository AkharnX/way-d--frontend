#!/bin/bash

# 🧹 Clean up and organize the Way-d project
echo "🧹 Cleaning up and organizing Way-d project..."

# Create organized folders
mkdir -p temp-cleanup/{tests,debug-scripts,documentation}

# Move test files
echo "📁 Moving test files..."
mv test-*.js temp-cleanup/tests/ 2>/dev/null || echo "No test files to move"
mv debug-*.js temp-cleanup/debug-scripts/ 2>/dev/null || echo "No debug files to move"

# Move documentation
echo "📚 Moving documentation..."
mv *.md temp-cleanup/documentation/ 2>/dev/null || echo "No markdown files to move"

# Keep only essential files in root
echo "✨ Organizing project structure..."

# List what we're keeping in root
echo "📋 Essential files remaining in root:"
ls -la | grep -E '\.(json|js|ts|html|config)$|^(src|public|config|deployment)' || echo "All clean!"

# Create a summary
echo "
🎉 PROJECT CLEANUP COMPLETE!

📁 Organized structure:
├── temp-cleanup/
│   ├── tests/ (all test-*.js files)
│   ├── debug-scripts/ (all debug-*.js files)  
│   └── documentation/ (all *.md files)
│
├── src/ (main application code)
├── public/ (static assets)
├── config/ (configuration files)
└── deployment/ (deployment scripts)

🔧 Next steps:
1. Test the application: npm run dev
2. Check Discovery page functionality
3. Verify age calculation fix
4. Test complete user flow

📱 Ready for production!
" > temp-cleanup/CLEANUP_SUMMARY.md

echo "✅ Cleanup complete! Check temp-cleanup/CLEANUP_SUMMARY.md for details."
