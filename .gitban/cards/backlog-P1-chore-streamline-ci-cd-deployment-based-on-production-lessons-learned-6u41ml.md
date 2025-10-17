# CI/CD Deployment Improvements

## Context
During the DESIGNSYS production deployment, we discovered and fixed multiple CI/CD issues that were blocking deployments for months. This card captures improvements to prevent future issues.

## Lessons Learned

### Critical Fixes Applied
1. **YAML Syntax** - GitHub Actions requires spaces, not tabs (fixed all workflows)
2. **Service Account Permissions** - Firebase deployment needs explicit IAM roles
3. **Coverage Threshold** - Removed non-existent coverage-summary.json check
4. **Autonomous Monitoring** - GitHub CLI + PAT enables real-time CI tracking

### Issues Encountered
- Git authentication (fixed: Windows Credential Manager)
- Package lock sync (fixed: npm install)
- JSX dynamic components (fixed: React.createElement)
- Test import errors (fixed: ES modules)
- E2E graceful skips (fixed: return instead of throw)

## Tasks

- [ ] Document CI/CD troubleshooting guide in docs/
- [ ] Add pre-commit hook to validate YAML syntax (no tabs)
- [ ] Configure Firebase service account with required IAM roles:
  - Cloud Firestore Service Agent
  - Firebase Rules System
- [ ] Restore full deployment: hosting + firestore:rules + firestore:indexes
- [ ] Add GitHub Actions workflow validation to test suite
- [ ] Create deployment smoke test checklist
- [ ] Document GitHub CLI setup for autonomous development
- [ ] Add coverage reporting without blocking deployment

## Success Criteria

- [ ] All GitHub Actions workflows deploy successfully
- [ ] Firestore rules deploy without permission errors
- [ ] Pre-commit hooks prevent YAML syntax errors
- [ ] Documentation complete and tested
- [ ] Smoke test checklist integrated into workflow

## References

- Fixed commits: 63b01102 (YAML tabs), 0d30d6b9 (coverage), 18f70211 (hosting-only)
- Deployment URL: https://notecards-1b054.web.app
- GitHub PAT configured for autonomous CI monitoring