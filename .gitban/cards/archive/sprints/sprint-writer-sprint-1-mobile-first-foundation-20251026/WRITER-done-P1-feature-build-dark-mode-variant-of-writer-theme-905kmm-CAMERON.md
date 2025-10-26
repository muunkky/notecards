# Build Dark Mode Variant of Writer Theme

**Type:** Feature
**Priority:** P1
**Status:** in_progress
**Created:** Generated via MCP

## Description
Build dark mode variant of Writer theme that maintains all brutalist principles while inverting colors for dark backgrounds. Pure black (#000) backgrounds with pure white (#fff) text, preserving sharp edges, instant feedback, and functional categorical colors.

## Tasks
- [x] Analyze Writer theme token structure
- [x] Design dark mode color inversion strategy
- [x] Create Writer Dark theme file (writer-dark-theme.ts)
- [x] Implement pure color inversion (black <-> white swap)
- [x] Preserve brutalist principles (0px radius, 0ms transitions, no shadows)
- [x] Maintain functional categorical colors (unchanged)
- [x] Register Writer Dark theme in theme manager
- [x] Write comprehensive TDD tests (41 tests covering all aspects)
- [x] Verify all tests passing (41/41)
- [x] Verify TypeScript compilation passes

## Implementation Details

### Files Created
1. `src/design-system/themes/writer-dark-theme.ts` - Complete dark mode theme definition
2. `src/test/design-system/writer-dark-theme.test.tsx` - 41 comprehensive tests

### Files Modified
1. `src/design-system/theme/theme-manager.ts` - Registered Writer Dark theme

### Theme Characteristics

**Color Inversion:**
- Background: #000000 (pure black, OLED-friendly)
- Text: #ffffff (pure white)
- Gray scale inverted: gray50 (#171717) to gray900 (#fafafa)
- Categorical colors UNCHANGED (functional, not decorative)

**Brutalist Principles Preserved:**
- Border radius: 0px everywhere (sharp edges)
- Transitions: 0ms everywhere (instant feedback)
- Shadows: none everywhere (flat brutalism)
- Fonts: System fonts only (no web fonts)
- Spacing: Binary system (tight or generous, no medium)

**Semantic Token Mapping:**
- primary: var(--primitive-black) → now white
- textPrimary: var(--primitive-black) → now white
- backgroundBase: var(--primitive-white) → now black
- backgroundOverlay: rgba(255, 255, 255, 0.75) → white scrim for dark mode

**Component Adaptations:**
- Buttons: White backgrounds with black text
- Cards: Black backgrounds with white text
- Inputs: Black backgrounds with white borders
- Navigation: Black backgrounds with white active states
- Modals: Black backgrounds with white scrim overlay

### Theme Switching

Users can switch between Writer and Writer Dark themes via:
```typescript
import { themeManager } from './design-system/theme/theme-manager';

// Switch to dark mode
await themeManager.switchTheme('writer-dark');

// Switch back to light mode
await themeManager.switchTheme('writer');

// Get current theme
const current = themeManager.getCurrentTheme();

// Listen for theme changes
document.documentElement.addEventListener('themechange', (e) => {
  console.log('Theme changed to:', e.detail.themeId);
});
```

Theme preference is automatically persisted to localStorage.

### Test Coverage (41 tests)

1. **Theme Definition** (2 tests)
   - Correct metadata (id, name, category, description)
   - Business context specification

2. **Color Inversion** (3 tests)
   - Primitive black/white swap
   - Gray scale inversion
   - Maintained gray scale order

3. **Categorical Colors** (6 tests)
   - Conflict/tension colors preserved
   - Character colors preserved
   - Location colors preserved
   - Theme/motif colors preserved
   - All categorical colors unchanged

4. **Brutalist Principles** (5 tests)
   - 0px border radius maintained
   - 0ms transitions maintained
   - No shadows maintained
   - System fonts maintained
   - Binary spacing system maintained

5. **Semantic Token Mapping** (5 tests)
   - Primary mapped to inverted black
   - Text colors inverted
   - Background colors inverted
   - White scrim for overlay
   - Border colors mapped appropriately

6. **Component Tokens** (4 tests)
   - Button colors inverted
   - Card colors inverted
   - Input colors inverted
   - Touch-optimized sizing maintained

7. **Theme Manager Integration** (8 tests)
   - Theme registration
   - Theme switching
   - CSS custom properties application
   - Semantic color application
   - Brutalist property preservation
   - localStorage persistence
   - Event dispatching
   - Seamless Writer <-> Writer Dark toggle

8. **Performance** (2 tests)
   - Theme switching under 100ms
   - No-op for same theme switch

9. **Edge Cases** (3 tests)
   - Missing optional properties
   - Theme validation
   - JSON export/import

10. **Accessibility** (3 tests)
    - Text contrast (21:1 ratio, WCAG AAA)
    - Focus ring visibility
    - Appropriate error colors

### Design Philosophy

The Writer Dark theme is NOT a generic dark theme. It maintains the brutalist purity of the Writer theme:

**Generic Dark Themes:**
- Use softened grays (#111827, #f9fafb)
- Add subtle shadows for depth
- Slightly desaturate colors
- Add gentle transitions
- Rounded corners for softness

**Writer Dark Theme:**
- Pure blacks and whites (#000, #fff)
- Zero shadows (flat brutalism)
- Full-intensity categorical colors
- Zero transitions (instant feedback)
- Sharp edges (0px radius)
- Terminal interface aesthetic

This is "dark terminal mode" not "cozy night mode" - uncompromising brutalism inverted.

### Accessibility

- **Contrast Ratio:** 21:1 (white on black) - WCAG AAA compliant
- **Focus Indicators:** 2px solid white outlines (highly visible)
- **Error States:** Full-intensity red (#ef4444) for maximum visibility
- **OLED Optimization:** Pure black (#000) for true pixel off on OLED screens

### Next Steps (Future Cards)

These are future enhancements beyond the scope of this card:

- Create theme toggle UI component (ThemeSwitch.tsx)
- Add system preference detection (prefers-color-scheme)
- Add auto-switching based on time of day (optional)
- Create theme switcher documentation
- Add theme preview screenshots

The core Writer Dark theme implementation is complete and fully functional.

## Notes
- Writer Dark is a first-class theme, not an afterthought
- Maintains 100% design purity with Writer theme
- Performance optimized (<100ms switching)
- OLED-friendly pure blacks save battery on mobile
- Ready for production use
