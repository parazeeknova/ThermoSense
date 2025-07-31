#!/bin/bash

echo "🧪 Testing Automated Release Workflow Components"
echo "================================================"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

print_info "Step 1: Checking Node.js and npm"
node --version && npm --version
print_status $? "Node.js and npm are available"

print_info "Step 2: Installing dependencies"
npm ci > /dev/null 2>&1
print_status $? "Dependencies installed"

print_info "Step 3: Running type check"
npm run type-check > /dev/null 2>&1
print_status $? "Type check passed"

print_info "Step 4: Running linting"
npm run lint > /dev/null 2>&1
print_status $? "Linting passed"

print_info "Step 5: Testing Next.js build"
npm run build > /dev/null 2>&1
print_status $? "Next.js build successful"

print_info "Step 6: Testing Electron build"
npm run build:electron > /dev/null 2>&1
print_status $? "Electron build successful"

print_info "Step 7: Checking version bump script"
node scripts/bump-version.js patch > /dev/null 2>&1
print_status $? "Version bump script works"

# Restore original version
git checkout package.json > /dev/null 2>&1

print_info "Step 8: Checking build scripts"
if [ -f "scripts/build-ci.sh" ] && [ -x "scripts/build-ci.sh" ]; then
    print_status 0 "Linux/macOS build script exists and is executable"
else
    print_status 1 "Linux/macOS build script missing or not executable"
fi

if [ -f "scripts/build-ci.bat" ]; then
    print_status 0 "Windows build script exists"
else
    print_status 1 "Windows build script missing"
fi

print_info "Step 9: Checking electron-builder configuration"
if [ -f "electron-builder-ci.json" ]; then
    print_status 0 "Electron builder CI configuration exists"
else
    print_status 1 "Electron builder CI configuration missing"
fi

echo ""
echo "🎉 Workflow test completed!"
echo ""
echo "📝 To trigger an automated release:"
echo "   1. Make your changes"
echo "   2. Commit: git commit -m 'Your change description'"
echo "   3. Push: git push origin main"
echo ""
echo "🚫 To skip automated release:"
echo "   1. Add [SKIP] to commit message"
echo "   2. Example: git commit -m 'Update docs [SKIP]'"
echo ""
echo "🔧 Manual version bump:"
echo "   npm run version:patch  # 1.0.0 → 1.0.1"
echo "   npm run version:minor  # 1.0.0 → 1.1.0"
echo "   npm run version:major  # 1.0.0 → 2.0.0"
