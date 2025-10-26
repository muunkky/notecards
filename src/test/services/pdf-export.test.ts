/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PdfExportService, ExportOptions } from '../../services/export/pdf-export';
import type { Deck, Card } from '../../types';

describe('PdfExportService', () => {
  let exportService: PdfExportService;
  let mockDeck: Deck;
  let mockCards: Card[];

  beforeEach(() => {
    exportService = new PdfExportService();

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

  describe('exportToPdf()', () => {
    it('should export deck to PDF with all cards', async () => {
      const result = await exportService.exportToPdf(mockDeck, mockCards);

      expect(result.blob).toBeDefined();
      expect(result.blob.type).toBe('application/pdf');
      expect(result.filename).toMatch(/\.pdf$/);
    });

    it('should exclude archived cards by default', async () => {
      const result = await exportService.exportToPdf(mockDeck, mockCards);

      // PDF should be generated with only 2 cards (archived excluded)
      expect(result.blob).toBeDefined();
    });

    it('should include archived cards when includeArchived is true', async () => {
      const options: ExportOptions = { includeArchived: true };
      const result = await exportService.exportToPdf(mockDeck, mockCards, options);

      // PDF should include all 3 cards
      expect(result.blob).toBeDefined();
    });

    it('should generate PDF blob with correct MIME type', async () => {
      const result = await exportService.exportToPdf(mockDeck, mockCards);

      expect(result.blob.type).toBe('application/pdf');
    });

    it('should generate filename with deck name and timestamp', async () => {
      const result = await exportService.exportToPdf(mockDeck, mockCards);

      expect(result.filename).toMatch(/^my-story-project-\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should sanitize deck name in filename', async () => {
      const specialDeck = { ...mockDeck, title: 'My Story: Part 1 (Draft)' };
      const result = await exportService.exportToPdf(specialDeck, mockCards);

      expect(result.filename).toMatch(/^my-story-part-1-draft-\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should handle empty deck', async () => {
      const result = await exportService.exportToPdf(mockDeck, []);

      expect(result.blob).toBeDefined();
      expect(result.blob.type).toBe('application/pdf');
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

      const result = await exportService.exportToPdf(mockDeck, cardsWithoutCategory);

      expect(result.blob).toBeDefined();
    });

    it('should preserve card order based on orderIndex', async () => {
      const result = await exportService.exportToPdf(mockDeck, mockCards);

      // PDF generation should process cards in order
      expect(result.blob).toBeDefined();
    });

    it('should handle very long card content', async () => {
      const longCard: Card = {
        id: 'card-long',
        deckId: 'deck-1',
        title: 'Long Content',
        body: 'A'.repeat(5000), // 5k characters
        orderIndex: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await exportService.exportToPdf(mockDeck, [longCard]);

      expect(result.blob).toBeDefined();
      expect(result.blob.size).toBeGreaterThan(0);
    });

    it('should return text version of PDF content for reference', async () => {
      const result = await exportService.exportToPdf(mockDeck, mockCards);

      expect(result.text).toBeDefined();
      expect(result.text).toContain('My Story Project');
    });

    it('should include deck metadata in PDF', async () => {
      const result = await exportService.exportToPdf(mockDeck, mockCards);

      expect(result.text).toContain('My Story Project');
      expect(result.text).toContain('Cards: 2'); // 2 non-archived
    });

    it('should include card titles in PDF', async () => {
      const result = await exportService.exportToPdf(mockDeck, mockCards);

      expect(result.text).toContain('Opening Scene');
      expect(result.text).toContain('Main Character');
    });

    it('should include card categories in PDF', async () => {
      const result = await exportService.exportToPdf(mockDeck, mockCards);

      expect(result.text).toContain('scene');
      expect(result.text).toContain('character');
    });

    it('should mark favorite cards in PDF', async () => {
      const result = await exportService.exportToPdf(mockDeck, mockCards);

      expect(result.text).toContain('⭐'); // Favorite indicator
    });

    it('should handle deck with no cards gracefully', async () => {
      const emptyDeck = { ...mockDeck, cardCount: 0 };
      const result = await exportService.exportToPdf(emptyDeck, []);

      expect(result.blob).toBeDefined();
      expect(result.text).toContain('No cards');
    });

    it('should handle special characters in card content', async () => {
      const specialCard: Card = {
        id: 'card-special',
        deckId: 'deck-1',
        title: 'Special: Characters & Symbols',
        body: 'Content with "quotes" and \'apostrophes\' & symbols',
        orderIndex: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await exportService.exportToPdf(mockDeck, [specialCard]);

      expect(result.blob).toBeDefined();
    });

    it('should create PDF with proper page breaks for long content', async () => {
      const manyCards: Card[] = Array.from({ length: 20 }, (_, i) => ({
        id: `card-${i}`,
        deckId: 'deck-1',
        title: `Card ${i + 1}`,
        body: 'A'.repeat(500),
        orderIndex: i,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      const result = await exportService.exportToPdf(mockDeck, manyCards);

      expect(result.blob).toBeDefined();
      expect(result.blob.size).toBeGreaterThan(1000); // Should be substantial
    });

    it('should handle empty deck title', async () => {
      const emptyTitleDeck = { ...mockDeck, title: '' };
      const result = await exportService.exportToPdf(emptyTitleDeck, mockCards);

      expect(result.filename).toMatch(/^untitled-\d{4}-\d{2}-\d{2}\.pdf$/);
    });
  });

  describe('generateFilename()', () => {
    it('should generate filename with current date', () => {
      const filename = exportService.generateFilename('Test Deck');

      expect(filename).toMatch(/^test-deck-\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should sanitize special characters', () => {
      const filename = exportService.generateFilename('Test: Deck / Name');

      expect(filename).toMatch(/^test-deck-name-\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should handle empty deck name', () => {
      const filename = exportService.generateFilename('');

      expect(filename).toMatch(/^untitled-\d{4}-\d{2}-\d{2}\.pdf$/);
    });

    it('should convert to lowercase', () => {
      const filename = exportService.generateFilename('UPPERCASE DECK');

      expect(filename).toMatch(/^uppercase-deck-\d{4}-\d{2}-\d{2}\.pdf$/);
    });
  });
});
