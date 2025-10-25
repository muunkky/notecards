/**
 * Writer Theme Demo Page
 *
 * Showcases the CardListScreen with sample screenplay cards.
 * Demonstrates the brutalist aesthetic and Writer theme in action.
 *
 * Features demonstrated:
 * - Collapsible card list with 4px category decorators
 * - Sticky header with monospace title
 * - Floating action button
 * - 6 category types with color-coded strips
 * - Zero animations (instant state changes)
 * - Sharp edges, flat design
 */

import * as React from 'react';
import { useEffect } from 'react';
import { CardListScreen } from '../screens/CardListScreen';
import { sampleScreenplayCards } from '../data/sampleCards';
import { themeManager } from '../design-system/theme/theme-manager';

export const WriterDemo: React.FC = () => {
  // Ensure Writer theme is active
  useEffect(() => {
    const activateTheme = async () => {
      await themeManager.switchTheme('writer');
      console.log('Writer theme activated for demo');
    };

    activateTheme();
  }, []);

  const handleBack = () => {
    console.log('Back button clicked - would navigate to deck list');
    alert('Back to Deck List (not implemented in demo)');
  };

  const handleAddCard = () => {
    console.log('Add card button clicked');
    alert('Add Card Editor (not implemented in demo)');
  };

  const handleEditCard = (cardId: string) => {
    console.log('Edit card:', cardId);
    alert(`Edit card ${cardId} (not implemented in demo)`);
  };

  const handleDeleteCard = (cardId: string) => {
    console.log('Delete card:', cardId);
    if (confirm('Delete this card?')) {
      alert(`Card ${cardId} deleted (not implemented in demo)`);
    }
  };

  return (
    <CardListScreen
      deckTitle="My Screenplay"
      cards={sampleScreenplayCards}
      onBack={handleBack}
      onAddCard={handleAddCard}
      onEditCard={handleEditCard}
      onDeleteCard={handleDeleteCard}
    />
  );
};

export default WriterDemo;
