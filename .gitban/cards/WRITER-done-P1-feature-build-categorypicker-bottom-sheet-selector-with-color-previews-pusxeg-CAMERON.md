# Build CategoryPicker - Mobile-Native Bottom Sheet Selector

**Type:** Feature  
**Priority:** P1  
**Status:** Done  
**Owner:** CAMERON

## Summary

Implemented mobile-native CategoryPicker component that replaces the native dropdown with a BottomSheet-based selector. Provides color-coded category selection with descriptions, following Writer theme brutalist design principles.

## Implementation Details

### Component Features
- **BottomSheet integration**: Uses BottomSheet component for mobile-native feel
- **6 category options**: Displays all categories from centralized system
- **4px colored strip**: Matches Card component's category decorator
- **Rich descriptions**: Shows label + description for each category
- **Selected state**: Checkmark indicator for current selection
- **Zero animations**: Instant appear/disappear (0ms transitions)
- **Sharp edges**: 0px border radius (brutalist aesthetic)
- **Auto-dismiss**: Closes automatically after selection
- **Accessible**: ARIA labels, keyboard navigation

### Component API
```typescript
interface CategoryPickerProps {
  isOpen: boolean;                      // Controls visibility
  onClose: () => void;                   // Dismiss callback
  selectedCategory?: CategoryValue;      // Currently selected (highlighted)
  onSelectCategory: (category) => void;  // Selection callback
  testId?: string;                       // Test ID for testing
}
```

### Visual Design
Each category option displays:
- **4px colored strip** on left edge (category color)
- **Category label** in bold (e.g., "Conflict", "Character")
- **Description** below label (explains category purpose)
- **Checkmark indicator** on right (if selected)
- **Hover/active states** for touch feedback

### CardEditorScreen Integration
Replaced native `<select>` dropdown with mobile-native button + BottomSheet:

**Before:**
```typescript
<select value={category} onChange={...}>
  {CATEGORIES.map((cat) => (
    <option value={cat.value}>{cat.label}</option>
  ))}
</select>
```

**After:**
```typescript
<button onClick={() => setIsCategoryPickerOpen(true)}>
  {getCategoryLabel(category)}
</button>

<CategoryPicker
  isOpen={isCategoryPickerOpen}
  onClose={() => setIsCategoryPickerOpen(false)}
  selectedCategory={category}
  onSelectCategory={(newCategory) => setCategory(newCategory)}
/>
```

### Files Created/Modified
- ✅ `src/design-system/components/CategoryPicker.tsx` - Component implementation (162 lines)
- ✅ `src/design-system/components/index.tsx` - Export CategoryPicker
- ✅ `src/screens/CardEditorScreen.tsx` - Integrate CategoryPicker button

## Completed Tasks
- [x] Design CategoryPicker component API and props interface
- [x] Implement CategoryPicker using BottomSheet with category list
- [x] Add category options with 4px color strips and descriptions
- [x] Add selected state indicator and tap handlers
- [x] Style with Writer theme (brutalist aesthetic, zero animations)
- [x] Export CategoryPicker from components index
- [x] Update CardEditorScreen to use CategoryPicker instead of dropdown
- [x] Test TypeScript compilation
- [x] Commit changes and update gitban card

## Design Philosophy
Follows Writer theme brutalist digital minimalism:
- **Zero animations**: 0ms transitions for instant state changes
- **Sharp edges**: 0px border radius, flat design
- **High contrast**: Black borders, colored strips
- **Mobile-first**: Full-width design, touch-optimized
- **Consistent**: 4px strips match Card decorator
- **Accessible**: ARIA labels, keyboard navigation

## User Experience Improvements
Over native `<select>` dropdown:
- **Mobile-native**: BottomSheet feels natural on mobile devices
- **Richer UI**: Shows descriptions, not just labels
- **Better visibility**: Full-screen picker, easier to read
- **Color-coded**: Visual color strips aid recognition
- **Touch-optimized**: Larger touch targets (44px minimum)
- **Consistent**: Matches app's brutalist aesthetic

## Native Enhancements (Future)
TODOs for when wrapped in Capacitor:
- Add haptic feedback on category selection (light impact)
- Add search/filter for category lists exceeding 10 items
- Swipe gestures for quick category switching

## Usage Example
```typescript
import { CategoryPicker } from '../design-system/components/CategoryPicker';

const [category, setCategory] = useState<CategoryValue>('conflict');
const [isOpen, setIsOpen] = useState(false);

<button onClick={() => setIsOpen(true)}>
  Select Category
</button>

<CategoryPicker
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  selectedCategory={category}
  onSelectCategory={(newCategory) => {
    setCategory(newCategory);
    // Auto-closes via component
  }}
/>
```

## Testing
- TypeScript compilation: ✅ Passed
- Manual testing: CardEditorScreen category selection
- BottomSheet integration: Works with BottomSheet backdrop/dismiss
- Selection flow: Tap → Select → Auto-dismiss → State updated

## Design Rationale

### Why BottomSheet over Dropdown?
1. **Mobile-first**: BottomSheets are native mobile pattern
2. **Better UX**: Larger touch targets, easier to read
3. **Richer content**: Can show descriptions, not just labels
4. **Consistent**: Matches brutalist aesthetic with sharp edges
5. **Modern**: Aligns with iOS/Android native action sheets

### Why 4px Color Strips?
- Consistent with Card component's category decorator
- Immediate visual recognition of category
- Subtle but effective (brutalist minimalism)
- Doesn't overwhelm with color

## Next Steps
This component completes the category system:
1. ✅ Centralized category definitions (domain/categories.ts)
2. ✅ Card decorator (4px color strip)
3. ✅ CardListScreen category display
4. ✅ CardEditorScreen category selection (CategoryPicker)

Remaining category features:
- Category filtering in CardListScreen (card 6rb25b)
- Category color-coding throughout app
