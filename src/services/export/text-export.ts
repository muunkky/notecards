import type { Deck, Card, ExportOptions, ExportResult } from '../../types';

/**
 * TextExportService - Exports decks to markdown/plain text format
 *
 * Features:
 * - Markdown-formatted output with deck metadata
 * - Card titles, categories, and content
 * - Favorite indicators (⭐)
 * - Optional inclusion of archived cards
 * - Timestamped filenames
 */
export class TextExportService {
  /**
   * Export deck and cards to text format
   */
  async exportToText(
    deck: Deck,
    cards: Card[],
    options: ExportOptions = {}
  ): Promise<ExportResult> {
    const { includeArchived = false } = options;

    // Filter archived cards if needed
    const filteredCards = includeArchived
      ? cards
      : cards.filter(card => !card.archived);

    // Sort by orderIndex
    const sortedCards = [...filteredCards].sort((a, b) => a.orderIndex - b.orderIndex);

    // Generate markdown content
    const text = this.generateMarkdown(deck, sortedCards);

    // Create blob
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });

    // Generate filename
    const filename = this.generateFilename(deck.title);

    return {
      blob,
      filename,
      text
    };
  }

  /**
   * Generate markdown content from deck and cards
   */
  private generateMarkdown(deck: Deck, cards: Card[]): string {
    const lines: string[] = [];

    // Header
    lines.push(`# ${deck.title}`);
    lines.push('');

    // Metadata
    lines.push(`**Deck:** ${deck.title}`);
    lines.push(`**Cards:** ${cards.length}`);
    lines.push(`**Exported:** ${new Date().toISOString().split('T')[0]}`);
    lines.push('');

    // Summary
    const favoriteCount = cards.filter(c => c.favorite).length;
    lines.push(`Total cards: ${cards.length}`);
    lines.push(`Favorites: ${favoriteCount}`);
    lines.push('');

    // Handle empty deck
    if (cards.length === 0) {
      lines.push('No cards in this deck.');
      return lines.join('\n');
    }

    lines.push('---');
    lines.push('');

    // Cards
    cards.forEach((card, index) => {
      // Card title with favorite indicator
      const favoriteIndicator = card.favorite ? ' ⭐' : '';
      lines.push(`## ${card.title}${favoriteIndicator}`);
      lines.push('');

      // Category
      if (card.category) {
        lines.push(`**Category:** ${card.category}`);
        lines.push('');
      }

      // Body content
      lines.push(card.body);
      lines.push('');

      // Separator between cards (except last)
      if (index < cards.length - 1) {
        lines.push('---');
        lines.push('');
      }
    });

    return lines.join('\n');
  }

  /**
   * Generate filename with sanitized deck name and timestamp
   */
  generateFilename(deckTitle: string): string {
    // Handle empty title
    if (!deckTitle || deckTitle.trim() === '') {
      deckTitle = 'untitled';
    }

    // Sanitize: lowercase, replace special chars with hyphens, remove duplicates
    const sanitized = deckTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') // Trim leading/trailing hyphens
      .replace(/-{2,}/g, '-');  // Replace multiple hyphens with single

    // Add timestamp
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    return `${sanitized || 'untitled'}-${timestamp}.txt`;
  }
}

// Export singleton instance
export const textExportService = new TextExportService();

// Re-export types for convenience
export type { ExportOptions } from '../../types';
