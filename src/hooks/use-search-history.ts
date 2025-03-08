import { GitHubUser } from "@/lib/api";
import { useCallback, useEffect } from "react";
import { useLocalStorage } from "./use-local-storage";

// Storage key for search history
const STORAGE_KEY = "search-history";

// Maximum number of history items to keep
const MAX_HISTORY_ITEMS = 10;

// Enhanced search history item with timestamp
export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  userData?: {
    name?: string;
    avatar_url?: string;
    bio?: string;
    followers?: number;
    following?: number;
    public_repos?: number;
    organization_count?: number;
  };
}

// Helper function to validate a timestamp
const isValidTimestamp = (timestamp: number): boolean => {
  return !isNaN(timestamp) && timestamp > 0 && timestamp < Date.now() + 8640000000000000; // Max valid JS date
};

interface UseSearchHistoryReturn {
  /**
   * Array of recent search queries
   */
  searchHistory: string[];

  /**
   * Enhanced search history with timestamps
   */
  enhancedSearchHistory: SearchHistoryItem[];

  /**
   * Add a new search query to history
   */
  addToHistory: (query: string, userData?: GitHubUser) => void;

  /**
   * Clear all search history
   */
  clearHistory: () => void;

  /**
   * Remove a specific search query from history
   */
  removeFromHistory: (query: string) => void;

  /**
   * Whether the history is currently loading
   */
  isLoading: boolean;
}

/**
 * Hook to manage search history with localStorage persistence
 * Uses the generic useLocalStorage hook for better error handling and storage management
 */
export function useSearchHistory(): UseSearchHistoryReturn {
  const [historyValue, setHistoryValue, , , isLoading] = useLocalStorage<SearchHistoryItem[]>(
    STORAGE_KEY,
    []
  );

  // Handle migration from old format (string[]) to new format (SearchHistoryItem[])
  useEffect(() => {
    migrateIfNeeded();
  }, []);

  // Migration function to convert old string[] format to SearchHistoryItem[]
  const migrateIfNeeded = () => {
    // Safety check - if historyValue is undefined or not an array
    if (!historyValue) {
      setHistoryValue([]);
      return;
    }

    // Try to detect if we're using the old format (array of strings)
    const needsMigration =
      Array.isArray(historyValue) && historyValue.length > 0 && typeof historyValue[0] === "string";

    if (needsMigration) {
      console.log("Migrating search history from old format...");
      // Convert string[] to SearchHistoryItem[]
      const migratedHistory = (historyValue as unknown as string[]).map(
        (query: string, index: number) => ({
          query,
          timestamp: Date.now() - index * 60000, // Create timestamps offset by 1 min each
          userData: undefined,
        })
      );
      setHistoryValue(migratedHistory);
    }
  };

  // Filter out any invalid items and ensure timestamps are valid - WITH NULL SAFETY
  const validEnhancedHistory = Array.isArray(historyValue)
    ? historyValue.filter(
        (item: SearchHistoryItem) =>
          item &&
          typeof item.query === "string" &&
          item.query.trim() &&
          isValidTimestamp(item.timestamp)
      )
    : [];

  // Derive simple string history for backward compatibility
  const searchHistory = validEnhancedHistory.map((item: SearchHistoryItem) => item.query);

  /**
   * Add a search query to history
   * @param query The search query to add
   * @param userData Optional GitHub user data to save with the history item
   */
  const addToHistory = useCallback(
    (query: string, userData?: GitHubUser) => {
      if (!query.trim()) return;

      setHistoryValue((prevHistory: SearchHistoryItem[]) => {
        // Ensure prevHistory is an array
        const safeHistory = Array.isArray(prevHistory) ? prevHistory : [];

        // Filter out any existing entries with this query
        const filteredHistory = safeHistory.filter((item) => item.query !== query);

        // Create new history item with user data
        const newItem: SearchHistoryItem = {
          query,
          timestamp: Date.now(),
          userData: userData
            ? {
                name: userData.name || undefined,
                avatar_url: userData.avatar_url || undefined,
                bio: userData.bio || undefined,
                followers: userData.followers,
                following: userData.following,
                public_repos: userData.public_repos,
                organization_count: userData.organizations?.length,
              }
            : undefined,
        };

        // Add new item to beginning of array and limit length
        return [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
      });
    },
    [setHistoryValue]
  );

  /**
   * Clear all search history
   */
  const clearHistory = useCallback(() => {
    console.log("Clearing search history");
    setHistoryValue([]);
  }, [setHistoryValue]);

  /**
   * Remove a specific search query from history
   * @param query The query to remove
   */
  const removeFromHistory = useCallback(
    (query: string) => {
      console.log("Removing from history:", query);
      setHistoryValue((prevHistory: SearchHistoryItem[]) => {
        // Ensure prevHistory is an array
        const safeHistory = Array.isArray(prevHistory) ? prevHistory : [];
        return safeHistory.filter((item) => item.query !== query);
      });
    },
    [setHistoryValue]
  );

  return {
    searchHistory,
    enhancedSearchHistory: validEnhancedHistory,
    addToHistory,
    clearHistory,
    removeFromHistory,
    isLoading,
  };
}
