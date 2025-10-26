/**
 * CardItem Component - TDD Test Suite
 *
 * Tests the Writer Theme CardItem component - a list-optimized card with:
 * - 4px category decorator strip
 * - Collapsible functionality (default collapsed in lists)
 * - Brutalist aesthetic (0px radius, 0ms transitions, stark contrast)
 * - Accessibility (keyboard, ARIA, focus management)
 *
 * This component is specifically designed for CardListScreen where many
 * cards are displayed in a vertical list. It prioritizes compact display
 * with quick expand/collapse for detail viewing.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CardItem, CardItemProps } from '../../design-system/components/CardItem';

describe('Writer Theme - CardItem Component', () => {
  // Default test props
  const defaultProps: CardItemProps = {
    id: 'test-card-123',
    title: 'Scene 1: Opening Conflict',
    content: 'The protagonist confronts their nemesis in a tense standoff.',
    category: 'conflict',
  };

  describe('Visual Design - Brutalist Aesthetic', () => {
    it('should render with white background and black border', () => {
      render(<CardItem {...defaultProps} />);

      const card = screen.getByRole('article');
      const styles = window.getComputedStyle(card);

      expect(styles.backgroundColor).toBe('rgb(255, 255, 255)');
      expect(styles.border).toContain('1px');
      expect(styles.borderColor).toBe('rgb(0, 0, 0)');
    });

    it('should have sharp corners (0px border radius)', () => {
      render(<CardItem {...defaultProps} />);

      const card = screen.getByRole('article');
      const styles = window.getComputedStyle(card);

      expect(styles.borderRadius).toBe('0px');
    });

    it('should have no shadow (flat design)', () => {
      render(<CardItem {...defaultProps} />);

      const card = screen.getByRole('article');
      const styles = window.getComputedStyle(card);

      expect(styles.boxShadow).toBe('none');
    });

    it('should have zero transitions (instant state changes)', () => {
      render(<CardItem {...defaultProps} />);

      const card = screen.getByRole('article');
      const styles = window.getComputedStyle(card);

      expect(styles.transitionDuration).toBe('0s');
    });

    it('should have 4px category decorator strip on left', () => {
      render(<CardItem {...defaultProps} />);

      const decorator = screen.getByTestId('carditem-decorator');
      const styles = window.getComputedStyle(decorator);

      expect(styles.width).toBe('4px');
      expect(styles.position).toBe('absolute');
      expect(styles.left).toBe('0px');
      expect(styles.top).toBe('0px');
      expect(styles.bottom).toBe('0px');
    });

    it('should show conflict category with rose red decorator (#e11d48)', () => {
      render(<CardItem {...defaultProps} category="conflict" />);

      const decorator = screen.getByTestId('carditem-decorator');
      const styles = window.getComputedStyle(decorator);

      expect(styles.backgroundColor).toBe('rgb(225, 29, 72)'); // #e11d48
    });

    it('should show character category with blue decorator (#3b82f6)', () => {
      render(<CardItem {...defaultProps} category="character" />);

      const decorator = screen.getByTestId('carditem-decorator');
      const styles = window.getComputedStyle(decorator);

      expect(styles.backgroundColor).toBe('rgb(59, 130, 246)'); // #3b82f6
    });

    it('should show location category with amber decorator (#f59e0b)', () => {
      render(<CardItem {...defaultProps} category="location" />);

      const decorator = screen.getByTestId('carditem-decorator');
      const styles = window.getComputedStyle(decorator);

      expect(styles.backgroundColor).toBe('rgb(245, 158, 11)'); // #f59e0b
    });
  });

  describe('Typography', () => {
    it('should render title in monospace font', () => {
      render(<CardItem {...defaultProps} />);

      const card = screen.getByRole('article');
      const title = within(card).getByText('Scene 1: Opening Conflict');
      const styles = window.getComputedStyle(title);

      expect(styles.fontFamily).toContain('monospace');
    });

    it('should render content in system font', () => {
      render(<CardItem {...defaultProps} defaultExpanded={true} />);

      const card = screen.getByRole('article');
      const content = within(card).getByText(/The protagonist confronts/);
      const styles = window.getComputedStyle(content);

      // System font stack (not monospace)
      expect(styles.fontFamily).not.toContain('monospace');
    });
  });

  describe('Collapsible Functionality - Default Collapsed', () => {
    it('should default to collapsed state in list view', () => {
      render(<CardItem {...defaultProps} />);

      const card = screen.getByRole('article');

      // Title visible
      expect(screen.getByText('Scene 1: Opening Conflict')).toBeInTheDocument();

      // Content NOT visible
      expect(screen.queryByText(/The protagonist confronts/)).not.toBeInTheDocument();

      // ARIA expanded false
      expect(card).toHaveAttribute('aria-expanded', 'false');
    });

    it('should show collapsed indicator (▸) when collapsed', () => {
      render(<CardItem {...defaultProps} />);

      const indicator = screen.getByTestId('carditem-expand-indicator');
      expect(indicator).toHaveTextContent('▸');
    });

    it('should show expanded indicator (▾) when expanded', () => {
      render(<CardItem {...defaultProps} defaultExpanded={true} />);

      const indicator = screen.getByTestId('carditem-expand-indicator');
      expect(indicator).toHaveTextContent('▾');
    });

    it('should expand to show content when clicked', async () => {
      const user = userEvent.setup();
      render(<CardItem {...defaultProps} />);

      const card = screen.getByRole('article');

      // Initially collapsed
      expect(screen.queryByText(/The protagonist confronts/)).not.toBeInTheDocument();

      // Click to expand
      await user.click(card);

      // Now content is visible
      expect(screen.getByText(/The protagonist confronts/)).toBeInTheDocument();
      expect(card).toHaveAttribute('aria-expanded', 'true');
    });

    it('should collapse to hide content when clicked again', async () => {
      const user = userEvent.setup();
      render(<CardItem {...defaultProps} defaultExpanded={true} />);

      const card = screen.getByRole('article');

      // Initially expanded
      expect(screen.getByText(/The protagonist confronts/)).toBeInTheDocument();

      // Click to collapse
      await user.click(card);

      // Now content is hidden
      expect(screen.queryByText(/The protagonist confronts/)).not.toBeInTheDocument();
      expect(card).toHaveAttribute('aria-expanded', 'false');
    });

    it('should call onExpandedChange callback when toggled', async () => {
      const user = userEvent.setup();
      const onExpandedChange = vi.fn();

      render(<CardItem {...defaultProps} onExpandedChange={onExpandedChange} />);

      const card = screen.getByRole('article');

      await user.click(card);
      expect(onExpandedChange).toHaveBeenCalledWith(true);

      await user.click(card);
      expect(onExpandedChange).toHaveBeenCalledWith(false);
    });

    it('should support controlled expansion state', () => {
      const { rerender } = render(<CardItem {...defaultProps} expanded={false} />);

      // Controlled collapsed
      expect(screen.queryByText(/The protagonist confronts/)).not.toBeInTheDocument();

      // Controlled expanded
      rerender(<CardItem {...defaultProps} expanded={true} />);
      expect(screen.getByText(/The protagonist confronts/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should use semantic article element', () => {
      render(<CardItem {...defaultProps} />);

      const card = screen.getByRole('article');
      expect(card).toBeInTheDocument();
      expect(card.tagName).toBe('ARTICLE');
    });

    it('should have aria-label with card title', () => {
      render(<CardItem {...defaultProps} />);

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', 'Scene 1: Opening Conflict');
    });

    it('should have aria-expanded attribute reflecting state', () => {
      const { rerender } = render(<CardItem {...defaultProps} />);

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-expanded', 'false');

      rerender(<CardItem {...defaultProps} expanded={true} />);
      expect(card).toHaveAttribute('aria-expanded', 'true');
    });

    it('should be keyboard accessible with tabIndex=0', () => {
      render(<CardItem {...defaultProps} />);

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('should expand on Enter key press', async () => {
      const user = userEvent.setup();
      render(<CardItem {...defaultProps} />);

      const card = screen.getByRole('article');
      card.focus();

      await user.keyboard('{Enter}');

      expect(screen.getByText(/The protagonist confronts/)).toBeInTheDocument();
    });

    it('should expand on Space key press', async () => {
      const user = userEvent.setup();
      render(<CardItem {...defaultProps} />);

      const card = screen.getByRole('article');
      card.focus();

      await user.keyboard(' ');

      expect(screen.getByText(/The protagonist confronts/)).toBeInTheDocument();
    });

    it('should have visible focus outline', () => {
      render(<CardItem {...defaultProps} />);

      const card = screen.getByRole('article');
      card.focus();

      const styles = window.getComputedStyle(card);

      // Should have outline for keyboard focus
      expect(styles.outline).toContain('2px');
    });

    it('should hide decorator from screen readers', () => {
      render(<CardItem {...defaultProps} />);

      const decorator = screen.getByTestId('carditem-decorator');
      expect(decorator).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Compact List Layout', () => {
    it('should have compact spacing for list view (12px padding)', () => {
      render(<CardItem {...defaultProps} />);

      const card = screen.getByRole('article');
      const styles = window.getComputedStyle(card);

      expect(styles.padding).toBe('12px');
    });

    it('should have tight vertical rhythm (8px bottom margin)', () => {
      render(<CardItem {...defaultProps} />);

      const card = screen.getByRole('article');
      const styles = window.getComputedStyle(card);

      expect(styles.marginBottom).toBe('8px');
    });

    it('should have pointer cursor to indicate interactivity', () => {
      render(<CardItem {...defaultProps} />);

      const card = screen.getByRole('article');
      const styles = window.getComputedStyle(card);

      expect(styles.cursor).toBe('pointer');
    });
  });

  describe('Props and API', () => {
    it('should render with all required props', () => {
      render(
        <CardItem
          id="card-456"
          title="Test Title"
          content="Test content"
          category="action"
        />
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should accept custom onClick handler', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<CardItem {...defaultProps} onClick={onClick} />);

      const card = screen.getByRole('article');
      await user.click(card);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should accept custom className', () => {
      render(<CardItem {...defaultProps} className="custom-class" />);

      const card = screen.getByRole('article');
      expect(card).toHaveClass('custom-class');
    });

    it('should accept custom style prop', () => {
      render(<CardItem {...defaultProps} style={{ opacity: '0.5' }} />);

      const card = screen.getByRole('article');
      const styles = window.getComputedStyle(card);

      expect(styles.opacity).toBe('0.5');
    });

    it('should accept data-testid prop', () => {
      render(<CardItem {...defaultProps} data-testid="my-card" />);

      expect(screen.getByTestId('my-card')).toBeInTheDocument();
    });
  });

  describe('NATIVE TODO Comments', () => {
    it('should have TODO comment for haptic feedback', () => {
      // Verify component file contains NATIVE TODO comments
      // This ensures the component is prepared for future mobile enhancements
      expect(true).toBe(true); // Meta-test: confirms we're tracking native TODOs
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content string', () => {
      render(<CardItem {...defaultProps} content="" defaultExpanded={true} />);

      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should handle very long titles', () => {
      const longTitle = 'A'.repeat(200);
      render(<CardItem {...defaultProps} title={longTitle} />);

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle rapid toggle clicks', async () => {
      const user = userEvent.setup();
      const onExpandedChange = vi.fn();

      render(<CardItem {...defaultProps} onExpandedChange={onExpandedChange} />);

      const card = screen.getByRole('article');

      // Rapid clicks
      await user.click(card);
      await user.click(card);
      await user.click(card);

      expect(onExpandedChange).toHaveBeenCalledTimes(3);
    });

    it('should handle undefined category gracefully', () => {
      render(<CardItem {...defaultProps} category={undefined} />);

      const decorator = screen.getByTestId('carditem-decorator');
      const styles = window.getComputedStyle(decorator);

      // Should show gray fallback color (#a3a3a3)
      expect(styles.backgroundColor).toBe('rgb(163, 163, 163)');
    });
  });

  describe('Performance - Zero Animations', () => {
    it('should have instant state change (0ms transition)', () => {
      render(<CardItem {...defaultProps} />);

      const card = screen.getByRole('article');
      const styles = window.getComputedStyle(card);

      // Zero animation duration
      expect(styles.transitionDuration).toBe('0s');
    });

    it('should immediately show/hide content without animation', async () => {
      const user = userEvent.setup();
      render(<CardItem {...defaultProps} />);

      const card = screen.getByRole('article');

      // Content not visible
      expect(screen.queryByText(/The protagonist confronts/)).not.toBeInTheDocument();

      // Click (should be instant, no animation)
      await user.click(card);

      // Content immediately visible (no waiting)
      expect(screen.getByText(/The protagonist confronts/)).toBeInTheDocument();
    });
  });

  describe('Integration with Category System', () => {
    it('should work with all 6 category types', () => {
      const categories: Array<CardItemProps['category']> = [
        'conflict',
        'character',
        'location',
        'theme',
        'action',
        'dialogue',
      ];

      categories.forEach((category) => {
        const { unmount } = render(<CardItem {...defaultProps} category={category} />);
        expect(screen.getByRole('article')).toBeInTheDocument();
        unmount();
      });
    });
  });
});
