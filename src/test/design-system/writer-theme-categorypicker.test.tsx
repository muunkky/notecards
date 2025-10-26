/**
 * Writer Theme - CategoryPicker Component TDD Specs
 *
 * Tests mobile-native category selector using BottomSheet.
 *
 * Design Requirements (from docs/WRITER-DESIGN-THESIS.md):
 * - Uses BottomSheet component
 * - 4px color strip for each category
 * - Category label and description
 * - Checkmark for selected category
 * - Auto-dismiss after selection
 * - Zero animations (0ms transitions)
 * - Brutalist aesthetic
 *
 * Categories (6 types):
 * - Conflict: #e11d48 (rose red)
 * - Character: #3b82f6 (blue)
 * - Location: #f59e0b (amber)
 * - Theme: #8b5cf6 (purple)
 * - Action: #f97316 (orange)
 * - Dialogue: #ec4899 (pink)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { themeManager } from '../../design-system/theme/theme-manager';

// Component to be tested
import { CategoryPicker } from '../../design-system/components/CategoryPicker';
import type { CategoryValue } from '../../domain/categories';

describe('Writer Theme - CategoryPicker Component', () => {
  beforeEach(async () => {
    // Ensure Writer theme is active
    await themeManager.switchTheme('writer');
  });

  describe('Bottom Sheet Integration', () => {
    it('should render using BottomSheet component', () => {
      render(
        <CategoryPicker
          isOpen={true}
          onClose={() => {}}
          onSelectCategory={() => {}}
        />
      );

      // Should have BottomSheet structure
      expect(screen.getByTestId('category-picker')).toBeInTheDocument();
      expect(screen.getByTestId('category-picker-scrim')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(
        <CategoryPicker
          isOpen={false}
          onClose={() => {}}
          onSelectCategory={() => {}}
        />
      );

      expect(screen.queryByTestId('category-picker')).not.toBeInTheDocument();
    });

    it('should show "Select Category" title', () => {
      render(
        <CategoryPicker
          isOpen={true}
          onClose={() => {}}
          onSelectCategory={() => {}}
        />
      );

      expect(screen.getByText('Select Category')).toBeInTheDocument();
    });
  });

  describe('Category List', () => {
    it('should render all 6 categories', () => {
      render(
        <CategoryPicker
          isOpen={true}
          onClose={() => {}}
          onSelectCategory={() => {}}
        />
      );

      expect(screen.getByText('Conflict')).toBeInTheDocument();
      expect(screen.getByText('Character')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('Theme')).toBeInTheDocument();
      expect(screen.getByText('Action')).toBeInTheDocument();
      expect(screen.getByText('Dialogue')).toBeInTheDocument();
    });

    it('should render category descriptions', () => {
      render(
        <CategoryPicker
          isOpen={true}
          onClose={() => {}}
          onSelectCategory={() => {}}
        />
      );

      // Check for description text (partial match)
      expect(screen.getByText(/Central conflict/i)).toBeInTheDocument();
      expect(screen.getByText(/Character development/i)).toBeInTheDocument();
    });

    it('should render 4px color strip for each category', () => {
      render(
        <CategoryPicker
          isOpen={true}
          onClose={() => {}}
          onSelectCategory={() => {}}
        />
      );

      // Find all color strips
      const categoryItems = screen.getAllByRole('button');
      expect(categoryItems.length).toBe(6);

      // Each item should have a decorator
      categoryItems.forEach((item) => {
        const decorator = within(item).getByTestId(/category-.*-decorator/);
        const styles = window.getComputedStyle(decorator);

        expect(styles.width).toBe('4px');
        expect(styles.position).toBe('absolute');
      });
    });
  });

  describe('Color Coding', () => {
    it('should show conflict category with rose red color', () => {
      render(
        <CategoryPicker
          isOpen={true}
          onClose={() => {}}
          onSelectCategory={() => {}}
        />
      );

      const conflictDecorator = screen.getByTestId('category-conflict-decorator');
      const styles = window.getComputedStyle(conflictDecorator);

      expect(styles.backgroundColor).toBe('rgb(225, 29, 72)'); // #e11d48
    });

    it('should show character category with blue color', () => {
      render(
        <CategoryPicker
          isOpen={true}
          onClose={() => {}}
          onSelectCategory={() => {}}
        />
      );

      const characterDecorator = screen.getByTestId('category-character-decorator');
      const styles = window.getComputedStyle(characterDecorator);

      expect(styles.backgroundColor).toBe('rgb(59, 130, 246)'); // #3b82f6
    });

    it('should show location category with amber color', () => {
      render(
        <CategoryPicker
          isOpen={true}
          onClose={() => {}}
          onSelectCategory={() => {}}
        />
      );

      const locationDecorator = screen.getByTestId('category-location-decorator');
      const styles = window.getComputedStyle(locationDecorator);

      expect(styles.backgroundColor).toBe('rgb(245, 158, 11)'); // #f59e0b
    });
  });

  describe('Selection State', () => {
    it('should show checkmark for selected category', () => {
      render(
        <CategoryPicker
          isOpen={true}
          onClose={() => {}}
          selectedCategory="conflict"
          onSelectCategory={() => {}}
        />
      );

      const conflictButton = screen.getByText('Conflict').closest('button')!;
      expect(within(conflictButton).getByText('✓')).toBeInTheDocument();
    });

    it('should not show checkmark for unselected categories', () => {
      render(
        <CategoryPicker
          isOpen={true}
          onClose={() => {}}
          selectedCategory="conflict"
          onSelectCategory={() => {}}
        />
      );

      const characterButton = screen.getByText('Character').closest('button')!;
      expect(within(characterButton).queryByText('✓')).not.toBeInTheDocument();
    });

    it('should not show checkmark when no category is selected', () => {
      render(
        <CategoryPicker
          isOpen={true}
          onClose={() => {}}
          onSelectCategory={() => {}}
        />
      );

      // Check that no checkmarks are visible
      const checkmarks = screen.queryAllByText('✓');
      expect(checkmarks.length).toBe(0);
    });
  });

  describe('Interaction', () => {
    it('should call onSelectCategory when category is clicked', async () => {
      const user = userEvent.setup();
      const onSelectCategory = vi.fn();

      render(
        <CategoryPicker
          isOpen={true}
          onClose={() => {}}
          onSelectCategory={onSelectCategory}
        />
      );

      const conflictButton = screen.getByText('Conflict').closest('button')!;
      await user.click(conflictButton);

      expect(onSelectCategory).toHaveBeenCalledWith('conflict');
    });

    it('should call onClose after category is selected (auto-dismiss)', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <CategoryPicker
          isOpen={true}
          onClose={onClose}
          onSelectCategory={() => {}}
        />
      );

      const conflictButton = screen.getByText('Conflict').closest('button')!;
      await user.click(conflictButton);

      expect(onClose).toHaveBeenCalled();
    });

    it('should call both callbacks in correct order on selection', async () => {
      const user = userEvent.setup();
      const calls: string[] = [];
      const onSelectCategory = vi.fn(() => calls.push('select'));
      const onClose = vi.fn(() => calls.push('close'));

      render(
        <CategoryPicker
          isOpen={true}
          onClose={onClose}
          onSelectCategory={onSelectCategory}
        />
      );

      const conflictButton = screen.getByText('Conflict').closest('button')!;
      await user.click(conflictButton);

      expect(calls).toEqual(['select', 'close']);
    });
  });

  describe('Visual Design - Brutalist Aesthetic', () => {
    it('should render category items with zero transitions', () => {
      render(
        <CategoryPicker
          isOpen={true}
          onClose={() => {}}
          onSelectCategory={() => {}}
        />
      );

      const categoryButtons = screen.getAllByRole('button');
      const firstButton = categoryButtons[0];
      const styles = window.getComputedStyle(firstButton);

      expect(styles.transitionDuration).toBe('0s');
    });

    it('should use system font for category labels', () => {
      render(
        <CategoryPicker
          isOpen={true}
          onClose={() => {}}
          onSelectCategory={() => {}}
        />
      );

      const conflictLabel = screen.getByText('Conflict');
      const styles = window.getComputedStyle(conflictLabel);

      expect(styles.fontFamily).toContain('system-ui');
    });

    it('should have clickable category items with pointer cursor', () => {
      render(
        <CategoryPicker
          isOpen={true}
          onClose={() => {}}
          onSelectCategory={() => {}}
        />
      );

      const categoryButtons = screen.getAllByRole('button');
      categoryButtons.forEach((button) => {
        const styles = window.getComputedStyle(button);
        expect(styles.cursor).toBe('pointer');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper button role for category items', () => {
      render(
        <CategoryPicker
          isOpen={true}
          onClose={() => {}}
          onSelectCategory={() => {}}
        />
      );

      const categoryButtons = screen.getAllByRole('button');
      expect(categoryButtons.length).toBeGreaterThanOrEqual(6);
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const onSelectCategory = vi.fn();

      render(
        <CategoryPicker
          isOpen={true}
          onClose={() => {}}
          onSelectCategory={onSelectCategory}
        />
      );

      const conflictButton = screen.getByText('Conflict').closest('button')!;
      conflictButton.focus();

      await user.keyboard('{Enter}');

      expect(onSelectCategory).toHaveBeenCalledWith('conflict');
    });
  });

  describe('API and Props', () => {
    it('should accept custom testId', () => {
      render(
        <CategoryPicker
          isOpen={true}
          onClose={() => {}}
          onSelectCategory={() => {}}
          testId="custom-picker"
        />
      );

      expect(screen.getByTestId('custom-picker')).toBeInTheDocument();
    });

    it('should accept all CategoryValue types', async () => {
      const user = userEvent.setup();
      const categories: CategoryValue[] = [
        'conflict',
        'character',
        'location',
        'theme',
        'action',
        'dialogue',
      ];

      for (const category of categories) {
        const onSelectCategory = vi.fn();

        const { unmount } = render(
          <CategoryPicker
            isOpen={true}
            onClose={() => {}}
            selectedCategory={category}
            onSelectCategory={onSelectCategory}
          />
        );

        // Should render with checkmark for selected category
        const categoryButton = screen.getByText(
          category.charAt(0).toUpperCase() + category.slice(1)
        ).closest('button')!;

        expect(within(categoryButton).getByText('✓')).toBeInTheDocument();

        unmount();
      }
    });
  });
});
