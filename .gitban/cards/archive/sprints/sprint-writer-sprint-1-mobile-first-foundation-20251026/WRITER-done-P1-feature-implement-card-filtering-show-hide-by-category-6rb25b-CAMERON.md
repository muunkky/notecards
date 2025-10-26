# Implement Card Filtering - Show/Hide by Category

**Type:** Feature  
**Priority:** P1  
**Status:** Done  
**Owner:** CAMERON

## Summary

Implemented category-based filtering for CardListScreen to help users quickly focus on specific card types. Added horizontal scrollable filter chips with color indicators, counts, and instant state changes following Writer theme brutalist principles.

## Implementation Details

### Filter Chip UI
Created horizontal scrollable chip bar with brutalist aesthetic:

**All Filter:**
- Shows total card count
- Default selected state
- Active: Black background, white text
- Inactive: White background, black text

**Category Filters (6 total):**
- One chip per category (Conflict, Character, Location, Theme, Action, Dialogue)
- 12x12px color indicator matching category decorator
- Card count per category
- Active/inactive states matching "All" filter

**Visual Design:**
- Border: 1px solid black
- Border radius: 0px (sharp edges)
- Transitions: 0ms (instant state changes)
- Font: 14px system font, weight 600
- Padding: 6px horizontal, 12px vertical
- Gap: 8px between chips
- Horizontal scroll for narrow viewports

### State Management
```typescript
const [selectedFilter, setSelectedFilter] = useState<'all' | CategoryValue>('all');
```

**Filter Logic:**
```typescript
const filteredCards = selectedFilter === 'all'
  ? cards
  : cards.filter(card => card.category === selectedFilter);
```

### Interactive States
**Inactive Chips:**
- Hover: Gray-50 background
- Active: Gray-100 background

**Active Chips:**
- Hover: Gray-800 background (darker black)
- Active: Gray-900 background (darkest)

All transitions: 0ms (instant feedback)

### Empty State Enhancement
Updated empty state to show contextual messages:
- No cards: "No cards yet. Tap + to add your first card."
- Filtered with no results: "No [category name] cards."

### Files Modified
- ✅ `src/screens/CardListScreen.tsx` - Added filter state, UI, and logic (+104 lines)

## Completed Tasks
- [x] Add filter state management to CardListScreen
- [x] Design filter UI (category chips/buttons)
- [x] Implement filter logic to show/hide cards by category
- [x] Add 'All' option to show all cards
- [x] Style filter UI with Writer theme (brutalist aesthetic)
- [x] Add active state indicators for selected filter
- [x] Add hover/active interaction states
- [x] Update empty state messages for filtered views
- [x] Test TypeScript compilation
- [x] Commit changes and update gitban card

## Design Philosophy

### Why Filter Chips?
1. **Visual clarity**: See all categories at once with counts
2. **Color coding**: 12x12px indicators match card decorators
3. **Touch-friendly**: Large tap targets (44px+ height)
4. **Mobile-native**: Horizontal scroll familiar to mobile users
5. **Instant feedback**: 0ms transitions show selection immediately

### Why Instant State Changes?
Follows Writer theme brutalist principles:
- No animation delays = faster perceived performance
- Binary state (selected/not selected) shown honestly
- Reduced cognitive load (no tracking animations)
- Better accessibility (no motion triggers)

### Why Category Counts?
- **Information density**: Users see card distribution at glance
- **Decision support**: Choose categories with most/least cards
- **Empty state awareness**: Zero count = no cards in category
- **Validation**: Total counts sum to "All" count

## User Experience

### Interaction Flow
1. User views CardListScreen with all cards visible
2. Horizontal chip bar shows "All" (selected) + 6 categories
3. User taps category chip (e.g., "Character")
4. Filter state changes instantly (0ms)
5. Card list updates to show only Character cards
6. Empty state shows "No character cards" if none exist
7. Category chip shows active state (black bg, white text)
8. User taps "All" to reset filter

### Visual Feedback
- **Color indicators**: Match card decorator strips (4px left edge)
- **Card counts**: Show number of cards per category
- **Active state**: Black background clearly indicates selection
- **Hover states**: Subtle gray feedback on interaction
- **Instant updates**: No waiting for animations

### Accessibility
- **Keyboard navigation**: Tab to focus chips, Enter to select
- **Screen readers**: Button labels announce category names
- **High contrast**: Black/white meets WCAG AAA standards
- **Clear indicators**: Active state visually distinct
- **No motion**: Zero animations safe for all users

## Benefits Over Alternative Approaches

### vs. Dropdown Menu
- **Faster**: No open/close interaction required
- **Visual**: See all options and counts at once
- **Mobile-friendly**: Horizontal scroll vs modal picker
- **Contextual**: Color indicators provide category context

### vs. Search Input
- **Simpler**: One tap vs typing query
- **Discoverable**: All categories visible upfront
- **Guided**: Users can't misspell or miss categories
- **Complementary**: Filtering + search could coexist

### vs. Sidebar Filters
- **Mobile-optimized**: No sidebar drawer needed
- **Always visible**: Filters don't hide behind menu
- **Simpler hierarchy**: Flat list vs nested navigation
- **Better use of space**: Horizontal scroll efficient on mobile

## Technical Implementation

### Filter State Type
```typescript
type FilterState = 'all' | CategoryValue;
```

Union type ensures type safety - can only be 'all' or valid category value.

### Category Integration
```typescript
import { CategoryValue, CATEGORIES, getCategoryColor } from '../domain/categories';
```

Uses centralized category system for consistency across app.

### Count Calculation
```typescript
const count = cards.filter(card => card.category === category.value).length;
```

Real-time count calculation ensures accuracy even after card changes.

### Render Optimization
```typescript
{filteredCards.map((card) => (
  <div key={card.id}>
    <Card {...props} />
  </div>
))}
```

Renders only filtered cards - better performance for large lists.

## Performance Considerations

### Filter Performance
- **O(n) filtering**: Linear scan through cards array
- **Acceptable for 100s of cards**: JavaScript filtering very fast
- **Real-time counts**: Recalculated on every render
- **No memoization**: React re-renders are cheap for this use case

### Future Optimization (if needed)
- **useMemo for counts**: Cache count calculations
- **Virtual scrolling**: Render only visible cards for 1000+ cards
- **Index-based filtering**: Pre-group cards by category

## Testing
- TypeScript compilation: ✅ Passed
- Manual testing: Filter chips behavior
- All filter: Shows all cards with correct count
- Category filters: Show only matching cards
- Empty state: Shows contextual messages
- Hover states: Gray backgrounds on interaction
- Active states: Black background on selection
- Horizontal scroll: Works on narrow viewports
- Count accuracy: Matches actual card counts

## Native Enhancements (Future)
TODOs for when wrapped in Capacitor:

### Haptic Feedback
```typescript
import { Haptics } from '@capacitor/haptics';
await Haptics.impact({ style: 'light' }); // On filter selection
```

### Filter Persistence
```typescript
import { Preferences } from '@capacitor/preferences';
await Preferences.set({ key: 'selectedFilter', value: selectedFilter });
// Restore on mount
```

### Analytics
Track filter usage to understand which categories users browse most:
```typescript
Analytics.logEvent('card_filter_selected', { category: selectedFilter });
```

## Design Rationale

### Why Document This?
Card filtering is core navigation pattern. Documentation ensures:
- Future developers understand filter architecture
- Pattern can be replicated for other filter types
- Performance characteristics are clear
- Design decisions are preserved

### Why Horizontal Chips?
Horizontal chip patterns are standard mobile UI:
- **iOS**: Collection view horizontal scroll
- **Android**: Chip groups in Material Design
- **Web**: Horizontal pills in GitHub, Twitter, etc.
- **Familiar**: Users know how to interact

### Why Color Indicators?
- **Visual consistency**: Match card decorator strips (4px left)
- **Quick scanning**: Find category by color, not label
- **Aesthetic**: Adds visual interest to brutalist UI
- **Functional**: Color coding reduces cognitive load

## Next Steps
This completes the card filtering system:
1. ✅ Filter state management
2. ✅ Filter UI (horizontal chips)
3. ✅ Filter logic (show/hide cards)
4. ✅ Category counts
5. ✅ Empty state messages
6. ✅ Interactive states (hover/active)

Remaining card features:
- Swipe to delete (card j4u6ru)
- Card reordering (card tsc2ox)
- Navigation system (card zgfc3v)
- Touch gesture system (card 010j1e)
