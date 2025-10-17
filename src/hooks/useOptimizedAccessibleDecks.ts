/**
 * Optimized Accessible Decks Hook
 * 
 * Enhanced version of useAccessibleDecks with performance optimizations:
 * - Pagination support
 * - Reduced redundant data fetching
 * - Optimized query patterns
 * - Intelligent caching
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  DocumentSnapshot,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../providers/AuthProvider';
import type { Deck } from '../types';

export interface OptimizedAccessibleDecksResult {
  decks: Deck[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => void;
  totalCount: number;
}

interface AccessibleDecksOptions {
  pageSize?: number;
  enablePagination?: boolean;
  prefetchSize?: number;
}

interface DeckMap { 
  [deckId: string]: Deck 
}

const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_PREFETCH_SIZE = 5;

export function useOptimizedAccessibleDecks(options: AccessibleDecksOptions = {}): OptimizedAccessibleDecksResult {
  const { 
    pageSize = DEFAULT_PAGE_SIZE, 
    enablePagination = true,
    prefetchSize = DEFAULT_PREFETCH_SIZE 
  } = options;
  
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Refs for pagination state
  const lastOwnedDoc = useRef<DocumentSnapshot | null>(null);
  const lastCollabDoc = useRef<DocumentSnapshot | null>(null);
  const ownedDecksComplete = useRef<boolean>(false);
  const collabDecksComplete = useRef<boolean>(false);

  // Internal state maps
  const ownedDecks = useRef<DeckMap>({});
  const collabDecks = useRef<DeckMap>({});
  const unsubscribers = useRef<Array<() => void>>([]);

  /**
   * Clear all state and unsubscribe from listeners
   */
  const clearState = useCallback(() => {
    unsubscribers.current.forEach(unsub => unsub());
    unsubscribers.current = [];
    ownedDecks.current = {};
    collabDecks.current = {};
    lastOwnedDoc.current = null;
    lastCollabDoc.current = null;
    ownedDecksComplete.current = false;
    collabDecksComplete.current = false;
    setDecks([]);
    setTotalCount(0);
    setHasMore(false);
  }, []);

  /**
   * Merge owned and collaborative decks, ensuring owned takes precedence
   */
  const mergeDecks = useCallback(() => {
    const merged: DeckMap = { ...collabDecks.current, ...ownedDecks.current };
    const sortedDecks = Object.values(merged)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    
    setDecks(sortedDecks);
    setTotalCount(sortedDecks.length);
    
    // Update hasMore based on completion status
    const moreAvailable = !ownedDecksComplete.current || !collabDecksComplete.current;
    setHasMore(moreAvailable);
    
    setLoading(false);
  }, []);

  /**
   * Create optimized query with pagination support
   */
  const createQuery = useCallback((
    baseQuery: QueryConstraint[],
    lastDoc: DocumentSnapshot | null,
    queryPageSize: number
  ) => {
    const constraints = [...baseQuery];
    
    if (lastDoc && enablePagination) {
      constraints.push(startAfter(lastDoc));
    }
    
    constraints.push(limit(queryPageSize));
    
    return query(collection(db, 'decks'), ...constraints);
  }, [enablePagination]);

  /**
   * Setup real-time listener for owned decks
   */
  const setupOwnedDecksListener = useCallback((initialLoad = true) => {
    if (!user) return;

    const queryPageSize = initialLoad ? pageSize : prefetchSize;
    const baseQuery = [
      where('ownerId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    ];

    const q = createQuery(baseQuery, lastOwnedDoc.current, queryPageSize);

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        try {
          if (snapshot.empty) {
            ownedDecksComplete.current = true;
            mergeDecks();
            return;
          }

          // Track last document for pagination
          lastOwnedDoc.current = snapshot.docs[snapshot.docs.length - 1];
          
          // Check if we got fewer docs than requested (indicates completion)
          if (snapshot.docs.length < queryPageSize) {
            ownedDecksComplete.current = true;
          }

          // Update owned decks map
          snapshot.docChanges().forEach((change) => {
            const doc = change.doc;
            const data = doc.data();
            
            if (change.type === 'removed') {
              delete ownedDecks.current[doc.id];
            } else if (data.title && data.ownerId && data.createdAt && data.updatedAt) {
              ownedDecks.current[doc.id] = {
                id: doc.id,
                title: data.title,
                ownerId: data.ownerId,
                createdAt: data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt,
                updatedAt: data.updatedAt.toDate ? data.updatedAt.toDate() : data.updatedAt,
                cardCount: data.cardCount || 0,
                collaboratorIds: Object.keys(data.roles || {}), // Optimized: derive from roles
                roles: data.roles || {},
                effectiveRole: 'owner'
              };
            }
          });

          mergeDecks();
        } catch (e: any) {
          console.error('Owned decks snapshot error', e);
          setError('Failed processing owned decks');
        }
      },
      (err) => {
        console.error('Owned decks listener error', err);
        setError(err.message || 'Owned decks listener failed');
        ownedDecksComplete.current = true;
        mergeDecks();
      }
    );

    unsubscribers.current.push(unsubscribe);
  }, [user, pageSize, prefetchSize, createQuery, mergeDecks]);

  /**
   * Setup real-time listener for collaborative decks
   */
  const setupCollabDecksListener = useCallback((initialLoad = true) => {
    if (!user) return;

    const queryPageSize = initialLoad ? pageSize : prefetchSize;
    const baseQuery = [
      where(`roles.${user.uid}`, 'in', ['editor', 'viewer']),
      orderBy('updatedAt', 'desc')
    ];

    const q = createQuery(baseQuery, lastCollabDoc.current, queryPageSize);

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        try {
          if (snapshot.empty) {
            collabDecksComplete.current = true;
            mergeDecks();
            return;
          }

          // Track last document for pagination
          lastCollabDoc.current = snapshot.docs[snapshot.docs.length - 1];
          
          // Check completion
          if (snapshot.docs.length < queryPageSize) {
            collabDecksComplete.current = true;
          }

          // Update collaborative decks map
          snapshot.docChanges().forEach((change) => {
            const doc = change.doc;
            const data = doc.data();
            
            if (change.type === 'removed') {
              delete collabDecks.current[doc.id];
            } else if (data.title && data.ownerId && data.createdAt && data.updatedAt) {
              // Skip if actually owned (shouldn't happen but defensive)
              if (data.ownerId === user.uid) return;
              
              const role = data.roles?.[user.uid] || 'viewer';
              collabDecks.current[doc.id] = {
                id: doc.id,
                title: data.title,
                ownerId: data.ownerId,
                createdAt: data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt,
                updatedAt: data.updatedAt.toDate ? data.updatedAt.toDate() : data.updatedAt,
                cardCount: data.cardCount || 0,
                collaboratorIds: Object.keys(data.roles || {}), // Optimized: derive from roles
                roles: data.roles || {},
                effectiveRole: role
              };
            }
          });

          mergeDecks();
        } catch (e: any) {
          console.error('Collaborative decks snapshot error', e);
          setError('Failed processing collaborative decks');
        }
      },
      (err) => {
        console.error('Collaborative decks listener error', err);
        // Gracefully degrade to owned-only
        collabDecksComplete.current = true;
        mergeDecks();
      }
    );

    unsubscribers.current.push(unsubscribe);
  }, [user, pageSize, prefetchSize, createQuery, mergeDecks]);

  /**
   * Load more decks (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!user || !hasMore || loading) return;

    setLoading(true);
    
    try {
      // Load more from incomplete sources
      if (!ownedDecksComplete.current) {
        setupOwnedDecksListener(false);
      }
      
      if (!collabDecksComplete.current) {
        setupCollabDecksListener(false);
      }
    } catch (error: any) {
      console.error('Load more failed', error);
      setError(error.message || 'Failed to load more decks');
      setLoading(false);
    }
  }, [user, hasMore, loading, setupOwnedDecksListener, setupCollabDecksListener]);

  /**
   * Refresh all data
   */
  const refresh = useCallback(() => {
    clearState();
    if (user) {
      setLoading(true);
      setError(null);
      setupOwnedDecksListener();
      setupCollabDecksListener();
    }
  }, [user, clearState, setupOwnedDecksListener, setupCollabDecksListener]);

  /**
   * Main effect - setup listeners when user changes
   */
  useEffect(() => {
    if (!user) {
      clearState();
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    setupOwnedDecksListener();
    setupCollabDecksListener();

    return () => {
      clearState();
    };
  }, [user, clearState, setupOwnedDecksListener, setupCollabDecksListener]);

  return {
    decks,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    totalCount
  };
}

export default useOptimizedAccessibleDecks;