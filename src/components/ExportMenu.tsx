import { useState, useEffect } from 'react';
import type { Deck, Card, ExportFormat } from '../types';
import { textExportService } from '../services/export/text-export';
import { pdfExportService } from '../services/export/pdf-export';

interface ExportMenuProps {
  deck: Deck;
  cards: Card[];
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ExportMenu - Dialog for exporting decks to text or PDF format
 *
 * Features:
 * - Format selection (Text / PDF)
 * - Export button with loading state
 * - Web Share API integration for mobile
 * - Fallback to download for desktop
 * - Brutalist Writer theme styling
 * - Keyboard navigation (Escape to close)
 * - Accessibility (ARIA labels)
 */
export function ExportMenu({ deck, cards, isOpen, onClose }: ExportMenuProps) {
  const [format, setFormat] = useState<ExportFormat>('text');
  const [isExporting, setIsExporting] = useState(false);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setIsExporting(true);

      let result;
      if (format === 'text') {
        result = await textExportService.exportToText(deck, cards);
      } else {
        result = await pdfExportService.exportToPdf(deck, cards);
      }

      // Try Web Share API (mobile)
      if (navigator.share && navigator.canShare) {
        try {
          const file = new File([result.blob], result.filename, {
            type: result.blob.type
          });

          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: deck.title,
              text: `Export of ${deck.title}`
            });

            onClose();
            return;
          }
        } catch (shareError) {
          // Fall through to download
          console.log('Share failed, falling back to download:', shareError);
        }
      }

      // Fallback to download
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Export Deck"
        style={{
          background: '#ffffff',
          border: '1px solid #000000',
          padding: '24px',
          maxWidth: '400px',
          width: '90%'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <h2 style={{
          margin: '0 0 16px 0',
          fontSize: '20px',
          fontWeight: 'bold'
        }}>
          Export Deck
        </h2>

        {/* Format Selection */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
            Select Format:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="format"
                value="text"
                checked={format === 'text'}
                onChange={() => setFormat('text')}
                style={{ cursor: 'pointer' }}
              />
              <span>Text (.txt)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="format"
                value="pdf"
                checked={format === 'pdf'}
                onChange={() => setFormat('pdf')}
                style={{ cursor: 'pointer' }}
              />
              <span>PDF (.pdf)</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '8px',
          justifyContent: 'flex-end',
          marginTop: '24px'
        }}>
          <button
            onClick={onClose}
            disabled={isExporting}
            style={{
              background: 'transparent',
              color: '#000000',
              border: '1px solid #000000',
              padding: '8px 16px',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: isExporting ? 0.5 : 1
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleExport}
            disabled={isExporting}
            style={{
              background: '#000000',
              color: '#ffffff',
              border: '1px solid #000000',
              padding: '8px 16px',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: isExporting ? 0.5 : 1
            }}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}
