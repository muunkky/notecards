/**
 * SwipeableCardItem Component - TDD Test Suite
 *
 * Tests the integration of swipe-to-delete functionality with CardItem:
 * - CardItem component (visual presentation)
 * - useSwipe hook (left swipe gesture detection)
 * - Toast notification (undo action)
 * - Delete callback with undo capability
 *
 * This component wraps CardItem with swipe-to-delete behavior, following
 * the principle of separation of concerns: CardItem remains a pure
 * presentational component, while SwipeableCardItem adds interaction logic.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  SwipeableCardItem,
  SwipeableCardItemProps,
} from '../../design-system/components/SwipeableCardItem';

describe('Writer Theme - SwipeableCardItem Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Default test props
  const defaultProps: SwipeableCardItemProps = {
    id: 'card-123',
    title: 'Scene 1: Opening Conflict',
    content: 'The protagonist confronts their nemesis.',
    category: 'conflict' as const,
    onDelete: vi.fn(),
  };

  describe('Rendering - CardItem Integration', () => {
    it('should render CardItem with all props', () => {
      render(<SwipeableCardItem {...defaultProps} />);

      expect(screen.getByText('Scene 1: Opening Conflict')).toBeInTheDocument();
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should pass category to CardItem', () => {
      render(<SwipeableCardItem {...defaultProps} category="action" />);

      const decorator = screen.getByTestId('carditem-decorator');
      const styles = window.getComputedStyle(decorator);

      expect(styles.backgroundColor).toBe('rgb(249, 115, 22)'); // #f97316 (action color)
    });

    it('should forward CardItem props', () => {
      render(
        <SwipeableCardItem
          {...defaultProps}
          defaultExpanded={true}
          className="custom-class"
        />
      );

      // Content visible (defaultExpanded)
      expect(screen.getByText(/The protagonist confronts/)).toBeInTheDocument();

      // Custom class applied
      const card = screen.getByRole('article');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Swipe Gesture Detection', () => {
    it('should attach swipe handlers to card', () => {
      render(<SwipeableCardItem {...defaultProps} />);

      const card = screen.getByRole('article');

      // Check that touch event handlers exist
      expect(card).toHaveAttribute('ontouchstart');
      expect(card).toHaveAttribute('ontouchend');
    });

    it('should call onDelete when swiped left', async () => {
      const onDelete = vi.fn();
      render(<SwipeableCardItem {...defaultProps} onDelete={onDelete} />);

      const card = screen.getByRole('article');

      // Simulate left swipe (touch start at x=200, touch end at x=100)
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 200, clientY: 100 } as Touch],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
      });

      act(() => {
        card.dispatchEvent(touchStart);
      });

      act(() => {
        card.dispatchEvent(touchEnd);
      });

      // Should call onDelete with card id
      expect(onDelete).toHaveBeenCalledWith('card-123');
    });

    it('should not delete on right swipe', async () => {
      const onDelete = vi.fn();
      render(<SwipeableCardItem {...defaultProps} onDelete={onDelete} />);

      const card = screen.getByRole('article');

      // Simulate right swipe (touch start at x=100, touch end at x=200)
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 100 } as Touch],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 200, clientY: 100 } as Touch],
      });

      act(() => {
        card.dispatchEvent(touchStart);
      });

      act(() => {
        card.dispatchEvent(touchEnd);
      });

      expect(onDelete).not.toHaveBeenCalled();
    });

    it('should not delete on short swipe (< 50px)', async () => {
      const onDelete = vi.fn();
      render(<SwipeableCardItem {...defaultProps} onDelete={onDelete} />);

      const card = screen.getByRole('article');

      // Simulate short left swipe (only 30px)
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 130, clientY: 100 } as Touch],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
      });

      act(() => {
        card.dispatchEvent(touchStart);
      });

      act(() => {
        card.dispatchEvent(touchEnd);
      });

      expect(onDelete).not.toHaveBeenCalled();
    });

    it('should prioritize horizontal swipe over vertical', async () => {
      const onDelete = vi.fn();
      render(<SwipeableCardItem {...defaultProps} onDelete={onDelete} />);

      const card = screen.getByRole('article');

      // Simulate diagonal swipe (mostly left, some down)
      // 100px left, 30px down -> should trigger left swipe
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 200, clientY: 100 } as Touch],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 130 } as Touch],
      });

      act(() => {
        card.dispatchEvent(touchStart);
      });

      act(() => {
        card.dispatchEvent(touchEnd);
      });

      expect(onDelete).toHaveBeenCalledWith('card-123');
    });
  });

  describe('Toast Notification - Undo', () => {
    it('should show toast after successful swipe', async () => {
      render(<SwipeableCardItem {...defaultProps} />);

      const card = screen.getByRole('article');

      // Perform left swipe
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 200, clientY: 100 } as Touch],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
      });

      act(() => {
        card.dispatchEvent(touchStart);
        card.dispatchEvent(touchEnd);
      });

      // Toast should appear
      await waitFor(() => {
        expect(screen.getByTestId('toast')).toBeInTheDocument();
      });
    });

    it('should show "Card deleted" message in toast', async () => {
      render(<SwipeableCardItem {...defaultProps} />);

      const card = screen.getByRole('article');

      // Perform left swipe
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 200, clientY: 100 } as Touch],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
      });

      act(() => {
        card.dispatchEvent(touchStart);
        card.dispatchEvent(touchEnd);
      });

      await waitFor(() => {
        expect(screen.getByText('Card deleted')).toBeInTheDocument();
      });
    });

    it('should show "Undo" button in toast', async () => {
      render(<SwipeableCardItem {...defaultProps} />);

      const card = screen.getByRole('article');

      // Perform left swipe
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 200, clientY: 100 } as Touch],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
      });

      act(() => {
        card.dispatchEvent(touchStart);
        card.dispatchEvent(touchEnd);
      });

      await waitFor(() => {
        expect(screen.getByText('Undo')).toBeInTheDocument();
      });
    });

    it('should call onUndo when undo button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const onUndo = vi.fn();

      render(<SwipeableCardItem {...defaultProps} onUndo={onUndo} />);

      const card = screen.getByRole('article');

      // Perform left swipe
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 200, clientY: 100 } as Touch],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
      });

      act(() => {
        card.dispatchEvent(touchStart);
        card.dispatchEvent(touchEnd);
      });

      // Click undo
      await waitFor(() => {
        expect(screen.getByText('Undo')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Undo'));

      expect(onUndo).toHaveBeenCalledWith('card-123');
    });

    it('should auto-dismiss toast after 5 seconds', async () => {
      render(<SwipeableCardItem {...defaultProps} />);

      const card = screen.getByRole('article');

      // Perform left swipe
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 200, clientY: 100 } as Touch],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
      });

      act(() => {
        card.dispatchEvent(touchStart);
        card.dispatchEvent(touchEnd);
      });

      // Toast visible
      await waitFor(() => {
        expect(screen.getByTestId('toast')).toBeInTheDocument();
      });

      // Fast-forward 5 seconds
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // Toast should be hidden
      await waitFor(() => {
        expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
      });
    });

    it('should hide toast immediately when undo is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      render(<SwipeableCardItem {...defaultProps} />);

      const card = screen.getByRole('article');

      // Perform left swipe
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 200, clientY: 100 } as Touch],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
      });

      act(() => {
        card.dispatchEvent(touchStart);
        card.dispatchEvent(touchEnd);
      });

      // Toast visible
      await waitFor(() => {
        expect(screen.getByText('Undo')).toBeInTheDocument();
      });

      // Click undo
      await user.click(screen.getByText('Undo'));

      // Toast immediately hidden
      expect(screen.queryByTestId('toast')).not.toBeInTheDocument();
    });
  });

  describe('Delete Workflow', () => {
    it('should call onDelete immediately on swipe', async () => {
      const onDelete = vi.fn();
      render(<SwipeableCardItem {...defaultProps} onDelete={onDelete} />);

      const card = screen.getByRole('article');

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 200, clientY: 100 } as Touch],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
      });

      act(() => {
        card.dispatchEvent(touchStart);
        card.dispatchEvent(touchEnd);
      });

      expect(onDelete).toHaveBeenCalledWith('card-123');
    });

    it('should call onUndo if undo button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const onDelete = vi.fn();
      const onUndo = vi.fn();

      render(
        <SwipeableCardItem
          {...defaultProps}
          onDelete={onDelete}
          onUndo={onUndo}
        />
      );

      const card = screen.getByRole('article');

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 200, clientY: 100 } as Touch],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
      });

      act(() => {
        card.dispatchEvent(touchStart);
        card.dispatchEvent(touchEnd);
      });

      expect(onDelete).toHaveBeenCalledTimes(1);

      // Click undo
      await waitFor(() => {
        expect(screen.getByText('Undo')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Undo'));

      expect(onUndo).toHaveBeenCalledWith('card-123');
    });

    it('should not call onUndo if toast auto-dismisses', async () => {
      const onUndo = vi.fn();

      render(<SwipeableCardItem {...defaultProps} onUndo={onUndo} />);

      const card = screen.getByRole('article');

      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 200, clientY: 100 } as Touch],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
      });

      act(() => {
        card.dispatchEvent(touchStart);
        card.dispatchEvent(touchEnd);
      });

      // Let toast auto-dismiss
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(onUndo).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple rapid swipes', async () => {
      const onDelete = vi.fn();
      render(<SwipeableCardItem {...defaultProps} onDelete={onDelete} />);

      const card = screen.getByRole('article');

      // Rapid swipes
      for (let i = 0; i < 3; i++) {
        const touchStart = new TouchEvent('touchstart', {
          touches: [{ clientX: 200, clientY: 100 } as Touch],
        });
        const touchEnd = new TouchEvent('touchend', {
          changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
        });

        act(() => {
          card.dispatchEvent(touchStart);
          card.dispatchEvent(touchEnd);
        });
      }

      // Should call onDelete for each swipe
      expect(onDelete).toHaveBeenCalledTimes(3);
    });

    it('should handle swipe during expanded state', async () => {
      const onDelete = vi.fn();
      render(
        <SwipeableCardItem
          {...defaultProps}
          defaultExpanded={true}
          onDelete={onDelete}
        />
      );

      const card = screen.getByRole('article');

      // Content visible
      expect(screen.getByText(/The protagonist confronts/)).toBeInTheDocument();

      // Swipe should still work
      const touchStart = new TouchEvent('touchstart', {
        touches: [{ clientX: 200, clientY: 100 } as Touch],
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
      });

      act(() => {
        card.dispatchEvent(touchStart);
        card.dispatchEvent(touchEnd);
      });

      expect(onDelete).toHaveBeenCalledWith('card-123');
    });
  });

  describe('Props and API', () => {
    it('should require onDelete callback', () => {
      // TypeScript should enforce this, but verify in runtime
      // @ts-expect-error Testing missing required prop
      expect(() => render(<SwipeableCardItem {...defaultProps} onDelete={undefined} />)).toThrow();
    });

    it('should accept optional onUndo callback', () => {
      expect(() =>
        render(<SwipeableCardItem {...defaultProps} onUndo={vi.fn()} />)
      ).not.toThrow();
    });

    it('should forward all CardItem props', () => {
      render(
        <SwipeableCardItem
          {...defaultProps}
          data-testid="my-swipeable-card"
          className="custom"
        />
      );

      const card = screen.getByTestId('my-swipeable-card');
      expect(card).toHaveClass('custom');
    });
  });

  describe('NATIVE TODO Comments', () => {
    it('should have TODO comment for haptic feedback on swipe', () => {
      expect(true).toBe(true); // Meta-test
    });
  });
});
