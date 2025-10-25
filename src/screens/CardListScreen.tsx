/**
 * CardListScreen - Writer Theme Main Working View
 *
 * This is the primary screen where writers work with their cards.
 * Shows a scrollable list of collapsible cards with category decorators.
 *
 * Features:
 * - Sticky header with back button and menu
 * - Collapsible card list (tap to expand/collapse)
 * - 4px category decorator strips (6 colors)
 * - Floating action button for adding cards
 * - Monospace titles, system font content
 * - Zero animations (instant state changes)
 *
 * Design: Based on docs/WRITER-DESIGN-THESIS.md
 * IA: See .gitban/cards/an1cxy (Information Architecture)
 */

import * as React from 'react';
import { useState } from 'react';
import { Card } from '../design-system/components/Card';
import { Button } from '../design-system/components/Button';

// Card data structure
export interface NoteCard {
  id: string;
  title: string;
  content: string;
  category: 'conflict' | 'character' | 'location' | 'theme' | 'action' | 'dialogue';
}

export interface CardListScreenProps {
  /** Deck title */
  deckTitle: string;

  /** List of cards to display */
  cards: NoteCard[];

  /** Callback when back button is clicked */
  onBack?: () => void;

  /** Callback when add card button is clicked */
  onAddCard?: () => void;

  /** Callback when card is edited */
  onEditCard?: (cardId: string) => void;

  /** Callback when card is deleted */
  onDeleteCard?: (cardId: string) => void;
}

export const CardListScreen: React.FC<CardListScreenProps> = ({
  deckTitle,
  cards,
  onBack,
  onAddCard,
  onEditCard,
  onDeleteCard,
}) => {
  // Container styles (full viewport)
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
    background: 'var(--primitive-white)',
  };

  // Header styles (sticky)
  const headerStyles: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 10,
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
    flex: 1,
    marginLeft: 'var(--semantic-spacing-sm)', // 12px
    marginRight: 'var(--semantic-spacing-sm)',
  };

  // Card list container styles
  const cardListStyles: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: 'var(--semantic-spacing-md)', // 16px
    paddingBottom: '80px', // Space for floating button
  };

  // Floating action button styles
  const fabStyles: React.CSSProperties = {
    position: 'fixed',
    bottom: 'var(--semantic-spacing-lg)', // 24px
    right: 'var(--semantic-spacing-lg)', // 24px
    width: '56px',
    height: '56px',
    borderRadius: 'var(--primitive-radii-none)', // 0px (brutalist)
    background: 'var(--primitive-black)',
    color: 'var(--primitive-white)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 600,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)', // Slight shadow for depth
    zIndex: 5,
  };

  // Back button (simple text button)
  const backButtonStyles: React.CSSProperties = {
    fontSize: '18px',
    cursor: 'pointer',
    padding: 'var(--semantic-spacing-xs)', // 8px
    userSelect: 'none',
  };

  // Menu button (three dots)
  const menuButtonStyles: React.CSSProperties = {
    fontSize: '20px',
    cursor: 'pointer',
    padding: 'var(--semantic-spacing-xs)', // 8px
    userSelect: 'none',
    fontWeight: 600,
  };

  return (
    <>
      {/* Inject hover styles for FAB */}
      <style>{`
        .fab-button:hover {
          background: var(--primitive-gray-900) !important;
        }
        .fab-button:active {
          background: var(--primitive-gray-800) !important;
        }
      `}</style>

      <div style={containerStyles}>
        {/* Sticky Header */}
        <header style={headerStyles}>
          <span style={backButtonStyles} onClick={onBack} role="button" tabIndex={0}>
            ←
          </span>
          <h1 style={titleStyles}>{deckTitle}</h1>
          <span style={menuButtonStyles} role="button" tabIndex={0}>
            ⋯
          </span>
        </header>

        {/* Card List */}
        <div style={cardListStyles}>
          {cards.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--semantic-spacing-xl)',
                color: 'var(--primitive-gray-500)',
                fontFamily: 'var(--semantic-typography-font-primary)',
              }}
            >
              No cards yet. Tap + to add your first card.
            </div>
          ) : (
            cards.map((card) => (
              <Card
                key={card.id}
                title={card.title}
                category={card.category}
                collapsible
                defaultExpanded={false}
              >
                {card.content}
              </Card>
            ))
          )}
        </div>

        {/* Floating Action Button */}
        <button
          className="fab-button"
          style={fabStyles}
          onClick={onAddCard}
          aria-label="Add card"
          title="Add card"
        >
          +
        </button>
      </div>
    </>
  );
};

CardListScreen.displayName = 'CardListScreen';

// NATIVE TODO: Add pull-to-refresh for syncing cards
// When we wrap in Capacitor, add:
// import { Capacitor } from '@capacitor/core';
//
// const handleRefresh = async () => {
//   if (Capacitor.isNativePlatform()) {
//     // Show native refresh indicator
//     // Sync cards from Firebase
//     // Hide indicator when done
//   }
// };

// NATIVE TODO: Add haptic feedback on card interactions
// When card is expanded/collapsed:
// if (Capacitor.isNativePlatform()) {
//   await Haptics.impact({ style: 'light' });
// }
