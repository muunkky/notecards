# Build ReorderMode - Drag-and-Drop Card Sequencing

**Type:** Feature
**Priority:** P1
**Status:** in_progress
**Created:** Generated via MCP

## Description
Build ReorderMode - drag-and-drop card sequencing with long-press activation, touch-first gesture support, and instant visual feedback.

## Tasks
- [x] Write comprehensive TDD tests for ReorderableCardList component (28 tests)
- [x] Implement ReorderableCardList component with touch-based dragging
- [x] Integrate useLongPress hook for drag activation (500ms threshold)
- [x] Implement drag tracking with touchmove/mousemove events
- [x] Add visual feedback (drag indicator, drop zones, opacity changes)
- [x] Implement drop zone calculation based on card positions
- [x] Implement reorder callback with new card array
- [x] Add reorder mode indicator for user feedback
- [x] Support escape key to cancel drag operation
- [x] Verify all 28 tests passing
- [x] Export ReorderableCardList from components index
- [x] Fix TypeScript ref forwarding error (useCallback with proper ref handling)
- [x] Verify TypeScript compilation passes

## Implementation Details

### Files Created
1. `src/design-system/components/ReorderableCardList.tsx`
2. `src/test/design-system/writer-theme-reorderable-list.test.tsx`

### Component Features
- Long-press activation (500ms threshold prevents accidental drags)
- Touch-first drag tracking (mobile-native, not HTML5 drag-and-drop)
- Visual drop zone indicators (4px black lines)
- Drag indicator following cursor/touch
- Reorder mode status message (fixed top-center)
- Instant reordering (0ms transitions, brutalist aesthetic)
- Escape key cancellation
- Full accessibility support (ARIA labels, roles)

### Test Coverage
- 28 comprehensive tests covering:
  - Rendering and card order
  - Long-press activation
  - Drag tracking and visual feedback
  - Drop zone calculation
  - Reorder operations (move up, down, no-op)
  - Edge cases (rapid operations, escape cancel)
  - Accessibility features

## Notes
- Uses mobile-first touch events rather than HTML5 drag-and-drop API
- Follows brutalist design: 0ms transitions, stark visual feedback, sharp edges
- Integrates seamlessly with existing CardItem component
- Ready for Capacitor haptic feedback integration (see NATIVE TODOs in code)
