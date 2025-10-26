/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { TextExportService, ExportOptions } from '../../services/export/text-export';
import type { Deck, Card } from '../../types';

describe('TextExportService', () => {
  let exportService: TextExportService;
  let mockDeck: Deck;
  let mockCards: Card[];

  beforeEach(() => {
    exportService = new TextExportService();

    // Create mock deck
    mockDeck = {
      id: 'deck-1',
      title: 'My Story Project',
      ownerId: 'user-1',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-15T00:00:00Z'),
      cardCount: 3
    };

    // Create mock cards
    mockCards = [
      {
        id: 'card-1',
        deckId: 'deck-1',
        title: 'Opening Scene',
        body: 'The protagonist wakes up in a mysterious room.',
        orderIndex: 0,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-01T00:00:00Z'),
        category: 'scene'
      },
      {
        id: 'card-2',
        deckId: 'deck-1',
        title: 'Main Character',
        body: 'A detective with a troubled past.',
        orderIndex: 1,
        createdAt: new Date('2025-01-02T00:00:00Z'),
        updatedAt: new Date('2025-01-02T00:00:00Z'),
        category: 'character',
        favorite: true
      },
      {
        id: 'card-3',
        deckId: 'deck-1',
        title: 'Plot Twist',
        body: 'The detective realizes the villain is their former partner.',
        orderIndex: 2,
        createdAt: new Date('2025-01-03T00:00:00Z'),
        updatedAt: new Date('2025-01-03T00:00:00Z'),
        category: 'conflict',
        archived: true
      }
    ];
  });

  describe('exportToText()', () => {
    it('should export deck with all cards in markdown format', async () => {
      const result = await exportService.exportToText(mockDeck, mockCards);

      expect(result.text).toContain('# My Story Project');
      expect(result.text).toContain('## Opening Scene');
      expect(result.text).toContain('## Main Character');
      expect(result.text).toContain('## Plot Twist');
    });

    it('should include deck metadata in export', async () => {
      const result = await exportService.exportToText(mockDeck, mockCards);

      expect(result.text).toContain('**Deck:** My Story Project');
      expect(result.text).toContain('**Cards:** 3');
      expect(result.text).toContain('**Exported:**');
    });

    it('should include card categories in export', async () => {
      const result = await exportService.exportToText(mockDeck, mockCards);

      expect(result.text).toContain('**Category:** scene');
      expect(result.text).toContain('**Category:** character');
      expect(result.text).toContain('**Category:** conflict');
    });

    it('should mark favorite cards with indicator', async () => {
      const result = await exportService.exportToText(mockDeck, mockCards);

      expect(result.text).toContain('⭐'); // Favorite indicator
      expect(result.text).toMatch(/Main Character.*⭐/s);
    });

    it('should exclude archived cards by default', async () => {
      const result = await exportService.exportToText(mockDeck, mockCards);

      expect(result.text).toContain('Opening Scene');
      expect(result.text).toContain('Main Character');
      expect(result.text).not.toContain('Plot Twist'); // Archived card
    });

    it('should include archived cards when includeArchived is true', async () => {
      const options: ExportOptions = { includeArchived: true };
      const result = await exportService.exportToText(mockDeck, mockCards, options);

      expect(result.text).toContain('Opening Scene');
      expect(result.text).toContain('Main Character');
      expect(result.text).toContain('Plot Twist'); // Now included
    });

    it('should handle empty deck', async () => {
      const result = await exportService.exportToText(mockDeck, []);

      expect(result.text).toContain('# My Story Project');
      expect(result.text).toContain('No cards in this deck');
    });

    it('should handle cards without categories', async () => {
      const cardsWithoutCategory: Card[] = [
        {
          id: 'card-1',
          deckId: 'deck-1',
          title: 'Simple Card',
          body: 'Simple content',
          orderIndex: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const result = await exportService.exportToText(mockDeck, cardsWithoutCategory);

      expect(result.text).toContain('Simple Card');
      expect(result.text).not.toContain('**Category:**');
    });

    it('should preserve card order based on orderIndex', async () => {
      const result = await exportService.exportToText(mockDeck, mockCards);
      const text = result.text;

      const openingIndex = text.indexOf('Opening Scene');
      const characterIndex = text.indexOf('Main Character');

      expect(openingIndex).toBeLessThan(characterIndex);
    });

    it('should generate blob with correct MIME type', async () => {
      const result = await exportService.exportToText(mockDeck, mockCards);

      expect(result.blob.type).toBe('text/plain;charset=utf-8');
    });

    it('should generate filename with deck name and timestamp', async () => {
      const result = await exportService.exportToText(mockDeck, mockCards);

      expect(result.filename).toMatch(/^my-story-project-\d{4}-\d{2}-\d{2}\.txt$/);
    });

    it('should sanitize deck name in filename', async () => {
      const specialDeck = { ...mockDeck, title: 'My Story: Part 1 (Draft)' };
      const result = await exportService.exportToText(specialDeck, mockCards);

      expect(result.filename).toMatch(/^my-story-part-1-draft-\d{4}-\d{2}-\d{2}\.txt$/);
    });

    it('should handle very long card content', async () => {
      const longCard: Card = {
        id: 'card-long',
        deckId: 'deck-1',
        title: 'Long Content',
        body: 'A'.repeat(10000), // 10k characters
        orderIndex: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await exportService.exportToText(mockDeck, [longCard]);

      expect(result.text).toContain('A'.repeat(10000));
      expect(result.blob.size).toBeGreaterThan(10000);
    });

    it('should escape markdown special characters in card content', async () => {
      const specialCard: Card = {
        id: 'card-special',
        deckId: 'deck-1',
        title: 'Special Characters',
        body: '# This is not a heading\n* This is not a list',
        orderIndex: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await exportService.exportToText(mockDeck, [specialCard]);

      // Should preserve literal markdown characters in body
      expect(result.text).toContain('# This is not a heading');
    });

    it('should include card counts in summary', async () => {
      const result = await exportService.exportToText(mockDeck, mockCards);

      expect(result.text).toMatch(/Total cards: \d+/);
      expect(result.text).toMatch(/Favorites: \d+/);
    });

    it('should handle deck with no cards gracefully', async () => {
      const emptyDeck = { ...mockDeck, cardCount: 0 };
      const result = await exportService.exportToText(emptyDeck, []);

      expect(result.text).toContain('# My Story Project');
      expect(result.text).toContain('No cards');
      expect(result.blob).toBeDefined();
    });

    it('should format timestamps in human-readable format', async () => {
      const result = await exportService.exportToText(mockDeck, mockCards);

      // Should include formatted date
      expect(result.text).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    it('should include card body with proper formatting', async () => {
      const result = await exportService.exportToText(mockDeck, mockCards);

      expect(result.text).toContain('The protagonist wakes up in a mysterious room.');
      expect(result.text).toContain('A detective with a troubled past.');
    });

    it('should separate cards with visual dividers', async () => {
      const result = await exportService.exportToText(mockDeck, mockCards);

      // Should have some separation between cards (markdown horizontal rules or blank lines)
      expect(result.text).toMatch(/---/);
    });
  });

  describe('generateFilename()', () => {
    it('should generate filename with current date', () => {
      const filename = exportService.generateFilename('Test Deck');

      expect(filename).toMatch(/^test-deck-\d{4}-\d{2}-\d{2}\.txt$/);
    });

    it('should sanitize special characters', () => {
      const filename = exportService.generateFilename('Test: Deck / Name');

      expect(filename).toMatch(/^test-deck-name-\d{4}-\d{2}-\d{2}\.txt$/);
    });

    it('should handle empty deck name', () => {
      const filename = exportService.generateFilename('');

      expect(filename).toMatch(/^untitled-\d{4}-\d{2}-\d{2}\.txt$/);
    });

    it('should convert to lowercase', () => {
      const filename = exportService.generateFilename('UPPERCASE DECK');

      expect(filename).toMatch(/^uppercase-deck-\d{4}-\d{2}-\d{2}\.txt$/);
    });
  });
});
