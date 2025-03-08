/**
 * Storage utility for managing localStorage with improved typing and error handling
 */

// Storage version - increment this when storage schema changes
const STORAGE_VERSION = 1;

// Prefix for all storage keys to avoid conflicts
const STORAGE_PREFIX = "github-explorer";

// Types for storage metadata
interface StorageMetadata {
  version: number;
  updatedAt: string;
}

// Generic interface for all storage items
export interface StorageItem<T> {
  data: T;
  metadata: StorageMetadata;
}

/**
 * Generate a prefixed storage key
 */
export const createStorageKey = (key: string): string => {
  return `${STORAGE_PREFIX}:${key}`;
};

/**
 * Set an item in localStorage with proper structure and error handling
 */
export const setStorageItem = <T>(key: string, data: T): boolean => {
  const storageKey = createStorageKey(key);

  try {
    const item: StorageItem<T> = {
      data,
      metadata: {
        version: STORAGE_VERSION,
        updatedAt: new Date().toISOString(),
      },
    };

    localStorage.setItem(storageKey, JSON.stringify(item));
    return true;
  } catch (error) {
    console.error(`Error setting localStorage item ${key}:`, error);
    return false;
  }
};

/**
 * Get an item from localStorage with proper typing and error handling
 */
export const getStorageItem = <T>(key: string, defaultValue?: T): T | undefined => {
  const storageKey = createStorageKey(key);

  try {
    const item = localStorage.getItem(storageKey);

    if (!item) {
      return defaultValue;
    }

    const parsedItem = JSON.parse(item) as StorageItem<T>;

    // Check if the storage version matches
    if (parsedItem.metadata?.version !== STORAGE_VERSION) {
      console.warn(
        `Storage version mismatch for key ${key}. Expected ${STORAGE_VERSION}, got ${parsedItem.metadata?.version}`
      );
      removeStorageItem(key);
      return defaultValue;
    }

    return parsedItem.data;
  } catch (error) {
    console.error(`Error getting localStorage item ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Remove an item from localStorage
 */
export const removeStorageItem = (key: string): boolean => {
  const storageKey = createStorageKey(key);

  try {
    localStorage.removeItem(storageKey);
    return true;
  } catch (error) {
    console.error(`Error removing localStorage item ${key}:`, error);
    return false;
  }
};

/**
 * Clear all app-related localStorage items
 */
export const clearAllStorage = (): boolean => {
  try {
    // Only clear keys with our prefix
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error("Error clearing localStorage:", error);
    return false;
  }
};

/**
 * Check if localStorage is available
 */
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = `${STORAGE_PREFIX}:test`;
    localStorage.setItem(testKey, "test");
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};
