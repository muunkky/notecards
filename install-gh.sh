#!/bin/bash
# GitHub CLI Installation Script for WSL Ubuntu

echo "🔧 Installing GitHub CLI..."
echo ""

# Download and install GitHub CLI GPG key
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg

# Set proper permissions
sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg

# Add GitHub CLI repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null

# Update package list and install
sudo apt update
sudo apt install gh -y

# Verify installation
echo ""
echo "✅ Installation complete!"
gh --version

echo ""
echo "📋 Next step: Authenticate with GitHub"
echo "Run: gh auth login"
echo ""
echo "Select:"
echo "  - GitHub.com"
echo "  - HTTPS"
echo "  - Yes (authenticate Git with your GitHub credentials)"
echo "  - Login with a web browser (easiest)"
