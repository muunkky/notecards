export interface Deck {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface Notecard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface StudySession {
  id: string;
  deckId: string;
  userId: string;
  startedAt: Date;
  completedAt?: Date;
  score?: number;
  totalCards: number;
  correctAnswers: number;
}
