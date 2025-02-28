// src/services/storageService.ts
/**
 * Service for handling local storage operations
 */

export const storageService = {
  /**
   * Get item from storage
   * @param key - Storage key
   * @returns Stored value or null
   */
  get: <T>(key: string): T | null => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting item ${key} from storage:`, error);
      return null;
    }
  },

  /**
   * Set item in storage
   * @param key - Storage key
   * @param value - Value to store
   */
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item ${key} in storage:`, error);
    }
  },

  /**
   * Remove item from storage
   * @param key - Storage key
   */
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key} from storage:`, error);
    }
  },

  /**
   * Clear all storage items
   */
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  /**
   * Get all storage keys
   * @returns Array of storage keys
   */
  getKeys: (): string[] => {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error getting storage keys:', error);
      return [];
    }
  },
};