#!/bin/bash
# Install Git hooks for the project

set -e

echo "🔧 Installing Git hooks..."
echo ""

# Configure Git to use custom hooks directory
git config core.hooksPath .githooks

# Make all hooks executable
chmod +x .githooks/*

echo "✅ Git hooks installed successfully!"
echo ""
echo "Installed hooks:"
echo "  - pre-push: Runs deployment checks before pushing to main"
echo ""
echo "Hooks are now active for this repository."
echo ""
echo "To bypass a hook (NOT RECOMMENDED):"
echo "  git push --no-verify"
