# Build OverlayMenu Component - Context-Preserving Menus with 75% Black Scrim

**Type:** Feature  
**Priority:** P1  
**Status:** Done  
**Owner:** CAMERON

## Summary

Implemented reusable OverlayMenu component for context-preserving action menus that appear over content with a 75% black scrim backdrop. Used for three-dot menus, context menus, and action menus throughout the app.

## Implementation Details

### Component Features
- **75% black scrim**: Matching BottomSheet for consistency
- **Smart positioning**: Appears near anchor element, adjusts if off-screen
- **Menu items**: List of clickable actions with labels
- **Danger variant**: Red text for destructive actions (delete, etc.)
- **Dismiss handlers**: Click outside, ESC key, or item selection
- **Auto-dismiss**: Closes automatically after item clicked
- **Zero animations**: Instant show/hide (0ms)
- **Brutalist aesthetic**: Sharp edges, black borders, flat design

### Component API
```typescript
interface MenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean; // Red text for destructive actions
}

interface OverlayMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  anchorEl?: HTMLElement | null; // Position near this element
  testId?: string;
}
```

### Visual Design
- **Scrim**: Fixed positioning, rgba(0, 0, 0, 0.75), z-index 1000
- **Menu container**: Fixed positioning, z-index 1001, white background
- **Size**: Min 200px, max 300px width
- **Border**: 1px solid black
- **Border radius**: 0px (sharp edges)
- **Shadow**: 0 4px 12px rgba(0, 0, 0, 0.15)
- **Menu items**: 12px padding, system font, 15px size
- **Item borders**: 1px solid gray-200 between items
- **Hover states**: Gray-50 (normal), Red-50 (danger)
- **Active states**: Gray-100 (normal), Red-100 (danger)

### Positioning Logic
```typescript
const getMenuPosition = (): React.CSSProperties => {
  if (!anchorEl) {
    // Default: centered on screen
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  }

  const rect = anchorEl.getBoundingClientRect();
  const menuWidth = 200;

  // Position below and to the right of anchor (default)
  let top = rect.bottom + 8;
  let left = rect.right - menuWidth;

  // Adjust if menu would go off screen
  if (top + 300 > window.innerHeight) {
    top = rect.top - 8; // Above anchor instead
  }
  if (left < 8) {
    left = 8; // Align to left edge
  }

  return { top: `${top}px`, left: `${left}px` };
};
```

### Dismiss Handlers

**ESC Key Handler:**
```typescript
useEffect(() => {
  if (!isOpen) return;
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen, onClose]);
```

**Click Outside Handler:**
```typescript
useEffect(() => {
  if (!isOpen) return;
  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      onClose();
    }
  };
  // Delay to avoid closing immediately on trigger click
  setTimeout(() => {
    document.addEventListener('mousedown', handleClickOutside);
  }, 0);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [isOpen, onClose]);
```

**Item Click Handler:**
```typescript
const handleItemClick = (item: MenuItem) => {
  item.onClick();
  onClose(); // Auto-dismiss after action
};
```

### Body Scroll Lock
```typescript
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
  return () => { document.body.style.overflow = ''; };
}, [isOpen]);
```

### Files Created/Modified
- ✅ `src/design-system/components/OverlayMenu.tsx` - Component implementation (237 lines)
- ✅ `src/design-system/components/index.tsx` - Export OverlayMenu and MenuItem type

## Completed Tasks
- [x] Design OverlayMenu component API and props
- [x] Create OverlayMenu component with scrim backdrop
- [x] Implement menu item list with click handlers
- [x] Add danger variant for destructive actions
- [x] Add ESC key handler
- [x] Add click-outside-to-close handler
- [x] Add body scroll lock when open
- [x] Implement smart positioning logic
- [x] Style with Writer theme (brutalist aesthetic)
- [x] Add hover/active states for menu items
- [x] Export OverlayMenu from components index
- [x] Test TypeScript compilation
- [x] Commit changes and update gitban card

## Design Philosophy

### Why OverlayMenu vs BottomSheet?
Both use 75% black scrim but serve different purposes:

**OverlayMenu:**
- **Position**: Near trigger element (anchor)
- **Use case**: Quick actions, context menus
- **Content**: Simple list of actions
- **Size**: Small (200-300px)
- **Dismiss**: Auto-dismiss after action

**BottomSheet:**
- **Position**: Bottom of screen
- **Use case**: Rich content pickers, forms
- **Content**: Complex layouts (CategoryPicker)
- **Size**: Variable height
- **Dismiss**: Manual close button

**When to use which:**
- Three-dot menu → OverlayMenu
- Category selector → BottomSheet
- Deck actions (rename/delete) → OverlayMenu
- Card editor → BottomSheet (full screen)

### Why 75% Black Scrim?
Consistency with BottomSheet:
- Same backdrop opacity across app
- Sufficient contrast to focus attention
- Not too dark (can still see context)
- Standard mobile pattern (iOS/Android)

### Why Auto-Dismiss After Action?
Reduces friction:
- User taps action → action executes → menu closes
- No extra step to close menu
- Feels more responsive (one tap does everything)
- Standard behavior in native apps

### Why Smart Positioning?
Adapts to context:
- Default: Below and to right of anchor
- Near top of screen: Above anchor instead
- Near left edge: Align to left edge
- Center screen: If no anchor provided

## User Experience

### Interaction Flow
1. User taps trigger element (three-dot button)
2. OverlayMenu appears instantly (0ms) near trigger
3. Scrim darkens background (75% black)
4. User sees list of actions
5. User taps action → action executes → menu closes
6. Or user taps outside / presses ESC → menu closes

### Visual Feedback
- **Hover**: Gray-50 background (normal), Red-50 (danger)
- **Active**: Gray-100 background (normal), Red-100 (danger)
- **Danger actions**: Red text to indicate caution
- **Instant transitions**: 0ms animations

### Accessibility
- **Keyboard navigation**: Tab to focus items, Enter to activate
- **Screen readers**: role="menu" and role="menuitem" attributes
- **ESC key**: Standard dismiss shortcut
- **High contrast**: Black/white/red for clarity
- **No motion**: Zero animations safe for all users

## Use Cases

### CardListScreen Header Menu
Three-dot button in header opens menu:
```typescript
const [isMenuOpen, setIsMenuOpen] = useState(false);
const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

const handleMenuClick = (e: React.MouseEvent<HTMLElement>) => {
  setMenuAnchorEl(e.currentTarget);
  setIsMenuOpen(true);
};

const menuItems: MenuItem[] = [
  { label: 'Sort by Title', onClick: () => handleSort('title') },
  { label: 'Sort by Category', onClick: () => handleSort('category') },
  { label: 'Filter Options', onClick: () => openFilterSheet() },
];

return (
  <>
    <button onClick={handleMenuClick}>⋯</button>
    <OverlayMenu
      isOpen={isMenuOpen}
      onClose={() => setIsMenuOpen(false)}
      items={menuItems}
      anchorEl={menuAnchorEl}
    />
  </>
);
```

### Card Context Menu
Right-click or long-press on card:
```typescript
const cardMenuItems: MenuItem[] = [
  { label: 'Edit', onClick: () => onEditCard(card.id) },
  { label: 'Duplicate', onClick: () => onDuplicateCard(card.id) },
  { label: 'Move to Deck', onClick: () => openMoveSheet(card.id) },
  { label: 'Delete', onClick: () => onDeleteCard(card.id), danger: true },
];

<OverlayMenu
  isOpen={isCardMenuOpen}
  onClose={() => setIsCardMenuOpen(false)}
  items={cardMenuItems}
  anchorEl={cardElement}
/>
```

### Deck Actions Menu
Deck list item menu:
```typescript
const deckMenuItems: MenuItem[] = [
  { label: 'Rename', onClick: () => onRenameDeck(deck.id) },
  { label: 'Export', onClick: () => onExportDeck(deck.id) },
  { label: 'Share', onClick: () => onShareDeck(deck.id) },
  { label: 'Delete', onClick: () => onDeleteDeck(deck.id), danger: true },
];
```

## Benefits Over Alternative Approaches

### vs. Native `<select>` Dropdown
- **Visual control**: Custom styling, brutalist aesthetic
- **Rich content**: Can add icons, descriptions, separators
- **Better UX**: Instant feedback, hover states
- **Mobile-friendly**: Large touch targets (44px+ height)
- **Contextual**: Positioned near trigger (not browser-default location)

### vs. Alert/Confirm Dialogs
- **Non-modal**: Doesn't block entire screen
- **Quicker**: Actions visible immediately
- **Contextual**: Appears where user tapped
- **Flexible**: Multiple actions vs alert's 1-2 buttons

### vs. Inline Buttons
- **Space-efficient**: Hidden until needed
- **Organized**: Groups related actions
- **Cleaner UI**: Reduces button clutter
- **Discoverable**: Standard three-dot pattern

## Technical Implementation

### Z-Index Management
```typescript
scrimStyles: { zIndex: 1000 }
menuStyles: { zIndex: 1001 }
```

Hierarchy:
- Content: z-index 1 (default)
- AddCardButton FAB: z-index 100
- OverlayMenu scrim: z-index 1000
- OverlayMenu container: z-index 1001
- Modals/sheets: z-index 1000+ (same layer)

### Event Handling
**Click Outside with Delay:**
```typescript
setTimeout(() => {
  document.addEventListener('mousedown', handleClickOutside);
}, 0);
```

Delay prevents immediate close on trigger click:
1. User clicks trigger button
2. Menu opens
3. Trigger click bubbles up
4. Without delay: Trigger click closes menu immediately
5. With delay: Event listener added after trigger click handled

### Ref Management
```typescript
const menuRef = useRef<HTMLDivElement>(null);
```

Used for:
- Click outside detection
- Future: Keyboard navigation focus management

## Testing
- TypeScript compilation: ✅ Passed
- Manual testing: Menu behavior
- Positioning: Below anchor, adjusts if off-screen
- Dismiss handlers: Click outside, ESC key, item click
- Hover states: Gray/red backgrounds on interaction
- Danger actions: Red text displayed correctly
- Body scroll lock: Prevents scrolling when open
- Auto-dismiss: Closes after item selection

## Native Enhancements (Future)
TODOs for when wrapped in Capacitor:

### Haptic Feedback
```typescript
import { Haptics } from '@capacitor/haptics';
await Haptics.impact({ style: 'light' }); // On menu open
await Haptics.impact({ style: 'medium' }); // On item click
```

### Long-Press Gesture
```typescript
import { Gesture } from '@ionic/react';
<Gesture
  onLongPress={(e) => {
    setMenuAnchorEl(e.currentTarget);
    setIsMenuOpen(true);
  }}
>
  <Card />
</Gesture>
```

### Context Menu API (Desktop)
```typescript
// For desktop, use native context menu
element.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  setMenuAnchorEl(e.currentTarget);
  setIsMenuOpen(true);
});
```

## Design Rationale

### Why Document This?
OverlayMenu is a fundamental interaction pattern. Comprehensive documentation ensures:
- Developers understand positioning logic
- Use cases are clear (when to use vs BottomSheet)
- Dismiss behavior is documented
- Danger variant usage is explained
- Integration patterns are provided

### Why This Architecture?
- **Context-aware**: Positioned near trigger (not center screen)
- **Auto-dismiss**: Reduces interaction friction
- **Danger variant**: Visual warning for destructive actions
- **Smart positioning**: Adapts to screen edges
- **Consistent scrim**: Matches BottomSheet (75% black)

### Why MenuItem Interface?
Simple, declarative API:
```typescript
const items: MenuItem[] = [
  { label: 'Action 1', onClick: handler1 },
  { label: 'Action 2', onClick: handler2, danger: true },
];
```

Benefits:
- **Type-safe**: TypeScript validates structure
- **Declarative**: Data drives UI
- **Extensible**: Easy to add icon, disabled, etc.
- **Testable**: Pure data objects

## Next Steps
This completes the overlay menu system:
1. ✅ OverlayMenu component
2. ✅ MenuItem interface
3. ✅ Smart positioning
4. ✅ Dismiss handlers
5. ✅ Danger variant

Future enhancements:
- Icons in menu items
- Dividers between item groups
- Keyboard navigation (arrow keys)
- Submenu support (nested menus)
- Custom menu item components
