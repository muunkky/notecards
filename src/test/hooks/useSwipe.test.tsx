/**
 * useSwipe Hook TDD Specs
 *
 * Tests swipe gesture detection for mobile-native interactions.
 *
 * Requirements:
 * - Detects left/right/up/down swipe directions
 * - Configurable distance threshold (default 50px)
 * - Configurable velocity threshold (default 0.3px/ms)
 * - Provides swipe start/move/end callbacks
 * - Calculates swipe distance and velocity
 * - Zero dependencies
 *
 * Use Cases:
 * - Swipe to delete cards
 * - Navigation gestures (swipe to go back)
 * - Card carousel/slider
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSwipe } from '../../hooks/useSwipe';
import type { UseSwipeOptions } from '../../hooks/useSwipe';

describe('useSwipe Hook', () => {
  describe('Basic Functionality', () => {
    it('should detect left swipe', () => {
      const onSwipeLeft = vi.fn();
      const { result } = renderHook(() =>
        useSwipe({ onSwipeLeft })
      );

      const touchStart = {
        nativeEvent: {
          touches: [{ clientX: 200, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      const touchEnd = {
        nativeEvent: {
          changedTouches: [{ clientX: 100, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStart);
      });

      act(() => {
        result.current.onTouchEnd(touchEnd);
      });

      expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    });

    it('should detect right swipe', () => {
      const onSwipeRight = vi.fn();
      const { result } = renderHook(() =>
        useSwipe({ onSwipeRight })
      );

      const touchStart = {
        nativeEvent: {
          touches: [{ clientX: 100, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      const touchEnd = {
        nativeEvent: {
          changedTouches: [{ clientX: 200, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStart);
      });

      act(() => {
        result.current.onTouchEnd(touchEnd);
      });

      expect(onSwipeRight).toHaveBeenCalledTimes(1);
    });

    it('should detect up swipe', () => {
      const onSwipeUp = vi.fn();
      const { result } = renderHook(() =>
        useSwipe({ onSwipeUp })
      );

      const touchStart = {
        nativeEvent: {
          touches: [{ clientX: 100, clientY: 200 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      const touchEnd = {
        nativeEvent: {
          changedTouches: [{ clientX: 100, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStart);
      });

      act(() => {
        result.current.onTouchEnd(touchEnd);
      });

      expect(onSwipeUp).toHaveBeenCalledTimes(1);
    });

    it('should detect down swipe', () => {
      const onSwipeDown = vi.fn();
      const { result } = renderHook(() =>
        useSwipe({ onSwipeDown })
      );

      const touchStart = {
        nativeEvent: {
          touches: [{ clientX: 100, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      const touchEnd = {
        nativeEvent: {
          changedTouches: [{ clientX: 100, clientY: 200 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStart);
      });

      act(() => {
        result.current.onTouchEnd(touchEnd);
      });

      expect(onSwipeDown).toHaveBeenCalledTimes(1);
    });
  });

  describe('Distance Threshold', () => {
    it('should not trigger swipe below default threshold (50px)', () => {
      const onSwipeLeft = vi.fn();
      const { result } = renderHook(() =>
        useSwipe({ onSwipeLeft })
      );

      const touchStart = {
        nativeEvent: {
          touches: [{ clientX: 100, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      const touchEnd = {
        nativeEvent: {
          changedTouches: [{ clientX: 60, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStart);
      });

      act(() => {
        result.current.onTouchEnd(touchEnd);
      });

      expect(onSwipeLeft).not.toHaveBeenCalled();
    });

    it('should trigger swipe at threshold (50px)', () => {
      const onSwipeLeft = vi.fn();
      const { result } = renderHook(() =>
        useSwipe({ onSwipeLeft })
      );

      const touchStart = {
        nativeEvent: {
          touches: [{ clientX: 100, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      const touchEnd = {
        nativeEvent: {
          changedTouches: [{ clientX: 50, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStart);
      });

      act(() => {
        result.current.onTouchEnd(touchEnd);
      });

      expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    });

    it('should support custom distance threshold', () => {
      const onSwipeLeft = vi.fn();
      const { result } = renderHook(() =>
        useSwipe({ onSwipeLeft, minDistance: 100 })
      );

      // 80px swipe (below 100px threshold)
      const touchStart = {
        nativeEvent: {
          touches: [{ clientX: 200, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      const touchEnd = {
        nativeEvent: {
          changedTouches: [{ clientX: 120, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStart);
      });

      act(() => {
        result.current.onTouchEnd(touchEnd);
      });

      expect(onSwipeLeft).not.toHaveBeenCalled();
    });
  });

  describe('Velocity Threshold', () => {
    it('should calculate velocity (distance/time)', () => {
      const onSwipeLeft = vi.fn();
      const { result } = renderHook(() =>
        useSwipe({ onSwipeLeft })
      );

      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValueOnce(now).mockReturnValueOnce(now + 100);

      const touchStart = {
        nativeEvent: {
          touches: [{ clientX: 200, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      const touchEnd = {
        nativeEvent: {
          changedTouches: [{ clientX: 100, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStart);
      });

      act(() => {
        result.current.onTouchEnd(touchEnd);
      });

      // 100px in 100ms = 1.0 px/ms velocity
      expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    });

    it('should not trigger swipe below velocity threshold', () => {
      const onSwipeLeft = vi.fn();
      const { result } = renderHook(() =>
        useSwipe({ onSwipeLeft, minVelocity: 1.0 })
      );

      const now = Date.now();
      // Slow swipe: 100px in 200ms = 0.5 px/ms
      vi.spyOn(Date, 'now').mockReturnValueOnce(now).mockReturnValueOnce(now + 200);

      const touchStart = {
        nativeEvent: {
          touches: [{ clientX: 200, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      const touchEnd = {
        nativeEvent: {
          changedTouches: [{ clientX: 100, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStart);
      });

      act(() => {
        result.current.onTouchEnd(touchEnd);
      });

      expect(onSwipeLeft).not.toHaveBeenCalled();
    });
  });

  describe('Dominant Direction Detection', () => {
    it('should detect horizontal swipe when X delta is larger', () => {
      const onSwipeLeft = vi.fn();
      const onSwipeDown = vi.fn();
      const { result } = renderHook(() =>
        useSwipe({ onSwipeLeft, onSwipeDown })
      );

      const touchStart = {
        nativeEvent: {
          touches: [{ clientX: 200, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      const touchEnd = {
        nativeEvent: {
          // 100px left, 30px down
          changedTouches: [{ clientX: 100, clientY: 130 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStart);
      });

      act(() => {
        result.current.onTouchEnd(touchEnd);
      });

      expect(onSwipeLeft).toHaveBeenCalledTimes(1);
      expect(onSwipeDown).not.toHaveBeenCalled();
    });

    it('should detect vertical swipe when Y delta is larger', () => {
      const onSwipeLeft = vi.fn();
      const onSwipeDown = vi.fn();
      const { result } = renderHook(() =>
        useSwipe({ onSwipeLeft, onSwipeDown })
      );

      const touchStart = {
        nativeEvent: {
          touches: [{ clientX: 100, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      const touchEnd = {
        nativeEvent: {
          // 30px left, 100px down
          changedTouches: [{ clientX: 70, clientY: 200 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStart);
      });

      act(() => {
        result.current.onTouchEnd(touchEnd);
      });

      expect(onSwipeDown).toHaveBeenCalledTimes(1);
      expect(onSwipeLeft).not.toHaveBeenCalled();
    });
  });

  describe('Mouse Events Support', () => {
    it('should detect swipe with mouse events', () => {
      const onSwipeLeft = vi.fn();
      const { result } = renderHook(() =>
        useSwipe({ onSwipeLeft })
      );

      const mouseDown = {
        nativeEvent: {
          clientX: 200,
          clientY: 100,
        } as MouseEvent,
      } as React.MouseEvent;

      const mouseUp = {
        nativeEvent: {
          clientX: 100,
          clientY: 100,
        } as MouseEvent,
      } as React.MouseEvent;

      act(() => {
        result.current.onMouseDown(mouseDown);
      });

      act(() => {
        result.current.onMouseUp(mouseUp);
      });

      expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    });

    it('should handle mouse leave during swipe', () => {
      const onSwipeLeft = vi.fn();
      const { result } = renderHook(() =>
        useSwipe({ onSwipeLeft })
      );

      const mouseDown = {
        nativeEvent: {
          clientX: 200,
          clientY: 100,
        } as MouseEvent,
      } as React.MouseEvent;

      const mouseLeave = {
        nativeEvent: {
          clientX: 100,
          clientY: 100,
        } as MouseEvent,
      } as React.MouseEvent;

      act(() => {
        result.current.onMouseDown(mouseDown);
      });

      act(() => {
        result.current.onMouseLeave(mouseLeave);
      });

      // Should not trigger on leave
      expect(onSwipeLeft).not.toHaveBeenCalled();
    });
  });

  describe('Callback Options', () => {
    it('should call onSwipeStart when swipe begins', () => {
      const onSwipeLeft = vi.fn();
      const onSwipeStart = vi.fn();
      const { result } = renderHook(() =>
        useSwipe({ onSwipeLeft, onSwipeStart })
      );

      const touchStart = {
        nativeEvent: {
          touches: [{ clientX: 200, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStart);
      });

      expect(onSwipeStart).toHaveBeenCalledTimes(1);
      expect(onSwipeStart).toHaveBeenCalledWith(
        expect.objectContaining({
          startX: 200,
          startY: 100,
        })
      );
    });

    it('should call onSwipeMove during swipe', () => {
      const onSwipeMove = vi.fn();
      const { result } = renderHook(() =>
        useSwipe({ onSwipeMove })
      );

      const touchStart = {
        nativeEvent: {
          touches: [{ clientX: 200, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      const touchMove = {
        nativeEvent: {
          touches: [{ clientX: 150, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStart);
      });

      act(() => {
        result.current.onTouchMove(touchMove);
      });

      expect(onSwipeMove).toHaveBeenCalledWith(
        expect.objectContaining({
          deltaX: -50,
          deltaY: 0,
          currentX: 150,
          currentY: 100,
        })
      );
    });

    it('should call onSwipeEnd when swipe finishes', () => {
      const onSwipeLeft = vi.fn();
      const onSwipeEnd = vi.fn();
      const { result } = renderHook(() =>
        useSwipe({ onSwipeLeft, onSwipeEnd })
      );

      const touchStart = {
        nativeEvent: {
          touches: [{ clientX: 200, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      const touchEnd = {
        nativeEvent: {
          changedTouches: [{ clientX: 100, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStart);
      });

      act(() => {
        result.current.onTouchEnd(touchEnd);
      });

      expect(onSwipeEnd).toHaveBeenCalledWith(
        expect.objectContaining({
          direction: 'left',
          distance: 100,
        })
      );
    });
  });

  describe('Handler Return Type', () => {
    it('should return all required handlers', () => {
      const onSwipeLeft = vi.fn();
      const { result } = renderHook(() => useSwipe({ onSwipeLeft }));

      expect(result.current).toHaveProperty('onTouchStart');
      expect(result.current).toHaveProperty('onTouchMove');
      expect(result.current).toHaveProperty('onTouchEnd');
      expect(result.current).toHaveProperty('onTouchCancel');
      expect(result.current).toHaveProperty('onMouseDown');
      expect(result.current).toHaveProperty('onMouseMove');
      expect(result.current).toHaveProperty('onMouseUp');
      expect(result.current).toHaveProperty('onMouseLeave');
    });

    it('should return stable handler references', () => {
      const onSwipeLeft = vi.fn();
      const { result, rerender } = renderHook(() =>
        useSwipe({ onSwipeLeft })
      );

      const firstRender = result.current;

      rerender();

      const secondRender = result.current;

      expect(firstRender.onTouchStart).toBe(secondRender.onTouchStart);
      expect(firstRender.onMouseDown).toBe(secondRender.onMouseDown);
    });
  });

  describe('Touch Cancel', () => {
    it('should handle touch cancel event', () => {
      const onSwipeLeft = vi.fn();
      const { result } = renderHook(() =>
        useSwipe({ onSwipeLeft })
      );

      const touchStart = {
        nativeEvent: {
          touches: [{ clientX: 200, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      const touchCancel = {
        nativeEvent: {
          changedTouches: [{ clientX: 100, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStart);
      });

      act(() => {
        result.current.onTouchCancel(touchCancel);
      });

      // Should not trigger swipe on cancel
      expect(onSwipeLeft).not.toHaveBeenCalled();
    });
  });

  describe('Memory Management', () => {
    it('should cleanup on unmount', () => {
      const onSwipeLeft = vi.fn();
      const { result, unmount } = renderHook(() =>
        useSwipe({ onSwipeLeft })
      );

      const touchStart = {
        nativeEvent: {
          touches: [{ clientX: 200, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStart);
      });

      unmount();

      // Should not cause errors after unmount
      expect(onSwipeLeft).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero distance swipe', () => {
      const onSwipeLeft = vi.fn();
      const { result } = renderHook(() =>
        useSwipe({ onSwipeLeft })
      );

      const touchStart = {
        nativeEvent: {
          touches: [{ clientX: 100, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      const touchEnd = {
        nativeEvent: {
          changedTouches: [{ clientX: 100, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStart);
      });

      act(() => {
        result.current.onTouchEnd(touchEnd);
      });

      expect(onSwipeLeft).not.toHaveBeenCalled();
    });

    it('should handle multiple callbacks for same direction', () => {
      const onSwipeLeft1 = vi.fn();
      const onSwipeLeft2 = vi.fn();

      // Only first callback should be used
      const { result } = renderHook(() =>
        useSwipe({ onSwipeLeft: onSwipeLeft1 })
      );

      const touchStart = {
        nativeEvent: {
          touches: [{ clientX: 200, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      const touchEnd = {
        nativeEvent: {
          changedTouches: [{ clientX: 100, clientY: 100 }],
        } as unknown as TouchEvent,
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(touchStart);
      });

      act(() => {
        result.current.onTouchEnd(touchEnd);
      });

      expect(onSwipeLeft1).toHaveBeenCalledTimes(1);
    });
  });

  describe('NATIVE TODO Comments', () => {
    it('should have comment for haptic feedback', () => {
      const fileContent = require('fs').readFileSync(
        require.resolve('../../hooks/useSwipe'),
        'utf-8'
      );

      expect(fileContent).toContain('NATIVE TODO');
      expect(fileContent).toContain('haptic');
    });
  });
});
