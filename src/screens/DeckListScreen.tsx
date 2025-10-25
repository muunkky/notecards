/**
 * DeckListScreen - Writer Theme Home View
 *
 * The entry point screen showing all story projects (decks).
 * Users select a deck to open its cards.
 *
 * Features:
 * - Header with "NOTECARDS" title and + button
 * - List of deck cards (title, card count, last updated)
 * - Tap deck to open CardListScreen
 * - Brutalist aesthetic (sharp edges, black borders)
 * - Zero animations
 *
 * Design: Based on docs/WRITER-DESIGN-THESIS.md
 * IA: See .gitban/cards/an1cxy Section "1. Deck List"
 */

import * as React from 'react';
import { Card } from '../design-system/components/Card';
import { Button } from '../design-system/components/Button';

// Deck data structure
export interface Deck {
  id: string;
  title: string;
  cardCount: number;
  lastUpdated: Date;
}

export interface DeckListScreenProps {
  /** List of decks to display */
  decks: Deck[];

  /** Callback when a deck is selected */
  onSelectDeck?: (deckId: string) => void;

  /** Callback when add deck button is clicked */
  onAddDeck?: () => void;

  /** Callback when deck is deleted */
  onDeleteDeck?: (deckId: string) => void;
}

export const DeckListScreen: React.FC<DeckListScreenProps> = ({
  decks,
  onSelectDeck,
  onAddDeck,
  onDeleteDeck,
}) => {
  // Format last updated time
  const formatLastUpdated = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return diffMins === 0 ? 'just now' : `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  // Container styles (full viewport)
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: '100%',
    background: 'var(--primitive-white)',
  };

  // Header styles
  const headerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--semantic-spacing-md)', // 16px
    background: 'var(--primitive-white)',
    borderBottom: '1px solid var(--primitive-black)',
    minHeight: '60px',
  };

  // Title styles (monospace)
  const titleStyles: React.CSSProperties = {
    fontFamily: 'var(--semantic-typography-font-title)', // Monospace
    fontSize: 'var(--semantic-typography-font-size-lg)', // 18px
    fontWeight: 600,
    color: 'var(--primitive-black)',
    letterSpacing: '0.05em', // Slightly spaced for terminal feel
  };

  // Deck list container styles
  const deckListStyles: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--semantic-spacing-md)', // 16px
  };

  // Deck card styles
  const deckCardStyles: React.CSSProperties = {
    padding: 'var(--semantic-spacing-md)', // 16px
    background: 'var(--primitive-white)',
    border: '1px solid var(--primitive-black)',
    borderRadius: 'var(--primitive-radii-none)', // 0px
    marginBottom: 'var(--semantic-spacing-md)', // 16px
    cursor: 'pointer',
    transition: 'var(--primitive-transitions-none)', // 0ms
  };

  const deckTitleStyles: React.CSSProperties = {
    fontFamily: 'var(--semantic-typography-font-primary)',
    fontSize: 'var(--semantic-typography-font-size-lg)', // 18px
    fontWeight: 600,
    color: 'var(--primitive-black)',
    marginBottom: 'var(--semantic-spacing-xs)', // 8px
  };

  const deckMetaStyles: React.CSSProperties = {
    fontFamily: 'var(--semantic-typography-font-primary)',
    fontSize: 'var(--semantic-typography-font-size-sm)', // 14px
    color: 'var(--primitive-gray-600)',
  };

  // Add button (square, top right)
  const addButtonStyles: React.CSSProperties = {
    minWidth: '44px',
    width: '44px',
    height: '44px',
    padding: '0',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <>
      {/* Inject hover styles for deck cards */}
      <style>{`
        .deck-card:hover {
          background: var(--primitive-gray-50) !important;
        }
        .deck-card:active {
          background: var(--primitive-gray-100) !important;
        }
      `}</style>

      <div style={containerStyles}>
        {/* Header */}
        <header style={headerStyles}>
          <h1 style={titleStyles}>NOTECARDS</h1>
          <button
            style={{
              ...addButtonStyles,
              background: 'var(--primitive-black)',
              color: 'var(--primitive-white)',
              border: 'none',
              borderRadius: 'var(--primitive-radii-none)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
            onClick={onAddDeck}
            aria-label="Add deck"
            title="Add deck"
          >
            +
          </button>
        </header>

        {/* Deck List */}
        <div style={deckListStyles}>
          {decks.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--semantic-spacing-xl)',
                color: 'var(--primitive-gray-500)',
                fontFamily: 'var(--semantic-typography-font-primary)',
              }}
            >
              No decks yet. Tap + to create your first deck.
            </div>
          ) : (
            decks.map((deck) => (
              <div
                key={deck.id}
                className="deck-card"
                style={deckCardStyles}
                onClick={() => onSelectDeck?.(deck.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectDeck?.(deck.id);
                  }
                }}
              >
                <div style={deckTitleStyles}>{deck.title}</div>
                <div style={deckMetaStyles}>
                  {deck.cardCount} {deck.cardCount === 1 ? 'card' : 'cards'} · Updated{' '}
                  {formatLastUpdated(deck.lastUpdated)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

DeckListScreen.displayName = 'DeckListScreen';

// NATIVE TODO: Add pull-to-refresh for syncing decks
// When we wrap in Capacitor, add:
// import { Capacitor } from '@capacitor/core';
//
// const handleRefresh = async () => {
//   if (Capacitor.isNativePlatform()) {
//     // Show native refresh indicator
//     // Sync decks from Firebase
//     // Hide indicator when done
//   }
// };

// NATIVE TODO: Add haptic feedback on deck selection
// When deck is tapped:
// if (Capacitor.isNativePlatform()) {
//   await Haptics.selection();
// }

// NATIVE TODO: Add long-press context menu for deck actions
// Long-press deck card to show:
// - Rename deck
// - Delete deck
// - Duplicate deck
// - Export deck
