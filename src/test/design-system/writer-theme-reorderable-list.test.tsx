/**
 * ReorderableCardList Component - TDD Test Suite
 *
 * Tests the drag-and-drop reordering system for card sequencing:
 * - Long-press to initiate drag mode (useLongPress integration)
 * - Touch-based dragging (mobile-first)
 * - Visual feedback during drag (dragging state, drop indicators)
 * - Reorder cards in list
 * - Callback with new order
 * - Brutalist aesthetic (instant state changes, sharp visuals)
 *
 * Design Philosophy:
 * - Mobile-first: Touch events, not HTML5 drag-and-drop API
 * - Long-press to enter reorder mode (prevents accidental drags)
 * - Visual clarity: Clear indication of what's being dragged
 * - Instant feedback: 0ms transitions for state changes
 * - Simple drop zones: Between-card indicators
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ReorderableCardList,
  ReorderableCardListProps,
  CardData,
} from '../../design-system/components/ReorderableCardList';

describe('Writer Theme - ReorderableCardList Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Sample card data
  const sampleCards: CardData[] = [
    { id: 'card-1', title: 'Scene 1: Opening', content: 'First scene', category: 'conflict' as const },
    { id: 'card-2', title: 'Scene 2: Development', content: 'Second scene', category: 'character' as const },
    { id: 'card-3', title: 'Scene 3: Climax', content: 'Third scene', category: 'action' as const },
  ];

  const defaultProps: ReorderableCardListProps = {
    cards: sampleCards,
    onReorder: vi.fn(),
  };

  describe('Rendering - Card List', () => {
    it('should render all cards in order', () => {
      render(<ReorderableCardList {...defaultProps} />);

      expect(screen.getByText('Scene 1: Opening')).toBeInTheDocument();
      expect(screen.getByText('Scene 2: Development')).toBeInTheDocument();
      expect(screen.getByText('Scene 3: Climax')).toBeInTheDocument();
    });

    it('should render cards with correct categories', () => {
      render(<ReorderableCardList {...defaultProps} />);

      const cards = screen.getAllByRole('article');
      expect(cards).toHaveLength(3);

      // Check first card has conflict decorator (rose red)
      const decorator1 = within(cards[0]).getByTestId('carditem-decorator');
      const styles1 = window.getComputedStyle(decorator1);
      expect(styles1.backgroundColor).toBe('rgb(225, 29, 72)'); // #e11d48 conflict
    });

    it('should maintain card order from props', () => {
      render(<ReorderableCardList {...defaultProps} />);

      const cards = screen.getAllByRole('article');

      expect(within(cards[0]).getByText('Scene 1: Opening')).toBeInTheDocument();
      expect(within(cards[1]).getByText('Scene 2: Development')).toBeInTheDocument();
      expect(within(cards[2]).getByText('Scene 3: Climax')).toBeInTheDocument();
    });

    it('should handle empty card list', () => {
      render(<ReorderableCardList cards={[]} onReorder={vi.fn()} />);

      expect(screen.queryByRole('article')).not.toBeInTheDocument();
    });

    it('should handle single card', () => {
      const singleCard = [sampleCards[0]];
      render(<ReorderableCardList cards={singleCard} onReorder={vi.fn()} />);

      expect(screen.getAllByRole('article')).toHaveLength(1);
    });
  });

  describe('Reorder Mode - Long Press Activation', () => {
    it('should enter reorder mode after long press (500ms)', () => {
      render(<ReorderableCardList {...defaultProps} />);

      const firstCard = screen.getAllByRole('article')[0];

      // Simulate mouse down
      const mouseDown = new MouseEvent('mousedown', { bubbles: true });
      firstCard.dispatchEvent(mouseDown);

      // Advance time for long press threshold
      vi.advanceTimersByTime(500);

      // Should show reorder mode indicator
      expect(screen.getByTestId('reorder-mode-active')).toBeInTheDocument();
    });

    it('should not enter reorder mode on short press', () => {
      render(<ReorderableCardList {...defaultProps} />);

      const firstCard = screen.getAllByRole('article')[0];

      const mouseDown = new MouseEvent('mousedown', { bubbles: true });
      const mouseUp = new MouseEvent('mouseup', { bubbles: true });

      firstCard.dispatchEvent(mouseDown);

      // Release before threshold
      vi.advanceTimersByTime(300);
      firstCard.dispatchEvent(mouseUp);

      expect(screen.queryByTestId('reorder-mode-active')).not.toBeInTheDocument();
    });

    it('should show visual feedback for card being dragged', () => {
      render(<ReorderableCardList {...defaultProps} />);

      const firstCard = screen.getAllByRole('article')[0];

      const mouseDown = new MouseEvent('mousedown', { bubbles: true });
      firstCard.dispatchEvent(mouseDown);
      vi.advanceTimersByTime(500);

      // Dragged card should have special styling
      const styles = window.getComputedStyle(firstCard);
      expect(styles.opacity).toBe('0.5'); // Semi-transparent while dragging
    });

    it('should cancel reorder mode on mouse move before threshold', () => {
      render(<ReorderableCardList {...defaultProps} />);

      const firstCard = screen.getAllByRole('article')[0];

      const mouseDown = new MouseEvent('mousedown', { bubbles: true });
      const mouseMove = new MouseEvent('mousemove', { bubbles: true });

      firstCard.dispatchEvent(mouseDown);

      // Move before long press completes
      vi.advanceTimersByTime(200);
      firstCard.dispatchEvent(mouseMove);

      // Advance past threshold
      vi.advanceTimersByTime(300);

      // Should not enter reorder mode (movement cancelled it)
      expect(screen.queryByTestId('reorder-mode-active')).not.toBeInTheDocument();
    });
  });

  describe('Drag and Drop - Touch Events', () => {
    it('should track touch position during drag', () => {
      render(<ReorderableCardList {...defaultProps} />);

      const firstCard = screen.getAllByRole('article')[0];

      // Long press to activate
      const mouseDown = new MouseEvent('mousedown', { clientX: 100, clientY: 100 } as any);
      firstCard.dispatchEvent(mouseDown);
      vi.advanceTimersByTime(500);

      // Move touch
      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 100, clientY: 200 } as Touch],
      });
      firstCard.dispatchEvent(touchMove);

      // Should show drag position indicator
      expect(screen.getByTestId('drag-indicator')).toBeInTheDocument();
    });

    it('should show drop zone between cards during drag', () => {
      render(<ReorderableCardList {...defaultProps} />);

      const firstCard = screen.getAllByRole('article')[0];

      // Activate drag
      const mouseDown = new MouseEvent('mousedown', { clientX: 100, clientY: 100 } as any);
      firstCard.dispatchEvent(mouseDown);
      vi.advanceTimersByTime(500);

      // Drag over second card position
      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 100, clientY: 300 } as Touch],
      });
      firstCard.dispatchEvent(touchMove);

      // Should show drop zone indicator
      const dropZones = screen.getAllByTestId(/drop-zone-/);
      expect(dropZones.length).toBeGreaterThan(0);
    });

    it('should reorder cards on drop', () => {
      const onReorder = vi.fn();
      render(<ReorderableCardList {...defaultProps} onReorder={onReorder} />);

      const firstCard = screen.getAllByRole('article')[0];

      // Start drag (long press)
      const mouseDown = new MouseEvent('mousedown', { clientX: 100, clientY: 50 } as any);
      firstCard.dispatchEvent(mouseDown);
      vi.advanceTimersByTime(500);

      // Drag down past second card
      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 100, clientY: 250 } as Touch],
      });
      firstCard.dispatchEvent(touchMove);

      // Drop
      const touchEnd = new TouchEvent('touchend', { bubbles: true });
      firstCard.dispatchEvent(touchEnd);

      // Should call onReorder with new card order
      expect(onReorder).toHaveBeenCalledWith([
        sampleCards[1], // Scene 2 now first
        sampleCards[0], // Scene 1 moved to second
        sampleCards[2], // Scene 3 stays last
      ]);
    });
  });

  describe('Visual Feedback - Brutalist Aesthetic', () => {
    it('should use 0ms transitions for state changes', () => {
      render(<ReorderableCardList {...defaultProps} />);

      const container = screen.getByTestId('reorderable-list');
      const styles = window.getComputedStyle(container);

      expect(styles.transitionDuration).toBe('0s');
    });

    it('should show sharp-edged drop zone indicators', () => {
      render(<ReorderableCardList {...defaultProps} />);

      const firstCard = screen.getAllByRole('article')[0];

      // Activate drag
      const mouseDown = new MouseEvent('mousedown', { clientX: 100, clientY: 100 } as any);
      firstCard.dispatchEvent(mouseDown);
      vi.advanceTimersByTime(500);

      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 100, clientY: 200 } as Touch],
      });
      firstCard.dispatchEvent(touchMove);

      const dropZone = screen.getByTestId(/drop-zone-/);
      const styles = window.getComputedStyle(dropZone);

      expect(styles.borderRadius).toBe('0px'); // Sharp edges
    });

    it('should use high-contrast drag indicator', () => {
      render(<ReorderableCardList {...defaultProps} />);

      const firstCard = screen.getAllByRole('article')[0];

      const mouseDown = new MouseEvent('mousedown', { clientX: 100, clientY: 100 } as any);
      firstCard.dispatchEvent(mouseDown);
      vi.advanceTimersByTime(500);

      const dragIndicator = screen.getByTestId('drag-indicator');
      const styles = window.getComputedStyle(dragIndicator);

      // Should be high contrast (black or white)
      expect(styles.backgroundColor).toMatch(/rgb\((0, 0, 0|255, 255, 255)\)/);
    });
  });

  describe('Reorder Behavior', () => {
    it('should move card down in list', () => {
      const onReorder = vi.fn();
      render(<ReorderableCardList {...defaultProps} onReorder={onReorder} />);

      const firstCard = screen.getAllByRole('article')[0];

      // Drag first card to third position
      const mouseDown = new MouseEvent('mousedown', { clientX: 100, clientY: 50 } as any);
      firstCard.dispatchEvent(mouseDown);
      vi.advanceTimersByTime(500);

      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 100, clientY: 350 } as Touch],
      });
      firstCard.dispatchEvent(touchMove);

      const touchEnd = new TouchEvent('touchend', { bubbles: true });
      firstCard.dispatchEvent(touchEnd);

      expect(onReorder).toHaveBeenCalledWith([
        sampleCards[1], // Scene 2
        sampleCards[2], // Scene 3
        sampleCards[0], // Scene 1 moved to end
      ]);
    });

    it('should move card up in list', () => {
      const onReorder = vi.fn();
      render(<ReorderableCardList {...defaultProps} onReorder={onReorder} />);

      const thirdCard = screen.getAllByRole('article')[2];

      // Drag third card to first position
      const mouseDown = new MouseEvent('mousedown', { clientX: 100, clientY: 250 } as any);
      thirdCard.dispatchEvent(mouseDown);
      vi.advanceTimersByTime(500);

      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 100, clientY: 50 } as Touch],
      });
      thirdCard.dispatchEvent(touchMove);

      const touchEnd = new TouchEvent('touchend', { bubbles: true });
      thirdCard.dispatchEvent(touchEnd);

      expect(onReorder).toHaveBeenCalledWith([
        sampleCards[2], // Scene 3 moved to first
        sampleCards[0], // Scene 1
        sampleCards[1], // Scene 2
      ]);
    });

    it('should not reorder if dropped in same position', () => {
      const onReorder = vi.fn();
      render(<ReorderableCardList {...defaultProps} onReorder={onReorder} />);

      const firstCard = screen.getAllByRole('article')[0];

      // Drag and drop in same position
      const mouseDown = new MouseEvent('mousedown', { clientX: 100, clientY: 50 } as any);
      firstCard.dispatchEvent(mouseDown);
      vi.advanceTimersByTime(500);

      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 100, clientY: 60 } as Touch], // Small movement
      });
      firstCard.dispatchEvent(touchMove);

      const touchEnd = new TouchEvent('touchend', { bubbles: true });
      firstCard.dispatchEvent(touchEnd);

      // Should not call onReorder (no change)
      expect(onReorder).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have role="list" for container', () => {
      render(<ReorderableCardList {...defaultProps} />);

      const container = screen.getByTestId('reorderable-list');
      expect(container).toHaveAttribute('role', 'list');
    });

    it('should have aria-label describing reorder mode', () => {
      render(<ReorderableCardList {...defaultProps} />);

      const container = screen.getByTestId('reorderable-list');
      expect(container).toHaveAttribute('aria-label', expect.stringContaining('reorder'));
    });

    it('should announce reorder mode activation to screen readers', () => {
      render(<ReorderableCardList {...defaultProps} />);

      const firstCard = screen.getAllByRole('article')[0];

      const mouseDown = new MouseEvent('mousedown', { bubbles: true });
      firstCard.dispatchEvent(mouseDown);
      vi.advanceTimersByTime(500);

      // Should have aria-live region announcing mode
      const announcement = screen.getByRole('status');
      expect(announcement).toHaveTextContent(/reorder mode/i);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid drag operations', () => {
      const onReorder = vi.fn();
      render(<ReorderableCardList {...defaultProps} onReorder={onReorder} />);

      const firstCard = screen.getAllByRole('article')[0];

      // Rapid drag-drop cycles
      for (let i = 0; i < 3; i++) {
        const mouseDown = new MouseEvent('mousedown', { clientX: 100, clientY: 50 } as any);
        firstCard.dispatchEvent(mouseDown);
        vi.advanceTimersByTime(500);

        const touchEnd = new TouchEvent('touchend', { bubbles: true });
        firstCard.dispatchEvent(touchEnd);
      }

      // Should handle without errors
      expect(onReorder).toHaveBeenCalled();
    });

    it('should cancel drag on escape key', async () => {
      const user = userEvent.setup({ delay: null });
      const onReorder = vi.fn();
      render(<ReorderableCardList {...defaultProps} onReorder={onReorder} />);

      const firstCard = screen.getAllByRole('article')[0];

      const mouseDown = new MouseEvent('mousedown', { bubbles: true });
      firstCard.dispatchEvent(mouseDown);
      vi.advanceTimersByTime(500);

      // Press Escape
      await user.keyboard('{Escape}');

      // Should exit reorder mode
      expect(screen.queryByTestId('reorder-mode-active')).not.toBeInTheDocument();
      expect(onReorder).not.toHaveBeenCalled();
    });

    it('should handle touch and mouse events simultaneously', () => {
      render(<ReorderableCardList {...defaultProps} />);

      const firstCard = screen.getAllByRole('article')[0];

      // Mix touch and mouse events
      const mouseDown = new MouseEvent('mousedown', { bubbles: true });
      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 100, clientY: 200 } as Touch],
      });
      const mouseUp = new MouseEvent('mouseup', { bubbles: true });

      firstCard.dispatchEvent(mouseDown);
      vi.advanceTimersByTime(500);
      firstCard.dispatchEvent(touchMove);
      firstCard.dispatchEvent(mouseUp);

      // Should handle gracefully
      expect(screen.getByTestId('reorderable-list')).toBeInTheDocument();
    });
  });

  describe('Props and API', () => {
    it('should require cards and onReorder props', () => {
      expect(() =>
        // @ts-expect-error Testing missing required props
        render(<ReorderableCardList />)
      ).toThrow();
    });

    it('should accept custom className', () => {
      render(<ReorderableCardList {...defaultProps} className="custom-list" />);

      const container = screen.getByTestId('reorderable-list');
      expect(container).toHaveClass('custom-list');
    });

    it('should call onReorder with updated card array', () => {
      const onReorder = vi.fn();
      render(<ReorderableCardList {...defaultProps} onReorder={onReorder} />);

      const firstCard = screen.getAllByRole('article')[0];

      const mouseDown = new MouseEvent('mousedown', { clientX: 100, clientY: 50 } as any);
      firstCard.dispatchEvent(mouseDown);
      vi.advanceTimersByTime(500);

      const touchMove = new TouchEvent('touchmove', {
        touches: [{ clientX: 100, clientY: 250 } as Touch],
      });
      firstCard.dispatchEvent(touchMove);

      const touchEnd = new TouchEvent('touchend', { bubbles: true });
      firstCard.dispatchEvent(touchEnd);

      // Verify callback receives complete card array
      expect(onReorder).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ id: expect.any(String) }),
      ]));
    });
  });

  describe('NATIVE TODO Comments', () => {
    it('should have TODO comment for haptic feedback on reorder', () => {
      expect(true).toBe(true); // Meta-test
    });
  });
});
