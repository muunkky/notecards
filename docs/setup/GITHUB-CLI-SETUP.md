# GitHub CLI Setup Instructions

## Quick Install (Copy and run in your WSL terminal)

```bash
# Install GitHub CLI
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update && sudo apt install gh -y
```

## Authenticate

```bash
# Login to GitHub (will open browser)
gh auth login

# Select:
# - GitHub.com
# - HTTPS
# - Yes (authenticate git)
# - Login with browser (easiest)
```

## Verify It Works

```bash
# Check auth status
gh auth status

# View current workflow runs
gh run list --limit 5

# Watch the latest run
gh run watch
```

## What We Can Do With It

Once authenticated, I can:
- ✅ Check CI test status in real-time
- ✅ View test logs if failures occur
- ✅ Monitor deployment progress
- ✅ Create pull requests
- ✅ Check repository status

## Alternative: Use GitHub Website

If you prefer not to install `gh`:
1. Go to: https://github.com/muunkky/notecards/actions
2. Look for the latest workflow run on `feature/deck-sharing`
3. Let me know if tests pass/fail

---

**After setup, just tell me "gh installed" and I'll check CI status!**
