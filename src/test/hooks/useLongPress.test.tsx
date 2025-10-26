/**
 * useLongPress Hook TDD Specs
 *
 * Tests long press gesture detection for mobile-native interactions.
 *
 * Requirements:
 * - Detects when user holds touch/click for duration (default 500ms)
 * - Works with both touch and mouse events
 * - Configurable threshold duration
 * - Prevents context menu on long press
 * - Cancels on move (prevents accidental triggers during scroll)
 * - Provides start/cancel callbacks
 * - Zero dependencies
 *
 * Use Cases:
 * - Context menus on long press
 * - Alternate actions (e.g., delete vs edit)
 * - Mobile-native interactions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLongPress } from '../../hooks/useLongPress';
import type { UseLongPressOptions } from '../../hooks/useLongPress';

describe('useLongPress Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Basic Functionality', () => {
    it('should trigger onLongPress after threshold duration', () => {
      const onLongPress = vi.fn();
      const { result } = renderHook(() =>
        useLongPress({ onLongPress, threshold: 500 })
      );

      const mockEvent = {
        nativeEvent: new MouseEvent('mousedown'),
      } as React.MouseEvent;

      act(() => {
        result.current.onMouseDown(mockEvent);
      });

      // Should not trigger before threshold
      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(onLongPress).not.toHaveBeenCalled();

      // Should trigger at threshold
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(onLongPress).toHaveBeenCalledTimes(1);
    });

    it('should not trigger if released before threshold', () => {
      const onLongPress = vi.fn();
      const { result } = renderHook(() =>
        useLongPress({ onLongPress, threshold: 500 })
      );

      const mockDownEvent = {
        nativeEvent: new MouseEvent('mousedown'),
      } as React.MouseEvent;

      const mockUpEvent = {
        nativeEvent: new MouseEvent('mouseup'),
      } as React.MouseEvent;

      act(() => {
        result.current.onMouseDown(mockDownEvent);
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      act(() => {
        result.current.onMouseUp(mockUpEvent);
      });

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(onLongPress).not.toHaveBeenCalled();
    });

    it('should use default threshold of 500ms when not specified', () => {
      const onLongPress = vi.fn();
      const { result } = renderHook(() => useLongPress({ onLongPress }));

      const mockEvent = {
        nativeEvent: new MouseEvent('mousedown'),
      } as React.MouseEvent;

      act(() => {
        result.current.onMouseDown(mockEvent);
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(onLongPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Custom Threshold', () => {
    it('should support custom threshold duration', () => {
      const onLongPress = vi.fn();
      const { result } = renderHook(() =>
        useLongPress({ onLongPress, threshold: 1000 })
      );

      const mockEvent = {
        nativeEvent: new MouseEvent('mousedown'),
      } as React.MouseEvent;

      act(() => {
        result.current.onMouseDown(mockEvent);
      });

      // Should not trigger at 500ms
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(onLongPress).not.toHaveBeenCalled();

      // Should trigger at 1000ms
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(onLongPress).toHaveBeenCalledTimes(1);
    });

    it('should support short threshold (300ms)', () => {
      const onLongPress = vi.fn();
      const { result } = renderHook(() =>
        useLongPress({ onLongPress, threshold: 300 })
      );

      const mockEvent = {
        nativeEvent: new MouseEvent('mousedown'),
      } as React.MouseEvent;

      act(() => {
        result.current.onMouseDown(mockEvent);
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(onLongPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Touch Events', () => {
    it('should trigger onLongPress with touch events', () => {
      const onLongPress = vi.fn();
      const { result } = renderHook(() =>
        useLongPress({ onLongPress, threshold: 500 })
      );

      const mockEvent = {
        nativeEvent: new TouchEvent('touchstart'),
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(mockEvent);
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(onLongPress).toHaveBeenCalledTimes(1);
    });

    it('should cancel on touch end', () => {
      const onLongPress = vi.fn();
      const { result } = renderHook(() =>
        useLongPress({ onLongPress, threshold: 500 })
      );

      const mockStartEvent = {
        nativeEvent: new TouchEvent('touchstart'),
      } as React.TouchEvent;

      const mockEndEvent = {
        nativeEvent: new TouchEvent('touchend'),
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(mockStartEvent);
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      act(() => {
        result.current.onTouchEnd(mockEndEvent);
      });

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(onLongPress).not.toHaveBeenCalled();
    });

    it('should cancel on touch cancel', () => {
      const onLongPress = vi.fn();
      const { result } = renderHook(() =>
        useLongPress({ onLongPress, threshold: 500 })
      );

      const mockStartEvent = {
        nativeEvent: new TouchEvent('touchstart'),
      } as React.TouchEvent;

      const mockCancelEvent = {
        nativeEvent: new TouchEvent('touchcancel'),
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(mockStartEvent);
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      act(() => {
        result.current.onTouchCancel(mockCancelEvent);
      });

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(onLongPress).not.toHaveBeenCalled();
    });
  });

  describe('Cancel on Move', () => {
    it('should cancel on mouse move by default', () => {
      const onLongPress = vi.fn();
      const { result } = renderHook(() =>
        useLongPress({ onLongPress, threshold: 500 })
      );

      const mockDownEvent = {
        nativeEvent: new MouseEvent('mousedown'),
      } as React.MouseEvent;

      const mockMoveEvent = {
        nativeEvent: new MouseEvent('mousemove'),
      } as React.MouseEvent;

      act(() => {
        result.current.onMouseDown(mockDownEvent);
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      act(() => {
        result.current.onMouseMove(mockMoveEvent);
      });

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(onLongPress).not.toHaveBeenCalled();
    });

    it('should cancel on touch move by default', () => {
      const onLongPress = vi.fn();
      const { result } = renderHook(() =>
        useLongPress({ onLongPress, threshold: 500 })
      );

      const mockStartEvent = {
        nativeEvent: new TouchEvent('touchstart'),
      } as React.TouchEvent;

      const mockMoveEvent = {
        nativeEvent: new TouchEvent('touchmove'),
      } as React.TouchEvent;

      act(() => {
        result.current.onTouchStart(mockStartEvent);
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      act(() => {
        result.current.onTouchMove(mockMoveEvent);
      });

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(onLongPress).not.toHaveBeenCalled();
    });

    it('should not cancel on move when cancelOnMove is false', () => {
      const onLongPress = vi.fn();
      const { result } = renderHook(() =>
        useLongPress({ onLongPress, threshold: 500, cancelOnMove: false })
      );

      const mockDownEvent = {
        nativeEvent: new MouseEvent('mousedown'),
      } as React.MouseEvent;

      const mockMoveEvent = {
        nativeEvent: new MouseEvent('mousemove'),
      } as React.MouseEvent;

      act(() => {
        result.current.onMouseDown(mockDownEvent);
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      act(() => {
        result.current.onMouseMove(mockMoveEvent);
      });

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(onLongPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mouse Leave', () => {
    it('should cancel on mouse leave', () => {
      const onLongPress = vi.fn();
      const { result } = renderHook(() =>
        useLongPress({ onLongPress, threshold: 500 })
      );

      const mockDownEvent = {
        nativeEvent: new MouseEvent('mousedown'),
      } as React.MouseEvent;

      const mockLeaveEvent = {
        nativeEvent: new MouseEvent('mouseleave'),
      } as React.MouseEvent;

      act(() => {
        result.current.onMouseDown(mockDownEvent);
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      act(() => {
        result.current.onMouseLeave(mockLeaveEvent);
      });

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(onLongPress).not.toHaveBeenCalled();
    });
  });

  describe('Callback Options', () => {
    it('should call onStart when press starts', () => {
      const onLongPress = vi.fn();
      const onStart = vi.fn();
      const { result } = renderHook(() =>
        useLongPress({ onLongPress, onStart, threshold: 500 })
      );

      const mockEvent = {
        nativeEvent: new MouseEvent('mousedown'),
      } as React.MouseEvent;

      act(() => {
        result.current.onMouseDown(mockEvent);
      });

      expect(onStart).toHaveBeenCalledTimes(1);
      expect(onLongPress).not.toHaveBeenCalled();
    });

    it('should call onCancel when press is cancelled', () => {
      const onLongPress = vi.fn();
      const onCancel = vi.fn();
      const { result } = renderHook(() =>
        useLongPress({ onLongPress, onCancel, threshold: 500 })
      );

      const mockDownEvent = {
        nativeEvent: new MouseEvent('mousedown'),
      } as React.MouseEvent;

      const mockUpEvent = {
        nativeEvent: new MouseEvent('mouseup'),
      } as React.MouseEvent;

      act(() => {
        result.current.onMouseDown(mockDownEvent);
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      act(() => {
        result.current.onMouseUp(mockUpEvent);
      });

      expect(onCancel).toHaveBeenCalledTimes(1);
      expect(onLongPress).not.toHaveBeenCalled();
    });

    it('should not call onCancel if long press was triggered', () => {
      const onLongPress = vi.fn();
      const onCancel = vi.fn();
      const { result } = renderHook(() =>
        useLongPress({ onLongPress, onCancel, threshold: 500 })
      );

      const mockDownEvent = {
        nativeEvent: new MouseEvent('mousedown'),
      } as React.MouseEvent;

      const mockUpEvent = {
        nativeEvent: new MouseEvent('mouseup'),
      } as React.MouseEvent;

      act(() => {
        result.current.onMouseDown(mockDownEvent);
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(onLongPress).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.onMouseUp(mockUpEvent);
      });

      expect(onCancel).not.toHaveBeenCalled();
    });
  });

  describe('Context Menu Prevention', () => {
    it('should prevent context menu by default', () => {
      const onLongPress = vi.fn();
      const { result } = renderHook(() => useLongPress({ onLongPress }));

      const mockEvent = {
        preventDefault: vi.fn(),
        nativeEvent: new MouseEvent('contextmenu'),
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.onContextMenu(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
    });

    it('should not prevent context menu when preventContextMenu is false', () => {
      const onLongPress = vi.fn();
      const { result } = renderHook(() =>
        useLongPress({ onLongPress, preventContextMenu: false })
      );

      const mockEvent = {
        preventDefault: vi.fn(),
        nativeEvent: new MouseEvent('contextmenu'),
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.onContextMenu(mockEvent);
      });

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('Handler Return Type', () => {
    it('should return all required handlers', () => {
      const onLongPress = vi.fn();
      const { result } = renderHook(() => useLongPress({ onLongPress }));

      expect(result.current).toHaveProperty('onMouseDown');
      expect(result.current).toHaveProperty('onMouseUp');
      expect(result.current).toHaveProperty('onMouseMove');
      expect(result.current).toHaveProperty('onMouseLeave');
      expect(result.current).toHaveProperty('onTouchStart');
      expect(result.current).toHaveProperty('onTouchEnd');
      expect(result.current).toHaveProperty('onTouchMove');
      expect(result.current).toHaveProperty('onTouchCancel');
      expect(result.current).toHaveProperty('onContextMenu');
    });

    it('should return stable handler references', () => {
      const onLongPress = vi.fn();
      const { result, rerender } = renderHook(() =>
        useLongPress({ onLongPress })
      );

      const firstRender = result.current;

      rerender();

      const secondRender = result.current;

      expect(firstRender.onMouseDown).toBe(secondRender.onMouseDown);
      expect(firstRender.onTouchStart).toBe(secondRender.onTouchStart);
    });
  });

  describe('Memory Leaks Prevention', () => {
    it('should cleanup timer on unmount', () => {
      const onLongPress = vi.fn();
      const { result, unmount } = renderHook(() =>
        useLongPress({ onLongPress, threshold: 500 })
      );

      const mockEvent = {
        nativeEvent: new MouseEvent('mousedown'),
      } as React.MouseEvent;

      act(() => {
        result.current.onMouseDown(mockEvent);
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      unmount();

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(onLongPress).not.toHaveBeenCalled();
    });
  });

  describe('Multiple Triggers Prevention', () => {
    it('should only trigger once per long press', () => {
      const onLongPress = vi.fn();
      const { result } = renderHook(() =>
        useLongPress({ onLongPress, threshold: 500 })
      );

      const mockDownEvent = {
        nativeEvent: new MouseEvent('mousedown'),
      } as React.MouseEvent;

      const mockUpEvent = {
        nativeEvent: new MouseEvent('mouseup'),
      } as React.MouseEvent;

      act(() => {
        result.current.onMouseDown(mockDownEvent);
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(onLongPress).toHaveBeenCalledTimes(1);

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(onLongPress).toHaveBeenCalledTimes(1);

      act(() => {
        result.current.onMouseUp(mockUpEvent);
      });

      // Start new press
      act(() => {
        result.current.onMouseDown(mockDownEvent);
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(onLongPress).toHaveBeenCalledTimes(2);
    });
  });

  describe('NATIVE TODO Comments', () => {
    it('should have comment for haptic feedback', () => {
      const fileContent = require('fs').readFileSync(
        require.resolve('../../hooks/useLongPress'),
        'utf-8'
      );

      expect(fileContent).toContain('NATIVE TODO');
      expect(fileContent).toContain('haptic');
    });
  });
});
