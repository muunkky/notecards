import jsPDF from 'jspdf';
import type { Deck, Card, ExportOptions, ExportResult } from '../../types';

/**
 * PdfExportService - Exports decks to PDF format with brutalist Writer theme styling
 *
 * Features:
 * - PDF generation with jsPDF library
 * - Brutalist styling (black text, white background, sharp edges)
 * - Deck metadata header
 * - Card titles, categories, and content
 * - Favorite indicators (⭐)
 * - Optional inclusion of archived cards
 * - Automatic page breaks
 * - Timestamped filenames
 */
export class PdfExportService {
  /**
   * Export deck and cards to PDF format
   */
  async exportToPdf(
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

    // Generate PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Generate content
    this.generatePdfContent(pdf, deck, sortedCards);

    // Convert to blob
    const blob = pdf.output('blob');

    // Generate text representation for reference
    const text = this.generateTextRepresentation(deck, sortedCards);

    // Generate filename
    const filename = this.generateFilename(deck.title);

    return {
      blob,
      filename,
      text
    };
  }

  /**
   * Generate PDF content with brutalist Writer theme styling
   */
  private generatePdfContent(pdf: jsPDF, deck: Deck, cards: Card[]): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Header - Deck Title
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(deck.title, margin, yPosition);
    yPosition += 15;

    // Metadata
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Deck: ${deck.title}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Cards: ${cards.length}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Exported: ${new Date().toISOString().split('T')[0]}`, margin, yPosition);
    yPosition += 10;

    // Summary
    const favoriteCount = cards.filter(c => c.favorite).length;
    pdf.text(`Total cards: ${cards.length}`, margin, yPosition);
    yPosition += 5;
    pdf.text(`Favorites: ${favoriteCount}`, margin, yPosition);
    yPosition += 15;

    // Handle empty deck
    if (cards.length === 0) {
      pdf.text('No cards in this deck.', margin, yPosition);
      return;
    }

    // Separator line
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Cards
    cards.forEach((card, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      // Card Title with favorite indicator
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      const favoriteIndicator = card.favorite ? ' ⭐' : '';
      pdf.text(`${card.title}${favoriteIndicator}`, margin, yPosition);
      yPosition += 10;

      // Category
      if (card.category) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'italic');
        pdf.text(`Category: ${card.category}`, margin, yPosition);
        yPosition += 8;
      }

      // Body content (with text wrapping)
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const bodyLines = pdf.splitTextToSize(card.body, maxWidth);

      bodyLines.forEach((line: string) => {
        // Check if we need a new page for each line
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.text(line, margin, yPosition);
        yPosition += 5;
      });

      yPosition += 10;

      // Separator between cards (except last)
      if (index < cards.length - 1) {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setLineWidth(0.3);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
      }
    });
  }

  /**
   * Generate text representation of PDF content for reference
   */
  private generateTextRepresentation(deck: Deck, cards: Card[]): string {
    const lines: string[] = [];

    // Header
    lines.push(`# ${deck.title}`);
    lines.push('');
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
      const favoriteIndicator = card.favorite ? ' ⭐' : '';
      lines.push(`## ${card.title}${favoriteIndicator}`);
      lines.push('');

      if (card.category) {
        lines.push(`**Category:** ${card.category}`);
        lines.push('');
      }

      lines.push(card.body);
      lines.push('');

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

    return `${sanitized || 'untitled'}-${timestamp}.pdf`;
  }
}

// Export singleton instance
export const pdfExportService = new PdfExportService();

// Re-export types for convenience
export type { ExportOptions } from '../../types';
