# Writer's Design Thesis: Notecards Application

**Version:** 1.0
**Last Updated:** October 25, 2025
**Status:** Living Document - Philosophical Foundation

---

## Table of Contents

1. [Core Philosophy](#core-philosophy)
2. [Aesthetic Inspirations](#aesthetic-inspirations)
3. [Physical-to-Digital Translation](#physical-to-digital-translation)
4. [Interaction Principles](#interaction-principles)
5. [Token Translation Rules](#token-translation-rules)
6. [Component Patterns](#component-patterns)
7. [Design Challenges & Solutions](#design-challenges--solutions)

---

## Core Philosophy

### The Problem We're Solving

**Writers use index cards because:**
- Physical cards force constraint (limited space = clear thinking)
- Spatial arrangement creates meaning (layout = structure)
- Tactile manipulation feels natural (move cards = move thoughts)
- Visual scanning is instant (see everything at once)

**Digital tools fail because:**
- Word processors force linear structure (top-to-bottom rigidity)
- Project management tools add complexity (setup overhead)
- Skeuomorphic apps mimic the wrong things (fake textures, not real benefits)

### Our Approach: Brutalist Digital Minimalism

> **"Digital power with analog feel. Infrastructure as interface. Function determines form."**

We are building a tool that:
1. **Respects the craft** - Writers are making something real, not playing with software
2. **Gets out of the way** - The work is what matters, not the tool
3. **Feels like infrastructure** - Solid, reliable, honest about what it is
4. **Preserves flow state** - No interruptions, no decoration, no navigation

---

## Aesthetic Inspirations

### Primary: Claude Code / Terminal Interface

**What makes it work:**
- **Information density without clutter** - Content fills the screen, hierarchy through typography alone
- **Color as meaning, not decoration** - Blue = user input, green = success, red = error
- **Monospace typography** - Fixed-width fonts as functional choice, not aesthetic posturing
- **Minimal chrome** - No unnecessary UI elements, content is 95% of screen real estate
- **Fast, responsive, zero animations** - Things appear instantly, no fading/sliding/bouncing
- **Keyboard-first interaction** - Mouse is optional, not required
- **Dark mode by default** - Reduces eye strain, focuses attention on content

**Translation to Notecards:**
- List of cards = terminal output (chronological, scannable)
- Card actions = command palette style (overlay, keyboard shortcuts)
- Color used only for categorization (card type decorators)
- Typography hierarchy through size/weight only, not color variation

### Secondary Inspirations

| Inspiration | What We Take | What We Leave |
|-------------|--------------|---------------|
| **Linear App** | Keyboard-first, minimal UI, speed | Gradient backgrounds, animations |
| **iA Writer** | Focus mode, typography, simplicity | Minimal feature set (we need more structure) |
| **Stripe Dashboard** | Information density, clear hierarchy | Corporate polish, rounded corners |
| **Vim/Neovim** | Keyboard shortcuts, modal editing | Learning curve, text-only limitation |
| **GitHub Modern UI** | Clean layout, functional color, tags | Social features, collaboration overhead |
| **Superhuman** | Command palette, speed, keyboard shortcuts | Email-specific patterns |
| **Swiss Design Principles** | Grid systems, negative space, typography | Cold perfection (we want tool-like warmth) |
| **Dieter Rams ("Less, but better")** | Functional minimalism, honesty | Product design (physical objects) |

---

## Physical-to-Digital Translation

### Challenge 1: Colored Index Cards

**Physical Reality:**
- Writers use colored cards for instant visual categorization
- Red = conflict scene, Blue = character moment, Yellow = location, etc.
- Visual scanning: "Show me all red cards" is instant

**Digital Problem:**
- Full colored backgrounds = harsh on screens, reduces text readability
- Color-coding requires good color vision (accessibility issue)
- Too many colors = visual chaos

**Brutalist Solution: Colored Decorator Strips**
```
┌─┬──────────────────────────┐
│ │ Card Title               │ ← 4px colored strip (left edge)
│ │ Card content here...     │ ← White/black card, high contrast text
│ │                          │
└─┴──────────────────────────┘
```

**Design Token Structure:**
```typescript
// Decorator colors (categorical, not decorative)
card.decorator.conflict: '#e11d48'      // Red strip: Conflict/tension
card.decorator.character: '#3b82f6'     // Blue strip: Character development
card.decorator.location: '#f59e0b'      // Amber strip: Setting/location
card.decorator.theme: '#8b5cf6'         // Purple strip: Theme/motif
card.decorator.dialogue: '#10b981'      // Green strip: Dialogue scene
card.decorator.action: '#ef4444'        // Bright red: Action sequence
card.decorator.internal: '#6366f1'      // Indigo: Internal monologue
card.decorator.transition: '#64748b'    // Gray: Transition/bridge

// Card maintains readability
card.background: '#ffffff' (light) / '#0a0a0a' (dark)
card.text: '#000000' (light) / '#fafafa' (dark)
card.border: '1px solid currentColor'
```

### Challenge 2: Spatial Arrangement

**Physical Reality:**
- Writers spread cards on desk/wall/floor
- Spatial relationships create meaning (proximity = connection)
- Rearranging is instant and tactile

**Digital Problem:**
- Screens are linear (scroll direction)
- Drag-and-drop on touch devices is awkward
- Hard to see "big picture" with limited viewport

**Brutalist Solution: Vertical Scroll + Keyboard Reorder**
- Default: Vertical list (mobile-first, works everywhere)
- Keyboard shortcuts: `Cmd+↑/↓` to move cards
- Visual: Cards physically move in list (no animation, instant)
- Overview: Collapse all cards → see titles only (table of contents view)

### Challenge 3: Physical Feedback

**Physical Reality:**
- Picking up a card feels substantial
- Shuffling cards is satisfying
- Physical constraints prevent accidental deletion

**Digital Solution:**
- Haptic feedback on mobile (if available)
- Instant visual feedback (no loading states)
- Confirmation only for destructive actions (delete deck)
- No confirmation for reversible actions (move, edit)

---

## Interaction Principles

### Principle 1: Context Preservation Over Navigation

**Anti-pattern:**
```
User taps card menu
  → Dropdown menu in corner
  → User loses spatial context
  → Must find their place again
```

**Our Pattern:**
```
User taps card action trigger ("···")
  → Translucent scrim overlays entire view
  → Menu appears DIRECTLY over the card
  → Background context visible through scrim
  → Spatial relationship preserved
  → Tap outside or Esc = instant return
```

**Design Tokens:**
```typescript
interaction.overlay.scrim: 'rgba(0, 0, 0, 0.75)'        // Dark but translucent
interaction.overlay.menu.background: '#ffffff'          // Solid, readable
interaction.overlay.menu.border: '1px solid #000000'    // Sharp, defined
interaction.overlay.menu.shadow: 'none'                 // Brutalist (no soft shadows)
interaction.overlay.animation: '120ms ease-out'         // Fast, not playful
interaction.overlay.blur: 'none'                        // Sharp edges, no blur
```

### Principle 2: Keyboard-First, Touch-Compatible

**Primary Interface: Keyboard**
- `Cmd+K` → Command palette (global actions)
- `N` → New card
- `E` → Edit focused card
- `Cmd+↑/↓` → Reorder
- `Cmd+D` → Duplicate
- `/` → Filter/search
- `Esc` → Cancel/close

**Secondary Interface: Touch/Mouse**
- Tap title → Expand/collapse
- Tap "···" → Context menu overlay
- Long press → Drag to reorder (mobile)
- Swipe left → Quick delete (optional, with undo)

### Principle 3: Zero Chrome, Maximum Content

**Screen Real Estate Allocation:**
- Header: 60px (deck title + back button)
- Content: Remaining viewport (95%+ of screen)
- Footer: None (actions inline with content)
- Sidebar: None (flat hierarchy only)

**Chrome Elements Eliminated:**
- No toolbars
- No status bars (except error states)
- No floating action buttons (inline "New Card" button at list end)
- No breadcrumbs (single back button)
- No pagination (infinite scroll or load more)

---

## Token Translation Rules

### Rule 1: Monochrome Base, Functional Color

**Primitive Tokens (Raw Values):**
```typescript
// Monochrome scale (16 shades)
gray: {
  0: '#000000',    // Pure black
  50: '#fafafa',   // Almost white
  100: '#f4f4f5',
  200: '#e4e4e7',
  300: '#d4d4d8',
  400: '#a1a1aa',
  500: '#71717a',
  600: '#52525b',
  700: '#3f3f46',
  800: '#27272a',
  900: '#18181b',
  950: '#09090b',
  1000: '#000000'  // Pure black (alias)
}

// Functional colors (categorical only)
categorical: {
  conflict: '#e11d48',
  character: '#3b82f6',
  location: '#f59e0b',
  theme: '#8b5cf6',
  // ... (see decorator colors above)
}

// System colors (semantic only)
system: {
  success: '#10b981',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6'
}
```

**Semantic Tokens (Purpose-Based):**
```typescript
// Light theme (default)
light: {
  background: gray[50],       // Almost white
  surface: gray[0],           // Pure white cards
  text: {
    primary: gray[1000],      // Black
    secondary: gray[600],     // Medium gray
    tertiary: gray[400]       // Light gray
  },
  border: {
    default: gray[200],       // Subtle
    strong: gray[900],        // Defined
    focus: gray[1000]         // Maximum contrast
  }
}

// Dark theme
dark: {
  background: gray[950],      // Near black
  surface: gray[900],         // Dark gray cards
  text: {
    primary: gray[50],        // Almost white
    secondary: gray[400],     // Medium gray
    tertiary: gray[600]       // Dark gray
  },
  border: {
    default: gray[800],       // Subtle
    strong: gray[100],        // Defined
    focus: gray[50]           // Maximum contrast
  }
}
```

**Component Tokens (Specific Usage):**
```typescript
card: {
  background: semantic.surface,
  text: semantic.text.primary,
  border: '1px solid ' + semantic.border.default,
  borderRadius: '0px',               // Sharp corners (brutalist)
  padding: '16px',                   // Generous (readability)
  marginBottom: '8px',               // Tight vertical rhythm

  // States
  hover: {
    borderColor: semantic.border.strong,
    borderWidth: '2px',              // Thicker border (tactile feedback)
    transform: 'none',               // No movement
    shadow: 'none'                   // No elevation
  },

  focus: {
    outline: '2px solid ' + semantic.border.focus,
    outlineOffset: '2px'
  },

  expanded: {
    // Full-bleed content, sticky header
  },

  decorator: {
    width: '4px',
    position: 'left',
    colors: categorical              // Use categorical colors
  }
}

button: {
  // Text-only by default
  background: 'transparent',
  color: semantic.text.primary,
  border: 'none',
  padding: '8px 16px',
  fontSize: '14px',
  fontWeight: '500',

  hover: {
    background: semantic.border.default,  // Subtle gray
    textDecoration: 'underline'
  },

  // Primary action only
  primary: {
    background: semantic.text.primary,    // Black (light) / White (dark)
    color: semantic.background,           // White (light) / Black (dark)
    border: '1px solid currentColor'
  }
}
```

### Rule 2: Typography Hierarchy

**System Font Stack (Never Web Fonts):**
```css
--font-primary: -apple-system, BlinkMacSystemFont, "Segoe UI",
                Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono: "SF Mono", Monaco, "Cascadia Code", "Roboto Mono",
             Consolas, "Courier New", monospace;
```

**Type Scale (Modular Scale 1.25):**
```typescript
typography: {
  // Use mono for card titles (terminal aesthetic)
  cardTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '16px',
    fontWeight: '600',
    lineHeight: '1.5',
    letterSpacing: '-0.01em'
  },

  // Use system for body content (readability)
  cardBody: {
    fontFamily: 'var(--font-primary)',
    fontSize: '15px',
    fontWeight: '400',
    lineHeight: '1.6',
    letterSpacing: '0'
  },

  // Size hierarchy only (no color changes)
  heading: {
    h1: { fontSize: '24px', fontWeight: '700' },  // Deck title
    h2: { fontSize: '20px', fontWeight: '600' },  // Section headers
    h3: { fontSize: '16px', fontWeight: '600' }   // Card titles
  }
}
```

### Rule 3: Spacing (Binary Scale)

**Two-Mode Spacing: Tight or Generous**
```typescript
spacing: {
  // Tight (within components)
  tight: '8px',

  // Generous (between components)
  generous: '24px',

  // No medium values (forces clear decisions)
}

// Application
card.padding: spacing.tight * 2,           // 16px (internal)
card.marginBottom: spacing.tight,          // 8px (list rhythm)
section.marginBottom: spacing.generous,    // 24px (visual grouping)
```

---

## Component Patterns

### Pattern 1: Collapsible Card (Primary UI Element)

**Collapsed State (Default):**
```
┌─┬────────────────────────────────────┐
│█│ INT. COFFEE SHOP - DAY         ···│ ← Colored strip, mono title, menu trigger
└─┴────────────────────────────────────┘
```

**Expanded State (Tap to Toggle):**
```
┌─┬────────────────────────────────────┐ ← Sticky header (scrolls with card)
│█│ INT. COFFEE SHOP - DAY         ···│
├─┼────────────────────────────────────┤
│ │ Sarah enters, sees Tom at corner  │
│ │ table. Their eyes meet. She       │
│ │ hesitates, then walks over.       │
│ │                                    │
│ │ Tension builds as she sits down   │
│ │ without saying a word.            │
└─┴────────────────────────────────────┘
```

**Implementation Notes:**
- Header remains sticky on scroll (spatial anchor)
- Body uses full card width (no internal margins)
- Tap anywhere on card to toggle (large hit area)
- Keyboard: `Space` or `Enter` to expand focused card
- Multi-expand allowed (multiple cards open simultaneously)

### Pattern 2: Overlay Context Menu

**Trigger:**
- Tap "···" on card
- Keyboard: `Cmd+.` or right-click

**Menu Layout:**
```
╔═══════════════════════════════════╗
║ SCRIM (translucent black 75%)    ║
║                                   ║
║   Card Title [faded but visible] ║
║   ┌───────────────────┐          ║
║   │ Edit              │          ║
║   │ Duplicate         │          ║
║   │ Change Type    ▶  │ → Submenu with color types
║   │ ─────────────     │          ║
║   │ Delete            │          ║
║   └───────────────────┘          ║
║                                   ║
╚═══════════════════════════════════╝
```

**Implementation:**
```typescript
overlay: {
  scrim: {
    background: 'rgba(0, 0, 0, 0.75)',
    backdropFilter: 'none',           // No blur (keep it sharp)
    animation: '120ms ease-out'
  },
  menu: {
    background: '#ffffff',
    border: '1px solid #000000',
    boxShadow: 'none',                // Brutalist (no soft shadows)
    borderRadius: '0px',              // Sharp corners
    position: 'absolute',             // Position over tapped card
    minWidth: '200px',
    padding: '4px'
  },
  menuItem: {
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#000000',
    background: 'transparent',
    border: 'none',
    textAlign: 'left',

    hover: {
      background: '#f4f4f5',          // Subtle gray
      cursor: 'pointer'
    },

    destructive: {
      color: '#ef4444'                // Red text only
    }
  }
}
```

### Pattern 3: Command Palette (Global Actions)

**Trigger:** `Cmd+K` or `/`

**Interface:**
```
╔═════════════════════════════════════════╗
║                                         ║
║  ┌─────────────────────────────────┐   ║
║  │ > search or command_          │   ║ ← Monospace input
║  └─────────────────────────────────┘   ║
║                                         ║
║  New Card                         ⌘N   ║
║  Collapse All                     ⌘⇧C  ║
║  Expand All                       ⌘⇧E  ║
║  Shuffle Cards                    ⌘⇧S  ║
║  ───────────────────────────────────   ║
║  Filter: Conflict Scenes          /c   ║
║  Filter: Character Moments        /ch  ║
║  Filter: All Cards                /a   ║
║                                         ║
╚═════════════════════════════════════════╝
```

**Behavior:**
- Fuzzy search (type `nw` → matches "New Card")
- Keyboard navigation only (↑/↓ to select, Enter to execute)
- Recent actions at top (learning behavior)
- Esc or Cmd+K again to dismiss

---

## Design Challenges & Solutions

### Challenge: Information Density vs. Clutter

**Problem:** Writers want to see many cards at once, but text-heavy lists feel overwhelming.

**Solution: Progressive Disclosure with Rhythm**
- Collapsed cards show title only (single line, monospace, scannable)
- 8px vertical spacing creates visual rhythm (cards separate but connected)
- Generous 24px section breaks for act/sequence divisions
- Expand on demand (tap or keyboard) without losing context

### Challenge: Mobile vs. Desktop Interaction

**Problem:** Desktop users want keyboard shortcuts, mobile users need touch gestures.

**Solution: Device-Aware Defaults**
```typescript
// Desktop: Keyboard-first
- Cmd+K for command palette
- Arrow keys for navigation
- Tab for focus management

// Mobile: Touch-optimized
- Tap to expand (large hit area)
- Swipe left for quick delete (with undo)
- Long press for drag-to-reorder
- Pull-down to refresh (sync)

// Both: Context menu overlay works everywhere
```

### Challenge: Color Accessibility

**Problem:** Color-blind users can't rely on decorator colors alone.

**Solution: Redundant Encoding**
- Color decorator strip (primary categorization)
- Text label in card header: `[CONFLICT]` prefix (always visible)
- Icon option (future): Small emoji/icon prefix
- Keyboard shortcut: `/` → filter by type name, not color

### Challenge: Export/Print Formatting

**Problem:** Writers need to export to screenplay software or print physical cards.

**Solution: Semantic Markup**
- Cards stored as structured Markdown
- Export formats: PDF (screenplay format), TXT (plain text), CSV (data)
- Print view: One card per page, decorator color as header bar
- Screenplay format: Automatic scene heading detection (INT./EXT.)

---

## Implementation Roadmap

### Phase 1: Foundation (Current)
- [ ] Create `docs/WRITER-DESIGN-THESIS.md` (this document)
- [ ] Design token definition for "Writer" theme
- [ ] Update `src/design-system/tokens/design-tokens.ts` with writer tokens
- [ ] Create theme definition in `src/design-system/theme/theme-manager.ts`

### Phase 2: Core Components
- [ ] Rebuild `CardListItem` with brutalist styling
- [ ] Implement colored decorator strips
- [ ] Add overlay context menu pattern
- [ ] Keyboard shortcuts infrastructure

### Phase 3: Advanced Patterns
- [ ] Command palette (Cmd+K)
- [ ] Collapse/expand all
- [ ] Card type filtering
- [ ] Keyboard-first navigation

### Phase 4: Polish
- [ ] Dark mode optimization
- [ ] Mobile gesture support
- [ ] Print/export views
- [ ] Accessibility audit (WCAG AA minimum)

---

## Success Criteria

**How do we know this design is working?**

1. **Flow State Preservation**
   - Writers report losing track of time (positive sign)
   - No interruptions or "where was I?" moments
   - Actions feel instant, no loading states

2. **Speed of Thought**
   - From idea to card: < 3 seconds
   - Reordering 10 cards: < 10 seconds
   - Finding a specific card: < 5 seconds

3. **Visual Scanning**
   - Can identify card types at a glance (color + label)
   - Can see structure of 50+ cards collapsed
   - Can read expanded card without scrolling (mobile too)

4. **Brutalist Honesty**
   - No user asks "What does this button do?" (labels clear)
   - No decorative elements (everything has function)
   - No surprise behavior (predictable, consistent)

5. **Technical Validation**
   - Lighthouse: 95+ performance, 100 accessibility
   - First paint: < 1 second
   - Interaction latency: < 100ms
   - Works on 3-year-old iPhone/Android

---

## References & Further Reading

**Design Philosophy:**
- Dieter Rams: "Ten Principles of Good Design"
- Brutalist Web Design: https://brutalist-web.design
- Swiss Design Principles: Grid systems, typography, negative space

**Technical Inspirations:**
- Claude Code interface patterns
- Linear app (keyboard-first design)
- iA Writer (focus mode, typography)
- Stripe Dashboard (information density)

**Writer's Tools:**
- Frank Daniel: 70-card method (David Lynch)
- Blake Snyder: Save the Cat beat sheet
- John Truby: Anatomy of Story structure
- Syd Field: Screenplay paradigm

**Accessibility:**
- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Inclusive Components: https://inclusive-components.design

---

**Document Status:** Living thesis - update as design evolves
**Next Review:** After Phase 1 implementation complete
**Owner:** Design + Engineering teams
