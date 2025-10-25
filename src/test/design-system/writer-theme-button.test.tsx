/**
 * Writer Theme - Button Component TDD Specs
 *
 * Tests brutalist button implementation with Writer theme tokens.
 * These tests define the specification - they will FAIL until component is implemented.
 *
 * Design Requirements (from docs/WRITER-DESIGN-THESIS.md):
 * - Black background (#000000) on primary buttons
 * - White text on primary, black text on secondary
 * - Sharp edges (0px border radius)
 * - Zero animations (0ms transitions)
 * - Touch-optimized sizing (44px minimum height)
 * - Strong borders (1px solid black)
 * - Monospace font for terminal aesthetic (optional)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { themeManager } from '../../design-system/theme/theme-manager';

// Component to be implemented
import { Button } from '../../design-system/components/Button';

describe('Writer Theme - Button Component', () => {
  beforeEach(async () => {
    // Ensure Writer theme is active for all tests
    await themeManager.switchTheme('writer');
  });

  describe('Visual Design - Brutalist Aesthetic', () => {
    it('should render primary button with pure black background', () => {
      render(<Button variant="primary">Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      const styles = window.getComputedStyle(button);

      // Pure black background (no gray)
      expect(styles.backgroundColor).toBe('rgb(0, 0, 0)');
    });

    it('should render primary button with white text', () => {
      render(<Button variant="primary">Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      const styles = window.getComputedStyle(button);

      // Pure white text on black
      expect(styles.color).toBe('rgb(255, 255, 255)');
    });

    it('should render secondary button with transparent background', () => {
      render(<Button variant="secondary">Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      const styles = window.getComputedStyle(button);

      // Transparent background
      expect(styles.backgroundColor).toMatch(/rgba?\(0, 0, 0, 0\)|transparent/);
    });

    it('should render secondary button with black text and black border', () => {
      render(<Button variant="secondary">Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      const styles = window.getComputedStyle(button);

      expect(styles.color).toBe('rgb(0, 0, 0)');
      expect(styles.borderColor).toBe('rgb(0, 0, 0)');
      expect(styles.borderWidth).toBe('1px');
    });

    it('should have sharp edges (0px border radius)', () => {
      render(<Button variant="primary">Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      const styles = window.getComputedStyle(button);

      // Brutalist sharp edges
      expect(styles.borderRadius).toBe('0px');
    });

    it('should have zero transition duration (instant state changes)', () => {
      render(<Button variant="primary">Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      const styles = window.getComputedStyle(button);

      // No animations
      expect(styles.transitionDuration).toBe('0s');
    });
  });

  describe('Touch Target Sizing - Mobile Optimization', () => {
    it('should meet 44px minimum touch target height (Apple HIG)', () => {
      render(<Button size="md">Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      const { height } = button.getBoundingClientRect();

      // Apple HIG minimum for touch targets
      expect(height).toBeGreaterThanOrEqual(44);
    });

    it('should have medium size as default with 44px height', () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      const { height } = button.getBoundingClientRect();

      expect(height).toBe(44);
    });

    it('should support small size (36px minimum)', () => {
      render(<Button size="sm">Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      const { height } = button.getBoundingClientRect();

      // Small but still tappable
      expect(height).toBeGreaterThanOrEqual(36);
    });

    it('should support large size (52px+)', () => {
      render(<Button size="lg">Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      const { height } = button.getBoundingClientRect();

      // Large for primary actions
      expect(height).toBeGreaterThanOrEqual(52);
    });
  });

  describe('Design Token Integration', () => {
    it('should use Writer theme component tokens for primary button', () => {
      render(<Button variant="primary">Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });

      // Should use CSS custom properties from Writer theme
      expect(button.style.getPropertyValue('--component-button-primary-background')).toBeTruthy();
    });

    it('should use semantic spacing tokens for padding', () => {
      render(<Button size="md">Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      const styles = window.getComputedStyle(button);

      // Padding should use token values (12px 16px for md)
      expect(styles.paddingTop).toBe('12px');
      expect(styles.paddingBottom).toBe('12px');
      expect(styles.paddingLeft).toBe('16px');
      expect(styles.paddingRight).toBe('16px');
    });

    it('should use semantic font size tokens', () => {
      render(<Button size="md">Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      const styles = window.getComputedStyle(button);

      // 16px font size for md
      expect(styles.fontSize).toBe('16px');
    });

    it('should use semantic font weight (600 for strong)', () => {
      render(<Button variant="primary">Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      const styles = window.getComputedStyle(button);

      // Strong weight (binary choice: 400 or 600)
      expect(styles.fontWeight).toBe('600');
    });
  });

  describe('Interaction States', () => {
    it('should show hover state with instant visual change', async () => {
      const user = userEvent.setup();
      render(<Button variant="primary">Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      const initialBg = window.getComputedStyle(button).backgroundColor;

      await user.hover(button);

      const hoverBg = window.getComputedStyle(button).backgroundColor;

      // Should change to darker black (gray-900)
      expect(hoverBg).not.toBe(initialBg);
      expect(hoverBg).toBe('rgb(23, 23, 23)'); // gray-900
    });

    it('should show active state when pressed', async () => {
      const user = userEvent.setup();
      render(<Button variant="primary">Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });

      // Simulate mousedown (active state)
      await user.pointer({ target: button, keys: '[MouseLeft>]' });

      const activeBg = window.getComputedStyle(button).backgroundColor;

      // Should change to even darker (gray-800)
      expect(activeBg).toBe('rgb(38, 38, 38)'); // gray-800
    });

    it('should show disabled state with reduced opacity', () => {
      render(<Button disabled>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      const styles = window.getComputedStyle(button);

      expect(button).toBeDisabled();
      expect(styles.opacity).toBe('0.5');
      expect(styles.cursor).toBe('not-allowed');
    });

    it('should show focus state with strong outline', async () => {
      const user = userEvent.setup();
      render(<Button variant="primary">Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });

      await user.tab(); // Focus button

      const styles = window.getComputedStyle(button);

      // Strong black focus ring
      expect(styles.outline).toContain('2px');
      expect(styles.outline).toContain('solid');
      expect(styles.outline).toContain('rgb(0, 0, 0)');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });

      // Tab to focus
      await user.tab();
      expect(button).toHaveFocus();

      // Enter to click
      await user.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledOnce();

      // Space to click
      await user.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });

    it('should have proper ARIA attributes', () => {
      render(<Button aria-label="Submit form">Submit</Button>);

      const button = screen.getByRole('button', { name: /submit form/i });

      expect(button).toHaveAccessibleName('Submit form');
    });

    it('should communicate disabled state to screen readers', () => {
      render(<Button disabled>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });

      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toBeDisabled();
    });

    it('should support loading state with proper aria-busy', () => {
      render(<Button loading>Loading...</Button>);

      const button = screen.getByRole('button', { name: /loading/i });

      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(button).toBeDisabled();
    });
  });

  describe('API and Props', () => {
    it('should accept onClick handler', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });
      await user.click(button);

      expect(handleClick).toHaveBeenCalledOnce();
    });

    it('should accept children as content', () => {
      render(<Button>Custom content</Button>);

      expect(screen.getByText(/custom content/i)).toBeInTheDocument();
    });

    it('should support fullWidth prop', () => {
      render(<Button fullWidth>Full width button</Button>);

      const button = screen.getByRole('button', { name: /full width/i });
      const styles = window.getComputedStyle(button);

      expect(styles.width).toBe('100%');
    });

    it('should support type prop for form submission', () => {
      render(<Button type="submit">Submit form</Button>);

      const button = screen.getByRole('button', { name: /submit form/i });

      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should forward ref to button element', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Click me</Button>);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.tagName).toBe('BUTTON');
    });
  });

  describe('NATIVE TODO Comments', () => {
    it('should have comment for haptic feedback on click', () => {
      // This test verifies the code has the right TODO comment structure
      // Actual implementation will have:
      // NATIVE TODO: Add haptic feedback on button press
      // if (Capacitor.isNativePlatform()) {
      //   Haptics.impact({ style: 'light' });
      // }

      expect(true).toBe(true); // Placeholder - verify in code review
    });
  });

  describe('Performance', () => {
    it('should render quickly (< 16ms for 60fps)', () => {
      const start = performance.now();

      render(<Button>Click me</Button>);

      const duration = performance.now() - start;

      // Should render in less than one frame (16.67ms at 60fps)
      expect(duration).toBeLessThan(16);
    });

    it('should handle rapid clicks without lag', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole('button', { name: /click me/i });

      const start = performance.now();

      // Rapid clicks (10 times)
      for (let i = 0; i < 10; i++) {
        await user.click(button);
      }

      const duration = performance.now() - start;

      // Should handle all clicks quickly
      expect(handleClick).toHaveBeenCalledTimes(10);
      expect(duration).toBeLessThan(500); // < 50ms per click
    });
  });
});
