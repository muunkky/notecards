/**
 * Optimized Deck Sharing Service
 * 
 * Enhanced sharing operations with performance optimizations:
 * - Batch operations for multiple users
 * - Optimized role updates with minimal writes
 * - Intelligent caching and cache invalidation
 * - Efficient permission verification
 */

import { 
  doc, 
  writeBatch, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  Timestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import optimizedUserLookup from '../sharing/optimized-user-lookup';

export interface ShareRequest {
  deckId: string;
  userEmail: string;
  role: 'editor' | 'viewer';
}

export interface BatchShareRequest {
  deckId: string;
  shares: Array<{
    userEmail: string;
    role: 'editor' | 'viewer';
  }>;
}

export interface ShareResult {
  success: boolean;
  userEmail: string;
  userId?: string;
  role?: string;
  error?: string;
}

export interface BatchShareResult {
  deckId: string;
  totalRequested: number;
  successful: ShareResult[];
  failed: ShareResult[];
  errors: string[];
}

interface RoleUpdate {
  userId: string;
  role: 'editor' | 'viewer';
}

interface RoleRemoval {
  userId: string;
}

class OptimizedDeckSharingService {
  private shareCache = new Map<string, ShareResult>();
  private cacheTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cache key for share operation
   */
  private getCacheKey(deckId: string, userEmail: string): string {
    return `${deckId}:${userEmail}`;
  }

  /**
   * Check if cache entry is valid
   */
  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTTL;
  }

  /**
   * Clear cache entries for a specific deck
   */
  private clearDeckCache(deckId: string): void {
    for (const key of this.shareCache.keys()) {
      if (key.startsWith(`${deckId}:`)) {
        this.shareCache.delete(key);
      }
    }
  }

  /**
   * Verify user has permission to share deck
   */
  private async verifySharePermission(deckId: string, currentUserId: string): Promise<boolean> {
    try {
      const deckDoc = await getDoc(doc(db, 'decks', deckId));
      if (!deckDoc.exists()) {
        throw new Error('Deck not found');
      }

      const deckData = deckDoc.data();
      
      // Owner can always share
      if (deckData.ownerId === currentUserId) {
        return true;
      }

      // Editors can share if they have editor role
      const userRole = deckData.roles?.[currentUserId];
      return userRole === 'editor';
    } catch (error) {
      console.error('Permission verification failed:', error);
      return false;
    }
  }

  /**
   * Share deck with a single user (optimized)
   */
  async shareWithUser(
    shareRequest: ShareRequest, 
    currentUserId: string
  ): Promise<ShareResult> {
    const { deckId, userEmail, role } = shareRequest;
    const cacheKey = this.getCacheKey(deckId, userEmail);

    try {
      // Check cache first (for recent operations)
      const cached = this.shareCache.get(cacheKey);
      if (cached && this.isCacheValid(Date.now())) {
        return cached;
      }

      // Verify permission
      const hasPermission = await this.verifySharePermission(deckId, currentUserId);
      if (!hasPermission) {
        const result: ShareResult = {
          success: false,
          userEmail,
          error: 'Insufficient permissions to share this deck'
        };
        return result;
      }

      // Look up user efficiently
      const userId = await optimizedUserLookup.lookupUserIdByEmail(userEmail);
      if (!userId) {
        const result: ShareResult = {
          success: false,
          userEmail,
          error: 'User not found'
        };
        return result;
      }

      const targetUserId = userId;

      // Use transaction for consistency
      const result = await runTransaction(db, async (transaction) => {
        const deckRef = doc(db, 'decks', deckId);
        const deckDoc = await transaction.get(deckRef);
        
        if (!deckDoc.exists()) {
          throw new Error('Deck not found');
        }

        const deckData = deckDoc.data();
        
        // Don't share with owner
        if (deckData.ownerId === targetUserId) {
          return {
            success: false,
            userEmail,
            error: 'Cannot share deck with owner'
          };
        }

        // Check if already shared with same or better role
        const currentRole = deckData.roles?.[targetUserId];
        if (currentRole === 'editor' || (currentRole === role)) {
          return {
            success: true,
            userEmail,
            userId: targetUserId,
            role: currentRole,
            error: 'Already shared with requested role'
          };
        }

        // Update roles
        const updatedRoles = { ...deckData.roles };
        updatedRoles[targetUserId] = role;

        // Update collaborator list if needed
        const collaboratorIds = deckData.collaboratorIds || [];
        const updates: any = {
          roles: updatedRoles,
          updatedAt: Timestamp.now()
        };

        if (!collaboratorIds.includes(targetUserId)) {
          updates.collaboratorIds = arrayUnion(targetUserId);
        }

        transaction.update(deckRef, updates);

        return {
          success: true,
          userEmail,
          userId: targetUserId,
          role
        };
      });

      // Cache successful result
      if (result.success) {
        this.shareCache.set(cacheKey, result);
      }

      return result;

    } catch (error: any) {
      console.error('Share operation failed:', error);
      const result: ShareResult = {
        success: false,
        userEmail,
        error: error.message || 'Share operation failed'
      };
      return result;
    }
  }

  /**
   * Share deck with multiple users in batch (optimized)
   */
  async batchShareDeck(
    batchRequest: BatchShareRequest,
    currentUserId: string
  ): Promise<BatchShareResult> {
    const { deckId, shares } = batchRequest;
    const successful: ShareResult[] = [];
    const failed: ShareResult[] = [];
    const errors: string[] = [];

    try {
      // Verify permission once
      const hasPermission = await this.verifySharePermission(deckId, currentUserId);
      if (!hasPermission) {
        return {
          deckId,
          totalRequested: shares.length,
          successful: [],
          failed: shares.map(share => ({
            success: false,
            userEmail: share.userEmail,
            error: 'Insufficient permissions to share this deck'
          })),
          errors: ['Insufficient permissions to share this deck']
        };
      }

      // Batch lookup users
      const userEmails = shares.map(share => share.userEmail);
      const userLookups = await optimizedUserLookup.lookupMultipleUsersByEmail(userEmails);

      // Process each share request
      const roleUpdates: RoleUpdate[] = [];
      const newCollaboratorIds: string[] = [];

      for (const share of shares) {
        const userId = userLookups.get(share.userEmail);

        if (!userId) {
          failed.push({
            success: false,
            userEmail: share.userEmail,
            error: 'User not found'
          });
          continue;
        }

        roleUpdates.push({
          userId: userId,
          role: share.role
        });

        successful.push({
          success: true,
          userEmail: share.userEmail,
          userId: userId,
          role: share.role
        });
      }

      // Apply all updates in a single transaction
      if (roleUpdates.length > 0) {
        await runTransaction(db, async (transaction) => {
          const deckRef = doc(db, 'decks', deckId);
          const deckDoc = await transaction.get(deckRef);
          
          if (!deckDoc.exists()) {
            throw new Error('Deck not found');
          }

          const deckData = deckDoc.data();
          const updatedRoles = { ...deckData.roles };
          const existingCollaborators = deckData.collaboratorIds || [];
          const collaboratorUpdates: string[] = [];

          // Process role updates
          for (const update of roleUpdates) {
            // Skip if trying to share with owner
            if (deckData.ownerId === update.userId) {
              continue;
            }

            updatedRoles[update.userId] = update.role;
            
            // Track new collaborators
            if (!existingCollaborators.includes(update.userId)) {
              collaboratorUpdates.push(update.userId);
            }
          }

          // Apply updates
          const updates: any = {
            roles: updatedRoles,
            updatedAt: Timestamp.now()
          };

          if (collaboratorUpdates.length > 0) {
            updates.collaboratorIds = arrayUnion(...collaboratorUpdates);
          }

          transaction.update(deckRef, updates);
        });
      }

      // Clear cache for this deck
      this.clearDeckCache(deckId);

      return {
        deckId,
        totalRequested: shares.length,
        successful,
        failed,
        errors
      };

    } catch (error: any) {
      console.error('Batch share operation failed:', error);
      errors.push(error.message || 'Batch share operation failed');
      
      return {
        deckId,
        totalRequested: shares.length,
        successful,
        failed: shares.map(share => ({
          success: false,
          userEmail: share.userEmail,
          error: 'Batch operation failed'
        })),
        errors
      };
    }
  }

  /**
   * Remove user access from deck
   */
  async removeUserAccess(
    deckId: string, 
    userIdToRemove: string, 
    currentUserId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify permission
      const hasPermission = await this.verifySharePermission(deckId, currentUserId);
      if (!hasPermission) {
        return {
          success: false,
          error: 'Insufficient permissions to modify deck sharing'
        };
      }

      await runTransaction(db, async (transaction) => {
        const deckRef = doc(db, 'decks', deckId);
        const deckDoc = await transaction.get(deckRef);
        
        if (!deckDoc.exists()) {
          throw new Error('Deck not found');
        }

        const deckData = deckDoc.data();
        
        // Cannot remove owner
        if (deckData.ownerId === userIdToRemove) {
          throw new Error('Cannot remove deck owner');
        }

        // Update roles and collaborators
        const updatedRoles = { ...deckData.roles };
        delete updatedRoles[userIdToRemove];

        const updates: any = {
          roles: updatedRoles,
          collaboratorIds: arrayRemove(userIdToRemove),
          updatedAt: Timestamp.now()
        };

        transaction.update(deckRef, updates);
      });

      // Clear cache for this deck
      this.clearDeckCache(deckId);

      return { success: true };

    } catch (error: any) {
      console.error('Remove access failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to remove user access'
      };
    }
  }

  /**
   * Update user role on deck
   */
  async updateUserRole(
    deckId: string,
    userId: string,
    newRole: 'editor' | 'viewer',
    currentUserId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify permission
      const hasPermission = await this.verifySharePermission(deckId, currentUserId);
      if (!hasPermission) {
        return {
          success: false,
          error: 'Insufficient permissions to modify deck sharing'
        };
      }

      await runTransaction(db, async (transaction) => {
        const deckRef = doc(db, 'decks', deckId);
        const deckDoc = await transaction.get(deckRef);
        
        if (!deckDoc.exists()) {
          throw new Error('Deck not found');
        }

        const deckData = deckDoc.data();
        
        // Cannot change owner role
        if (deckData.ownerId === userId) {
          throw new Error('Cannot change owner role');
        }

        // Update role
        const updatedRoles = { ...deckData.roles };
        updatedRoles[userId] = newRole;

        transaction.update(deckRef, {
          roles: updatedRoles,
          updatedAt: Timestamp.now()
        });
      });

      // Clear cache for this deck
      this.clearDeckCache(deckId);

      return { success: true };

    } catch (error: any) {
      console.error('Update role failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to update user role'
      };
    }
  }

  /**
   * Get current sharing status for deck
   */
  async getSharingStatus(deckId: string): Promise<{
    success: boolean;
    ownerId?: string;
    collaborators?: Array<{ userId: string; role: string }>;
    error?: string;
  }> {
    try {
      const deckDoc = await getDoc(doc(db, 'decks', deckId));
      if (!deckDoc.exists()) {
        return {
          success: false,
          error: 'Deck not found'
        };
      }

      const deckData = deckDoc.data();
      const roles = deckData.roles || {};
      
      const collaborators = Object.entries(roles).map(([userId, role]) => ({
        userId,
        role: role as string
      }));

      return {
        success: true,
        ownerId: deckData.ownerId,
        collaborators
      };

    } catch (error: any) {
      console.error('Get sharing status failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to get sharing status'
      };
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.shareCache.clear();
  }
}

// Export singleton instance
export const optimizedDeckSharing = new OptimizedDeckSharingService();
export default optimizedDeckSharing;