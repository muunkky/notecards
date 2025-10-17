# Design Token API Reference

Complete reference for all design tokens in the management change-proof design system.

## Quick Reference

```typescript
import { tokenCSS } from './design-system';

// Colors
tokenCSS.color.primary
tokenCSS.color.success
tokenCSS.color.textPrimary
tokenCSS.color.backgroundBase

// Typography
tokenCSS.typography.fontPrimary
tokenCSS.typography.fontSizeMd
tokenCSS.typography.fontWeightBold

// Spacing
tokenCSS.spacing.xs // 4px (varies by theme scale)
tokenCSS.spacing.md // 16px (varies by theme scale)
tokenCSS.spacing.xl // 32px (varies by theme scale)

// Component tokens
tokenCSS.button.primaryBackground
tokenCSS.card.borderRadius
tokenCSS.input.padding
```

## Token Hierarchy

### Three-Tier System

```
┌─────────────────────────────────────┐
│   Component Tokens                  │
│   (Specific usage)                  │
│   button.primaryBackground          │
│   card.padding                      │
└────────────┬────────────────────────┘
             │ References
┌────────────▼────────────────────────┐
│   Semantic Tokens                   │
│   (Purpose-based)                   │
│   colors.primary                    │
│   spacing.componentPadding          │
└────────────┬────────────────────────┘
             │ References
┌────────────▼────────────────────────┐
│   Primitive Tokens                  │
│   (Raw values)                      │
│   blue500: '#3b82f6'                │
│   base: '0.25rem'                   │
└─────────────────────────────────────┘
```

##Color Tokens

### Semantic Colors

#### Brand Colors

```typescript
// Primary brand color
tokenCSS.color.primary
// Usage: CTAs, links, primary actions
// Example: '#2563eb' (default), '#ec4899' (creative), '#374151' (minimal)

// Secondary brand color
tokenCSS.color.secondary
// Usage: Secondary actions, alternative CTAs
// Example: '#4b5563' (default)

// Accent color
tokenCSS.color.accent
// Usage: Highlights, badges, notifications
// Example: '#3b82f6' (default)
```

#### State Colors

```typescript
// Success state
tokenCSS.color.success
// Usage: Success messages, completed status
// Value: '#22c55e' (green-500)

// Warning state
tokenCSS.color.warning
// Usage: Warning messages, caution indicators
// Value: '#eab308' (yellow-500)

// Error state
tokenCSS.color.error
// Usage: Error messages, validation failures
// Value: '#ef4444' (red-500)

// Info state
tokenCSS.color.info
// Usage: Informational messages, tooltips
// Value: '#3b82f6' (blue-500)
```

#### Text Colors

```typescript
// Primary text (main content)
tokenCSS.color.textPrimary
// Usage: Body text, headings
// Contrast: WCAG AA compliant (4.5:1)

// Secondary text (supporting content)
tokenCSS.color.textSecondary
// Usage: Captions, labels
// Contrast: WCAG AA compliant (4.5:1)

// Muted text (de-emphasized)
tokenCSS.color.textMuted
// Usage: Placeholders, disabled text
// Contrast: WCAG AA compliant (3:1)

// Inverse text (on dark backgrounds)
tokenCSS.color.textInverse
// Usage: Text on primary buttons, dark cards
// Value: '#ffffff' or near-white
```

#### Background Colors

```typescript
// Base background (page background)
tokenCSS.color.backgroundBase
// Usage: Main page background
// Value: '#ffffff' (light), '#111827' (dark)

// Elevated background (cards, modals)
tokenCSS.color.backgroundElevated
// Usage: Cards, dropdowns, raised surfaces
// Value: '#f9fafb' (light), '#1f2937' (dark)

// Inverse background (dark sections)
tokenCSS.color.backgroundInverse
// Usage: Dark headers, footers
// Value: '#111827' (light), '#f9fafb' (dark)

// Overlay background (modals, tooltips)
tokenCSS.color.backgroundOverlay
// Usage: Modal overlays, dropdown shadows
// Value: 'rgba(0, 0, 0, 0.5)'
```

#### Border Colors

```typescript
// Subtle border (minimal separation)
tokenCSS.color.borderSubtle
// Usage: Subtle dividers, table borders
// Value: '#e5e7eb' (gray-200)

// Default border (standard separation)
tokenCSS.color.borderDefault
// Usage: Input borders, card borders
// Value: '#d1d5db' (gray-300)

// Strong border (prominent separation)
tokenCSS.color.borderStrong
// Usage: Focus borders, emphasized dividers
// Value: '#9ca3af' (gray-400)

// Accent border (interactive elements)
tokenCSS.color.borderAccent
// Usage: Active inputs, selected items
// Value: '#93c5fd' (blue-300)
```

## Typography Tokens

### Font Families

```typescript
// Primary font (body text)
tokenCSS.typography.fontPrimary
// Usage: Body text, UI components
// Value: 'system-ui, sans-serif' (default)
// Themes: Serif (corporate), Display (creative)

// Heading font (titles, headings)
tokenCSS.typography.fontHeading
// Usage: H1-H6, section titles
// Value: Same as fontPrimary or distinct

// Monospace font (code, data)
tokenCSS.typography.fontMono
// Usage: Code blocks, technical data
// Value: '"Fira Code", Monaco, monospace'
```

### Font Sizes

```typescript
// Extra small
tokenCSS.typography.fontSizeXs
// Usage: Captions, footnotes
// Value: calc(var(--primitive-spacing-base) * 3) // 0.75rem / 12px

// Small
tokenCSS.typography.fontSizeSm
// Usage: Labels, small text
// Value: calc(var(--primitive-spacing-base) * 3.5) // 0.875rem / 14px

// Medium (base)
tokenCSS.typography.fontSizeMd
// Usage: Body text, buttons
// Value: calc(var(--primitive-spacing-base) * 4) // 1rem / 16px

// Large
tokenCSS.typography.fontSizeLg
// Usage: Subheadings, emphasized text
// Value: calc(var(--primitive-spacing-base) * 4.5) // 1.125rem / 18px

// Extra large
tokenCSS.typography.fontSizeXl
// Usage: H3 headings
// Value: calc(var(--primitive-spacing-base) * 5) // 1.25rem / 20px

// 2X large
tokenCSS.typography.fontSize2xl
// Usage: H2 headings
// Value: calc(var(--primitive-spacing-base) * 6) // 1.5rem / 24px

// 3X large
tokenCSS.typography.fontSize3xl
// Usage: H1 headings, hero text
// Value: calc(var(--primitive-spacing-base) * 7.5) // 1.875rem / 30px
```

### Font Weights

```typescript
// Light weight
tokenCSS.typography.fontWeightLight
// Value: 300

// Normal weight (base)
tokenCSS.typography.fontWeightNormal
// Value: 400

// Medium weight
tokenCSS.typography.fontWeightMedium
// Usage: Emphasized text, buttons
// Value: 500

// Bold weight
tokenCSS.typography.fontWeightBold
// Usage: Headings, strong emphasis
// Value: 700
```

### Line Heights

```typescript
// Tight line height
tokenCSS.typography.lineHeightTight
// Usage: Headings, compact text
// Value: 1.2

// Normal line height (base)
tokenCSS.typography.lineHeightNormal
// Usage: Body text
// Value: 1.5

// Loose line height
tokenCSS.typography.lineHeightLoose
// Usage: Long-form content, readability
// Value: 1.8
```

## Spacing Tokens

### Spacing Scale

**Note:** Spacing scales dynamically based on theme's `spacing.scale` factor.

```typescript
// Extra small spacing
tokenCSS.spacing.xs
// Base: 4px (scale=1)
// Corporate: 3px (scale=0.75)
// Creative: 6px (scale=1.5)
// Minimal: 8px (scale=2)

// Small spacing
tokenCSS.spacing.sm
// Base: 8px (scale=1)

// Medium spacing (base unit)
tokenCSS.spacing.md
// Base: 16px (scale=1)

// Large spacing
tokenCSS.spacing.lg
// Base: 24px (scale=1)

// Extra large spacing
tokenCSS.spacing.xl
// Base: 32px (scale=1)

// 2X extra large spacing
tokenCSS.spacing.xxl
// Base: 48px (scale=1)
```

### Component Spacing

```typescript
// Standard component padding
tokenCSS.spacing.componentPadding
// Usage: Cards, buttons, inputs
// Value: var(--semantic-spacing-md)

// Section gap
tokenCSS.spacing.sectionGap
// Usage: Between page sections
// Value: var(--semantic-spacing-xl)

// Page margin
tokenCSS.spacing.pageMargin
// Usage: Page side margins
// Value: var(--semantic-spacing-lg)
```

## Interaction Tokens

```typescript
// Border radius
tokenCSS.interactions.borderRadius
// Usage: Buttons, cards, inputs
// Value: 0px (corporate) → 1rem (creative)

// Elevation (box-shadow)
tokenCSS.interactions.elevation
// Usage: Cards, dropdowns, modals
// Value: '0 4px 6px -1px rgb(0 0 0 / 0.1), ...'

// Transition
tokenCSS.interactions.transition
// Usage: Hover states, theme switching
// Value: '0ms' (corporate) → '400ms cubic-bezier(...)' (creative)

// Focus ring
tokenCSS.interactions.focusRing
// Usage: Keyboard focus indicators
// Value: '0 0 0 2px var(--semantic-colors-accent)'
```

## Component Tokens

### Button Tokens

```typescript
// Primary button
tokenCSS.button.primaryBackground
tokenCSS.button.primaryBackgroundHover
tokenCSS.button.primaryBackgroundActive
tokenCSS.button.primaryText
tokenCSS.button.primaryBorder

// Secondary button
tokenCSS.button.secondaryBackground
tokenCSS.button.secondaryBackgroundHover
tokenCSS.button.secondaryText
tokenCSS.button.secondaryBorder

// Sizes
tokenCSS.button.paddingSm  // '4px 8px'
tokenCSS.button.paddingMd  // '8px 16px'
tokenCSS.button.paddingLg  // '16px 24px'

// Typography
tokenCSS.button.fontSizeSm
tokenCSS.button.fontSizeMd
tokenCSS.button.fontSizeLg
tokenCSS.button.fontWeight  // 500

// Style
tokenCSS.button.borderRadius
tokenCSS.button.transition
```

### Card Tokens

```typescript
// Background
tokenCSS.card.background
tokenCSS.card.backgroundHover

// Borders
tokenCSS.card.border  // '1px solid ...'
tokenCSS.card.borderRadius

// Spacing
tokenCSS.card.padding

// Elevation
tokenCSS.card.shadow
tokenCSS.card.shadowHover
```

### Input Tokens

```typescript
// Background
tokenCSS.input.background
tokenCSS.input.backgroundFocus

// Borders
tokenCSS.input.border
tokenCSS.input.borderFocus
tokenCSS.input.borderError

// Text
tokenCSS.input.text
tokenCSS.input.placeholder

// Style
tokenCSS.input.borderRadius
tokenCSS.input.padding
tokenCSS.input.fontSize
```

### Navigation Tokens

```typescript
// Background
tokenCSS.navigation.background
tokenCSS.navigation.itemBackground
tokenCSS.navigation.itemBackgroundHover
tokenCSS.navigation.itemBackgroundActive

// Text
tokenCSS.navigation.itemText
tokenCSS.navigation.itemTextActive

// Style
tokenCSS.navigation.border
tokenCSS.navigation.padding
```

### Modal Tokens

```typescript
// Background
tokenCSS.modal.background
tokenCSS.modal.overlay

// Borders
tokenCSS.modal.border
tokenCSS.modal.borderRadius

// Spacing
tokenCSS.modal.padding

// Elevation
tokenCSS.modal.shadow
```

## Usage Patterns

### Inline Styles

```typescript
<div style={{
  background: tokenCSS.card.background,
  padding: tokenCSS.card.padding,
  borderRadius: tokenCSS.card.borderRadius,
  boxShadow: tokenCSS.card.shadow,
}}>
  Content
</div>
```

### Styled Components

```typescript
import styled from 'styled-components';
import { tokenCSS } from './design-system';

const StyledCard = styled.div`
  background: ${tokenCSS.card.background};
  padding: ${tokenCSS.card.padding};
  border-radius: ${tokenCSS.card.borderRadius};
  box-shadow: ${tokenCSS.card.shadow};

  &:hover {
    background: ${tokenCSS.card.backgroundHover};
    box-shadow: ${tokenCSS.card.shadowHover};
  }
`;
```

### CSS Modules

```css
/* card.module.css */
.card {
  background: var(--component-card-background);
  padding: var(--component-card-padding);
  border-radius: var(--component-card-border-radius);
  box-shadow: var(--component-card-shadow);
}

.card:hover {
  background: var(--component-card-background-hover);
  box-shadow: var(--component-card-shadow-hover);
}
```

## Theme Variations

### Color Changes Across Themes

| Token | Default | Corporate | Creative | Dark |
|-------|---------|-----------|----------|------|
| `primary` | #2563eb (blue) | #1e40af (navy) | #ec4899 (pink) | #60a5fa (light blue) |
| `backgroundBase` | #ffffff (white) | #ffffff | #ffffff | #111827 (deep black) |
| `textPrimary` | #111827 (black) | #111827 | #111827 | #f9fafb (white) |

### Spacing Changes Across Themes

| Token | Default (scale=1) | Corporate (scale=0.75) | Creative (scale=1.5) | Minimal (scale=2) | Dense (scale=0.5) |
|-------|-------------------|------------------------|----------------------|-------------------|-------------------|
| `spacing.sm` | 8px | 6px | 12px | 16px | 4px |
| `spacing.md` | 16px | 12px | 24px | 32px | 8px |
| `spacing.lg` | 24px | 18px | 36px | 48px | 12px |

## Best Practices

### ✅ DO

```typescript
// Use semantic tokens
background: tokenCSS.color.primary

// Use component tokens for specific elements
padding: tokenCSS.button.paddingMd

// Compose tokens for complex styling
boxShadow: `0 0 0 2px ${tokenCSS.color.borderAccent}`
```

### ❌ DON'T

```typescript
// Don't hardcode values
background: '#3b82f6'  // ❌

// Don't reference primitives directly
color: 'var(--primitive-blue-500)'  // ❌

// Don't skip semantic layer
padding: 'var(--primitive-spacing-base)'  // ❌
```

## TypeScript Support

### Token Types

```typescript
import { DesignTokens, SemanticTokens, ComponentTokens } from './design-system';

// Full token structure
const tokens: DesignTokens = {
  primitive: { ... },
  semantic: { ... },
  component: { ... },
};

// Semantic tokens only
const semanticTokens: SemanticTokens = {
  colors: { primary, secondary, ... },
  typography: { fontPrimary, ... },
  spacing: { xs, sm, md, ... },
  interactions: { borderRadius, ... },
};
```

### Type-Safe Token Access

```typescript
import { tokenCSS } from './design-system';

// TypeScript autocomplete works
tokenCSS.color.primary  // ✅ Type: string
tokenCSS.button.paddingMd  // ✅ Type: string
tokenCSS.color.missing  // ❌ Type error
```

---

**All tokens are theme-aware and update automatically when themes change.**
