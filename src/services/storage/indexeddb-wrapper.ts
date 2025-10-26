/**
 * IndexedDB Wrapper
 *
 * Low-level wrapper around IndexedDB API for type-safe operations.
 * Provides promise-based interface for CRUD operations.
 *
 * DESIGN PHILOSOPHY - LOCAL-FIRST:
 * - Type-safe operations
 * - Promise-based async API
 * - Transaction management
 * - Error handling
 * - Support for batch operations
 *
 * TDD: Built to pass indexeddb-wrapper.test.ts
 */

import { initializeDatabase } from './schema';

export class IndexedDBWrapper {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private dbVersion: number;

  constructor(dbName: string, dbVersion: number) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
  }

  /**
   * Open database connection
   */
  async open(): Promise<void> {
    if (this.db && !this.db.objectStoreNames.contains('_deleted_')) {
      return; // Already open
    }

    this.db = await initializeDatabase();
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Delete database
   */
  async deleteDatabase(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.dbName);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete database'));
    });
  }

  /**
   * Check if database is open
   */
  isOpen(): boolean {
    return this.db !== null && !this.db.objectStoreNames.contains('_deleted_');
  }

  /**
   * Get item by key
   */
  async get<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
    this.ensureOpen();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Failed to get item from ${storeName}`));
    });
  }

  /**
   * Get all items from store
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    this.ensureOpen();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Failed to get all items from ${storeName}`));
    });
  }

  /**
   * Get items by index value
   */
  async getAllByIndex<T>(storeName: string, indexName: string, value: IDBValidKey): Promise<T[]> {
    this.ensureOpen();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Failed to get items by index ${indexName} from ${storeName}`));
    });
  }

  /**
   * Put (create or update) item in store
   */
  async put<T extends { id: string }>(storeName: string, item: T): Promise<string> {
    this.ensureOpen();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onsuccess = () => resolve(item.id);
      request.onerror = () => reject(new Error(`Failed to put item in ${storeName}`));
    });
  }

  /**
   * Put multiple items in store
   */
  async putMany<T extends { id: string }>(storeName: string, items: T[]): Promise<string[]> {
    this.ensureOpen();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const ids: string[] = [];

      let completed = 0;
      let hasError = false;

      items.forEach((item) => {
        const request = store.put(item);
        request.onsuccess = () => {
          ids.push(item.id);
          completed++;
          if (completed === items.length && !hasError) {
            resolve(ids);
          }
        };
        request.onerror = () => {
          if (!hasError) {
            hasError = true;
            reject(new Error(`Failed to put items in ${storeName}`));
          }
        };
      });

      if (items.length === 0) {
        resolve([]);
      }
    });
  }

  /**
   * Delete item by key
   */
  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    this.ensureOpen();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to delete item from ${storeName}`));
    });
  }

  /**
   * Delete multiple items by keys
   */
  async deleteMany(storeName: string, keys: IDBValidKey[]): Promise<void> {
    this.ensureOpen();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);

      let completed = 0;
      let hasError = false;

      keys.forEach((key) => {
        const request = store.delete(key);
        request.onsuccess = () => {
          completed++;
          if (completed === keys.length && !hasError) {
            resolve();
          }
        };
        request.onerror = () => {
          if (!hasError) {
            hasError = true;
            reject(new Error(`Failed to delete items from ${storeName}`));
          }
        };
      });

      if (keys.length === 0) {
        resolve();
      }
    });
  }

  /**
   * Clear all items from store
   */
  async clear(storeName: string): Promise<void> {
    this.ensureOpen();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to clear ${storeName}`));
    });
  }

  /**
   * Count all items in store
   */
  async count(storeName: string): Promise<number> {
    this.ensureOpen();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Failed to count items in ${storeName}`));
    });
  }

  /**
   * Count items by index value
   */
  async countByIndex(storeName: string, indexName: string, value: IDBValidKey): Promise<number> {
    this.ensureOpen();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.count(value);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error(`Failed to count items by index ${indexName} in ${storeName}`));
    });
  }

  /**
   * Ensure database is open, throw error if not
   */
  private ensureOpen(): void {
    if (!this.db) {
      throw new Error('Database is not open');
    }
  }
}
