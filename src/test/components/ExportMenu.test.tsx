/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ExportMenu } from '../../components/ExportMenu';
import type { Deck, Card } from '../../types';

// Mock export services
vi.mock('../../services/export/text-export', () => ({
  textExportService: {
    exportToText: vi.fn()
  }
}));

vi.mock('../../services/export/pdf-export', () => ({
  pdfExportService: {
    exportToPdf: vi.fn()
  }
}));

describe('ExportMenu', () => {
  let mockDeck: Deck;
  let mockCards: Card[];
  let mockOnClose: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockDeck = {
      id: 'deck-1',
      title: 'Test Deck',
      ownerId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      cardCount: 2
    };

    mockCards = [
      {
        id: 'card-1',
        deckId: 'deck-1',
        title: 'Card 1',
        body: 'Content 1',
        orderIndex: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'card-2',
        deckId: 'deck-1',
        title: 'Card 2',
        body: 'Content 2',
        orderIndex: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    mockOnClose = vi.fn();

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render export menu when open', () => {
      render(<ExportMenu deck={mockDeck} cards={mockCards} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText(/export/i)).toBeInTheDocument();
    });

    it('should not render when closed', () => {
      const { container } = render(<ExportMenu deck={mockDeck} cards={mockCards} isOpen={false} onClose={mockOnClose} />);

      expect(container.firstChild).toBeNull();
    });

    it('should show format selection options', () => {
      render(<ExportMenu deck={mockDeck} cards={mockCards} isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText(/text/i)).toBeInTheDocument();
      expect(screen.getByText(/pdf/i)).toBeInTheDocument();
    });

    it('should show export button', () => {
      render(<ExportMenu deck={mockDeck} cards={mockCards} isOpen={true} onClose={mockOnClose} />);

      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toBeInTheDocument();
    });

    it('should show close button', () => {
      render(<ExportMenu deck={mockDeck} cards={mockCards} isOpen={true} onClose={mockOnClose} />);

      const closeButton = screen.getByRole('button', { name: /cancel|close/i });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Format Selection', () => {
    it('should have text format selected by default', () => {
      render(<ExportMenu deck={mockDeck} cards={mockCards} isOpen={true} onClose={mockOnClose} />);

      const textOption = screen.getByRole('radio', { name: /text/i });
      expect(textOption).toBeChecked();
    });

    it('should allow selecting PDF format', () => {
      render(<ExportMenu deck={mockDeck} cards={mockCards} isOpen={true} onClose={mockOnClose} />);

      const pdfOption = screen.getByRole('radio', { name: /pdf/i });
      fireEvent.click(pdfOption);

      expect(pdfOption).toBeChecked();
    });
  });

  describe('Export Actions', () => {
    it('should call onClose when cancel button is clicked', () => {
      render(<ExportMenu deck={mockDeck} cards={mockCards} isOpen={true} onClose={mockOnClose} />);

      const cancelButton = screen.getByRole('button', { name: /cancel|close/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should show loading state during export', async () => {
      const { textExportService } = await import('../../services/export/text-export');

      // Make export take some time
      vi.mocked(textExportService.exportToText).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          blob: new Blob(['test'], { type: 'text/plain' }),
          filename: 'test.txt',
          text: 'test'
        }), 100))
      );

      render(<ExportMenu deck={mockDeck} cards={mockCards} isOpen={true} onClose={mockOnClose} />);

      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);

      // Should show loading state
      expect(exportButton).toBeDisabled();
    });

    it('should close menu after successful export', async () => {
      const { textExportService } = await import('../../services/export/text-export');

      vi.mocked(textExportService.exportToText).mockResolvedValue({
        blob: new Blob(['test'], { type: 'text/plain' }),
        filename: 'test.txt',
        text: 'test'
      });

      render(<ExportMenu deck={mockDeck} cards={mockCards} isOpen={true} onClose={mockOnClose} />);

      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ExportMenu deck={mockDeck} cards={mockCards} isOpen={true} onClose={mockOnClose} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-label');
    });

    it('should support keyboard navigation with Escape', () => {
      render(<ExportMenu deck={mockDeck} cards={mockCards} isOpen={true} onClose={mockOnClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
