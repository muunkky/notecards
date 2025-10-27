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
import { AddCardButton } from '../design-system/components/AddCardButton';
import { CategoryValue, CATEGORIES, getCategoryColor } from '../domain/categories';

// Card data structure
export interface NoteCard {
  id: string;
  title: string;
  content: string;
  category: CategoryValue;
  order?: number;
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

  /** Callback when card is moved up */
  onMoveCardUp?: (cardId: string, currentIndex: number) => void;

  /** Callback when card is moved down */
  onMoveCardDown?: (cardId: string, currentIndex: number) => void;
}

export const CardListScreen: React.FC<CardListScreenProps> = ({
  deckTitle,
  cards,
  onBack,
  onAddCard,
  onEditCard,
  onDeleteCard,
  onMoveCardUp,
  onMoveCardDown,
}) => {
  // Filter state ('all' or specific category)
  const [selectedFilter, setSelectedFilter] = useState<'all' | CategoryValue>('all');

  // Filter cards based on selected category
  const filteredCards = selectedFilter === 'all'
    ? cards
    : cards.filter(card => card.category === selectedFilter);

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
      {/* Inject hover styles for card action buttons and filter chips */}
      <style>{`
        .card-action-btn:hover {
          background: var(--primitive-gray-50) !important;
        }
        .card-action-btn:active {
          background: var(--primitive-gray-100) !important;
        }
        .card-action-btn-delete:hover {
          background: var(--primitive-red-50) !important;
        }
        .card-action-btn-delete:active {
          background: var(--primitive-red-100) !important;
        }
        .filter-chip:hover {
          background: var(--primitive-gray-50) !important;
        }
        .filter-chip:active {
          background: var(--primitive-gray-100) !important;
        }
        .filter-chip-active:hover {
          background: var(--primitive-gray-800) !important;
        }
        .filter-chip-active:active {
          background: var(--primitive-gray-900) !important;
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

        {/* Category Filter */}
        <div
          style={{
            display: 'flex',
            gap: 'var(--semantic-spacing-xs)', // 8px
            padding: 'var(--semantic-spacing-md)', // 16px
            paddingTop: 'var(--semantic-spacing-sm)', // 12px
            paddingBottom: 'var(--semantic-spacing-sm)', // 12px
            overflowX: 'auto',
            borderBottom: '1px solid var(--primitive-gray-200)',
            background: 'var(--primitive-white)',
          }}
        >
          {/* All filter */}
          <button
            onClick={() => setSelectedFilter('all')}
            className={selectedFilter === 'all' ? 'filter-chip-active' : 'filter-chip'}
            style={{
              padding: '6px 12px',
              background: selectedFilter === 'all' ? 'var(--primitive-black)' : 'var(--primitive-white)',
              color: selectedFilter === 'all' ? 'var(--primitive-white)' : 'var(--primitive-black)',
              border: '1px solid var(--primitive-black)',
              borderRadius: 'var(--primitive-radii-none)', // 0px
              cursor: 'pointer',
              fontSize: '14px',
              fontFamily: 'var(--semantic-typography-font-primary)',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              transition: 'var(--primitive-transitions-none)', // 0ms
            }}
          >
            All ({cards.length})
          </button>

          {/* Category filters */}
          {CATEGORIES.map((category) => {
            const count = cards.filter(card => card.category === category.value).length;
            const isActive = selectedFilter === category.value;

            return (
              <button
                key={category.value}
                onClick={() => setSelectedFilter(category.value)}
                className={isActive ? 'filter-chip-active' : 'filter-chip'}
                style={{
                  padding: '6px 12px',
                  background: isActive ? 'var(--primitive-black)' : 'var(--primitive-white)',
                  color: isActive ? 'var(--primitive-white)' : 'var(--primitive-black)',
                  border: '1px solid var(--primitive-black)',
                  borderRadius: 'var(--primitive-radii-none)', // 0px
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: 'var(--semantic-typography-font-primary)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  transition: 'var(--primitive-transitions-none)', // 0ms
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {/* Color indicator */}
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    background: category.color,
                    border: '1px solid var(--primitive-black)',
                  }}
                  aria-hidden="true"
                />
                {category.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Card List */}
        <div style={cardListStyles}>
          {filteredCards.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--semantic-spacing-xl)',
                color: 'var(--primitive-gray-500)',
                fontFamily: 'var(--semantic-typography-font-primary)',
              }}
            >
              {cards.length === 0
                ? 'No cards yet. Tap + to add your first card.'
                : `No ${selectedFilter !== 'all' ? CATEGORIES.find(c => c.value === selectedFilter)?.label.toLowerCase() : ''} cards.`}
            </div>
          ) : (
            filteredCards.map((card, index) => (
              <div
                key={card.id}
                data-testid="card-item"
                data-card-title={card.title}
                style={{
                  position: 'relative',
                  marginBottom: '8px',
                }}
              >
                <Card
                  title={card.title}
                  category={card.category}
                  collapsible
                  defaultExpanded={false}
                >
                  <div>{card.content}</div>

                  {/* Card actions (reorder, edit, delete) */}
                  <div
                    style={{
                      marginTop: 'var(--semantic-spacing-sm)', // 12px
                      paddingTop: 'var(--semantic-spacing-sm)', // 12px
                      borderTop: '1px solid var(--primitive-gray-200)',
                      display: 'flex',
                      gap: 'var(--semantic-spacing-xs)', // 8px
                    }}
                  >
                    {/* Move up button */}
                    {index > 0 && onMoveCardUp && (
                      <button
                        data-testid="move-card-up"
                        style={{
                          padding: '6px 12px',
                          background: 'var(--primitive-white)',
                          border: '1px solid var(--primitive-black)',
                          borderRadius: 'var(--primitive-radii-none)',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontFamily: 'var(--semantic-typography-font-primary)',
                          transition: 'var(--primitive-transitions-none)', // 0ms
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const actualIndex = cards.findIndex(c => c.id === card.id);
                          onMoveCardUp(card.id, actualIndex);
                        }}
                        className="card-action-btn"
                      >
                        ↑
                      </button>
                    )}

                    {/* Move down button */}
                    {index < filteredCards.length - 1 && onMoveCardDown && (
                      <button
                        data-testid="move-card-down"
                        style={{
                          padding: '6px 12px',
                          background: 'var(--primitive-white)',
                          border: '1px solid var(--primitive-black)',
                          borderRadius: 'var(--primitive-radii-none)',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontFamily: 'var(--semantic-typography-font-primary)',
                          transition: 'var(--primitive-transitions-none)', // 0ms
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const actualIndex = cards.findIndex(c => c.id === card.id);
                          onMoveCardDown(card.id, actualIndex);
                        }}
                        className="card-action-btn"
                      >
                        ↓
                      </button>
                    )}

                    <button
                      style={{
                        padding: '6px 12px',
                        background: 'var(--primitive-white)',
                        border: '1px solid var(--primitive-black)',
                        borderRadius: 'var(--primitive-radii-none)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontFamily: 'var(--semantic-typography-font-primary)',
                        transition: 'var(--primitive-transitions-none)', // 0ms
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCard?.(card.id);
                      }}
                      className="card-action-btn"
                    >
                      Edit
                    </button>
                    <button
                      style={{
                        padding: '6px 12px',
                        background: 'var(--primitive-white)',
                        border: '1px solid var(--primitive-red-600)',
                        color: 'var(--primitive-red-600)',
                        borderRadius: 'var(--primitive-radii-none)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontFamily: 'var(--semantic-typography-font-primary)',
                        transition: 'var(--primitive-transitions-none)', // 0ms
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCard?.(card.id);
                      }}
                      className="card-action-btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </Card>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Floating Action Button */}
      <AddCardButton onClick={onAddCard} testId="create-card-button" />
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
