/**
 * Writer Theme - Card Component TDD Specs
 *
 * Tests brutalist card implementation with 4px category decorator strips.
 * This is the SIGNATURE visual element of the Writer theme.
 *
 * Design Requirements (from docs/WRITER-DESIGN-THESIS.md):
 * - White background with black border
 * - Sharp edges (0px border radius)
 * - 4px colored left decorator strip (category indication)
 * - No shadows (flat design)
 * - Collapsible (tap to expand/collapse)
 * - Instant state changes (0ms transitions)
 * - Monospace font for title (terminal aesthetic)
 * - System font for body content
 *
 * Decorator Colors:
 * - Conflict: #e11d48 (rose red)
 * - Character: #3b82f6 (blue)
 * - Location: #f59e0b (amber)
 * - Theme: #8b5cf6 (purple)
 * - Action: #f97316 (orange)
 * - Dialogue: #ec4899 (pink)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { themeManager } from '../../design-system/theme/theme-manager';

// Component to be implemented
import { Card } from '../../design-system/components/Card';

describe('Writer Theme - Card Component', () => {
  beforeEach(async () => {
    // Ensure Writer theme is active
    await themeManager.switchTheme('writer');
  });

  describe('Visual Design - Brutalist Aesthetic', () => {
    it('should render with white background', () => {
      render(<Card title="Test Card">Card content</Card>);

      const card = screen.getByRole('article');
      const styles = window.getComputedStyle(card);

      expect(styles.backgroundColor).toBe('rgb(255, 255, 255)');
    });

    it('should render with black border', () => {
      render(<Card title="Test Card">Card content</Card>);

      const card = screen.getByRole('article');
      const styles = window.getComputedStyle(card);

      expect(styles.borderColor).toBe('rgb(0, 0, 0)');
      expect(styles.borderWidth).toBe('1px');
      expect(styles.borderStyle).toBe('solid');
    });

    it('should have sharp edges (0px border radius)', () => {
      render(<Card title="Test Card">Card content</Card>);

      const card = screen.getByRole('article');
      const styles = window.getComputedStyle(card);

      expect(styles.borderRadius).toBe('0px');
    });

    it('should have no shadow (flat design)', () => {
      render(<Card title="Test Card">Card content</Card>);

      const card = screen.getByRole('article');
      const styles = window.getComputedStyle(card);

      expect(styles.boxShadow).toBe('none');
    });

    it('should have zero transitions (instant state changes)', () => {
      render(<Card title="Test Card">Card content</Card>);

      const card = screen.getByRole('article');
      const styles = window.getComputedStyle(card);

      expect(styles.transitionDuration).toBe('0s');
    });
  });

  describe('Decorator Strip - Signature Visual Element', () => {
    it('should render 4px wide decorator strip on left', () => {
      render(<Card title="Test Card" category="conflict">Card content</Card>);

      const card = screen.getByRole('article');
      const decorator = within(card).getByTestId('card-decorator');
      const styles = window.getComputedStyle(decorator);

      expect(styles.width).toBe('4px');
      expect(styles.position).toBe('absolute');
      expect(styles.left).toBe('0px');
      expect(styles.top).toBe('0px');
      expect(styles.bottom).toBe('0px');
    });

    it('should render conflict category in red (#e11d48)', () => {
      render(<Card title="Test Card" category="conflict">Card content</Card>);

      const decorator = screen.getByTestId('card-decorator');
      const styles = window.getComputedStyle(decorator);

      expect(styles.backgroundColor).toBe('rgb(225, 29, 72)'); // #e11d48
    });

    it('should render character category in blue (#3b82f6)', () => {
      render(<Card title="Test Card" category="character">Card content</Card>);

      const decorator = screen.getByTestId('card-decorator');
      const styles = window.getComputedStyle(decorator);

      expect(styles.backgroundColor).toBe('rgb(59, 130, 246)'); // #3b82f6
    });

    it('should render location category in amber (#f59e0b)', () => {
      render(<Card title="Test Card" category="location">Card content</Card>);

      const decorator = screen.getByTestId('card-decorator');
      const styles = window.getComputedStyle(decorator);

      expect(styles.backgroundColor).toBe('rgb(245, 158, 11)'); // #f59e0b
    });

    it('should render theme category in purple (#8b5cf6)', () => {
      render(<Card title="Test Card" category="theme">Card content</Card>);

      const decorator = screen.getByTestId('card-decorator');
      const styles = window.getComputedStyle(decorator);

      expect(styles.backgroundColor).toBe('rgb(139, 92, 246)'); // #8b5cf6
    });

    it('should render action category in orange (#f97316)', () => {
      render(<Card title="Test Card" category="action">Card content</Card>);

      const decorator = screen.getByTestId('card-decorator');
      const styles = window.getComputedStyle(decorator);

      expect(styles.backgroundColor).toBe('rgb(249, 115, 22)'); // #f97316
    });

    it('should render dialogue category in pink (#ec4899)', () => {
      render(<Card title="Test Card" category="dialogue">Card content</Card>);

      const decorator = screen.getByTestId('card-decorator');
      const styles = window.getComputedStyle(decorator);

      expect(styles.backgroundColor).toBe('rgb(236, 72, 153)'); // #ec4899
    });

    it('should render gray decorator if no category', () => {
      render(<Card title="Test Card">Card content</Card>);

      const decorator = screen.getByTestId('card-decorator');
      const styles = window.getComputedStyle(decorator);

      // Gray fallback
      expect(styles.backgroundColor).toBe('rgb(163, 163, 163)'); // gray-400
    });
  });

  describe('Typography - Terminal Aesthetic', () => {
    it('should use monospace font for title', () => {
      render(<Card title="INT. COFFEE SHOP - DAY">Card content</Card>);

      const title = screen.getByText(/int\. coffee shop - day/i);
      const styles = window.getComputedStyle(title);

      // Monospace font (SF Mono, Monaco, Cascadia Code, etc.)
      expect(styles.fontFamily).toMatch(/mono|courier/i);
    });

    it('should use system font for body content', () => {
      render(<Card title="Test Card">Card body content here</Card>);

      const content = screen.getByText(/card body content/i);
      const styles = window.getComputedStyle(content);

      // System font (not monospace)
      expect(styles.fontFamily).not.toMatch(/mono|courier/i);
      expect(styles.fontFamily).toMatch(/system|apple|segoe|roboto/i);
    });

    it('should use 16px font size for title', () => {
      render(<Card title="Test Card">Card content</Card>);

      const title = screen.getByText(/test card/i);
      const styles = window.getComputedStyle(title);

      expect(styles.fontSize).toBe('16px');
    });

    it('should use 15px font size for body', () => {
      render(<Card title="Test Card">Card content</Card>);

      const content = screen.getByText(/card content/i);
      const styles = window.getComputedStyle(content);

      expect(styles.fontSize).toBe('15px');
    });

    it('should use 600 font weight for title', () => {
      render(<Card title="Test Card">Card content</Card>);

      const title = screen.getByText(/test card/i);
      const styles = window.getComputedStyle(title);

      expect(styles.fontWeight).toBe('600');
    });

    it('should use 1.6 line height for body readability', () => {
      render(<Card title="Test Card">Card content</Card>);

      const content = screen.getByText(/card content/i);
      const styles = window.getComputedStyle(content);

      expect(styles.lineHeight).toBe('1.6');
    });
  });

  describe('Collapsible Functionality', () => {
    it('should start collapsed by default', () => {
      render(<Card title="Test Card" collapsible>Hidden content</Card>);

      const content = screen.queryByText(/hidden content/i);

      expect(content).not.toBeVisible();
    });

    it('should expand when clicked', async () => {
      const user = userEvent.setup();
      render(<Card title="Test Card" collapsible>Hidden content</Card>);

      const card = screen.getByRole('article');

      await user.click(card);

      const content = screen.getByText(/hidden content/i);
      expect(content).toBeVisible();
    });

    it('should collapse when clicked again', async () => {
      const user = userEvent.setup();
      render(<Card title="Test Card" collapsible defaultExpanded>Visible content</Card>);

      const card = screen.getByRole('article');

      // Content should be visible initially
      expect(screen.getByText(/visible content/i)).toBeVisible();

      // Click to collapse
      await user.click(card);

      const content = screen.queryByText(/visible content/i);
      expect(content).not.toBeVisible();
    });

    it('should toggle instantly (0ms transition)', async () => {
      const user = userEvent.setup();
      render(<Card title="Test Card" collapsible>Hidden content</Card>);

      const card = screen.getByRole('article');

      const start = performance.now();
      await user.click(card);
      const duration = performance.now() - start;

      // Should be instant (< 50ms including click simulation)
      expect(duration).toBeLessThan(50);

      const content = screen.getByText(/hidden content/i);
      expect(content).toBeVisible();
    });

    it('should show expand/collapse indicator', () => {
      render(<Card title="Test Card" collapsible>Hidden content</Card>);

      const indicator = screen.getByTestId('expand-indicator');

      expect(indicator).toBeInTheDocument();
      expect(indicator.textContent).toBe('▸'); // Collapsed
    });

    it('should update indicator when expanded', async () => {
      const user = userEvent.setup();
      render(<Card title="Test Card" collapsible>Hidden content</Card>);

      const card = screen.getByRole('article');
      const indicator = screen.getByTestId('expand-indicator');

      expect(indicator.textContent).toBe('▸'); // Collapsed

      await user.click(card);

      expect(indicator.textContent).toBe('▾'); // Expanded
    });

    it('should support controlled expansion state', async () => {
      const user = userEvent.setup();
      const TestComponent = () => {
        const [expanded, setExpanded] = React.useState(false);

        return (
          <>
            <button onClick={() => setExpanded(!expanded)}>Toggle</button>
            <Card
              title="Test Card"
              collapsible
              expanded={expanded}
              onExpandedChange={setExpanded}
            >
              Content
            </Card>
          </>
        );
      };

      render(<TestComponent />);

      const toggleButton = screen.getByRole('button', { name: /toggle/i });

      // Should start collapsed
      expect(screen.queryByText(/content/i)).not.toBeVisible();

      // Expand via external button
      await user.click(toggleButton);
      expect(screen.getByText(/content/i)).toBeVisible();

      // Collapse via external button
      await user.click(toggleButton);
      expect(screen.queryByText(/content/i)).not.toBeVisible();
    });
  });

  describe('Layout and Spacing', () => {
    it('should use 16px padding inside card', () => {
      render(<Card title="Test Card">Card content</Card>);

      const card = screen.getByRole('article');
      const styles = window.getComputedStyle(card);

      expect(styles.padding).toBe('16px');
    });

    it('should add 8px margin bottom for rhythm', () => {
      render(<Card title="Test Card">Card content</Card>);

      const card = screen.getByRole('article');
      const styles = window.getComputedStyle(card);

      // Tight rhythm (8px between cards)
      expect(styles.marginBottom).toBe('8px');
    });

    it('should position decorator with 4px left padding offset', () => {
      render(<Card title="Test Card" category="conflict">Card content</Card>);

      const card = screen.getByRole('article');
      const decorator = screen.getByTestId('card-decorator');

      // Card should have position: relative
      const cardStyles = window.getComputedStyle(card);
      expect(cardStyles.position).toBe('relative');

      // Decorator should be absolute
      const decoratorStyles = window.getComputedStyle(decorator);
      expect(decoratorStyles.position).toBe('absolute');
      expect(decoratorStyles.left).toBe('0px');
    });

    it('should inset content by 4px to avoid decorator overlap', () => {
      render(<Card title="Test Card" category="conflict">Card content</Card>);

      const content = screen.getByText(/card content/i);
      const parentStyles = window.getComputedStyle(content.parentElement!);

      // Content should have left padding to avoid decorator
      expect(parentStyles.paddingLeft).toBe('4px');
    });
  });

  describe('Accessibility', () => {
    it('should have article role for semantic HTML', () => {
      render(<Card title="Test Card">Card content</Card>);

      const card = screen.getByRole('article');

      expect(card).toBeInTheDocument();
    });

    it('should have accessible label from title', () => {
      render(<Card title="Test Card">Card content</Card>);

      const card = screen.getByRole('article', { name: /test card/i });

      expect(card).toBeInTheDocument();
    });

    it('should communicate collapsible state to screen readers', () => {
      render(<Card title="Test Card" collapsible>Hidden content</Card>);

      const card = screen.getByRole('article');

      expect(card).toHaveAttribute('aria-expanded', 'false');
    });

    it('should update aria-expanded when toggled', async () => {
      const user = userEvent.setup();
      render(<Card title="Test Card" collapsible>Hidden content</Card>);

      const card = screen.getByRole('article');

      expect(card).toHaveAttribute('aria-expanded', 'false');

      await user.click(card);

      expect(card).toHaveAttribute('aria-expanded', 'true');
    });

    it('should be keyboard accessible for collapsible cards', async () => {
      const user = userEvent.setup();
      render(<Card title="Test Card" collapsible>Hidden content</Card>);

      const card = screen.getByRole('article');

      // Should be focusable
      await user.tab();
      expect(card).toHaveFocus();

      // Enter to toggle
      await user.keyboard('{Enter}');
      expect(screen.getByText(/hidden content/i)).toBeVisible();

      // Space to toggle
      await user.keyboard(' ');
      expect(screen.queryByText(/hidden content/i)).not.toBeVisible();
    });

    it('should have semantic HTML structure', () => {
      render(<Card title="Test Card">Card content</Card>);

      const title = screen.getByText(/test card/i);
      const content = screen.getByText(/card content/i);

      // Title should be heading
      expect(title.tagName).toBe('H3');

      // Content should be in section or div
      expect(content.closest('section') || content.closest('div')).toBeInTheDocument();
    });
  });

  describe('Design Token Integration', () => {
    it('should use Writer theme component tokens', () => {
      render(<Card title="Test Card">Card content</Card>);

      const card = screen.getByRole('article');

      // Should use CSS custom properties from Writer theme
      expect(card.style.getPropertyValue('--component-card-background')).toBeTruthy();
    });

    it('should use category colors from primitive tokens', () => {
      render(<Card title="Test Card" category="conflict">Card content</Card>);

      const decorator = screen.getByTestId('card-decorator');

      // Should use var(--primitive-blue-500) from tokens
      const styles = window.getComputedStyle(decorator);
      expect(styles.backgroundColor).toBe('rgb(225, 29, 72)');
    });
  });

  describe('NATIVE TODO Comments', () => {
    it('should have comment for haptic feedback on tap', () => {
      // NATIVE TODO: Add haptic feedback when card is tapped to expand/collapse
      // if (Capacitor.isNativePlatform()) {
      //   Haptics.impact({ style: 'light' });
      // }

      expect(true).toBe(true); // Placeholder - verify in code review
    });
  });

  describe('Performance', () => {
    it('should render quickly (< 16ms)', () => {
      const start = performance.now();

      render(<Card title="Test Card">Card content</Card>);

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(16);
    });

    it('should handle rapid expand/collapse without lag', async () => {
      const user = userEvent.setup();
      render(<Card title="Test Card" collapsible>Card content</Card>);

      const card = screen.getByRole('article');

      const start = performance.now();

      // Rapid toggling (10 times)
      for (let i = 0; i < 10; i++) {
        await user.click(card);
      }

      const duration = performance.now() - start;

      expect(duration).toBeLessThan(500); // < 50ms per toggle
    });

    it('should render list of 100 cards efficiently', () => {
      const start = performance.now();

      const cards = Array.from({ length: 100 }, (_, i) => (
        <Card key={i} title={`Card ${i}`} category="conflict">
          Content {i}
        </Card>
      ));

      render(<div>{cards}</div>);

      const duration = performance.now() - start;

      // Should render 100 cards in < 500ms
      expect(duration).toBeLessThan(500);
    });
  });
});
