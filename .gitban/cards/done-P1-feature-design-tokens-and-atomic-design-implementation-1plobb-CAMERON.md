# 5p8fxr: Future-Proof Design Tokens & Component Architecture

## Overview
Build the foundational token system that enables **radical design pivots** without component rewrites. This system must handle anything from conservative corporate designs to bold creative directions.

## Business Context
- **Management changes direction frequently**
- **User feedback will drive major visual changes**
- **Must avoid rebuilding components** when design evolves
- **Support A/B testing** of completely different styles

## Design Token Architecture

### 1. Three-Tier Token System

#### Tier 1: Primitive Tokens (Raw Values)
```css
:root {
  /* Colors - raw values only */
  --primitive-blue-50: #eff6ff;
  --primitive-blue-500: #3b82f6;
  --primitive-gray-900: #111827;
  
  /* Typography - raw values */
  --primitive-font-inter: 'Inter', sans-serif;
  --primitive-font-playfair: 'Playfair Display', serif;
  
  /* Spacing - raw values */
  --primitive-space-1: 0.25rem;
  --primitive-space-16: 4rem;
}
```

#### Tier 2: Semantic Tokens (Purpose-Based)
```css
:root {
  /* Semantic meaning, not appearance */
  --color-primary: var(--primitive-blue-500);
  --color-danger: var(--primitive-red-500);
  --color-text-primary: var(--primitive-gray-900);
  --color-surface-base: var(--primitive-white);
  
  --font-primary: var(--primitive-font-inter);
  --font-heading: var(--primitive-font-playfair);
  
  --space-component-padding: var(--primitive-space-4);
  --space-section-gap: var(--primitive-space-16);
}
```

#### Tier 3: Component Tokens (Specific Usage)
```css
:root {
  /* Component-specific decisions */
  --button-background: var(--color-primary);
  --button-text: var(--color-white);
  --button-border-radius: var(--primitive-radius-md);
  
  --card-background: var(--color-surface-base);
  --card-shadow: var(--elevation-low);
  --card-padding: var(--space-component-padding);
}
```

### 2. Theme Variants - Extreme Flexibility

#### Conservative Corporate Theme
```css
[data-theme="corporate"] {
  --color-primary: #1e3a8a; /* Deep blue */
  --font-primary: 'Times New Roman', serif;
  --space-component-padding: var(--primitive-space-2); /* Tight */
  --border-radius: 0px; /* Sharp corners */
  --animation-duration: 0ms; /* No animations */
}
```

#### Bold Creative Theme
```css
[data-theme="creative"] {
  --color-primary: #ec4899; /* Hot pink */
  --font-primary: 'Comic Sans MS', cursive;
  --space-component-padding: var(--primitive-space-8); /* Spacious */
  --border-radius: 2rem; /* Very rounded */
  --animation-duration: 300ms; /* Smooth animations */
}
```

#### Minimal Zen Theme
```css
[data-theme="minimal"] {
  --color-primary: #374151; /* Muted gray */
  --font-primary: 'Helvetica Neue', sans-serif;
  --space-component-padding: var(--primitive-space-12); /* Extra spacious */
  --border-radius: 0.125rem; /* Subtle rounding */
}
```

## Atomic Design Integration

### 1. Atoms (Basic Elements)
- **Button**: Uses `--button-*` tokens exclusively
- **Input**: Uses `--input-*` tokens exclusively  
- **Text**: Uses `--text-*` tokens exclusively
- **Icon**: Uses `--icon-*` tokens exclusively

### 2. Molecules (Simple Components)
- **SearchBox**: Combines input + button atoms
- **CardHeader**: Combines text + icon atoms
- **Navigation**: Combines multiple button atoms

### 3. Organisms (Complex Components)
- **DeckCard**: Uses molecule components
- **NavigationBar**: Uses molecule components
- **SharingModal**: Uses multiple molecules

## Technical Requirements

### 1. Token Management System
```typescript
interface TokenDefinition {
  name: string;
  value: string;
  type: 'color' | 'typography' | 'spacing' | 'motion' | 'elevation';
  tier: 'primitive' | 'semantic' | 'component';
  description: string;
}

class TokenManager {
  generateTheme(tokens: TokenDefinition[]): CSSStyleDeclaration;
  validateTokens(tokens: TokenDefinition[]): ValidationResult;
  generateTypeScript(tokens: TokenDefinition[]): string;
}
```

### 2. Theme Builder Tool
- **Visual theme editor** for non-technical users
- **Real-time preview** of component changes
- **Export/import** theme configurations
- **Generate CSS** from visual selections

### 3. Component Token Binding
```tsx
// NO hardcoded styles allowed
const Button = styled.button`
  background-color: var(--button-background);
  color: var(--button-text);
  padding: var(--button-padding);
  border-radius: var(--button-border-radius);
  font-family: var(--button-font);
  transition: all var(--button-transition-duration);
`;
```

## Acceptance Criteria

### Phase 1: Token Foundation
- [ ] Three-tier token architecture implemented
- [ ] All existing components converted to use tokens only
- [ ] No hardcoded colors/fonts/spacing anywhere
- [ ] Token validation and type safety

### Phase 2: Theme System
- [ ] At least 5 dramatically different themes created
- [ ] Runtime theme switching (no page reload)
- [ ] Theme persistence across sessions
- [ ] Performance optimized (<100ms switch time)

### Phase 3: Management Tools
- [ ] Visual theme builder for non-technical users
- [ ] Theme export/import functionality  
- [ ] Component preview system
- [ ] Documentation for business stakeholders

## Extreme Flexibility Test Cases
- [ ] **Conservative → Creative**: Corporate blue → Hot pink in <2 clicks
- [ ] **Typography Swap**: Serif → Sans-serif → Display across all components
- [ ] **Spacing Pivot**: Tight → Spacious → Extra-spacious layouts
- [ ] **Border Style**: Sharp → Rounded → Extreme-rounded corners
- [ ] **Motion Preferences**: No animation → Subtle → High-motion

## Risk Prevention
- **No component rewrites** for visual changes
- **Semantic naming** prevents color-specific locks
- **Validation system** prevents broken themes
- **Fallback values** for missing tokens
- **Migration tools** for token updates

## Success Metrics
- [ ] Complete visual redesign in <1 hour
- [ ] Zero TypeScript/React code changes for theme swaps
- [ ] Non-developers can create usable themes
- [ ] 100% component compatibility across all themes
- [ ] User preference tracking and analytics ready

## Related Cards
- Multi-Theme Architecture (5fvi0i)
- CSS Architecture (064npz)
- Component API Design (4mtrrl)

## Notes
**CRITICAL**: This is the foundation that prevents months of rework later. Every pixel must be tokenized. Overengineer this system to handle any conceivable design direction change.
