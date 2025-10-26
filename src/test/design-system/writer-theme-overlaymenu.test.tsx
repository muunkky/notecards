/**
 * Writer Theme - OverlayMenu Component TDD Specs
 *
 * Tests context-preserving overlay menu for action menus.
 *
 * Design Requirements (from docs/WRITER-DESIGN-THESIS.md):
 * - 75% black scrim backdrop (matching BottomSheet)
 * - Positioned near anchor element
 * - White background with black border
 * - Sharp edges (0px border radius)
 * - Zero animations (0ms transitions)
 * - Menu items with click handlers
 * - Danger variant (red text for destructive actions)
 * - Auto-dismiss after item selection
 * - Click outside to dismiss
 * - ESC key to dismiss
 *
 * Use Cases:
 * - Three-dot menus
 * - Context menus (right-click, long-press)
 * - Action menus (deck/card operations)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { themeManager } from '../../design-system/theme/theme-manager';

// Component to be tested
import { OverlayMenu } from '../../design-system/components/OverlayMenu';
import type { MenuItem } from '../../design-system/components/OverlayMenu';

describe('Writer Theme - OverlayMenu Component', () => {
  const mockItems: MenuItem[] = [
    { label: 'Edit', onClick: vi.fn() },
    { label: 'Duplicate', onClick: vi.fn() },
    { label: 'Delete', onClick: vi.fn(), danger: true },
  ];

  beforeEach(async () => {
    // Ensure Writer theme is active
    await themeManager.switchTheme('writer');

    // Reset body overflow
    document.body.style.overflow = '';

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('Visual Design - Brutalist Aesthetic', () => {
    it('should render scrim with 75% black background', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      const scrim = screen.getByTestId('overlay-menu-scrim');
      const styles = window.getComputedStyle(scrim);

      expect(styles.backgroundColor).toBe('rgba(0, 0, 0, 0.75)');
    });

    it('should render menu with white background', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      const menu = screen.getByTestId('overlay-menu');
      const styles = window.getComputedStyle(menu);

      expect(styles.backgroundColor).toBe('rgb(255, 255, 255)');
    });

    it('should render with black border', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      const menu = screen.getByTestId('overlay-menu');
      const styles = window.getComputedStyle(menu);

      expect(styles.borderColor).toBe('rgb(0, 0, 0)');
      expect(styles.borderWidth).toBe('1px');
    });

    it('should have sharp edges (0px border radius)', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      const menu = screen.getByTestId('overlay-menu');
      const styles = window.getComputedStyle(menu);

      expect(styles.borderRadius).toBe('0px');
    });

    it('should have zero transitions (instant state changes)', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      const menu = screen.getByTestId('overlay-menu');
      const scrim = screen.getByTestId('overlay-menu-scrim');

      const menuStyles = window.getComputedStyle(menu);
      const scrimStyles = window.getComputedStyle(scrim);

      expect(menuStyles.transitionDuration).toBe('0s');
      expect(scrimStyles.transitionDuration).toBe('0s');
    });

    it('should have box shadow for depth', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      const menu = screen.getByTestId('overlay-menu');
      const styles = window.getComputedStyle(menu);

      expect(styles.boxShadow).not.toBe('none');
      expect(styles.boxShadow).toContain('rgba(0, 0, 0');
    });
  });

  describe('Positioning', () => {
    it('should be fixed positioned', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      const menu = screen.getByTestId('overlay-menu');
      const styles = window.getComputedStyle(menu);

      expect(styles.position).toBe('fixed');
    });

    it('should have high z-index (1001, above scrim at 1000)', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      const scrim = screen.getByTestId('overlay-menu-scrim');
      const menu = screen.getByTestId('overlay-menu');

      const scrimStyles = window.getComputedStyle(scrim);
      const menuStyles = window.getComputedStyle(menu);

      expect(parseInt(scrimStyles.zIndex)).toBe(1000);
      expect(parseInt(menuStyles.zIndex)).toBe(1001);
    });

    it('should center on screen when no anchor element', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      const menu = screen.getByTestId('overlay-menu');
      const styles = window.getComputedStyle(menu);

      expect(styles.top).toBe('50%');
      expect(styles.left).toBe('50%');
      expect(styles.transform).toContain('translate(-50%, -50%)');
    });
  });

  describe('Size Constraints', () => {
    it('should have minimum width of 200px', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      const menu = screen.getByTestId('overlay-menu');
      const styles = window.getComputedStyle(menu);

      expect(parseInt(styles.minWidth)).toBe(200);
    });

    it('should have maximum width of 300px', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      const menu = screen.getByTestId('overlay-menu');
      const styles = window.getComputedStyle(menu);

      expect(parseInt(styles.maxWidth)).toBe(300);
    });
  });

  describe('Open/Close Behavior', () => {
    it('should render when isOpen is true', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      expect(screen.getByTestId('overlay-menu')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(
        <OverlayMenu isOpen={false} onClose={() => {}} items={mockItems} />
      );

      expect(screen.queryByTestId('overlay-menu')).not.toBeInTheDocument();
    });

    it('should call onClose when scrim is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <OverlayMenu isOpen={true} onClose={onClose} items={mockItems} />
      );

      const scrim = screen.getByTestId('overlay-menu-scrim');
      await user.click(scrim);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when ESC key is pressed', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <OverlayMenu isOpen={true} onClose={onClose} items={mockItems} />
      );

      await user.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Menu Items', () => {
    it('should render all menu items', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Duplicate')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should render menu items as buttons', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBe(3);

      menuItems.forEach((item) => {
        expect(item.tagName).toBe('BUTTON');
      });
    });

    it('should have pointer cursor for menu items', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      const menuItems = screen.getAllByRole('menuitem');
      menuItems.forEach((item) => {
        const styles = window.getComputedStyle(item);
        expect(styles.cursor).toBe('pointer');
      });
    });

    it('should render items with borders between them', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      const menuItems = screen.getAllByRole('menuitem');
      const firstItem = menuItems[0];
      const styles = window.getComputedStyle(firstItem);

      expect(styles.borderBottom).toContain('1px solid');
    });
  });

  describe('Danger Variant', () => {
    it('should render danger items with red text', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      const deleteButton = screen.getByText('Delete');
      const styles = window.getComputedStyle(deleteButton);

      // Red-600 color
      expect(styles.color).toContain('220, 38, 38');
    });

    it('should render non-danger items with black text', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      const editButton = screen.getByText('Edit');
      const styles = window.getComputedStyle(editButton);

      expect(styles.color).toBe('rgb(0, 0, 0)');
    });
  });

  describe('Interaction', () => {
    it('should call item onClick when clicked', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const items: MenuItem[] = [{ label: 'Test', onClick }];

      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={items} />
      );

      const item = screen.getByText('Test');
      await user.click(item);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should auto-dismiss after item is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      const items: MenuItem[] = [{ label: 'Test', onClick: vi.fn() }];

      render(
        <OverlayMenu isOpen={true} onClose={onClose} items={items} />
      );

      const item = screen.getByText('Test');
      await user.click(item);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClick before onClose', async () => {
      const user = userEvent.setup();
      const calls: string[] = [];
      const onClick = vi.fn(() => calls.push('item'));
      const onClose = vi.fn(() => calls.push('close'));
      const items: MenuItem[] = [{ label: 'Test', onClick }];

      render(
        <OverlayMenu isOpen={true} onClose={onClose} items={items} />
      );

      const item = screen.getByText('Test');
      await user.click(item);

      expect(calls).toEqual(['item', 'close']);
    });
  });

  describe('Body Scroll Lock', () => {
    it('should lock body scroll when open', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when closed', () => {
      const { rerender } = render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <OverlayMenu isOpen={false} onClose={() => {}} items={mockItems} />
      );

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA role', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      const menu = screen.getByTestId('overlay-menu');
      expect(menu).toHaveAttribute('role', 'menu');
    });

    it('should have aria-label', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      const menu = screen.getByTestId('overlay-menu');
      expect(menu).toHaveAttribute('aria-label', 'Menu');
    });

    it('should have menuitem role for items', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems.length).toBe(3);
    });

    it('should hide scrim from screen readers', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      const scrim = screen.getByTestId('overlay-menu-scrim');
      expect(scrim).toHaveAttribute('aria-hidden', 'true');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      const items: MenuItem[] = [{ label: 'Test', onClick }];

      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={items} />
      );

      const item = screen.getByText('Test');
      item.focus();

      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('API and Props', () => {
    it('should accept custom testId', () => {
      render(
        <OverlayMenu
          isOpen={true}
          onClose={() => {}}
          items={mockItems}
          testId="custom-menu"
        />
      );

      expect(screen.getByTestId('custom-menu')).toBeInTheDocument();
      expect(screen.getByTestId('custom-menu-scrim')).toBeInTheDocument();
    });

    it('should handle empty items array', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={[]} />
      );

      const menu = screen.getByTestId('overlay-menu');
      expect(menu).toBeInTheDocument();

      const menuItems = screen.queryAllByRole('menuitem');
      expect(menuItems.length).toBe(0);
    });

    it('should accept anchorEl prop', () => {
      const anchorEl = document.createElement('button');
      document.body.appendChild(anchorEl);

      render(
        <OverlayMenu
          isOpen={true}
          onClose={() => {}}
          items={mockItems}
          anchorEl={anchorEl}
        />
      );

      expect(screen.getByTestId('overlay-menu')).toBeInTheDocument();

      document.body.removeChild(anchorEl);
    });
  });

  describe('Visual Feedback - Hover States', () => {
    it('should render with zero transition for instant hover', () => {
      render(
        <OverlayMenu isOpen={true} onClose={() => {}} items={mockItems} />
      );

      const menuItems = screen.getAllByRole('menuitem');
      menuItems.forEach((item) => {
        const styles = window.getComputedStyle(item);
        expect(styles.transitionDuration).toBe('0s');
      });
    });
  });

  describe('NATIVE TODO Comments', () => {
    it('should have comment for haptic feedback', () => {
      const fileContent = require('fs').readFileSync(
        require.resolve('../../design-system/components/OverlayMenu'),
        'utf-8'
      );

      expect(fileContent).toContain('NATIVE TODO');
      expect(fileContent).toContain('Haptics');
    });
  });
});
