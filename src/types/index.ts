// User model for Firebase Auth users
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date;
}

// Deck model - represents a collection of cards
export interface Deck {
  id: string;
  title: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  cardCount?: number; // Calculated field, not stored in Firestore
  // --- Sharing (feature-flagged) ---
  // List of user UIDs (excluding owner) who have any role on this deck
  collaboratorIds?: string[];
  // Role map keyed by user UID; owner implicitly has 'owner' role (may be duplicated here for simplicity)
  roles?: Record<string, DeckRole>;
  // Derived at runtime (not persisted): the current user's effective role relative to this deck.
  effectiveRole?: DeckRole;
}

// Card model - represents individual notecards within a deck
export interface Card {
  id: string;
  deckId: string;
  title: string;
  body: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
  favorite?: boolean; // Optional favorite flag
  archived?: boolean; // Soft-delete/archive flag
  category?: string; // Optional category for Writer's Tool (conflict, character, location, etc.)
}

// Order Snapshot model - stores saved card orderings
export interface OrderSnapshot {
  id: string;
  deckId: string;
  name: string;
  cardOrder: string[]; // Array of card IDs in order
  createdAt: Date;
}

// Card reordering operation types
export interface CardReorderOperation {
  cardId: string;
  direction: 'up' | 'down';
  currentIndex: number;
  newIndex: number;
}

export interface BulkReorderOperation {
  deckId: string;
  cardUpdates: Array<{
    cardId: string;
    newOrderIndex: number;
  }>;
}

export enum ReorderDirection {
  UP = 'up',
  DOWN = 'down'
}

// Firestore document data types (without auto-generated fields)
export interface DeckData {
  title: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  // Sharing fields are optional at rest until feature flag is active
  collaboratorIds?: string[];
  roles?: Record<string, DeckRole>;
}

export interface CardData {
  title: string;
  body: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
  favorite?: boolean;
  archived?: boolean;
  category?: string; // Optional category for Writer's Tool
}

export interface OrderSnapshotData {
  name: string;
  cardOrder: string[];
  createdAt: Date;
}

export interface UserData {
  email: string;
  displayName: string;
  createdAt: Date;
}

// UI State types
export interface CardUIState {
  isExpanded: boolean;
  isEditing: boolean;
}

export interface DeckScreenState {
  selectedDeckId: string | null;
  isCreatingDeck: boolean;
  isRenamingDeck: string | null; // ID of deck being renamed
}

export interface CardScreenState {
  filterText: string;
  allExpanded: boolean;
  isShuffling: boolean;
  selectedSnapshot: string | null;
}

// API Response types
export interface FirestoreError {
  code: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: FirestoreError;
}

// Hook return types
export interface UseDecksReturn {
  decks: Deck[];
  loading: boolean;
  error: FirestoreError | null;
  createDeck: (title: string) => Promise<string>;
  updateDeck: (id: string, updates: Partial<DeckData>) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
}

export interface UseCardsReturn {
  cards: Card[];
  loading: boolean;
  error: FirestoreError | null;
  createCard: (title: string, body?: string) => Promise<string>;
  updateCard: (id: string, updates: Partial<CardData>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  reorderCards: (cardIds: string[]) => Promise<void>;
}

export interface UseOrderSnapshotsReturn {
  snapshots: OrderSnapshot[];
  loading: boolean;
  error: FirestoreError | null;
  saveSnapshot: (name: string, cardOrder: string[]) => Promise<string>;
  loadSnapshot: (snapshotId: string) => Promise<string[]>;
  deleteSnapshot: (snapshotId: string) => Promise<void>;
}

// Drag and Drop types (for react-beautiful-dnd)
export interface DragResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination: {
    droppableId: string;
    index: number;
  } | null;
  reason: 'DROP' | 'CANCEL';
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  values: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isDirty: boolean;
}

// Constants and Enums
export enum OrderDirection {
  ASC = 'asc',
  DESC = 'desc'
}

export enum CardSortBy {
  ORDER_INDEX = 'orderIndex',
  TITLE = 'title',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt'
}

export enum DeckSortBy {
  TITLE = 'title',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  CARD_COUNT = 'cardCount'
}

// -------------------------
// Deck Sharing Types/Flags
// -------------------------

// Roles supported for deck collaboration (owner is deck.ownerId)
export type DeckRole = 'owner' | 'editor' | 'viewer';

// Feature flag environment toggle (can later be sourced from runtime config)
export const FEATURE_DECK_SHARING = true; // Set to false to disable sharing-related UI/logic

// -------------------------
// Export Types
// -------------------------

export interface ExportOptions {
  includeArchived?: boolean;
  format?: 'text' | 'pdf';
}

export interface ExportResult {
  blob: Blob;
  filename: string;
  text: string;
}

export type ExportFormat = 'text' | 'pdf';

