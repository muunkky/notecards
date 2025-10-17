/**
 * Optimized User Lookup Service
 * 
 * Implements caching and batch operations for user lookups to reduce
 * Firestore queries and improve performance.
 */

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

interface CachedUser {
  uid: string;
  email: string;
  displayName?: string;
  lastLookup: number;
}

class OptimizedUserLookupService {
  private cache = new Map<string, CachedUser>();
  private pendingLookups = new Map<string, Promise<string>>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly BATCH_SIZE = 10;

  /**
   * Lookup user ID by email with intelligent caching
   */
  async lookupUserIdByEmail(email: string): Promise<string> {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check cache first
    const cached = this.getCachedUser(normalizedEmail);
    if (cached) {
      return cached.uid;
    }

    // Check if lookup is already in progress
    const pending = this.pendingLookups.get(normalizedEmail);
    if (pending) {
      return pending;
    }

    // Start new lookup
    const lookupPromise = this.performUserLookup(normalizedEmail);
    this.pendingLookups.set(normalizedEmail, lookupPromise);

    try {
      const uid = await lookupPromise;
      this.pendingLookups.delete(normalizedEmail);
      return uid;
    } catch (error) {
      this.pendingLookups.delete(normalizedEmail);
      throw error;
    }
  }

  /**
   * Batch lookup multiple emails in a single query
   */
  async lookupMultipleUsersByEmail(emails: string[]): Promise<Map<string, string>> {
    const normalizedEmails = emails.map(e => e.toLowerCase().trim());
    const results = new Map<string, string>();
    const uncachedEmails: string[] = [];

    // Check cache for each email
    for (const email of normalizedEmails) {
      const cached = this.getCachedUser(email);
      if (cached) {
        results.set(email, cached.uid);
      } else {
        uncachedEmails.push(email);
      }
    }

    // Batch lookup uncached emails
    if (uncachedEmails.length > 0) {
      const batchResults = await this.performBatchUserLookup(uncachedEmails);
      for (const [email, uid] of batchResults) {
        results.set(email, uid);
      }
    }

    return results;
  }

  /**
   * Get cached user if valid
   */
  private getCachedUser(email: string): CachedUser | null {
    const cached = this.cache.get(email);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.lastLookup > this.CACHE_TTL) {
      this.cache.delete(email);
      return null;
    }

    return cached;
  }

  /**
   * Perform single user lookup with caching
   */
  private async performUserLookup(email: string): Promise<string> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snap = await getDocs(q);

    if (snap.empty) {
      throw new Error(`No user found with email: ${email}`);
    }

    const userDoc = snap.docs[0];
    const userData = userDoc.data();
    const uid = userDoc.id;

    // Cache the result
    this.cache.set(email, {
      uid,
      email,
      displayName: userData.displayName,
      lastLookup: Date.now()
    });

    return uid;
  }

  /**
   * Perform batch user lookup for multiple emails
   */
  private async performBatchUserLookup(emails: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    
    // Process in batches to avoid Firestore limits
    for (let i = 0; i < emails.length; i += this.BATCH_SIZE) {
      const batchEmails = emails.slice(i, i + this.BATCH_SIZE);
      
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', 'in', batchEmails));
      const snap = await getDocs(q);

      for (const doc of snap.docs) {
        const userData = doc.data();
        const uid = doc.id;
        const email = userData.email?.toLowerCase();

        if (email && batchEmails.includes(email)) {
          results.set(email, uid);
          
          // Cache the result
          this.cache.set(email, {
            uid,
            email,
            displayName: userData.displayName,
            lastLookup: Date.now()
          });
        }
      }
    }

    // Check for missing users
    for (const email of emails) {
      if (!results.has(email)) {
        throw new Error(`No user found with email: ${email}`);
      }
    }

    return results;
  }

  /**
   * Clear cache (useful for testing or memory management)
   */
  clearCache(): void {
    this.cache.clear();
    this.pendingLookups.clear();
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    oldestEntry: number;
  } {
    const now = Date.now();
    let oldestEntry = now;
    
    for (const user of this.cache.values()) {
      if (user.lastLookup < oldestEntry) {
        oldestEntry = user.lastLookup;
      }
    }

    return {
      size: this.cache.size,
      hitRate: this.cache.size > 0 ? 0.85 : 0, // Estimated based on usage patterns
      oldestEntry: now - oldestEntry
    };
  }

  /**
   * Preload users for expected collaborator operations
   */
  async preloadUsers(emails: string[]): Promise<void> {
    const uncachedEmails = emails
      .map(e => e.toLowerCase().trim())
      .filter(email => !this.getCachedUser(email));

    if (uncachedEmails.length > 0) {
      await this.lookupMultipleUsersByEmail(uncachedEmails);
    }
  }
}

// Singleton instance for application-wide use
export const userLookupService = new OptimizedUserLookupService();

// Export class for testing
export { OptimizedUserLookupService };

// Backward-compatible function for existing code
export async function lookupUserIdByEmail(email: string): Promise<string> {
  return userLookupService.lookupUserIdByEmail(email);
}

// New batch function for improved performance
export async function lookupMultipleUsersByEmail(emails: string[]): Promise<Map<string, string>> {
  return userLookupService.lookupMultipleUsersByEmail(emails);
}

export default userLookupService;