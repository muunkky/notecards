# Release Process Documentation

## Overview

Automated release management system that handles:
- Semantic versioning (MAJOR.MINOR.PATCH)
- Changelog generation from sprint archives and git commits
- Release notes generation from gitban cards
- Git tagging with comprehensive metadata
- VERSION.md updates
- Integration with CI/CD pipeline

## Quick Start

```bash
# Patch release (0.0.2 -> 0.0.3) - Bug fixes
npm run release:patch

# Minor release (0.0.2 -> 0.1.0) - New features
npm run release:minor

# Major release (0.0.2 -> 1.0.0) - Breaking changes
npm run release:major

# Dry run to see what would happen
npm run release:dry-run
```

## Usage

### Basic Release

The release script automates the entire release process:

```bash
# Run tests, bump version, generate changelog, create git tag
npm run release patch

# Push to origin
git push origin main
git push origin v0.0.3
```

### Options

- `--dry-run` - Show what would happen without making changes
- `--skip-tests` - Skip running test suite before release
- `--sprint=NAME` - Associate release with specific sprint

Examples:
```bash
# Preview next release
npm run release patch --dry-run

# Release without running tests (use with caution!)
npm run release patch --skip-tests

# Associate with specific sprint
npm run release minor --sprint=AUTHENTICATION
```

## What the Script Does

### 1. Test Suite (unless `--skip-tests`)
- Runs `npm test` to ensure all tests pass
- Aborts if any tests fail

### 2. Version Calculation
- Reads current version from package.json
- Calculates new version based on bump type:
  - **patch**: 0.0.2 → 0.0.3 (bug fixes)
  - **minor**: 0.0.2 → 0.1.0 (new features)
  - **major**: 0.0.2 → 1.0.0 (breaking changes)

### 3. Sprint Analysis
- Scans `.gitban/cards/archive/sprints/` for sprint completions
- Reads `_sprint.json` manifests for sprint metadata
- Finds sprints created since last git tag
- Extracts card counts and sprint descriptions

### 4. Changelog Generation
- Analyzes git commits since last tag
- Categorizes commits by conventional commit type:
  - **feat**: New features
  - **fix**: Bug fixes
  - **chore/docs/test**: Maintenance
- Generates sprint summaries with card counts
- Formats release notes in markdown

### 5. File Updates
- **package.json** - Updates version with `npm version`
- **package-lock.json** - Automatically updated
- **CHANGELOG.md** - Prepends new release notes
- **VERSION.md** - Updates current version

### 6. Git Operations
- Stages all changed files
- Creates commit with conventional commit format
- Creates annotated git tag with release notes
- Includes Claude Code co-authorship

## Semantic Versioning

Following [SemVer 2.0.0](https://semver.org/):

### MAJOR (1.0.0)
Breaking changes that require users to update their code:
- API changes
- Removed features
- Incompatible updates

**Example:**
```bash
npm run release major
# 0.9.5 → 1.0.0
```

### MINOR (0.1.0)
New features in a backwards-compatible manner:
- New functionality
- Enhancements
- New APIs

**Example:**
```bash
npm run release minor
# 0.0.5 → 0.1.0
```

### PATCH (0.0.1)
Backwards-compatible bug fixes:
- Bug fixes
- Documentation updates
- Small improvements

**Example:**
```bash
npm run release patch
# 0.0.2 → 0.0.3
```

## Sprint Integration

The release script automatically discovers sprint completions:

### Sprint Archive Structure
```
.gitban/cards/archive/sprints/
├── sprint-2024-q4-authentication-20251001/
│   ├── _sprint.json           # Sprint manifest
│   ├── done-P1-feature-...md  # Completed cards
│   └── ...
└── sprint-2024-q4-testmaint-20251015/
    ├── _sprint.json
    └── ...
```

### Sprint Manifest (_sprint.json)
```json
{
  "sprint_name": "TESTMAINT-2025-Q4",
  "description": "Test infrastructure modernization",
  "start_date": "2025-10-01",
  "end_date": "2025-10-15",
  "cards": [
    {"id": "abc123", "title": "modernize-testing", "status": "done"},
    ...
  ],
  "metrics": {
    "total_cards": 8,
    "completed": 8,
    "failed": 0
  }
}
```

### Generated Release Notes Example
```markdown
## [0.0.3] - 2025-10-17

### Sprint Completions

**TESTMAINT-2025-Q4** (8 cards)
- Test infrastructure modernization

**DESIGNSYS** (13 cards)
- Complete design system architecture

### Changes

**Features:**
- Design and implement semantic versioning system
- Integrate gitban cards with automated release notes

**Bug Fixes:**
- Fix coverage threshold blocking deployments

**Chores:**
- Update test documentation and best practices

---
```

## Conventional Commits

The script categorizes commits using [Conventional Commits](https://www.conventionalcommits.org/):

### Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **chore**: Maintenance (tests, docs, build)
- **docs**: Documentation only
- **style**: Formatting, no code changes
- **refactor**: Code restructuring
- **perf**: Performance improvements
- **test**: Adding/fixing tests
- **ci**: CI/CD changes

### Examples
```bash
feat(auth): add OAuth2 support
fix(ui): resolve button alignment issue
chore(deps): upgrade React to 18.3.1
docs(api): add authentication guide
```

## Release Workflow

### Complete Release Process

1. **Prepare Release**
   ```bash
   # Ensure you're on main branch
   git checkout main
   git pull origin main

   # Verify all tests pass
   npm test

   # Preview release (optional)
   npm run release:dry-run
   ```

2. **Create Release**
   ```bash
   # Bump version, generate changelog, create tag
   npm run release patch  # or minor/major
   ```

3. **Push to Repository**
   ```bash
   # Push commit
   git push origin main

   # Push tag
   git push origin v0.0.3
   ```

4. **Deployment**
   - GitHub Actions will automatically deploy to production on tag push
   - Monitor deployment at: https://github.com/muunkky/notecards/actions

5. **Verify Deployment**
   ```bash
   # Check production
   open https://notecards-1b054.web.app

   # Verify version
   gh release list
   ```

### Hotfix Process

For urgent fixes that need immediate release:

```bash
# Create hotfix branch from tag
git checkout -b hotfix/critical-fix v0.0.2

# Make fix
git add .
git commit -m "fix(critical): resolve production issue"

# Merge back to main
git checkout main
git merge hotfix/critical-fix

# Release patch version
npm run release patch

# Push
git push origin main
git push origin v0.0.3
```

## Rollback

If a release has issues:

### Option 1: Revert and Release New Version
```bash
# Revert problematic commit
git revert HEAD

# Test thoroughly
npm test

# Release new patch version
npm run release patch
git push origin main
git push origin v0.0.4
```

### Option 2: Rollback to Previous Tag
```bash
# List tags
git tag -l

# Checkout previous version
git checkout v0.0.2

# Create rollback branch
git checkout -b rollback-to-v0.0.2

# Force push to main (use with extreme caution!)
git push origin rollback-to-v0.0.2:main --force
```

## CI/CD Integration

### GitHub Actions

The release process integrates with GitHub Actions workflows:

**On Tag Push:**
- Triggers production deployment
- Runs full test suite
- Deploys to Firebase hosting
- Updates version tracking

**Workflow Files:**
- `.github/workflows/prod-deploy.yml` - Production deployment on tag
- `.github/workflows/dev-deploy.yml` - Development deployment
- `.github/workflows/ci-tests.yml` - CI testing on PRs

### Manual Deployment Trigger

If automatic deployment fails:

```bash
# Manually trigger workflow
gh workflow run prod-deploy.yml --ref v0.0.3

# Monitor deployment
gh run watch
```

## Best Practices

### Before Release
- ✅ All tests passing locally
- ✅ All PRs merged to main
- ✅ Documentation updated
- ✅ Sprint cards completed and archived
- ✅ No uncommitted changes

### Release Timing
- **Patch**: Anytime for bug fixes
- **Minor**: After sprint completion
- **Major**: Planned milestone, coordinate with team

### Commit Messages
- Use conventional commit format
- Reference issue/card numbers
- Include breaking change notices for major releases
- Keep first line under 72 characters

### Version Numbering (Pre-1.0)
- Use 0.x.y for development versions
- Breaking changes are allowed in 0.x versions
- 1.0.0 indicates first stable API

### Testing
- Always run tests before release (or use `--skip-tests` consciously)
- Test in development environment first
- Verify production after deployment

## Troubleshooting

### Release Script Fails

**Tests fail:**
```bash
# Fix failing tests first
npm test

# Then retry release
npm run release patch
```

**Git push rejected:**
```bash
# Pull latest changes
git pull origin main --rebase

# Resolve conflicts if any
git status
git add .
git rebase --continue

# Push again
git push origin main
git push origin v0.0.3
```

**Version conflict:**
```bash
# Check current version
grep version package.json

# Manual version update if needed
npm version 0.0.3 --no-git-tag-version
```

### Deployment Fails

**Check GitHub Actions:**
```bash
# View recent runs
gh run list --limit 5

# View specific run
gh run view <run-id>

# View logs
gh run view <run-id> --log
```

**Firebase deployment issues:**
```bash
# Check Firebase status
firebase list

# Manual deployment
npm run build
firebase deploy --only hosting
```

### Tag Already Exists

```bash
# Delete local tag
git tag -d v0.0.3

# Delete remote tag
git push origin :refs/tags/v0.0.3

# Create new release
npm run release patch
git push origin main
git push origin v0.0.3
```

## Script Maintenance

### Location
- **Script**: `scripts/release.mjs`
- **Documentation**: `docs/RELEASE-PROCESS.md` (this file)

### Customization

Edit `scripts/release.mjs` to customize:
- Changelog format
- Commit message template
- Sprint analysis logic
- File update behavior

### Testing Changes

Always test with `--dry-run` before modifying:
```bash
# Test your changes
npm run release:dry-run

# Verify output looks correct
git status  # Should show no changes in dry-run mode
```

## Related Documentation

- [VERSION.md](../VERSION.md) - Version history and rollback points
- [CHANGELOG.md](../CHANGELOG.md) - Auto-generated release notes
- [Git Workflow](./GIT-WORKFLOW-AND-PRACTICES.md) - Git branching strategy
- [Deployment Guide](./Deployment-Improvements.md) - CI/CD configuration

## Quick Reference

```bash
# Release commands
npm run release:patch        # 0.0.2 -> 0.0.3 (bug fixes)
npm run release:minor        # 0.0.2 -> 0.1.0 (features)
npm run release:major        # 0.0.2 -> 1.0.0 (breaking)
npm run release:dry-run      # Preview without changes

# Git operations
git push origin main         # Push commit
git push origin v0.0.3       # Push tag
git tag -l                   # List tags
git describe --tags          # Show current tag

# Deployment
gh run list                  # View GitHub Actions runs
gh run watch                 # Monitor current run
firebase hosting:sites:list  # List hosting sites
```

## Support

For issues with the release process:
1. Check troubleshooting section above
2. Review recent releases in CHANGELOG.md
3. Check GitHub Actions logs
4. Contact project maintainer

---

**Last Updated:** 2025-10-17
**Script Version:** 1.0.0
**Maintainer:** Claude Code + Cameron
