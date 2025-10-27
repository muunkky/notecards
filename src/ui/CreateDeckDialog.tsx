/**
 * CreateDeckDialog - Modal for creating a new deck
 *
 * Simple modal following Writer brutalist design principles:
 * - Single input field for deck name
 * - Submit/Cancel actions
 * - Zero animations
 * - Black borders, white background
 *
 * Used by: DeckListScreen
 */

import * as React from 'react';
import { useState } from 'react';

export interface CreateDeckDialogProps {
  /** Callback when user cancels */
  onClose: () => void;

  /** Callback when user submits new deck name */
  onCreateDeck: (name: string) => Promise<void> | void;
}

export const CreateDeckDialog: React.FC<CreateDeckDialogProps> = ({
  onClose,
  onCreateDeck,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      setError('Deck name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onCreateDeck(name.trim());
      onClose();
    } catch (err) {
      setError('Failed to create deck. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Modal overlay styles (75% black scrim)
  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 'var(--semantic-spacing-md)', // 16px
  };

  // Dialog container styles
  const dialogStyles: React.CSSProperties = {
    background: 'var(--primitive-white)',
    border: '2px solid var(--primitive-black)',
    borderRadius: 'var(--primitive-radii-none)', // 0px
    padding: 'var(--semantic-spacing-lg)', // 24px
    maxWidth: '400px',
    width: '100%',
    transition: 'var(--primitive-transitions-none)', // 0ms
  };

  // Title styles
  const titleStyles: React.CSSProperties = {
    fontFamily: 'var(--semantic-typography-font-title)', // Monospace
    fontSize: 'var(--semantic-typography-font-size-lg)', // 18px
    fontWeight: 600,
    color: 'var(--primitive-black)',
    marginBottom: 'var(--semantic-spacing-md)', // 16px
    letterSpacing: '0.05em',
  };

  // Input styles
  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: 'var(--semantic-spacing-sm)', // 12px
    fontFamily: 'var(--semantic-typography-font-primary)',
    fontSize: 'var(--semantic-typography-font-size-md)', // 16px
    border: '1px solid var(--primitive-black)',
    borderRadius: 'var(--primitive-radii-none)', // 0px
    marginBottom: 'var(--semantic-spacing-md)', // 16px
    outline: 'none',
    transition: 'var(--primitive-transitions-none)', // 0ms
    boxSizing: 'border-box',
  };

  // Error message styles
  const errorStyles: React.CSSProperties = {
    color: 'var(--primitive-red-600)',
    fontSize: 'var(--semantic-typography-font-size-sm)', // 14px
    marginTop: 'calc(-1 * var(--semantic-spacing-sm))', // -8px
    marginBottom: 'var(--semantic-spacing-sm)', // 8px
    fontFamily: 'var(--semantic-typography-font-primary)',
  };

  // Button container styles
  const buttonContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: 'var(--semantic-spacing-sm)', // 12px
    justifyContent: 'flex-end',
  };

  // Button base styles
  const buttonBaseStyles: React.CSSProperties = {
    padding: 'var(--semantic-spacing-sm) var(--semantic-spacing-md)', // 12px 16px
    fontFamily: 'var(--semantic-typography-font-primary)',
    fontSize: 'var(--semantic-typography-font-size-md)', // 16px
    fontWeight: 600,
    border: '1px solid var(--primitive-black)',
    borderRadius: 'var(--primitive-radii-none)', // 0px
    cursor: 'pointer',
    transition: 'var(--primitive-transitions-none)', // 0ms
    minWidth: '80px',
  };

  // Cancel button styles
  const cancelButtonStyles: React.CSSProperties = {
    ...buttonBaseStyles,
    background: 'var(--primitive-white)',
    color: 'var(--primitive-black)',
  };

  // Submit button styles
  const submitButtonStyles: React.CSSProperties = {
    ...buttonBaseStyles,
    background: 'var(--primitive-black)',
    color: 'var(--primitive-white)',
    opacity: loading ? 0.6 : 1,
  };

  return (
    <>
      {/* Inject hover styles */}
      <style>{`
        .create-deck-input:focus {
          border: 2px solid var(--primitive-black) !important;
        }
        .create-deck-cancel:hover {
          background: var(--primitive-gray-100) !important;
        }
        .create-deck-submit:hover:not(:disabled) {
          background: var(--primitive-gray-800) !important;
        }
      `}</style>

      <div style={overlayStyles} onClick={onClose}>
        <div style={dialogStyles} onClick={(e) => e.stopPropagation()}>
          <h2 style={titleStyles}>CREATE DECK</h2>

          <form onSubmit={handleSubmit}>
            <input
              data-testid="deck-name-input"
              className="create-deck-input"
              type="text"
              placeholder="Deck name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null); // Clear error on input
              }}
              style={inputStyles}
              autoFocus
              disabled={loading}
            />

            {error && <div style={errorStyles}>{error}</div>}

            <div style={buttonContainerStyles}>
              <button
                type="button"
                className="create-deck-cancel"
                style={cancelButtonStyles}
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                data-testid="create-deck-submit"
                type="submit"
                className="create-deck-submit"
                style={submitButtonStyles}
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

CreateDeckDialog.displayName = 'CreateDeckDialog';
