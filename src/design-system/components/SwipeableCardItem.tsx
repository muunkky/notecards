/**
 * SwipeableCardItem Component - Writer Theme
 *
 * Integrates swipe-to-delete functionality with CardItem:
 * - Wraps CardItem component (separation of concerns)
 * - Uses useSwipe hook for left-swipe gesture detection
 * - Shows Toast notification with undo capability
 * - Handles delete and undo callbacks
 *
 * ARCHITECTURE DECISION:
 * This component keeps CardItem as a pure presentational component
 * while adding interaction logic in a separate wrapper. This follows
 * the single responsibility principle and makes testing easier.
 *
 * SWIPE-TO-DELETE FLOW:
 * 1. User swipes left on card (>= 50px distance)
 * 2. onDelete(cardId) called immediately
 * 3. Toast appears: "Card deleted" with "Undo" button
 * 4. User can click "Undo" within 5 seconds
 * 5. If undone: onUndo(cardId) called, toast closes
 * 6. If not undone: toast auto-dismisses after 5 seconds
 *
 * INSTANT FEEDBACK PATTERN:
 * Delete happens immediately on swipe (optimistic UI pattern).
 * Parent component should handle delete logic and undo restoration.
 *
 * TDD: This component is built to pass writer-theme-swipeable-card.test.tsx
 */

import * as React from 'react';
import { useState } from 'react';
import { CardItem, CardItemProps } from './CardItem';
import { Toast } from './Toast';
import { useSwipe } from '../../hooks/useSwipe';

export interface SwipeableCardItemProps extends Omit<CardItemProps, 'id'> {
  /** Unique card identifier */
  id: string;

  /** Callback when card is deleted (swipe left) */
  onDelete: (cardId: string) => void;

  /** Optional callback when undo is clicked */
  onUndo?: (cardId: string) => void;
}

export const SwipeableCardItem = React.forwardRef<HTMLElement, SwipeableCardItemProps>(
  (
    {
      id,
      title,
      content,
      category,
      onDelete,
      onUndo,
      ...cardItemProps
    },
    ref
  ) => {
    const [showToast, setShowToast] = useState(false);

    // Handle swipe left (delete)
    const handleSwipeLeft = () => {
      // Call delete immediately (optimistic UI)
      onDelete(id);

      // Show toast with undo option
      setShowToast(true);
    };

    // Handle undo
    const handleUndo = () => {
      onUndo?.(id);
      setShowToast(false);
    };

    // Handle toast close (auto-dismiss or manual)
    const handleToastClose = () => {
      setShowToast(false);
    };

    // Attach swipe handlers
    const swipeHandlers = useSwipe({
      onSwipeLeft: handleSwipeLeft,
      minDistance: 50, // Minimum 50px swipe
      minVelocity: 0.3, // Minimum velocity
    });

    return (
      <>
        {/* CardItem with swipe handlers */}
        <CardItem
          ref={ref}
          id={id}
          title={title}
          content={content}
          category={category}
          {...cardItemProps}
          {...swipeHandlers}
        />

        {/* Toast notification with undo */}
        <Toast
          message="Card deleted"
          isOpen={showToast}
          onClose={handleToastClose}
          actionLabel="Undo"
          onAction={handleUndo}
          duration={5000}
        />
      </>
    );
  }
);

SwipeableCardItem.displayName = 'SwipeableCardItem';

// NATIVE TODO: Add haptic feedback on successful swipe
// When we wrap in Capacitor, add:
// import { Haptics } from '@capacitor/haptics';
// import { Capacitor } from '@capacitor/core';
//
// const handleSwipeLeft = async () => {
//   if (Capacitor.isNativePlatform()) {
//     await Haptics.notification({ type: 'warning' }); // Strong haptic for delete
//   }
//
//   onDelete(id);
//   setShowToast(true);
// };

// NATIVE TODO: Add visual swipe feedback (slide animation during gesture)
// Consider adding a subtle horizontal translation during the swipe
// to show the card is "moving" before deletion. This would be
// conditional on native platform to maintain 0ms transitions on web.
//
// if (Capacitor.isNativePlatform()) {
//   // Add transform: translateX() during onSwipeMove callback
//   // Reset on onSwipeEnd
// }
