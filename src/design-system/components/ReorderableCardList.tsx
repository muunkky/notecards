/**
 * ReorderableCardList Component - Writer Theme
 *
 * Drag-and-drop card reordering system with:
 * - Long-press to initiate drag (useLongPress integration)
 * - Touch-first dragging (mobile-native)
 * - Visual feedback during drag
 * - Instant state changes (0ms transitions)
 * - Callback with reordered card array
 *
 * DESIGN PHILOSOPHY - MOBILE-FIRST:
 * Uses touch events and long-press activation rather than HTML5
 * drag-and-drop API (which is desktop-centric and awkward on mobile).
 *
 * DRAG FLOW:
 * 1. User long-presses card (500ms threshold)
 * 2. Reorder mode activates, card becomes draggable
 * 3. User drags card up/down in list
 * 4. Drop zone indicators show where card will land
 * 5. On release, cards reorder with instant feedback
 * 6. onReorder callback receives new card array
 *
 * INSTANT FEEDBACK PATTERN (0ms):
 * Card order updates instantly on drop, no animations.
 * This maintains the brutalist philosophy of immediate, honest feedback.
 *
 * TDD: This component is built to pass writer-theme-reorderable-list.test.tsx
 */

import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { CardItem } from './CardItem';
import { useLongPress } from '../../hooks/useLongPress';
import { CategoryValue } from '../../domain/categories';

export interface CardData {
  id: string;
  title: string;
  content: string;
  category?: CategoryValue;
}

export interface ReorderableCardListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of cards to display */
  cards: CardData[];

  /** Callback when cards are reordered */
  onReorder: (newOrder: CardData[]) => void;
}

export const ReorderableCardList = React.forwardRef<HTMLDivElement, ReorderableCardListProps>(
  ({ cards, onReorder, className, ...props }, ref) => {
    const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
    const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
    const [targetIndex, setTargetIndex] = useState<number | null>(null);
    const [reorderModeActive, setReorderModeActive] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const cardPositionsRef = useRef<Map<string, DOMRect>>(new Map());

    // Update card positions when cards change
    useEffect(() => {
      if (!containerRef.current) return;

      const positions = new Map<string, DOMRect>();
      const cardElements = containerRef.current.querySelectorAll('[data-card-id]');

      cardElements.forEach((element) => {
        const cardId = element.getAttribute('data-card-id');
        if (cardId) {
          positions.set(cardId, element.getBoundingClientRect());
        }
      });

      cardPositionsRef.current = positions;
    }, [cards]);

    // Handle long press to initiate drag
    const handleLongPress = (cardId: string) => {
      setDraggedCardId(cardId);
      setReorderModeActive(true);
    };

    // Handle drag move
    const handleDragMove = (event: TouchEvent | MouseEvent) => {
      if (!draggedCardId) return;

      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

      setDragPosition({ x: clientX, y: clientY });

      // Calculate target index based on position
      const newIndex = calculateTargetIndex(clientY);
      setTargetIndex(newIndex);
    };

    // Handle drag end
    const handleDragEnd = () => {
      if (!draggedCardId || targetIndex === null) {
        resetDragState();
        return;
      }

      const currentIndex = cards.findIndex((card) => card.id === draggedCardId);

      // Only reorder if position changed
      if (currentIndex !== targetIndex) {
        const newOrder = reorderCards(cards, currentIndex, targetIndex);
        onReorder(newOrder);
      }

      resetDragState();
    };

    // Handle escape key to cancel
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        resetDragState();
      }
    };

    useEffect(() => {
      if (reorderModeActive) {
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
      }
    }, [reorderModeActive]);

    // Calculate target index based on Y position
    const calculateTargetIndex = (y: number): number => {
      const positions = Array.from(cardPositionsRef.current.entries());

      for (let i = 0; i < positions.length; i++) {
        const [_, rect] = positions[i];
        const cardMiddle = rect.top + rect.height / 2;

        if (y < cardMiddle) {
          return i;
        }
      }

      return positions.length;
    };

    // Reorder cards array
    const reorderCards = (cards: CardData[], fromIndex: number, toIndex: number): CardData[] => {
      const newCards = [...cards];
      const [movedCard] = newCards.splice(fromIndex, 1);
      newCards.splice(toIndex, 0, movedCard);
      return newCards;
    };

    // Reset drag state
    const resetDragState = () => {
      setDraggedCardId(null);
      setDragPosition(null);
      setTargetIndex(null);
      setReorderModeActive(false);
    };

    // Container styles
    const containerStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '0', // No gap, cards have bottom margin
      transition: 'var(--primitive-transitions-none)', // 0ms
    };

    // Reorder mode indicator styles
    const reorderModeIndicatorStyles: React.CSSProperties = {
      position: 'fixed',
      top: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--primitive-black)',
      color: 'var(--primitive-white)',
      padding: '8px 16px',
      fontSize: '14px',
      fontFamily: 'var(--semantic-typography-font-primary)',
      zIndex: 1002,
      borderRadius: 'var(--primitive-radii-none)', // 0px
    };

    // Drag indicator styles (visual placeholder)
    const dragIndicatorStyles: React.CSSProperties = {
      position: 'fixed',
      top: dragPosition ? `${dragPosition.y - 20}px` : '0',
      left: dragPosition ? `${dragPosition.x - 20}px` : '0',
      width: '40px',
      height: '40px',
      background: 'var(--primitive-black)',
      borderRadius: 'var(--primitive-radii-none)', // 0px
      zIndex: 1001,
      pointerEvents: 'none',
    };

    // Drop zone styles
    const dropZoneStyles: React.CSSProperties = {
      height: '4px',
      background: 'var(--primitive-black)',
      margin: '4px 0',
      borderRadius: 'var(--primitive-radii-none)', // 0px
    };

    const computedClassName = ['reorderable-list', className].filter(Boolean).join(' ');

    return (
      <>
        {/* Reorder mode indicator */}
        {reorderModeActive && (
          <div
            data-testid="reorder-mode-active"
            style={reorderModeIndicatorStyles}
            role="status"
            aria-live="polite"
          >
            Reorder mode active
          </div>
        )}

        {/* Drag indicator */}
        {dragPosition && (
          <div
            data-testid="drag-indicator"
            style={dragIndicatorStyles}
            aria-hidden="true"
          />
        )}

        {/* Card list container */}
        <div
          ref={useCallback(
            (node: HTMLDivElement | null) => {
              // @ts-ignore - containerRef.current assignment
              containerRef.current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                // @ts-ignore - ref.current assignment
                ref.current = node;
              }
            },
            [ref]
          )}
          role="list"
          aria-label="Reorderable card list - long press to reorder"
          data-testid="reorderable-list"
          style={containerStyles}
          className={computedClassName}
          {...props}
        >
          {cards.map((card, index) => {
            const isDragging = card.id === draggedCardId;

            // Long press handlers for this card
            const longPressHandlers = useLongPress({
              onLongPress: () => handleLongPress(card.id),
              threshold: 500,
              cancelOnMove: false, // Allow movement during drag
            });

            // Card wrapper styles
            const cardWrapperStyles: React.CSSProperties = {
              opacity: isDragging ? 0.5 : 1,
              transition: 'var(--primitive-transitions-none)', // 0ms
            };

            return (
              <React.Fragment key={card.id}>
                {/* Drop zone indicator before each card */}
                {reorderModeActive && targetIndex === index && (
                  <div
                    data-testid={`drop-zone-${index}`}
                    style={dropZoneStyles}
                    aria-hidden="true"
                  />
                )}

                {/* Card with drag handlers */}
                <div
                  data-card-id={card.id}
                  style={cardWrapperStyles}
                  onTouchMove={(e) => handleDragMove(e.nativeEvent)}
                  onTouchEnd={handleDragEnd}
                  onMouseMove={(e) => reorderModeActive && handleDragMove(e.nativeEvent)}
                  onMouseUp={handleDragEnd}
                >
                  <CardItem
                    id={card.id}
                    title={card.title}
                    content={card.content}
                    category={card.category}
                    {...longPressHandlers}
                  />
                </div>
              </React.Fragment>
            );
          })}

          {/* Drop zone at end of list */}
          {reorderModeActive && targetIndex === cards.length && (
            <div
              data-testid={`drop-zone-${cards.length}`}
              style={dropZoneStyles}
              aria-hidden="true"
            />
          )}
        </div>
      </>
    );
  }
);

ReorderableCardList.displayName = 'ReorderableCardList';

// NATIVE TODO: Add haptic feedback on drag start
// When we wrap in Capacitor, add:
// import { Haptics } from '@capacitor/haptics';
// import { Capacitor } from '@capacitor/core';
//
// const handleLongPress = async (cardId: string) => {
//   if (Capacitor.isNativePlatform()) {
//     await Haptics.impact({ style: 'medium' }); // Medium haptic for drag start
//   }
//
//   setDraggedCardId(cardId);
//   setReorderModeActive(true);
// };

// NATIVE TODO: Add haptic feedback on successful reorder
// const handleDragEnd = async () => {
//   if (!draggedCardId || targetIndex === null) {
//     resetDragState();
//     return;
//   }
//
//   const currentIndex = cards.findIndex((card) => card.id === draggedCardId);
//
//   if (currentIndex !== targetIndex) {
//     if (Capacitor.isNativePlatform()) {
//       await Haptics.notification({ type: 'success' }); // Success haptic for reorder
//     }
//
//     const newOrder = reorderCards(cards, currentIndex, targetIndex);
//     onReorder(newOrder);
//   }
//
//   resetDragState();
// };
