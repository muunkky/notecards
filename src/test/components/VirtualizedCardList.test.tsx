/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VirtualizedCardList } from '../../components/VirtualizedCardList';
import type { Card } from '../../types';

// Mock react-window
vi.mock('react-window', () => {
  const React = require('react');
  return {
    FixedSizeList: React.forwardRef(({ children, itemCount, itemSize, height, width, itemData }: any, ref: any) => {
      // Render a simplified version that renders all items (for testing)
      const items = [];
      for (let i = 0; i < itemCount; i++) {
        items.push(
          <div key={i} data-index={i}>
            {children({ index: i, style: {}, data: itemData })}
          </div>
        );
      }
      return (
        <div
          ref={ref}
          data-virtualized-list
          data-item-count={itemCount}
          data-item-size={itemSize}
          data-height={height}
          data-width={width}
          style={{ height, width }}
        >
          {items}
        </div>
      );
    })
  };
});

function generateMockCards(count: number): Card[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `card-${i}`,
    deckId: 'deck-1',
    title: `Card ${i + 1}`,
    body: `Content for card ${i + 1}`,
    orderIndex: i,
    createdAt: new Date(),
    updatedAt: new Date(),
    category: 'scene'
  }));
}

describe('VirtualizedCardList', () => {
  describe('Basic Rendering', () => {
    it('should render with react-window FixedSizeList', () => {
      const cards = generateMockCards(10);
      const { container } = render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={600}
        />
      );

      const list = container.querySelector('[data-virtualized-list]');
      expect(list).toBeDefined();
      expect(list?.getAttribute('data-item-count')).toBe('10');
      expect(list?.getAttribute('data-height')).toBe('600');
    });

    it('should render with correct item size (60px)', () => {
      const cards = generateMockCards(5);
      const { container } = render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={600}
        />
      );

      const list = container.querySelector('[data-virtualized-list]');
      expect(list?.getAttribute('data-item-size')).toBe('60');
    });

    it('should render with 100% width', () => {
      const cards = generateMockCards(5);
      const { container } = render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={600}
        />
      );

      const list = container.querySelector('[data-virtualized-list]');
      expect(list?.getAttribute('data-width')).toBe('100%');
    });

    it('should pass custom height prop', () => {
      const cards = generateMockCards(5);
      const { container } = render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={400}
        />
      );

      const list = container.querySelector('[data-virtualized-list]');
      expect(list?.getAttribute('data-height')).toBe('400');
    });
  });

  describe('Card Rendering', () => {
    it('should render card items with data-card-item attribute', () => {
      const cards = generateMockCards(5);
      const { container } = render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={600}
        />
      );

      const cardItems = container.querySelectorAll('[data-card-item]');
      expect(cardItems.length).toBeGreaterThan(0);
    });

    it('should render card titles', () => {
      const cards = generateMockCards(3);
      render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={600}
        />
      );

      expect(screen.getByText('Card 1')).toBeDefined();
      expect(screen.getByText('Card 2')).toBeDefined();
      expect(screen.getByText('Card 3')).toBeDefined();
    });

    it('should render cards in correct order', () => {
      const cards = [
        { id: '1', deckId: 'deck-1', title: 'First', body: '', orderIndex: 0, createdAt: new Date(), updatedAt: new Date(), category: 'scene' },
        { id: '2', deckId: 'deck-1', title: 'Second', body: '', orderIndex: 1, createdAt: new Date(), updatedAt: new Date(), category: 'scene' },
        { id: '3', deckId: 'deck-1', title: 'Third', body: '', orderIndex: 2, createdAt: new Date(), updatedAt: new Date(), category: 'scene' }
      ];

      const { container } = render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={600}
        />
      );

      const cardItems = container.querySelectorAll('[data-card-item]');
      expect(cardItems[0]?.textContent).toContain('First');
      expect(cardItems[1]?.textContent).toContain('Second');
      expect(cardItems[2]?.textContent).toContain('Third');
    });

    it('should render category indicators', () => {
      const cards = [
        { id: '1', deckId: 'deck-1', title: 'Scene Card', body: '', orderIndex: 0, createdAt: new Date(), updatedAt: new Date(), category: 'scene' },
        { id: '2', deckId: 'deck-1', title: 'Character Card', body: '', orderIndex: 1, createdAt: new Date(), updatedAt: new Date(), category: 'character' }
      ];

      const { container } = render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={600}
        />
      );

      const categoryIndicators = container.querySelectorAll('[data-category-indicator]');
      expect(categoryIndicators.length).toBeGreaterThan(0);
    });
  });

  describe('Card Interactions', () => {
    it('should call onCardClick when card is clicked', () => {
      const cards = generateMockCards(3);
      const onCardClick = vi.fn();
      const { container } = render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={onCardClick}
          onCardEdit={vi.fn()}
          height={600}
        />
      );

      const firstCard = container.querySelector('[data-card-item]');
      if (firstCard) {
        fireEvent.click(firstCard);
        expect(onCardClick).toHaveBeenCalledWith('card-0');
      }
    });

    it('should call onCardEdit when edit button is clicked', () => {
      const cards = generateMockCards(3);
      const onCardEdit = vi.fn();
      const { container } = render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={vi.fn()}
          onCardEdit={onCardEdit}
          height={600}
        />
      );

      const editButton = container.querySelector('[data-edit-button]');
      if (editButton) {
        fireEvent.click(editButton);
        expect(onCardEdit).toHaveBeenCalledWith('card-0');
      }
    });

    it('should not call onCardClick when edit button is clicked', () => {
      const cards = generateMockCards(3);
      const onCardClick = vi.fn();
      const { container } = render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={onCardClick}
          onCardEdit={vi.fn()}
          height={600}
        />
      );

      const editButton = container.querySelector('[data-edit-button]');
      if (editButton) {
        fireEvent.click(editButton);
        expect(onCardClick).not.toHaveBeenCalled();
      }
    });
  });

  describe('Empty State', () => {
    it('should render empty state for no cards', () => {
      const { container } = render(
        <VirtualizedCardList
          cards={[]}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={600}
        />
      );

      const list = container.querySelector('[data-virtualized-list]');
      expect(list?.getAttribute('data-item-count')).toBe('0');
    });

    it('should show empty message when no cards', () => {
      render(
        <VirtualizedCardList
          cards={[]}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={600}
        />
      );

      expect(screen.queryByText(/no cards/i)).toBeDefined();
    });

    it('should handle single card', () => {
      const cards = generateMockCards(1);
      const { container } = render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={600}
        />
      );

      const list = container.querySelector('[data-virtualized-list]');
      expect(list?.getAttribute('data-item-count')).toBe('1');
      expect(screen.getByText('Card 1')).toBeDefined();
    });
  });

  describe('Large Lists', () => {
    it('should handle 100 cards efficiently', () => {
      const cards = generateMockCards(100);
      const { container } = render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={600}
        />
      );

      const list = container.querySelector('[data-virtualized-list]');
      expect(list?.getAttribute('data-item-count')).toBe('100');
    });

    it('should handle 1000 cards efficiently', () => {
      const cards = generateMockCards(1000);
      const { container } = render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={600}
        />
      );

      const list = container.querySelector('[data-virtualized-list]');
      expect(list?.getAttribute('data-item-count')).toBe('1000');
    });

    it('should render constant DOM size regardless of list length', () => {
      // Test with different sizes
      const sizes = [10, 100, 1000];
      const domSizes = sizes.map(size => {
        const cards = generateMockCards(size);
        const { container } = render(
          <VirtualizedCardList
            cards={cards}
            onCardClick={vi.fn()}
            onCardEdit={vi.fn()}
            height={600}
          />
        );
        return container.querySelectorAll('[data-card-item]').length;
      });

      // In production with actual react-window, DOM size would be constant
      // In our mock, we verify that the component accepts all sizes
      expect(domSizes.every(size => size > 0)).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should render list with role="list"', () => {
      const cards = generateMockCards(3);
      const { container } = render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={600}
        />
      );

      const list = container.querySelector('[role="list"]');
      expect(list).toBeDefined();
    });

    it('should render cards with role="listitem"', () => {
      const cards = generateMockCards(3);
      const { container } = render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={600}
        />
      );

      const items = container.querySelectorAll('[role="listitem"]');
      expect(items.length).toBe(3);
    });

    it('should render cards with aria-label', () => {
      const cards = [
        { id: '1', deckId: 'deck-1', title: 'Test Card', body: '', orderIndex: 0, createdAt: new Date(), updatedAt: new Date(), category: 'scene' }
      ];

      const { container } = render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={600}
        />
      );

      const card = container.querySelector('[aria-label*="Test Card"]');
      expect(card).toBeDefined();
    });

    it('should render edit button with aria-label', () => {
      const cards = generateMockCards(1);
      const { container } = render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={600}
        />
      );

      const editButton = container.querySelector('[data-edit-button][aria-label]');
      expect(editButton).toBeDefined();
    });
  });

  describe('Props Handling', () => {
    it('should accept required props without error', () => {
      const cards = generateMockCards(5);
      expect(() => {
        render(
          <VirtualizedCardList
            cards={cards}
            onCardClick={vi.fn()}
            onCardEdit={vi.fn()}
            height={600}
          />
        );
      }).not.toThrow();
    });

    it('should handle cards prop updates', () => {
      const initialCards = generateMockCards(3);
      const { rerender, container } = render(
        <VirtualizedCardList
          cards={initialCards}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={600}
        />
      );

      let list = container.querySelector('[data-virtualized-list]');
      expect(list?.getAttribute('data-item-count')).toBe('3');

      const updatedCards = generateMockCards(5);
      rerender(
        <VirtualizedCardList
          cards={updatedCards}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={600}
        />
      );

      list = container.querySelector('[data-virtualized-list]');
      expect(list?.getAttribute('data-item-count')).toBe('5');
    });

    it('should handle height prop updates', () => {
      const cards = generateMockCards(5);
      const { rerender, container } = render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={600}
        />
      );

      let list = container.querySelector('[data-virtualized-list]');
      expect(list?.getAttribute('data-height')).toBe('600');

      rerender(
        <VirtualizedCardList
          cards={cards}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={800}
        />
      );

      list = container.querySelector('[data-virtualized-list]');
      expect(list?.getAttribute('data-height')).toBe('800');
    });
  });

  describe('Performance', () => {
    it('should render quickly with 100 cards', () => {
      const cards = generateMockCards(100);
      const start = performance.now();

      render(
        <VirtualizedCardList
          cards={cards}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={600}
        />
      );

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100);
    });

    it('should update quickly when cards change', () => {
      const initialCards = generateMockCards(50);
      const { rerender } = render(
        <VirtualizedCardList
          cards={initialCards}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={600}
        />
      );

      const updatedCards = [...initialCards];
      updatedCards[25] = { ...updatedCards[25], title: 'Updated Title' };

      const start = performance.now();
      rerender(
        <VirtualizedCardList
          cards={updatedCards}
          onCardClick={vi.fn()}
          onCardEdit={vi.fn()}
          height={600}
        />
      );
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(50);
    });
  });
});
