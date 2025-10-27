#!/bin/bash
set -e  # Exit on any error

echo "🔍 Pre-Deployment Verification Script"
echo "======================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        exit 1
    fi
}

print_info() {
    echo -e "${YELLOW}→${NC} $1"
}

# 1. Check we're in the right directory
print_info "Checking project directory..."
if [ ! -f "package.json" ] || [ ! -f "firebase.json" ]; then
    echo -e "${RED}Error: Must run from project root${NC}"
    exit 1
fi
print_status 0 "Project directory verified"

# 2. Check Node.js version
print_info "Checking Node.js version..."
NODE_VERSION=$(node --version)
echo "   Node version: $NODE_VERSION"
print_status 0 "Node.js installed"

# 3. Check Firebase CLI
print_info "Checking Firebase CLI..."
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}Firebase CLI not installed${NC}"
    echo "Install with: npm install -g firebase-tools"
    exit 1
fi
FIREBASE_VERSION=$(firebase --version)
echo "   Firebase CLI version: $FIREBASE_VERSION"
print_status 0 "Firebase CLI installed"

# 4. Check Firebase authentication
print_info "Checking Firebase authentication..."
if ! firebase projects:list &> /dev/null; then
    echo -e "${RED}Not authenticated with Firebase${NC}"
    echo "Run: firebase login"
    exit 1
fi
print_status 0 "Firebase authenticated"

# 5. Check current Firebase project
print_info "Checking Firebase project..."
CURRENT_PROJECT=$(firebase use | grep "^Active project" | awk '{print $3}')
echo "   Current project: $CURRENT_PROJECT"
if [ "$CURRENT_PROJECT" != "notecards-1b054" ]; then
    echo -e "${YELLOW}Warning: Not using production project${NC}"
    echo "Switch with: firebase use notecards-1b054"
fi
print_status 0 "Firebase project configured"

# 6. Check Git status
print_info "Checking Git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}Warning: You have uncommitted changes${NC}"
    git status --short
    echo ""
fi
print_status 0 "Git status checked"

# 7. Check current branch
print_info "Checking Git branch..."
CURRENT_BRANCH=$(git branch --show-current)
echo "   Current branch: $CURRENT_BRANCH"
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}Warning: Not on main branch${NC}"
    echo "Production deploys happen from 'main' branch"
fi

# 8. Install dependencies (if needed)
print_info "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    print_info "Installing dependencies..."
    npm ci
fi
print_status $? "Dependencies installed"

# 9. Run TypeScript type checking
print_info "Running TypeScript type check..."
npx tsc --noEmit > /dev/null 2>&1
print_status $? "TypeScript type check passed"

# 10. Run tests
print_info "Running test suite..."
npm run test:run > /dev/null 2>&1
print_status $? "All tests passed"

# 11. Build production bundle
print_info "Building production bundle..."
npm run build > /dev/null 2>&1
print_status $? "Production build successful"

# 12. Check build artifacts
print_info "Checking build artifacts..."
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    print_status 1 "Build artifacts missing"
fi
print_status 0 "Build artifacts verified"

# 13. Verify Firestore rules (optional - requires emulator)
print_info "Firestore rules syntax..."
if [ -f "firestore.rules" ]; then
    # Just check the file exists, don't validate (needs emulator)
    print_status 0 "Firestore rules file found"
fi

# Summary
echo ""
echo "======================================"
echo -e "${GREEN}✓ All checks passed!${NC}"
echo ""
echo "📋 Deployment Summary:"
echo "   Project:  notecards-1b054"
echo "   Branch:   $CURRENT_BRANCH"
echo "   URL:      https://notecards-1b054.web.app"
echo ""
echo "🚀 Deployment Options:"
echo ""
echo "   AUTOMATIC (Recommended):"
echo "   $ git push origin main"
echo "   → GitHub Actions will automatically deploy"
echo ""
echo "   MANUAL (If needed):"
echo "   $ firebase deploy --only hosting"
echo ""
echo "   VIEW WORKFLOW STATUS:"
echo "   $ gh run list --limit 5"
echo ""
