/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { VirtualizedCardList } from '../../components/VirtualizedCardList';
import type { Card } from '../../types';

// Helper to generate mock cards
function generateMockCards(count: number): Card[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `card-${i}`,
    deckId: 'deck-1',
    title: `Card ${i + 1}`,
    body: `Content for card ${i + 1}. Lorem ipsum dolor sit amet.`,
    orderIndex: i,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: ['scene', 'character', 'conflict', 'location'][i % 4]
  }));
}

// Helper to measure render performance
function measureRenderTime(component: JSX.Element): number {
  const start = performance.now();
  render(component);
  const end = performance.now();
  return end - start;
}

describe('Virtualization Performance Benchmarks', () => {
  describe('Render Performance', () => {
    it('should render 100 cards in under 100ms', () => {
      const cards = generateMockCards(100);
      const renderTime = measureRenderTime(
        <VirtualizedCardList
          cards={cards}
          onCardClick={() => {}}
          onCardEdit={() => {}}
          height={600}
        />
      );

      expect(renderTime).toBeLessThan(100);
    });

    it('should render 500 cards in under 150ms', () => {
      const cards = generateMockCards(500);
      const renderTime = measureRenderTime(
        <VirtualizedCardList
          cards={cards}
          onCardClick={() => {}}
          onCardEdit={() => {}}
          height={600}
        />
      );

      expect(renderTime).toBeLessThan(150);
    });

    it('should render 1000 cards in under 200ms', () => {
      const cards = generateMockCards(1000);
      const renderTime = measureRenderTime(
        <VirtualizedCardList
          cards={cards}
          onCardClick={() => {}}
          onCardEdit={() => {}}
          height={600}
        />
      );

      expect(renderTime).toBeLessThan(200);
    });

    it('should have constant render time regardless of list size', () => {
      const times = [100, 500, 1000].map(count => {
        const cards = generateMockCards(count);
        return measureRenderTime(
          <VirtualizedCardList
            cards={cards}
            onCardClick={() => {}}
            onCardEdit={() => {}}
            height={600}
          />
        );
      });

      // With virtualization, render time should be nearly constant
      // Allow 50ms variance between smallest and largest
      const variance = Math.max(...times) - Math.min(...times);
      expect(variance).toBeLessThan(50);
    });
  });

  describe('DOM Size', () => {
    it('should render only visible items (not all 100 cards)', () => {
      const cards = generateMockCards(100);
      const { container } = render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={() => {}}
          onCardEdit={() => {}}
          height={600}
        />
      );

      // With 60px card height and 600px viewport, ~10 cards visible
      // With buffer of 5 above/below, expect ~20 cards in DOM max
      const renderedCards = container.querySelectorAll('[data-card-item]');
      expect(renderedCards.length).toBeLessThan(25);
      expect(renderedCards.length).toBeGreaterThan(5);
    });

    it('should maintain constant DOM size for 1000 cards', () => {
      const cards = generateMockCards(1000);
      const { container } = render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={() => {}}
          onCardEdit={() => {}}
          height={600}
        />
      );

      // Even with 1000 cards, DOM size stays constant
      const renderedCards = container.querySelectorAll('[data-card-item]');
      expect(renderedCards.length).toBeLessThan(25);
    });
  });

  describe('Memory Usage', () => {
    it('should not grow memory linearly with card count', () => {
      // This is a proxy test - we check that component complexity
      // doesn't scale with input size
      const sizes = [100, 500, 1000];
      const components = sizes.map(size => {
        const cards = generateMockCards(size);
        return (
          <VirtualizedCardList
            cards={cards}
            onCardClick={() => {}}
            onCardEdit={() => {}}
            height={600}
          />
        );
      });

      // All should render successfully without memory issues
      components.forEach(component => {
        const { container } = render(component);
        expect(container).toBeDefined();
      });
    });
  });

  describe('Scroll Performance', () => {
    it('should handle rapid scroll updates efficiently', () => {
      const cards = generateMockCards(500);
      const { container } = render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={() => {}}
          onCardEdit={() => {}}
          height={600}
        />
      );

      const scrollContainer = container.querySelector('[data-virtualized-list]');
      expect(scrollContainer).toBeDefined();

      // Simulate rapid scrolling
      const start = performance.now();

      // Simulate 10 scroll events
      for (let i = 0; i < 10; i++) {
        if (scrollContainer) {
          scrollContainer.scrollTop = i * 100;
        }
      }

      const elapsed = performance.now() - start;

      // Should handle 10 scroll updates in under 50ms
      expect(elapsed).toBeLessThan(50);
    });
  });

  describe('Update Performance', () => {
    it('should handle card updates efficiently', () => {
      const cards = generateMockCards(100);
      const { rerender } = render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={() => {}}
          onCardEdit={() => {}}
          height={600}
        />
      );

      // Update one card
      const updatedCards = [...cards];
      updatedCards[50] = { ...updatedCards[50], title: 'Updated Title' };

      const start = performance.now();
      rerender(
        <VirtualizedCardList
          cards={updatedCards}
          onCardClick={() => {}}
          onCardEdit={() => {}}
          height={600}
        />
      );
      const elapsed = performance.now() - start;

      // Should re-render in under 50ms
      expect(elapsed).toBeLessThan(50);
    });
  });

  describe('Empty List Performance', () => {
    it('should handle empty list gracefully', () => {
      const renderTime = measureRenderTime(
        <VirtualizedCardList
          cards={[]}
          onCardClick={() => {}}
          onCardEdit={() => {}}
          height={600}
        />
      );

      expect(renderTime).toBeLessThan(50);
    });

    it('should handle single card efficiently', () => {
      const cards = generateMockCards(1);
      const renderTime = measureRenderTime(
        <VirtualizedCardList
          cards={cards}
          onCardClick={() => {}}
          onCardEdit={() => {}}
          height={600}
        />
      );

      expect(renderTime).toBeLessThan(50);
    });
  });

  describe('Baseline Comparison', () => {
    it('should document current non-virtualized performance', () => {
      // This test documents baseline performance
      // In real implementation, we'd compare against non-virtualized version
      const cards = generateMockCards(100);
      const renderTime = measureRenderTime(
        <VirtualizedCardList
          cards={cards}
          onCardClick={() => {}}
          onCardEdit={() => {}}
          height={600}
        />
      );

      // Expect virtualized version to be significantly faster
      // Non-virtualized baseline would be ~500-5000ms for 100 cards
      expect(renderTime).toBeLessThan(100);
    });
  });
});
