# Development Environment Setup

## Prerequisites

- **Node.js**: 18+ (recommended: latest LTS)
- **npm**: 9+ (comes with Node.js)
- **Git**: For version control
- **VSCode** (recommended) or any modern editor with TypeScript support

## Initial Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd notecards

# 2. Install dependencies
npm install

# 3. Verify installation
npm run lint
npm run build
npm run test
```

## Development Workflow

### Running the Application

```bash
# Start development server with HMR
npm run dev

# Access application at http://localhost:5173
```

### Design System Development

```bash
# Watch design system files for changes
npm run dev

# Design system files hot-reload automatically
# Changes to src/design-system/* trigger instant updates
```

### Linting and Formatting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format with Prettier
npm run format

# Check formatting without writing
npm run format:check
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run design system specific tests
npm test -- design-system
```

### Type Checking

```bash
# Type check without emitting files
npm run typecheck

# Type check test files separately
npm run typecheck:tests
```

## Design System Specific Guidelines

### Token-First Development

**✅ ALWAYS use tokens:**

```typescript
import { tokenCSS } from '../design-system';

// Good: Token-based styling
const Button = styled.button\`
  background: \${tokenCSS.button.primaryBackground};
  color: \${tokenCSS.button.primaryText};
  padding: \${tokenCSS.button.paddingMd};
\`;
```

**❌ NEVER hardcode values:**

```typescript
// Bad: Hardcoded values (ESLint will error)
const Button = styled.button\`
  background: #3b82f6;  // ❌ ESLint error
  color: white;         // ❌ ESLint error
  padding: 16px;        // ❌ ESLint error
\`;
```

### Adding New Tokens

1. **Define in appropriate tier:**

```typescript
// src/design-system/tokens/semantic-tokens.ts
export const newToken: SemanticToken = {
  highlight: 'var(--primitive-yellow-300)',
};
```

2. **Add to TokenCSS helper:**

```typescript
// src/design-system/tokens/token-css.ts
export const tokenCSS = {
  color: {
    highlight: 'var(--semantic-colors-highlight)',
  },
};
```

3. **Document in TOKEN-API-REFERENCE.md:**

```markdown
### New Token Category

\`\`\`typescript
// Usage
tokenCSS.color.highlight
// Value: #fbbf24 (default theme)
\`\`\`
```

4. **Test across themes:**

```typescript
describe('New token', () => {
  ['default', 'corporate', 'creative', 'minimal', 'accessible', 'dense', 'dark'].forEach(theme => {
    it(\`works with \${theme} theme\`, () => {
      themeManager.switchTheme(theme);
      expect(tokenCSS.color.highlight).toBeDefined();
    });
  });
});
```

### Theme Development

**Creating new themes:**

```typescript
// src/design-system/theme/theme-manager.ts
this.registerTheme({
  id: 'custom',
  name: 'Custom Theme',
  description: 'Your custom theme',
  category: 'creative',
  businessContext: 'Use case description',
  tokens: {
    primitive: {
      colors: {
        blue500: '#your-color',
        // ... other primitives
      }
    },
    semantic: {
      colors: {
        primary: 'var(--primitive-blue-500)',
        // ... semantic mappings
      }
    }
  }
});
```

**Testing themes:**

```bash
# Start dev server
npm run dev

# Open browser console
themeManager.switchTheme('custom');

# Verify visual appearance
# Check performance: should be <100ms
```

## IDE Setup (VSCode)

### Recommended Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Settings Configuration

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

## Common Development Tasks

### Add a New Component

```bash
# 1. Create component file
touch src/components/NewComponent.tsx

# 2. Use design tokens
import { tokenCSS } from '../design-system';

# 3. Write tests
touch src/test/components/NewComponent.test.tsx

# 4. Test with all themes
npm test -- NewComponent
```

### Update Existing Component to Use Tokens

```typescript
// BEFORE: Tailwind classes
<button className="bg-blue-600 text-white px-4 py-2 rounded">
  Submit
</button>

// AFTER: Token-based inline styles
<button style={{
  background: tokenCSS.button.primaryBackground,
  color: tokenCSS.button.primaryText,
  padding: tokenCSS.button.paddingMd,
  borderRadius: tokenCSS.button.borderRadius,
}}>
  Submit
</button>
```

### Debug Token Values

```typescript
// In browser console
import { tokenCSS } from './design-system';

// Check current token value
console.log(tokenCSS.color.primary);

// Check CSS custom property
getComputedStyle(document.documentElement)
  .getPropertyValue('--semantic-colors-primary');

// List all tokens
console.log(tokenCSS);
```

### Performance Profiling

```typescript
// Measure theme switch performance
performance.mark('theme-switch-start');
themeManager.switchTheme('dark');
performance.mark('theme-switch-end');
performance.measure('theme-switch', 'theme-switch-start', 'theme-switch-end');

// Get measurement
const measure = performance.getEntriesByName('theme-switch')[0];
console.log(\`Theme switch took: \${measure.duration}ms\`);
// Target: <100ms
```

## Troubleshooting

### ESLint Errors

**Problem:** ESLint reports hardcoded color/spacing errors

**Solution:**
1. Replace hardcoded values with tokens
2. Use `tokenCSS` helper for type-safe access
3. Consult TOKEN-API-REFERENCE.md for correct token

**Example:**

```typescript
// Error: Hardcoded hex color
background: '#3b82f6'  // ❌

// Fix: Use semantic token
background: tokenCSS.color.primary  // ✅
```

### TypeScript Errors

**Problem:** \`Property 'newToken' does not exist on type 'TokenCSS'\`

**Solution:**
1. Add token to `token-css.ts`
2. Update TypeScript types
3. Rebuild: `npm run build`

### Theme Not Applying

**Problem:** Theme switch doesn't update component styles

**Solution:**
1. **Check token usage:** Component must use CSS custom properties
2. **Verify DOM:** Inspect computed styles in DevTools
3. **Clear cache:** Hard reload (Ctrl+Shift+R)

```typescript
// Wrong: Static value
const Button = styled.button\`
  background: #3b82f6;  // ❌ Never updates
\`;

// Correct: CSS custom property
const Button = styled.button\`
  background: var(--semantic-colors-primary);  // ✅ Updates on theme switch
\`;
```

### Build Failures

**Problem:** `npm run build` fails with type errors

**Solution:**
1. Check `tsconfig.json` includes design system files
2. Run `npm run typecheck` for detailed errors
3. Fix type errors in reported files
4. Ensure all token types are defined

## Git Workflow

### Branching Strategy

```bash
# Feature branch for design system work
git checkout -b feature/design-system-improvements

# Make changes
# ... edit files ...

# Commit with conventional commits
git add .
git commit -m "feat(design-system): Add new color tokens for error states"

# Push and create PR
git push origin feature/design-system-improvements
```

### Conventional Commit Format

```
feat(design-system): Add dark mode theme
fix(tokens): Correct spacing scale calculation
docs(design-system): Update TOKEN-API-REFERENCE
chore(lint): Add ESLint rule for hardcoded colors
test(theme): Add theme switching tests
```

### Pre-commit Checklist

- [ ] `npm run lint` passes
- [ ] `npm run format:check` passes
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] All themes tested visually
- [ ] Documentation updated

## Performance Guidelines

### Theme Switching Target

**Goal:** <100ms for theme switch

**Measurement:**

```typescript
const start = performance.now();
themeManager.switchTheme('dark');
const duration = performance.now() - start;
console.log(\`Theme switch: \${duration}ms\`);
```

**If slow (>100ms):**
1. Check token count (fewer is better)
2. Profile with Chrome DevTools Performance tab
3. Ensure `requestAnimationFrame` batching is working
4. Review DOM size (smaller = faster)

### Bundle Size Guidelines

- **Design System Core:** <15KB minified + gzipped
- **Theme Manager:** <5KB minified + gzipped
- **Per Theme Overhead:** <2KB each

**Check bundle size:**

```bash
npm run build
ls -lh dist/assets/*.js | sort -k5 -h
```

## Resources

- [Design System Principles](./DESIGN-PRINCIPLES.md)
- [Token API Reference](./TOKEN-API-REFERENCE.md)
- [CSS Architecture](./CSS-ARCHITECTURE.md)
- [Accessibility Compliance](./ACCESSIBILITY-COMPLIANCE.md)
- [Migration Guide](./ADOPTION-MIGRATION-PLAN.md)

---

**Ready to develop? Start with `npm run dev` and open the theme switcher to explore!**
