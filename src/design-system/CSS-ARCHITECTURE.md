# CSS Architecture Documentation

## Overview

The design system uses a **CSS Custom Properties architecture** for runtime theme switching without recompilation. This allows management to change design direction without touching component code.

## Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│  Components (React/TypeScript)                      │
│  Use tokenCSS helper for type-safe access          │
└───────────────┬─────────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────────┐
│  TokenCSS Helper (JavaScript)                       │
│  Provides dot-notation access to CSS variables     │
│  tokenCSS.color.primary                             │
└───────────────┬─────────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────────┐
│  CSS Custom Properties (:root)                      │
│  --semantic-colors-primary: var(--primitive-blue-600) │
│  --component-button-primary-background: ...         │
└───────────────┬─────────────────────────────────────┘
                │
┌───────────────▼─────────────────────────────────────┐
│  Theme Manager (JavaScript)                         │
│  Updates CSS custom properties on theme switch     │
└─────────────────────────────────────────────────────┘
```

## CSS Custom Properties Structure

### Naming Convention

```css
/* Format: --{tier}-{category}-{property} */

/* Primitive tier */
--primitive-colors-blue-500: #3b82f6;
--primitive-spacing-base: 0.25rem;
--primitive-radii-md: 0.375rem;

/* Semantic tier */
--semantic-colors-primary: var(--primitive-colors-blue-600);
--semantic-spacing-md: calc(var(--primitive-spacing-base) * 4 * var(--primitive-spacing-scale));
--semantic-typography-font-size-md: calc(var(--primitive-spacing-base) * 4);

/* Component tier */
--component-button-primary-background: var(--semantic-colors-primary);
--component-card-padding: var(--semantic-spacing-component-padding);
```

### Why This Naming?

1. **Tier prefix** (`primitive-`, `semantic-`, `component-`) prevents collisions
2. **Category** (`colors`, `spacing`, `typography`) groups related tokens
3. **Kebab-case** (CSS standard for custom properties)
4. **Hierarchical** (clear dependency chain)

## Theme Switching Mechanism

### How Themes Change

```javascript
// 1. User requests theme change
themeManager.switchTheme('dark');

// 2. Theme manager merges theme tokens with defaults
const mergedTokens = mergeWithDefaults(darkTheme.tokens);

// 3. CSS custom properties updated via DOM
document.documentElement.style.setProperty('--semantic-colors-primary', '#60a5fa');
document.documentElement.style.setProperty('--semantic-colors-background-base', '#111827');
// ... all tokens updated

// 4. Components automatically reflect new values
// (CSS variables cascade down to all elements)
```

### Performance Optimization

```javascript
// Batch updates with requestAnimationFrame
requestAnimationFrame(() => {
  // All token updates happen in single frame
  this.applyThemeTokens(theme);

  // Emit event after DOM update
  document.dispatchEvent(new CustomEvent('themechange', {
    detail: { themeId, duration: performance.now() - start }
  }));
});
```

**Result:** <100ms theme switching (typically 25-75ms)

## CSS Patterns

### Pattern 1: Token-Based Inline Styles

**Use Case:** React components with dynamic styling

```typescript
import { tokenCSS } from './design-system';

function Card({ children }) {
  return (
    <div style={{
      background: tokenCSS.card.background,
      padding: tokenCSS.card.padding,
      borderRadius: tokenCSS.card.borderRadius,
      boxShadow: tokenCSS.card.shadow,
    }}>
      {children}
    </div>
  );
}
```

**Pros:**
- ✅ Type-safe (TypeScript autocomplete)
- ✅ Clear token usage
- ✅ Works with React
- ✅ Dynamic theme switching

**Cons:**
- ❌ Inline styles = higher specificity
- ❌ No pseudo-selectors (:hover)
- ❌ Verbose for complex components

### Pattern 2: CSS Modules with Variables

**Use Case:** Traditional CSS workflow

```css
/* Card.module.css */
.card {
  background: var(--component-card-background);
  padding: var(--component-card-padding);
  border-radius: var(--component-card-border-radius);
  box-shadow: var(--component-card-shadow);
  transition: var(--semantic-interactions-transition);
}

.card:hover {
  background: var(--component-card-background-hover);
  box-shadow: var(--component-card-shadow-hover);
}
```

```typescript
import styles from './Card.module.css';

function Card({ children }) {
  return <div className={styles.card}>{children}</div>;
}
```

**Pros:**
- ✅ Pseudo-selectors work
- ✅ Lower specificity
- ✅ Clean component code
- ✅ Cached CSS (performance)

**Cons:**
- ❌ No TypeScript autocomplete for variables
- ❌ Must remember exact variable names

### Pattern 3: Styled Components

**Use Case:** CSS-in-JS with emotion/styled-components

```typescript
import styled from 'styled-components';
import { tokenCSS } from './design-system';

const StyledCard = styled.div`
  background: ${tokenCSS.card.background};
  padding: ${tokenCSS.card.padding};
  border-radius: ${tokenCSS.card.borderRadius};
  box-shadow: ${tokenCSS.card.shadow};
  transition: ${tokenCSS.interactions.transition};

  &:hover {
    background: ${tokenCSS.card.backgroundHover};
    box-shadow: ${tokenCSS.card.shadowHover};
  }
`;

function Card({ children }) {
  return <StyledCard>{children}</StyledCard>;
}
```

**Pros:**
- ✅ Type-safe token access
- ✅ Pseudo-selectors work
- ✅ Scoped styles
- ✅ Dynamic props

**Cons:**
- ❌ Runtime CSS generation (performance)
- ❌ Larger bundle size
- ❌ Styled-components dependency

### Pattern 4: Utility Classes (Tailwind Bridge)

**Use Case:** Gradual migration from Tailwind

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--semantic-colors-primary)',
        secondary: 'var(--semantic-colors-secondary)',
        'text-primary': 'var(--semantic-colors-text-primary)',
      },
      spacing: {
        'component-padding': 'var(--semantic-spacing-component-padding)',
      }
    }
  }
}
```

```typescript
// Component uses Tailwind classes that reference design tokens
<div className="bg-primary text-white p-component-padding rounded">
  Tailwind + Design Tokens
</div>
```

**Pros:**
- ✅ Gradual migration path
- ✅ Existing Tailwind knowledge
- ✅ Utility-first workflow
- ✅ Theme-aware utilities

**Cons:**
- ❌ Requires Tailwind config sync
- ❌ Token name mismatch (Tailwind conventions vs design system)

## Responsive Design

### Mobile-First Approach

```css
.card {
  /* Mobile styles (base) */
  padding: var(--semantic-spacing-sm);
  font-size: var(--semantic-typography-font-size-sm);
}

@media (min-width: 768px) {
  /* Tablet styles */
  .card {
    padding: var(--semantic-spacing-md);
    font-size: var(--semantic-typography-font-size-md);
  }
}

@media (min-width: 1024px) {
  /* Desktop styles */
  .card {
    padding: var(--semantic-spacing-lg);
    font-size: var(--semantic-typography-font-size-lg);
  }
}
```

### Breakpoint Tokens (Future)

```typescript
// Phase 2: Breakpoint tokens
tokenCSS.breakpoints.mobile   // 0-767px
tokenCSS.breakpoints.tablet   // 768px-1023px
tokenCSS.breakpoints.desktop  // 1024px+
```

## State Management

### Hover States

```css
.button {
  background: var(--component-button-primary-background);
  transition: var(--component-button-transition);
}

.button:hover {
  background: var(--component-button-primary-background-hover);
}

.button:active {
  background: var(--component-button-primary-background-active);
}
```

### Focus States

```css
.input {
  border: var(--component-input-border);
  transition: var(--semantic-interactions-transition);
}

.input:focus {
  border: var(--component-input-border-focus);
  outline: none;
  box-shadow: var(--semantic-interactions-focus-ring);
}
```

### Disabled States

```css
.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  /* Tokens auto-adjust for theme (no hardcoded opacity) */
}
```

## Accessibility Patterns

### Focus Indicators

```css
/* Always visible focus ring */
.interactive-element:focus-visible {
  box-shadow: var(--semantic-interactions-focus-ring);
  outline: none;
}
```

### High Contrast Mode

```css
/* Respect user's contrast preference */
@media (prefers-contrast: high) {
  :root {
    --semantic-colors-border-default: var(--semantic-colors-border-strong);
    --component-button-primary-border: 2px solid currentColor;
  }
}
```

### Reduced Motion

```css
/* Respect user's motion preference */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Animation Patterns

### Theme-Aware Animations

```css
.animated-card {
  transition: all var(--semantic-interactions-transition);
}

/* Corporate theme: no animation (transition: 0ms) */
/* Creative theme: bouncy animation (transition: 400ms cubic-bezier(...)) */
/* System automatically adjusts */
```

### Performance Considerations

```css
/* ✅ GOOD: Animate transform/opacity (GPU-accelerated) */
.element {
  transition: transform var(--semantic-interactions-transition),
              opacity var(--semantic-interactions-transition);
}

.element:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}

/* ❌ BAD: Animate layout properties (causes reflow) */
.element {
  transition: height 300ms, width 300ms;  /* ❌ Expensive */
}
```

## Dark Mode Specifics

### Automatic Inversion

```css
/* Dark mode automatically inverts semantic tokens */
:root[data-theme="dark"] {
  --semantic-colors-text-primary: var(--primitive-gray-900);  /* #f9fafb */
  --semantic-colors-background-base: var(--primitive-gray-50);  /* #111827 */
}

/* Components don't need dark mode logic */
.card {
  background: var(--component-card-background);  /* Works in both themes */
  color: var(--semantic-colors-text-primary);    /* Auto-adjusts */
}
```

### Image Handling

```css
/* Reduce brightness for images in dark mode */
[data-theme="dark"] img {
  filter: brightness(0.9);
}

/* Or invert decorative images */
[data-theme="dark"] .decorative-icon {
  filter: invert(1);
}
```

## Performance Best Practices

### 1. Avoid Expensive Selectors

```css
/* ❌ BAD: Universal selector */
* {
  color: var(--semantic-colors-text-primary);
}

/* ✅ GOOD: Targeted selectors */
body {
  color: var(--semantic-colors-text-primary);
}
```

### 2. Minimize Reflows

```css
/* ✅ GOOD: Use transform for movement */
.element {
  transform: translateX(100px);  /* Composite layer */
}

/* ❌ BAD: Use positioning for movement */
.element {
  left: 100px;  /* Triggers reflow */
}
```

### 3. CSS Containment

```css
/* Isolate style calculations */
.card {
  contain: layout style paint;
}
```

## Debugging Tips

### Inspect Token Values

```javascript
// Console debugging
console.log('Primary color:', getComputedStyle(document.documentElement).getPropertyValue('--semantic-colors-primary'));

// Check all tokens
Array.from(document.styleSheets)
  .flatMap(sheet => Array.from(sheet.cssRules))
  .filter(rule => rule.selectorText === ':root')
  .forEach(rule => console.log(rule.cssText));
```

### Visualize Theme Changes

```javascript
// Log theme switch performance
document.addEventListener('themechange', (e) => {
  console.log(`Theme: ${e.detail.themeId}, Duration: ${e.detail.duration}ms`);
});
```

### Validate Token Usage

```javascript
// Find hardcoded values (development only)
const elements = document.querySelectorAll('*');
elements.forEach(el => {
  const computed = getComputedStyle(el);
  if (computed.backgroundColor.includes('rgb') &&
      !computed.backgroundColor.includes('var(')) {
    console.warn('Hardcoded color found:', el, computed.backgroundColor);
  }
});
```

## Migration Patterns

### Gradual Token Adoption

```css
/* Step 1: Use CSS variables directly (quick migration) */
.card {
  background: var(--component-card-background);
  padding: 16px;  /* Still hardcoded */
}

/* Step 2: Replace remaining hardcoded values */
.card {
  background: var(--component-card-background);
  padding: var(--component-card-padding);  /* ✅ Fully tokenized */
}
```

### Fallback Values

```css
/* Provide fallback for older browsers */
.card {
  background: #ffffff;  /* Fallback */
  background: var(--component-card-background);  /* Preferred */
}
```

## Anti-Patterns

### ❌ Don't Modify Tokens Directly

```javascript
// ❌ BAD: Mutating CSS variables outside theme manager
document.documentElement.style.setProperty('--semantic-colors-primary', '#ff0000');

// ✅ GOOD: Create new theme and switch
themeManager.registerTheme({
  id: 'custom-red',
  tokens: {
    semantic: { colors: { primary: '#ff0000' } }
  }
});
themeManager.switchTheme('custom-red');
```

### ❌ Don't Use !important

```css
/* ❌ BAD: Breaking cascade */
.card {
  background: var(--component-card-background) !important;
}

/* ✅ GOOD: Increase specificity */
.container .card {
  background: var(--component-card-background);
}
```

### ❌ Don't Mix Token Tiers

```css
/* ❌ BAD: Component referencing primitive */
.button {
  background: var(--primitive-colors-blue-500);
}

/* ✅ GOOD: Use semantic layer */
.button {
  background: var(--semantic-colors-primary);
}
```

## Browser Support

### Modern Browsers (Full Support)
- Chrome 88+
- Firefox 89+
- Safari 14+
- Edge 88+

### Legacy Browsers (Fallback)
```css
/* Detect CSS custom property support */
@supports (--custom: property) {
  .element {
    background: var(--semantic-colors-primary);
  }
}

@supports not (--custom: property) {
  .element {
    background: #3b82f6;  /* Static fallback */
  }
}
```

---

**CSS architecture built for flexibility, performance, and developer experience.**
