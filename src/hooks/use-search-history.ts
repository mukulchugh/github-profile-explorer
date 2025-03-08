import { GitHubUser } from "@/lib/api";
import { useCallback } from "react";
import { useLocalStorage } from "./use-local-storage";

const STORAGE_KEY = "search-history";

const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  avatar_url?: string;
  html_url?: string;
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

const isValidTimestamp = (timestamp: number): boolean => {
  return !isNaN(timestamp) && timestamp > 0 && timestamp < Date.now() + 8640000000000000;
};

interface UseSearchHistoryReturn {
  searchHistory: string[];
  enhancedSearchHistory: SearchHistoryItem[];
  addToHistory: (query: string, userData?: GitHubUser) => void;
  clearHistory: () => void;
  removeFromHistory: (query: string) => void;
  isLoading: boolean;
}

export function useSearchHistory(): UseSearchHistoryReturn {
  const [historyValue, setHistoryValue, , , isLoading] = useLocalStorage<SearchHistoryItem[]>(
    STORAGE_KEY,
    []
  );

  const validEnhancedHistory = Array.isArray(historyValue)
    ? historyValue.filter(
        (item: SearchHistoryItem) =>
          item &&
          typeof item.query === "string" &&
          item.query.trim() &&
          isValidTimestamp(item.timestamp)
      )
    : [];

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
        const safeHistory = Array.isArray(prevHistory) ? prevHistory : [];

        const filteredHistory = safeHistory.filter((item) => item.query !== query);

        const newItem: SearchHistoryItem = {
          query,
          timestamp: Date.now(),
          avatar_url: userData?.avatar_url || `https://avatars.githubusercontent.com/${query}`,
          html_url: userData?.html_url || `https://github.com/${query}`,
          userData: userData
            ? {
                name: userData.name || undefined,
                avatar_url: userData.avatar_url || undefined,
                bio: userData.bio || undefined,
                followers: userData.followers,
                following: userData.following,
                public_repos: userData.public_repos,
                organization_count: undefined,
              }
            : undefined,
        };

        return [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
      });
    },
    [setHistoryValue]
  );

  const clearHistory = useCallback(() => {
    setHistoryValue([]);
  }, [setHistoryValue]);

  /**
   * Remove a specific search query from history
   * @param query The query to remove
   */
  const removeFromHistory = useCallback(
    (query: string) => {
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
