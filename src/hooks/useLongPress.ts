/**
 * useLongPress Hook - Detect Long Press Gestures
 *
 * Detects when user holds touch/click for a duration (default 500ms).
 * Useful for context menus, alternate actions, and mobile-native interactions.
 *
 * Features:
 * - Configurable duration threshold
 * - Works with both touch and mouse events
 * - Prevents context menu on long press
 * - Cancels on move (prevents accidental triggers during scroll)
 * - Zero dependencies
 *
 * Usage:
 * const longPressHandlers = useLongPress(() => {
 *   console.log('Long pressed!');
 * }, { threshold: 500 });
 *
 * return <div {...longPressHandlers}>Long press me</div>;
 */

import { useCallback, useRef } from 'react';

export interface UseLongPressOptions {
  /** Duration in ms to trigger long press (default: 500ms) */
  threshold?: number;

  /** Callback when long press is triggered */
  onLongPress: (event: TouchEvent | MouseEvent) => void;

  /** Optional callback when touch starts */
  onStart?: (event: TouchEvent | MouseEvent) => void;

  /** Optional callback when touch is cancelled */
  onCancel?: (event: TouchEvent | MouseEvent) => void;

  /** Prevent default context menu (default: true) */
  preventContextMenu?: boolean;

  /** Cancel on move (default: true) */
  cancelOnMove?: boolean;
}

export interface LongPressHandlers {
  onMouseDown: (event: React.MouseEvent) => void;
  onMouseUp: (event: React.MouseEvent) => void;
  onMouseMove: (event: React.MouseEvent) => void;
  onMouseLeave: (event: React.MouseEvent) => void;
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
  onTouchMove: (event: React.TouchEvent) => void;
  onTouchCancel: (event: React.TouchEvent) => void;
  onContextMenu: (event: React.MouseEvent) => void;
}

export const useLongPress = (
  options: UseLongPressOptions
): LongPressHandlers => {
  const {
    threshold = 500,
    onLongPress,
    onStart,
    onCancel,
    preventContextMenu = true,
    cancelOnMove = true,
  } = options;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startEventRef = useRef<TouchEvent | MouseEvent | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  // Start long press timer
  const start = useCallback(
    (event: TouchEvent | MouseEvent) => {
      // Store start event for later use
      startEventRef.current = event;
      isLongPressTriggeredRef.current = false;

      // Call onStart callback
      onStart?.(event);

      // Set timer for long press
      timerRef.current = setTimeout(() => {
        isLongPressTriggeredRef.current = true;
        onLongPress(event);
      }, threshold);
    },
    [threshold, onLongPress, onStart]
  );

  // Cancel long press timer
  const cancel = useCallback(
    (event: TouchEvent | MouseEvent) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      // Call onCancel if long press wasn't triggered
      if (!isLongPressTriggeredRef.current && startEventRef.current) {
        onCancel?.(event);
      }

      startEventRef.current = null;
      isLongPressTriggeredRef.current = false;
    },
    [onCancel]
  );

  // Mouse handlers
  const onMouseDown = useCallback(
    (event: React.MouseEvent) => {
      start(event.nativeEvent);
    },
    [start]
  );

  const onMouseUp = useCallback(
    (event: React.MouseEvent) => {
      cancel(event.nativeEvent);
    },
    [cancel]
  );

  const onMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (cancelOnMove && timerRef.current) {
        cancel(event.nativeEvent);
      }
    },
    [cancel, cancelOnMove]
  );

  const onMouseLeave = useCallback(
    (event: React.MouseEvent) => {
      cancel(event.nativeEvent);
    },
    [cancel]
  );

  // Touch handlers
  const onTouchStart = useCallback(
    (event: React.TouchEvent) => {
      start(event.nativeEvent);
    },
    [start]
  );

  const onTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      cancel(event.nativeEvent);
    },
    [cancel]
  );

  const onTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (cancelOnMove && timerRef.current) {
        cancel(event.nativeEvent);
      }
    },
    [cancel, cancelOnMove]
  );

  const onTouchCancel = useCallback(
    (event: React.TouchEvent) => {
      cancel(event.nativeEvent);
    },
    [cancel]
  );

  // Context menu handler
  const onContextMenu = useCallback(
    (event: React.MouseEvent) => {
      if (preventContextMenu) {
        event.preventDefault();
      }
    },
    [preventContextMenu]
  );

  return {
    onMouseDown,
    onMouseUp,
    onMouseMove,
    onMouseLeave,
    onTouchStart,
    onTouchEnd,
    onTouchMove,
    onTouchCancel,
    onContextMenu,
  };
};

// NATIVE TODO: Add haptic feedback on long press trigger
// When we wrap in Capacitor, add:
// import { Haptics } from '@capacitor/haptics';
//
// In the timeout callback:
// if (Capacitor.isNativePlatform()) {
//   await Haptics.impact({ style: 'medium' });
// }
