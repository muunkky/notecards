# Build AddCardButton - Floating Action Button for Quick Card Creation

**Type:** Feature  
**Priority:** P1  
**Status:** Done  
**Owner:** CAMERON

## Summary

Implemented reusable AddCardButton FAB (Floating Action Button) component for quick card creation. Extracted inline FAB from CardListScreen into a standalone component following Writer theme brutalist design principles.

## Implementation Details

### Component Features
- **Floating action button (FAB)**: Standard mobile pattern for primary action
- **Fixed positioning**: Bottom-right corner (20px offset from edges)
- **Standard size**: 56px x 56px (meets 44px minimum touch target)
- **Brutalist aesthetic**: Black background, white + symbol, sharp edges
- **Zero animations**: 0ms transitions for instant state changes
- **Elevation**: Box-shadow for depth perception
- **Interactive states**: Hover (darker), active (darkest), disabled (grayed)
- **z-index management**: 100 (above content, below modals at 1000)
- **Accessible**: ARIA label, keyboard support, disabled state

### Component API
```typescript
interface AddCardButtonProps {
  onClick?: () => void;    // Click handler
  label?: string;          // Button label (default: "+")
  disabled?: boolean;      // Disabled state
  testId?: string;         // Test ID for testing
}
```

### Visual Design
- **Size**: 56px x 56px (standard FAB size)
- **Position**: Fixed, bottom: 20px, right: 20px
- **Background**: Black (disabled: gray-400)
- **Text**: White, 28px font size, bold
- **Border**: 2px solid black
- **Border radius**: 0px (brutalist sharp edges)
- **Shadow**: 0 4px 12px rgba(0,0,0,0.15)
- **Hover**: Darker gray-800 background, deeper shadow
- **Active**: Darkest gray-900 background, shallower shadow

### CardListScreen Integration
Replaced inline FAB implementation with AddCardButton component:

**Before:**
```typescript
// Inline FAB styles (20+ lines)
const fabStyles: React.CSSProperties = { ... };

// Inline style injection
<style>{`
  .fab-button:hover { ... }
  .fab-button:active { ... }
`}</style>

// Inline button element
<button className="fab-button" style={fabStyles} onClick={onAddCard}>
  +
</button>
```

**After:**
```typescript
// Clean component usage
<AddCardButton onClick={onAddCard} />
```

### Files Created/Modified
- ✅ `src/design-system/components/AddCardButton.tsx` - Component implementation (110 lines)
- ✅ `src/design-system/components/index.tsx` - Export AddCardButton
- ✅ `src/screens/CardListScreen.tsx` - Integrate component (removed 30+ lines of inline code)

## Completed Tasks
- [x] Design AddCardButton component with FAB positioning and styles
- [x] Implement AddCardButton with Writer theme brutalist aesthetic
- [x] Add accessibility features (ARIA labels, keyboard support)
- [x] Export AddCardButton from components index
- [x] Integrate AddCardButton into CardListScreen
- [x] Test TypeScript compilation
- [x] Commit changes and update gitban card

## Design Philosophy
Follows Writer theme brutalist digital minimalism:
- **Zero animations**: 0ms transitions for instant state changes
- **Sharp edges**: 0px border radius, flat design
- **High contrast**: Black background, white text
- **Minimalist**: Simple + symbol, no decorations
- **Functional**: Clear affordance (big circular button = tap me)
- **Accessible**: ARIA labels, keyboard support, clear disabled state

## Benefits Over Inline Implementation

### Code Quality
- **Reusable**: Can be used in any screen needing FAB
- **Maintainable**: Single source of truth for FAB styling
- **Testable**: Component can be unit tested independently
- **Type-safe**: Props interface ensures correct usage
- **Cleaner screens**: CardListScreen reduced by 30+ lines

### Consistency
- **Uniform styling**: Same FAB appearance across app
- **Standardized behavior**: Consistent hover/active states
- **Predictable positioning**: Always bottom-right, same offset
- **Shared patterns**: Establishes FAB pattern for other features

### Extensibility
- **Easy customization**: Props for label, disabled, onClick
- **Future enhancements**: Can add variants, sizes, positions
- **Native integration**: Ready for haptic feedback, safe areas
- **Menu expansion**: Foundation for FAB menu pattern

## User Experience

### Mobile-First Design
- **Thumb-friendly**: Bottom-right position for right-handed users
- **Standard size**: 56px follows Material Design FAB guidelines
- **Clear affordance**: Black circle with + symbol = "add something"
- **Always visible**: Fixed positioning, never scrolls away
- **Non-intrusive**: Small footprint, doesn't obscure content

### Accessibility
- **ARIA label**: Screen readers announce "Add new card"
- **Keyboard accessible**: Can be focused and activated with Enter
- **High contrast**: Black/white meets WCAG AAA standards
- **Large touch target**: 56px exceeds 44px Apple HIG minimum
- **Clear disabled state**: Grayed out, cursor changes to not-allowed

## Native Enhancements (Future)
TODOs for when wrapped in Capacitor:

### Haptic Feedback
```typescript
import { Haptics } from '@capacitor/haptics';
await Haptics.impact({ style: 'light' }); // On tap
```

### Safe Area Padding
```css
bottom: calc(20px + env(safe-area-inset-bottom));
right: calc(20px + env(safe-area-inset-right));
```

### FAB Menu (Speed Dial)
Long-press FAB to reveal mini-menu:
- New card (current action)
- New deck
- Import cards
- Quick note
Mini-menu appears as stacked buttons above FAB

## Usage Example
```typescript
import { AddCardButton } from '../design-system/components/AddCardButton';

// Basic usage
<AddCardButton onClick={() => handleAddCard()} />

// With custom label
<AddCardButton onClick={handleAdd} label="✓" />

// Disabled state
<AddCardButton onClick={handleAdd} disabled={!canAdd} />
```

## Testing
- TypeScript compilation: ✅ Passed
- Manual testing: CardListScreen FAB behavior
- Hover states: Darker backgrounds on interaction
- Disabled state: Grayed out, not clickable
- Positioning: Fixed bottom-right, above content
- Integration: Works with existing onAddCard callback

## Design Rationale

### Why FAB Pattern?
1. **Mobile-native**: Familiar pattern from iOS/Android apps
2. **Always accessible**: Primary action never scrolls away
3. **Thumb-friendly**: Bottom-right for right-handed majority
4. **Clear affordance**: Round button = tap for primary action
5. **Non-modal**: Doesn't block content, easily dismissed

### Why Brutalist Aesthetic?
- **Consistency**: Matches Writer theme sharp edges, flat design
- **Functional**: No decorations, pure function
- **High contrast**: Black/white for maximum clarity
- **Modern**: Contemporary design trend, feels fresh
- **Performance**: No gradients, shadows are minimal

### Why Component Extraction?
- **DRY principle**: Don't repeat inline styles across screens
- **Maintainability**: Single source of truth for changes
- **Reusability**: Other screens will need FABs (DeckListScreen, etc.)
- **Testability**: Can unit test component independently
- **Scalability**: Easy to extend with variants, menu patterns

## Next Steps
This component completes the basic action button system:
1. ✅ Button component (primitive)
2. ✅ AddCardButton (specialized FAB)

Future FAB enhancements:
- FAB for DeckListScreen (add deck)
- FAB menu (speed dial) for multiple actions
- Mini FAB variant (smaller, secondary actions)
- Extended FAB variant (label + icon)
