# WSL Git Setup Instructions

Run these commands to configure Git with automatic Windows credential sharing:

```bash
# Set your Git identity (matches Windows config)
git config --global user.name "Cameron Rout"
git config --global user.email "cameronrout@gmail.com"

# Configure Windows Git Credential Manager for automatic auth
git config --global credential.helper "/mnt/c/Program\ Files/Git/mingw64/bin/git-credential-manager.exe"
```

## Verify it worked

```bash
# Check config is set correctly
git config --global --list | grep -E "(user|credential)"

# Test with a git operation (it should work without prompting)
git pull  # or git push
```

## What this does

- Sets your Git identity (name/email)
- Configures WSL to use Windows Git Credential Manager
- Credentials automatically shared from Windows - no login needed
- Works for all git operations (push, pull, fetch, clone)

## Benefits

- No manual authentication required
- Credentials managed centrally by Windows
- Works across all WSL sessions automatically
- Claude Code (or any LLM) can run git commands without intervention

---

**Note:** This setup was created for seamless Git operations across WSL and Windows environments. The credential manager path points to your Windows Git installation, allowing WSL to use the same authenticated credentials.
