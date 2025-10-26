/**
 * Writer Theme - BottomSheet Component TDD Specs
 *
 * Tests mobile-native bottom sheet component for action sheets and pickers.
 *
 * Design Requirements (from docs/WRITER-DESIGN-THESIS.md):
 * - 75% black scrim backdrop
 * - Slides up from bottom of screen
 * - White background with black border
 * - Sharp edges (0px border radius)
 * - No shadows (flat design)
 * - Zero animations (0ms transitions)
 * - ESC key to dismiss
 * - Click outside to dismiss
 * - Body scroll lock when open
 *
 * Mobile Pattern:
 * - Fixed positioning at bottom
 * - Full width on mobile
 * - Modal behavior (blocks interaction with background)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { themeManager } from '../../design-system/theme/theme-manager';

// Component to be tested
import { BottomSheet } from '../../design-system/components/BottomSheet';

describe('Writer Theme - BottomSheet Component', () => {
  beforeEach(async () => {
    // Ensure Writer theme is active
    await themeManager.switchTheme('writer');

    // Reset body overflow
    document.body.style.overflow = '';
  });

  describe('Visual Design - Brutalist Aesthetic', () => {
    it('should render scrim with 75% black background', () => {
      render(
        <BottomSheet isOpen={true} onClose={() => {}} title="Test Sheet">
          Content
        </BottomSheet>
      );

      const scrim = screen.getByTestId('bottom-sheet-scrim');
      const styles = window.getComputedStyle(scrim);

      expect(styles.backgroundColor).toBe('rgba(0, 0, 0, 0.75)');
    });

    it('should render sheet with white background', () => {
      render(
        <BottomSheet isOpen={true} onClose={() => {}} title="Test Sheet">
          Content
        </BottomSheet>
      );

      const sheet = screen.getByTestId('bottom-sheet');
      const styles = window.getComputedStyle(sheet);

      expect(styles.backgroundColor).toBe('rgb(255, 255, 255)');
    });

    it('should render with black border on top', () => {
      render(
        <BottomSheet isOpen={true} onClose={() => {}} title="Test Sheet">
          Content
        </BottomSheet>
      );

      const sheet = screen.getByTestId('bottom-sheet');
      const styles = window.getComputedStyle(sheet);

      expect(styles.borderTopColor).toBe('rgb(0, 0, 0)');
      expect(styles.borderTopWidth).toBe('1px');
    });

    it('should have sharp top corners (0px border radius)', () => {
      render(
        <BottomSheet isOpen={true} onClose={() => {}} title="Test Sheet">
          Content
        </BottomSheet>
      );

      const sheet = screen.getByTestId('bottom-sheet');
      const styles = window.getComputedStyle(sheet);

      expect(styles.borderTopLeftRadius).toBe('0px');
      expect(styles.borderTopRightRadius).toBe('0px');
    });

    it('should have zero transitions (instant state changes)', () => {
      render(
        <BottomSheet isOpen={true} onClose={() => {}} title="Test Sheet">
          Content
        </BottomSheet>
      );

      const sheet = screen.getByTestId('bottom-sheet');
      const scrim = screen.getByTestId('bottom-sheet-scrim');

      const sheetStyles = window.getComputedStyle(sheet);
      const scrimStyles = window.getComputedStyle(scrim);

      expect(sheetStyles.transitionDuration).toBe('0s');
      expect(scrimStyles.transitionDuration).toBe('0s');
    });
  });

  describe('Positioning - Mobile Pattern', () => {
    it('should be fixed at bottom of screen', () => {
      render(
        <BottomSheet isOpen={true} onClose={() => {}} title="Test Sheet">
          Content
        </BottomSheet>
      );

      const sheet = screen.getByTestId('bottom-sheet');
      const styles = window.getComputedStyle(sheet);

      expect(styles.position).toBe('fixed');
      expect(styles.bottom).toBe('0px');
    });

    it('should span full width', () => {
      render(
        <BottomSheet isOpen={true} onClose={() => {}} title="Test Sheet">
          Content
        </BottomSheet>
      );

      const sheet = screen.getByTestId('bottom-sheet');
      const styles = window.getComputedStyle(sheet);

      expect(styles.left).toBe('0px');
      expect(styles.right).toBe('0px');
    });

    it('should have high z-index (above content)', () => {
      render(
        <BottomSheet isOpen={true} onClose={() => {}} title="Test Sheet">
          Content
        </BottomSheet>
      );

      const scrim = screen.getByTestId('bottom-sheet-scrim');
      const sheet = screen.getByTestId('bottom-sheet');

      const scrimStyles = window.getComputedStyle(scrim);
      const sheetStyles = window.getComputedStyle(sheet);

      expect(parseInt(scrimStyles.zIndex)).toBeGreaterThanOrEqual(1000);
      expect(parseInt(sheetStyles.zIndex)).toBeGreaterThan(parseInt(scrimStyles.zIndex));
    });
  });

  describe('Open/Close Behavior', () => {
    it('should render when isOpen is true', () => {
      render(
        <BottomSheet isOpen={true} onClose={() => {}} title="Test Sheet">
          Content
        </BottomSheet>
      );

      expect(screen.getByTestId('bottom-sheet')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(
        <BottomSheet isOpen={false} onClose={() => {}} title="Test Sheet">
          Content
        </BottomSheet>
      );

      expect(screen.queryByTestId('bottom-sheet')).not.toBeInTheDocument();
    });

    it('should call onClose when scrim is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <BottomSheet isOpen={true} onClose={onClose} title="Test Sheet">
          Content
        </BottomSheet>
      );

      const scrim = screen.getByTestId('bottom-sheet-scrim');
      await user.click(scrim);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when ESC key is pressed', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <BottomSheet isOpen={true} onClose={onClose} title="Test Sheet">
          Content
        </BottomSheet>
      );

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <BottomSheet isOpen={true} onClose={onClose} title="Test Sheet" showCloseButton={true}>
          Content
        </BottomSheet>
      );

      const closeButton = screen.getByTestId('bottom-sheet-close');
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not show close button when showCloseButton is false', () => {
      render(
        <BottomSheet isOpen={true} onClose={() => {}} title="Test Sheet" showCloseButton={false}>
          Content
        </BottomSheet>
      );

      expect(screen.queryByTestId('bottom-sheet-close')).not.toBeInTheDocument();
    });
  });

  describe('Header and Title', () => {
    it('should render title when provided', () => {
      render(
        <BottomSheet isOpen={true} onClose={() => {}} title="Test Title">
          Content
        </BottomSheet>
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('should not render header when title is not provided', () => {
      render(
        <BottomSheet isOpen={true} onClose={() => {}}>
          Content
        </BottomSheet>
      );

      expect(screen.queryByTestId('bottom-sheet-header')).not.toBeInTheDocument();
    });

    it('should use monospace font for title', () => {
      render(
        <BottomSheet isOpen={true} onClose={() => {}} title="Test Title">
          Content
        </BottomSheet>
      );

      const title = screen.getByText('Test Title');
      const styles = window.getComputedStyle(title);

      expect(styles.fontFamily).toContain('monospace');
    });
  });

  describe('Content', () => {
    it('should render children content', () => {
      render(
        <BottomSheet isOpen={true} onClose={() => {}} title="Test Sheet">
          <div data-testid="test-content">Test Content</div>
        </BottomSheet>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('Body Scroll Lock', () => {
    it('should lock body scroll when open', () => {
      render(
        <BottomSheet isOpen={true} onClose={() => {}} title="Test Sheet">
          Content
        </BottomSheet>
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when closed', () => {
      const { rerender } = render(
        <BottomSheet isOpen={true} onClose={() => {}} title="Test Sheet">
          Content
        </BottomSheet>
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <BottomSheet isOpen={false} onClose={() => {}} title="Test Sheet">
          Content
        </BottomSheet>
      );

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA role', () => {
      render(
        <BottomSheet isOpen={true} onClose={() => {}} title="Test Sheet">
          Content
        </BottomSheet>
      );

      const sheet = screen.getByTestId('bottom-sheet');
      expect(sheet).toHaveAttribute('role', 'dialog');
    });

    it('should have aria-modal attribute', () => {
      render(
        <BottomSheet isOpen={true} onClose={() => {}} title="Test Sheet">
          Content
        </BottomSheet>
      );

      const sheet = screen.getByTestId('bottom-sheet');
      expect(sheet).toHaveAttribute('aria-modal', 'true');
    });

    it('should have aria-label from title', () => {
      render(
        <BottomSheet isOpen={true} onClose={() => {}} title="Test Sheet">
          Content
        </BottomSheet>
      );

      const sheet = screen.getByTestId('bottom-sheet');
      expect(sheet).toHaveAttribute('aria-label', 'Test Sheet');
    });

    it('should hide scrim from screen readers', () => {
      render(
        <BottomSheet isOpen={true} onClose={() => {}} title="Test Sheet">
          Content
        </BottomSheet>
      );

      const scrim = screen.getByTestId('bottom-sheet-scrim');
      expect(scrim).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('API and Props', () => {
    it('should accept custom testId', () => {
      render(
        <BottomSheet isOpen={true} onClose={() => {}} title="Test Sheet" testId="custom-sheet">
          Content
        </BottomSheet>
      );

      expect(screen.getByTestId('custom-sheet')).toBeInTheDocument();
      expect(screen.getByTestId('custom-sheet-scrim')).toBeInTheDocument();
    });
  });

  describe('NATIVE TODO Comments', () => {
    it('should have comment for haptic feedback on open', () => {
      const fileContent = require('fs').readFileSync(
        require.resolve('../../design-system/components/BottomSheet'),
        'utf-8'
      );

      expect(fileContent).toContain('NATIVE TODO');
      expect(fileContent).toContain('Haptics');
    });
  });
});
