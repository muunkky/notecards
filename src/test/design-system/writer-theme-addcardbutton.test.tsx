/**
 * Writer Theme - AddCardButton Component TDD Specs
 *
 * Tests floating action button (FAB) for quick card creation.
 *
 * Design Requirements (from docs/WRITER-DESIGN-THESIS.md):
 * - 56x56px size (standard FAB dimensions)
 * - Fixed positioning bottom-right (20px offset)
 * - Black background with white text
 * - Sharp edges (0px border radius - brutalist)
 * - Zero animations (0ms transitions)
 * - Box shadow for depth
 * - Hover/active states
 * - Disabled state support
 *
 * Mobile Pattern:
 * - Meets 44px minimum touch target (exceeds at 56px)
 * - Thumb-friendly bottom-right positioning
 * - Always visible (fixed, doesn't scroll away)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { themeManager } from '../../design-system/theme/theme-manager';

// Component to be tested
import { AddCardButton } from '../../design-system/components/AddCardButton';

describe('Writer Theme - AddCardButton Component', () => {
  beforeEach(async () => {
    // Ensure Writer theme is active
    await themeManager.switchTheme('writer');
  });

  describe('Visual Design - Brutalist Aesthetic', () => {
    it('should render with black background', () => {
      render(<AddCardButton onClick={() => {}} />);

      const button = screen.getByTestId('add-card-button');
      const styles = window.getComputedStyle(button);

      expect(styles.backgroundColor).toBe('rgb(0, 0, 0)');
    });

    it('should render with white text color', () => {
      render(<AddCardButton onClick={() => {}} />);

      const button = screen.getByTestId('add-card-button');
      const styles = window.getComputedStyle(button);

      expect(styles.color).toBe('rgb(255, 255, 255)');
    });

    it('should have sharp edges (0px border radius)', () => {
      render(<AddCardButton onClick={() => {}} />);

      const button = screen.getByTestId('add-card-button');
      const styles = window.getComputedStyle(button);

      expect(styles.borderRadius).toBe('0px');
    });

    it('should have box shadow for depth perception', () => {
      render(<AddCardButton onClick={() => {}} />);

      const button = screen.getByTestId('add-card-button');
      const styles = window.getComputedStyle(button);

      expect(styles.boxShadow).not.toBe('none');
      expect(styles.boxShadow).toContain('rgba(0, 0, 0');
    });

    it('should have zero transitions (instant state changes)', () => {
      render(<AddCardButton onClick={() => {}} />);

      const button = screen.getByTestId('add-card-button');
      const styles = window.getComputedStyle(button);

      expect(styles.transitionDuration).toBe('0s');
    });

    it('should have black border', () => {
      render(<AddCardButton onClick={() => {}} />);

      const button = screen.getByTestId('add-card-button');
      const styles = window.getComputedStyle(button);

      expect(styles.borderColor).toBe('rgb(0, 0, 0)');
      expect(styles.borderWidth).toBe('2px');
    });
  });

  describe('Size and Dimensions - FAB Standards', () => {
    it('should be 56x56px (standard FAB size)', () => {
      render(<AddCardButton onClick={() => {}} />);

      const button = screen.getByTestId('add-card-button');
      const styles = window.getComputedStyle(button);

      expect(styles.width).toBe('56px');
      expect(styles.height).toBe('56px');
    });

    it('should exceed 44px minimum touch target', () => {
      render(<AddCardButton onClick={() => {}} />);

      const button = screen.getByTestId('add-card-button');
      const styles = window.getComputedStyle(button);

      const width = parseInt(styles.width);
      const height = parseInt(styles.height);

      expect(width).toBeGreaterThanOrEqual(44);
      expect(height).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Positioning - Fixed Bottom-Right', () => {
    it('should be fixed positioned', () => {
      render(<AddCardButton onClick={() => {}} />);

      const button = screen.getByTestId('add-card-button');
      const styles = window.getComputedStyle(button);

      expect(styles.position).toBe('fixed');
    });

    it('should be 20px from bottom', () => {
      render(<AddCardButton onClick={() => {}} />);

      const button = screen.getByTestId('add-card-button');
      const styles = window.getComputedStyle(button);

      expect(styles.bottom).toBe('20px');
    });

    it('should be 20px from right', () => {
      render(<AddCardButton onClick={() => {}} />);

      const button = screen.getByTestId('add-card-button');
      const styles = window.getComputedStyle(button);

      expect(styles.right).toBe('20px');
    });

    it('should have z-index 100 (above content, below modals)', () => {
      render(<AddCardButton onClick={() => {}} />);

      const button = screen.getByTestId('add-card-button');
      const styles = window.getComputedStyle(button);

      expect(styles.zIndex).toBe('100');
    });
  });

  describe('Label and Content', () => {
    it('should render with default "+" label', () => {
      render(<AddCardButton onClick={() => {}} />);

      const button = screen.getByTestId('add-card-button');
      expect(button).toHaveTextContent('+');
    });

    it('should accept custom label', () => {
      render(<AddCardButton onClick={() => {}} label="✓" />);

      const button = screen.getByTestId('add-card-button');
      expect(button).toHaveTextContent('✓');
    });

    it('should render label with large font size', () => {
      render(<AddCardButton onClick={() => {}} />);

      const button = screen.getByTestId('add-card-button');
      const styles = window.getComputedStyle(button);

      expect(parseInt(styles.fontSize)).toBeGreaterThanOrEqual(24);
    });

    it('should render label with bold font weight', () => {
      render(<AddCardButton onClick={() => {}} />);

      const button = screen.getByTestId('add-card-button');
      const styles = window.getComputedStyle(button);

      expect(parseInt(styles.fontWeight)).toBeGreaterThanOrEqual(600);
    });
  });

  describe('Interaction', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<AddCardButton onClick={onClick} />);

      const button = screen.getByTestId('add-card-button');
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should have pointer cursor', () => {
      render(<AddCardButton onClick={() => {}} />);

      const button = screen.getByTestId('add-card-button');
      const styles = window.getComputedStyle(button);

      expect(styles.cursor).toBe('pointer');
    });
  });

  describe('Disabled State', () => {
    it('should render with gray background when disabled', () => {
      render(<AddCardButton onClick={() => {}} disabled={true} />);

      const button = screen.getByTestId('add-card-button');
      const styles = window.getComputedStyle(button);

      // Gray-400 color
      expect(styles.backgroundColor).toContain('156, 163, 175');
    });

    it('should have not-allowed cursor when disabled', () => {
      render(<AddCardButton onClick={() => {}} disabled={true} />);

      const button = screen.getByTestId('add-card-button');
      const styles = window.getComputedStyle(button);

      expect(styles.cursor).toBe('not-allowed');
    });

    it('should have no box shadow when disabled', () => {
      render(<AddCardButton onClick={() => {}} disabled={true} />);

      const button = screen.getByTestId('add-card-button');
      const styles = window.getComputedStyle(button);

      expect(styles.boxShadow).toBe('none');
    });

    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<AddCardButton onClick={onClick} disabled={true} />);

      const button = screen.getByTestId('add-card-button');
      await user.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });

    it('should be disabled in DOM when disabled prop is true', () => {
      render(<AddCardButton onClick={() => {}} disabled={true} />);

      const button = screen.getByTestId('add-card-button');
      expect(button).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have button role', () => {
      render(<AddCardButton onClick={() => {}} />);

      const button = screen.getByTestId('add-card-button');
      expect(button.tagName).toBe('BUTTON');
    });

    it('should have aria-label for screen readers', () => {
      render(<AddCardButton onClick={() => {}} />);

      const button = screen.getByTestId('add-card-button');
      expect(button).toHaveAttribute('aria-label', 'Add new card');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(<AddCardButton onClick={onClick} />);

      const button = screen.getByTestId('add-card-button');
      button.focus();

      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should communicate disabled state to screen readers', () => {
      render(<AddCardButton onClick={() => {}} disabled={true} />);

      const button = screen.getByTestId('add-card-button');
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('API and Props', () => {
    it('should accept custom testId', () => {
      render(<AddCardButton onClick={() => {}} testId="custom-fab" />);

      expect(screen.getByTestId('custom-fab')).toBeInTheDocument();
    });

    it('should handle missing onClick gracefully', () => {
      render(<AddCardButton />);

      const button = screen.getByTestId('add-card-button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('NATIVE TODO Comments', () => {
    it('should have comment for haptic feedback on tap', () => {
      const fileContent = require('fs').readFileSync(
        require.resolve('../../design-system/components/AddCardButton'),
        'utf-8'
      );

      expect(fileContent).toContain('NATIVE TODO');
      expect(fileContent).toContain('Haptics');
    });
  });

  describe('Performance', () => {
    it('should render quickly (< 16ms for 60fps)', () => {
      const startTime = performance.now();

      render(<AddCardButton onClick={() => {}} />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      expect(renderTime).toBeLessThan(16);
    });
  });
});
