import { useEffect, useState } from "react";

const STORAGE_KEY = "github-search-history";
const MAX_HISTORY_ITEMS = 10;

interface UseSearchHistoryReturn {
  /**
   * Array of recent search queries
   */
  searchHistory: string[];

  /**
   * Add a new search query to history
   */
  addToHistory: (query: string) => void;

  /**
   * Clear all search history
   */
  clearHistory: () => void;

  /**
   * Remove a specific search query from history
   */
  removeFromHistory: (query: string) => void;
}

/**
 * Hook to manage search history for autocomplete
 */
export function useSearchHistory(): UseSearchHistoryReturn {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history from localStorage on init
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEY);
      if (savedHistory) {
        setSearchHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to load search history:", error);
      // If localStorage is corrupted, reset it
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Save search history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(searchHistory));
    } catch (error) {
      console.error("Failed to save search history:", error);
    }
  }, [searchHistory]);

  /**
   * Add a search query to history
   */
  const addToHistory = (query: string) => {
    if (!query.trim()) return;

    setSearchHistory((prevHistory) => {
      // Remove the query if it already exists (to avoid duplicates)
      const filteredHistory = prevHistory.filter((item) => item !== query);

      // Add the new query to the beginning of the array
      return [query, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
    });
  };

  /**
   * Clear all search history
   */
  const clearHistory = () => {
    setSearchHistory([]);
  };

  /**
   * Remove a specific search query from history
   */
  const removeFromHistory = (query: string) => {
    setSearchHistory((prevHistory) => prevHistory.filter((item) => item !== query));
  };

  return {
    searchHistory,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}
