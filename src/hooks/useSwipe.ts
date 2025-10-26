/**
 * useSwipe Hook - Detect Swipe Gestures
 *
 * Detects swipe direction (left/right/up/down) with configurable thresholds.
 * Useful for swipe-to-delete, navigation gestures, and card carousels.
 *
 * Features:
 * - Detects 4 directions: left, right, up, down
 * - Configurable distance threshold (default 50px)
 * - Configurable velocity threshold (default 0.3px/ms)
 * - Works with both touch and mouse events
 * - Provides start/move/end callbacks
 * - Zero dependencies
 *
 * Usage:
 * const swipeHandlers = useSwipe({
 *   onSwipeLeft: () => console.log('Swiped left!'),
 *   onSwipeRight: () => console.log('Swiped right!'),
 * });
 *
 * return <div {...swipeHandlers}>Swipe me</div>;
 */

import { useCallback, useRef } from 'react';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface SwipeState {
  startX: number;
  startY: number;
  currentX?: number;
  currentY?: number;
  deltaX?: number;
  deltaY?: number;
  direction?: SwipeDirection;
  distance?: number;
  velocity?: number;
}

export interface UseSwipeOptions {
  /** Callback when swiped left */
  onSwipeLeft?: () => void;

  /** Callback when swiped right */
  onSwipeRight?: () => void;

  /** Callback when swiped up */
  onSwipeUp?: () => void;

  /** Callback when swiped down */
  onSwipeDown?: () => void;

  /** Callback when swipe starts */
  onSwipeStart?: (state: SwipeState) => void;

  /** Callback during swipe movement */
  onSwipeMove?: (state: SwipeState) => void;

  /** Callback when swipe ends */
  onSwipeEnd?: (state: SwipeState) => void;

  /** Minimum distance in px to trigger swipe (default: 50) */
  minDistance?: number;

  /** Minimum velocity in px/ms to trigger swipe (default: 0.3) */
  minVelocity?: number;
}

export interface SwipeHandlers {
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchMove: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
  onTouchCancel: (event: React.TouchEvent) => void;
  onMouseDown: (event: React.MouseEvent) => void;
  onMouseMove: (event: React.MouseEvent) => void;
  onMouseUp: (event: React.MouseEvent) => void;
  onMouseLeave: (event: React.MouseEvent) => void;
}

export const useSwipe = (options: UseSwipeOptions): SwipeHandlers => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipeStart,
    onSwipeMove,
    onSwipeEnd,
    minDistance = 50,
    minVelocity = 0.3,
  } = options;

  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const isSwipingRef = useRef<boolean>(false);

  // Start swipe tracking
  const start = useCallback(
    (x: number, y: number) => {
      startXRef.current = x;
      startYRef.current = y;
      startTimeRef.current = Date.now();
      isSwipingRef.current = true;

      onSwipeStart?.({
        startX: x,
        startY: y,
      });
    },
    [onSwipeStart]
  );

  // Track swipe movement
  const move = useCallback(
    (x: number, y: number) => {
      if (!isSwipingRef.current) return;

      const deltaX = x - startXRef.current;
      const deltaY = y - startYRef.current;

      onSwipeMove?.({
        startX: startXRef.current,
        startY: startYRef.current,
        currentX: x,
        currentY: y,
        deltaX,
        deltaY,
      });
    },
    [onSwipeMove]
  );

  // End swipe and detect direction
  const end = useCallback(
    (x: number, y: number) => {
      if (!isSwipingRef.current) return;

      const deltaX = x - startXRef.current;
      const deltaY = y - startYRef.current;
      const deltaTime = Date.now() - startTimeRef.current;

      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      const distance = Math.max(absDeltaX, absDeltaY);
      const velocity = deltaTime > 0 ? distance / deltaTime : 0;

      isSwipingRef.current = false;

      // Check if swipe meets thresholds
      if (distance < minDistance || velocity < minVelocity) {
        return;
      }

      // Determine dominant direction (horizontal vs vertical)
      let direction: SwipeDirection | undefined;

      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0) {
          direction = 'right';
          onSwipeRight?.();
        } else {
          direction = 'left';
          onSwipeLeft?.();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          direction = 'down';
          onSwipeDown?.();
        } else {
          direction = 'up';
          onSwipeUp?.();
        }
      }

      onSwipeEnd?.({
        startX: startXRef.current,
        startY: startYRef.current,
        currentX: x,
        currentY: y,
        deltaX,
        deltaY,
        direction,
        distance,
        velocity,
      });
    },
    [minDistance, minVelocity, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSwipeEnd]
  );

  // Cancel swipe
  const cancel = useCallback(() => {
    isSwipingRef.current = false;
  }, []);

  // Touch handlers
  const onTouchStart = useCallback(
    (event: React.TouchEvent) => {
      const touch = event.nativeEvent.touches[0];
      start(touch.clientX, touch.clientY);
    },
    [start]
  );

  const onTouchMove = useCallback(
    (event: React.TouchEvent) => {
      const touch = event.nativeEvent.touches[0];
      move(touch.clientX, touch.clientY);
    },
    [move]
  );

  const onTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      const touch = event.nativeEvent.changedTouches[0];
      end(touch.clientX, touch.clientY);
    },
    [end]
  );

  const onTouchCancel = useCallback(
    (event: React.TouchEvent) => {
      cancel();
    },
    [cancel]
  );

  // Mouse handlers
  const onMouseDown = useCallback(
    (event: React.MouseEvent) => {
      start(event.nativeEvent.clientX, event.nativeEvent.clientY);
    },
    [start]
  );

  const onMouseMove = useCallback(
    (event: React.MouseEvent) => {
      move(event.nativeEvent.clientX, event.nativeEvent.clientY);
    },
    [move]
  );

  const onMouseUp = useCallback(
    (event: React.MouseEvent) => {
      end(event.nativeEvent.clientX, event.nativeEvent.clientY);
    },
    [end]
  );

  const onMouseLeave = useCallback(
    (event: React.MouseEvent) => {
      cancel();
    },
    [cancel]
  );

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
  };
};

// NATIVE TODO: Add haptic feedback on swipe completion
// When we wrap in Capacitor, add:
// import { Haptics } from '@capacitor/haptics';
//
// In the end() function after direction is determined:
// if (Capacitor.isNativePlatform()) {
//   await Haptics.impact({ style: 'light' });
// }
