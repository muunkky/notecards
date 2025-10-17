# CI/CD Pipeline for Design System Releases

## Overview

The design system follows a continuous integration and deployment strategy that ensures quality, performance, and backwards compatibility. All changes are validated before merge, and releases are automated.

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────┐
│  1. Pull Request Created                            │
│  - Lint check (ESLint)                              │
│  - Format check (Prettier)                          │
│  - Type check (TypeScript)                          │
│  - Unit tests (Vitest)                              │
└───────────────┬─────────────────────────────────────┘
                │ ✅ All checks pass
┌───────────────▼─────────────────────────────────────┐
│  2. Code Review                                     │
│  - Design system owner approval required            │
│  - Documentation review                             │
│  - Token consistency check                          │
└───────────────┬─────────────────────────────────────┘
                │ ✅ Approved
┌───────────────▼─────────────────────────────────────┐
│  3. Merge to Main Branch                            │
│  - Automated build verification                     │
│  - Bundle size check (<20KB target)                 │
│  - Performance benchmarks (<100ms theme switch)     │
└───────────────┬─────────────────────────────────────┘
                │ ✅ All checks pass
┌───────────────▼─────────────────────────────────────┐
│  4. Deploy to Production                            │
│  - Firebase hosting deployment                      │
│  - Smoke tests (all themes loadable)                │
│  - Rollback capability maintained                   │
└─────────────────────────────────────────────────────┘
```

## GitHub Actions Workflows

### CI Workflow (.github/workflows/ci-tests.yml)

```yaml
name: CI - Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check Prettier formatting
        run: npm run format:check

      - name: TypeScript type check
        run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov (optional)
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

  build-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build production bundle
        run: npm run build

      - name: Validate bundle size
        run: |
          # Check design system bundle size
          BUNDLE_SIZE=$(find dist/assets -name "*.js" -exec gzip -c {} \; | wc -c)
          MAX_SIZE=$((20 * 1024))  # 20KB

          if [ $BUNDLE_SIZE -gt $MAX_SIZE ]; then
            echo "❌ Bundle too large: $(($BUNDLE_SIZE / 1024))KB (max: 20KB)"
            exit 1
          fi

          echo "✅ Bundle size OK: $(($BUNDLE_SIZE / 1024))KB"

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
```

### Deploy Workflow (.github/workflows/deploy.yml)

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for production
        run: npm run build

      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: ${{ secrets.FIREBASE_PROJECT_ID }}

      - name: Run smoke tests
        run: |
          # Wait for deployment
          sleep 10

          # Test all themes loadable
          npm run test:smoke
```

## Local CI Validation

Run the full CI pipeline locally before pushing:

```bash
# Full CI validation script
npm run ci:validate

# Or run individual checks
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
```

### Pre-commit Hooks (Optional)

Install Husky for automatic validation:

```bash
# Install Husky
npm install --save-dev husky

# Initialize Husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run format:check && npm run typecheck"
```

Create `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Lint
npm run lint || exit 1

# Format check
npm run format:check || exit 1

# Type check
npm run typecheck || exit 1

echo "✅ Pre-commit checks passed"
```

## Quality Gates

### Required Checks

**All PRs must pass:**

1. **Linting:** Zero ESLint errors/warnings
2. **Formatting:** Prettier check passes
3. **Type Safety:** Zero TypeScript errors
4. **Tests:** 100% of tests passing
5. **Build:** Production build succeeds
6. **Bundle Size:** <20KB (gzipped)

### Performance Benchmarks

**Theme switching must stay under target:**

```typescript
// Performance test (runs in CI)
describe('Design system performance', () => {
  it('switches themes in <100ms', async () => {
    const start = performance.now();
    await themeManager.switchTheme('dark');
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(100);
  });

  it('maintains <20KB bundle size', () => {
    const bundleSize = getBundleSizeGzipped('./dist/assets');
    expect(bundleSize).toBeLessThan(20 * 1024);
  });
});
```

## Release Strategy

### Semantic Versioning

Design system follows semver:

- **Major (1.0.0 → 2.0.0):** Breaking changes (token removals, API changes)
- **Minor (1.0.0 → 1.1.0):** New features (new themes, tokens)
- **Patch (1.0.0 → 1.0.1):** Bug fixes (token value corrections)

### Release Process

```bash
# 1. Update version
npm version minor  # or major/patch

# 2. Update CHANGELOG.md
# Document all changes since last release

# 3. Create git tag
git tag -a v1.1.0 -m "Release v1.1.0: Add dark mode theme"

# 4. Push with tags
git push origin main --follow-tags

# 5. GitHub Actions automatically deploys
```

### Changelog Management

**CHANGELOG.md format:**

```markdown
# Changelog

## [1.1.0] - 2025-10-16

### Added
- Dark mode theme with OLED-friendly colors
- Performance optimization for theme switching
- New accessibility tokens (focus ring, contrast modes)

### Changed
- Updated spacing scale calculation for better consistency
- Improved TypeScript types for token definitions

### Fixed
- Fixed hover state colors in accessible theme
- Corrected line-height token in minimal theme

### Breaking Changes
None
```

## Rollback Procedures

### Quick Rollback

If deployment causes production issues:

```bash
# Option 1: Revert last commit
git revert HEAD
git push origin main

# Option 2: Deploy previous version
firebase hosting:rollback

# Option 3: Manual tag deployment
git checkout v1.0.0
npm run build
firebase deploy --only hosting
```

### Rollback Verification

```bash
# Test rollback worked
npm run test:smoke

# Verify themes loading
curl https://your-app.web.app | grep "design-system"
```

## Monitoring and Alerts

### Performance Monitoring

**Track key metrics in production:**

```typescript
// Log theme switch performance
document.addEventListener('themechange', (e: CustomEvent) => {
  const duration = e.detail.duration;

  // Send to analytics
  if (window.gtag) {
    gtag('event', 'theme_switch', {
      theme: e.detail.themeId,
      duration_ms: duration,
      exceeded_target: duration > 100,
    });
  }

  // Alert if consistently slow
  if (duration > 150) {
    console.warn('Theme switch slower than target:', duration);
  }
});
```

### Bundle Size Monitoring

**Track bundle size trends:**

```bash
# GitHub Action to comment on PR
# Shows bundle size change vs main branch

- name: Comment bundle size
  run: |
    CURRENT_SIZE=$(du -k dist/assets/*.js | awk '{sum+=$1} END {print sum}')
    echo "Bundle size: ${CURRENT_SIZE}KB" >> $GITHUB_STEP_SUMMARY
```

## Automated Testing in CI

### Unit Tests

```yaml
# Runs all design system tests
- name: Run design system tests
  run: npm test -- design-system
```

### Visual Regression Tests (Future)

```yaml
# Future: Percy/Chromatic integration
- name: Visual regression tests
  run: npm run test:visual
  env:
    PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
```

### Cross-browser Testing (Future)

```yaml
# Future: BrowserStack/Sauce Labs
- name: Cross-browser tests
  run: npm run test:browsers
  env:
    BROWSERSTACK_ACCESS_KEY: ${{ secrets.BROWSERSTACK_KEY }}
```

## Security Scanning

### Dependency Vulnerability Checks

```yaml
# Automated security scanning
- name: Security audit
  run: npm audit --audit-level=moderate

- name: Dependency check
  run: npx audit-ci --moderate
```

### License Compliance

```yaml
# Check for license conflicts
- name: License check
  run: npx license-checker --failOn "GPL;AGPL"
```

## Deployment Environments

### Development

- **Trigger:** Every commit to `develop` branch
- **URL:** https://dev.your-app.web.app
- **Testing:** Manual QA, theme testing

### Staging

- **Trigger:** Every commit to `main` branch
- **URL:** https://staging.your-app.web.app
- **Testing:** Automated smoke tests, performance benchmarks

### Production

- **Trigger:** Manual approval or tag push
- **URL:** https://your-app.web.app
- **Testing:** Full smoke test suite, rollback capability

## Troubleshooting CI Issues

### Build Failures

**Problem:** CI build fails but local build works

**Solutions:**
1. Check Node version (CI uses 18, local may differ)
2. Clear npm cache: `npm ci` (clean install)
3. Check environment variables
4. Verify git LFS files committed

### Test Flakiness

**Problem:** Tests pass locally but fail in CI

**Solutions:**
1. Run tests with `npm test -- --run` (no watch mode)
2. Check for timing-dependent tests
3. Increase timeouts for theme switching tests
4. Mock browser APIs properly

### Deployment Failures

**Problem:** Firebase deployment fails

**Solutions:**
1. Verify Firebase service account credentials
2. Check Firebase project ID
3. Ensure build artifacts exist
4. Review Firebase hosting configuration

## Best Practices

### ✅ DO

- **Run full CI locally** before pushing
- **Keep CI fast** (<5 minutes total)
- **Use caching** for dependencies
- **Monitor bundle size** trends
- **Automate everything** that can be automated

### ❌ DON'T

- **Don't skip CI checks** (defeats the purpose)
- **Don't deploy without tests** passing
- **Don't ignore bundle size warnings**
- **Don't deploy on Friday** (rollback difficult over weekend)

## Future Enhancements

### Phase 2: Advanced CI/CD

- [ ] Automated visual regression testing
- [ ] Cross-browser compatibility testing
- [ ] Performance regression detection
- [ ] Automatic dependency updates (Dependabot)

### Phase 3: Release Automation

- [ ] Automatic changelog generation
- [ ] NPM package publishing (if design system extracted)
- [ ] Version bump automation
- [ ] Release notes generation

---

**CI/CD ensures design system quality and reliability at every stage.**
