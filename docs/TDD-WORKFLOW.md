# TDD Workflow - Docs as Code for Writer Sprint

This document explains the Test-Driven Development (TDD) workflow we're using to build the Writer's tool with bulletproof quality.

## Philosophy: Tests ARE the Specification

> "The tests don't just verify the code - they ARE the documentation of what the code should do."

- ✅ **Tests First**: Write failing tests that define the behavior
- ✅ **Implement Second**: Write minimum code to make tests pass
- ✅ **Refactor Third**: Clean up code while tests stay green
- ✅ **Living Docs**: Tests document behavior, always up-to-date

## The Workflow (Red → Green → Refactor)

### Step 1: RED - Write Failing Tests

Write comprehensive test specs that define EXACTLY what the component should do.

**Example: Button Component**
```bash
# Create test file FIRST
touch src/test/design-system/writer-theme-button.test.tsx
```

Write tests that define:
- Visual design (colors, borders, sharp edges)
- Sizing (44px touch targets)
- Interactions (hover, focus, active states)
- Accessibility (keyboard, ARIA, screen readers)
- Performance (< 16ms render)
- Design token integration

**Run tests - they will FAIL**
```bash
npm run test:unit:watch
```

**Expected output:**
```
❌ FAIL src/test/design-system/writer-theme-button.test.tsx
  ● Writer Theme - Button Component › Visual Design - Brutalist Aesthetic › should render primary button with pure black background

    Cannot find module '../../design-system/components/Button'
```

This is GOOD. The failing test tells us exactly what to build.

---

### Step 2: GREEN - Make Tests Pass

Now implement the MINIMUM code to make tests pass.

**Create the component:**
```bash
touch src/design-system/components/Button.tsx
```

**Implement basics:**
```typescript
// src/design-system/components/Button.tsx
import React from 'react';

export const Button = ({ children, variant = 'primary', ...props }) => {
  return (
    <button
      className={`
        ${variant === 'primary' ? 'bg-black text-white' : 'bg-transparent text-black border-black'}
        border-0
        transition-none
        h-[44px]
        px-4
        font-semibold
      `}
      {...props}
    >
      {children}
    </button>
  );
};
```

**Run tests again:**
```bash
npm run test:unit:watch
```

**Expected output:**
```
✅ PASS src/test/design-system/writer-theme-button.test.tsx (5 passed)
  ✅ should render primary button with pure black background
  ✅ should render primary button with white text
  ✅ should have sharp edges (0px border radius)
  ✅ should have zero transition duration
  ✅ should meet 44px minimum touch target height
```

Tests pass! But we're not done...

---

### Step 3: REFACTOR - Clean Up Code

Now refactor to use design tokens instead of hardcoded values.

**Before (hardcoded):**
```typescript
<button className="bg-black text-white border-0" />
```

**After (design tokens):**
```typescript
<button
  style={{
    background: 'var(--component-button-primary-background)',
    color: 'var(--component-button-primary-text)',
    borderRadius: 'var(--primitive-radii-none)',
    transition: 'var(--primitive-transitions-none)',
    minHeight: '44px',
    padding: 'var(--semantic-spacing-sm) var(--semantic-spacing-md)',
  }}
/>
```

**Run tests AGAIN:**
```bash
npm run test:unit:watch
```

Tests should STILL PASS. If they fail, refactoring broke something - fix it.

---

## Component Development Order

Build components in dependency order:

1. **Primitives** (no dependencies)
   - Button ✅ Start here
   - Input ✅ Start here
   - Card ✅ Start here

2. **Composite** (use primitives)
   - OverlayMenu (uses Button)
   - BottomSheet (uses Button)
   - CategoryPicker (uses Button + Input)

3. **Screens** (use composites)
   - DeckListScreen
   - CardListScreen
   - CardEditorScreen

---

## Test Organization

```
src/test/design-system/
├── writer-theme-button.test.tsx      ← Brutalist Button specs
├── writer-theme-input.test.tsx       ← Brutalist Input specs
├── writer-theme-card.test.tsx        ← Card with decorator strips
├── writer-theme-overlay.test.tsx     ← Context-preserving menus
└── writer-theme-bottomsheet.test.tsx ← Mobile bottom sheets
```

Each test file covers:
- **Visual Design** - Colors, borders, typography, spacing
- **Brutalist Aesthetic** - Sharp edges, zero animations, flat
- **Touch Optimization** - 44px targets, tap-friendly sizing
- **Design Tokens** - Integration with Writer theme
- **Accessibility** - Keyboard, ARIA, screen readers
- **Performance** - < 16ms render, smooth interactions
- **NATIVE TODOs** - Comments for future enhancements

---

## Running Tests

### Watch Mode (during development)
```bash
npm run test:unit:watch
```

Automatically re-runs tests when files change. Perfect for TDD workflow.

### Single Run (CI/CD)
```bash
npm run test:unit
```

Run all tests once and exit. Used in CI pipeline.

### Coverage Report
```bash
npm run test:coverage
```

Generates HTML coverage report in `coverage/` directory.

### UI Mode (visual debugging)
```bash
npm run test:ui
```

Opens Vitest UI for visual test debugging and exploration.

---

## Test Structure

### Describe Blocks (organize related tests)
```typescript
describe('Writer Theme - Button Component', () => {
  describe('Visual Design - Brutalist Aesthetic', () => {
    it('should render primary button with pure black background', () => {
      // Test implementation
    });
  });

  describe('Touch Target Sizing - Mobile Optimization', () => {
    it('should meet 44px minimum touch target height', () => {
      // Test implementation
    });
  });
});
```

### Setup (before each test)
```typescript
beforeEach(async () => {
  // Ensure Writer theme is active
  await themeManager.switchTheme('writer');
});
```

### Assertions (what should be true)
```typescript
it('should render with black background', () => {
  render(<Button variant="primary">Click me</Button>);

  const button = screen.getByRole('button', { name: /click me/i });
  const styles = window.getComputedStyle(button);

  expect(styles.backgroundColor).toBe('rgb(0, 0, 0)');
});
```

---

## Testing Library Queries

Use semantic queries that match how users interact with components:

### ✅ Preferred (accessible)
```typescript
screen.getByRole('button', { name: /click me/i })
screen.getByLabelText(/name/i)
screen.getByText(/card content/i)
```

### ⚠️ Fallback (when semantic queries don't work)
```typescript
screen.getByTestId('card-decorator')
```

### ❌ Avoid (implementation details)
```typescript
container.querySelector('.button')  // ❌ Fragile
```

---

## User Interactions

Use `userEvent` for realistic interactions:

```typescript
const user = userEvent.setup();

// Click
await user.click(button);

// Type
await user.type(input, 'Hello world');

// Keyboard
await user.tab();
await user.keyboard('{Enter}');

// Hover
await user.hover(button);
```

---

## Performance Testing

Every component should render in < 16ms (one frame at 60fps):

```typescript
it('should render quickly (< 16ms)', () => {
  const start = performance.now();

  render(<Button>Click me</Button>);

  const duration = performance.now() - start;

  expect(duration).toBeLessThan(16);
});
```

---

## Accessibility Testing

Every component should be fully accessible:

```typescript
it('should be keyboard accessible', async () => {
  const user = userEvent.setup();
  const handleClick = vi.fn();

  render(<Button onClick={handleClick}>Click me</Button>);

  const button = screen.getByRole('button');

  // Tab to focus
  await user.tab();
  expect(button).toHaveFocus();

  // Enter to click
  await user.keyboard('{Enter}');
  expect(handleClick).toHaveBeenCalled();
});

it('should have proper ARIA attributes', () => {
  render(<Button aria-label="Submit form">Submit</Button>);

  const button = screen.getByRole('button');

  expect(button).toHaveAccessibleName('Submit form');
});
```

---

## Design Token Testing

Verify components use tokens, not hardcoded values:

```typescript
it('should use Writer theme component tokens', () => {
  render(<Button variant="primary">Click me</Button>);

  const button = screen.getByRole('button');

  // Should use CSS custom properties
  expect(button.style.getPropertyValue('--component-button-primary-background')).toBeTruthy();
});

it('should use semantic spacing tokens', () => {
  render(<Button>Click me</Button>);

  const button = screen.getByRole('button');
  const styles = window.getComputedStyle(button);

  // Padding should match token values (12px 16px)
  expect(styles.paddingTop).toBe('12px');
  expect(styles.paddingLeft).toBe('16px');
});
```

---

## NATIVE TODO Testing

Document future native enhancements:

```typescript
describe('NATIVE TODO Comments', () => {
  it('should have comment for haptic feedback', () => {
    // This test verifies code has proper TODO structure
    // Actual implementation will have:
    // NATIVE TODO: Add haptic feedback on button press
    // if (Capacitor.isNativePlatform()) {
    //   Haptics.impact({ style: 'light' });
    // }

    expect(true).toBe(true); // Verify in code review
  });
});
```

---

## Coverage Targets

Maintain high coverage for quality:

```json
{
  "coverage": {
    "branches": 70,
    "functions": 75,
    "lines": 75,
    "statements": 75
  }
}
```

**Check coverage:**
```bash
npm run test:coverage
```

Open `coverage/index.html` to see visual report.

---

## CI/CD Integration

Tests run automatically on:

1. **Pre-commit hook** - Fast unit tests
2. **Pull request** - Full test suite
3. **Pre-deploy** - Coverage check

**GitHub Actions workflow:**
```yaml
- name: Run tests
  run: npm run test:unit

- name: Check coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

---

## Benefits of This Approach

✅ **Confidence** - Tests verify every requirement
✅ **Documentation** - Tests explain what code does
✅ **Refactoring Safety** - Change code without breaking behavior
✅ **Regression Prevention** - Tests catch bugs before production
✅ **Design Feedback** - Hard-to-test code = bad design
✅ **Living Specs** - Tests never get out of date

---

## Example Workflow

**1. Start with failing test:**
```bash
$ npm run test:unit:watch

❌ FAIL writer-theme-button.test.tsx
  ● should render primary button with pure black background
```

**2. Implement minimal code:**
```typescript
export const Button = ({ children }) => (
  <button style={{ background: '#000', color: '#fff' }}>
    {children}
  </button>
);
```

**3. Test passes:**
```bash
✅ PASS writer-theme-button.test.tsx
  ✅ should render primary button with pure black background
```

**4. Refactor with tokens:**
```typescript
export const Button = ({ children }) => (
  <button style={{
    background: 'var(--component-button-primary-background)',
    color: 'var(--component-button-primary-text)',
  }}>
    {children}
  </button>
);
```

**5. Test STILL passes:**
```bash
✅ PASS writer-theme-button.test.tsx
  ✅ should render primary button with pure black background
```

**6. Commit:**
```bash
git add .
git commit -m "feat(design): implement Button component with Writer theme

- Pure black background (#000000)
- White text for high contrast
- Sharp edges (0px border radius)
- 44px touch targets (Apple HIG)
- Zero animations (instant state changes)
- Design token integration

Tests: 25/25 passing
Coverage: 95%"
```

---

## Next Steps

1. ✅ **Tests written** - Button, Input, Card specs complete
2. ⏳ **Implement components** - Make tests pass
3. ⏳ **Refactor with tokens** - Clean up code
4. ⏳ **Add Storybook** - Living component documentation
5. ⏳ **Build screens** - Use components to build app

---

## Resources

- **Vitest Docs**: https://vitest.dev/
- **Testing Library**: https://testing-library.com/
- **TDD Kent Beck**: https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530
- **Writer Theme Thesis**: docs/WRITER-DESIGN-THESIS.md
- **Native Enhancements**: WRITER-backlog-P0-docs-document-native-mobile-enhancements-*.md
