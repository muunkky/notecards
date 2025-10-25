/**
 * Sample Deck Data for Writer Theme Demo
 *
 * Shows multiple story projects with realistic metadata.
 */

import type { Deck } from '../screens/DeckListScreen';
import type { NoteCard } from '../screens/CardListScreen';
import { sampleScreenplayCards } from './sampleCards';

// Sample decks
export const sampleDecks: Deck[] = [
  {
    id: 'deck-001',
    title: 'My Screenplay',
    cardCount: 10,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: 'deck-002',
    title: 'Novel Draft',
    cardCount: 32,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
  },
  {
    id: 'deck-003',
    title: 'Short Story Collection',
    cardCount: 15,
    lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12), // 12 days ago
  },
];

// Cards organized by deck
export const cardsByDeck: Record<string, NoteCard[]> = {
  'deck-001': sampleScreenplayCards,
  'deck-002': [
    {
      id: 'novel-001',
      title: 'Chapter 1: The Beginning',
      category: 'location',
      content: 'Opening scene in the mountain village...',
    },
    {
      id: 'novel-002',
      title: 'Protagonist Introduction',
      category: 'character',
      content: 'Elena (32, botanist) discovers the ancient seed...',
    },
  ],
  'deck-003': [
    {
      id: 'short-001',
      title: 'The Last Train',
      category: 'theme',
      content: 'A meditation on endings and new beginnings...',
    },
  ],
};
