import { GitHubUser } from "@/lib/api";
import { useEffect, useState } from "react";

const STORAGE_KEY = "github-watchlist";

interface UseWatchlistReturn {
  /**
   * Array of users in the watchlist
   */
  watchlist: GitHubUser[];

  /**
   * Add a user to the watchlist
   */
  addToWatchlist: (user: GitHubUser) => void;

  /**
   * Remove a user from the watchlist
   */
  removeFromWatchlist: (userId: number) => void;

  /**
   * Check if a user is already in the watchlist
   */
  isInWatchlist: (userId: number) => boolean;

  /**
   * Clear the entire watchlist
   */
  clearWatchlist: () => void;
}

/**
 * Hook to manage GitHub user watchlist with persistence
 */
export function useWatchlist(): UseWatchlistReturn {
  const [watchlist, setWatchlist] = useState<GitHubUser[]>([]);

  // Load watchlist from localStorage on init
  useEffect(() => {
    try {
      const savedWatchlist = localStorage.getItem(STORAGE_KEY);
      if (savedWatchlist) {
        setWatchlist(JSON.parse(savedWatchlist));
      }
    } catch (error) {
      console.error("Failed to load watchlist:", error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    } catch (error) {
      console.error("Failed to save watchlist:", error);
    }
  }, [watchlist]);

  /**
   * Add a user to the watchlist
   */
  const addToWatchlist = (user: GitHubUser) => {
    setWatchlist((prev) => {
      // Don't add if already exists
      if (prev.some((item) => item.id === user.id)) {
        return prev;
      }
      return [...prev, user];
    });
  };

  /**
   * Remove a user from the watchlist
   */
  const removeFromWatchlist = (userId: number) => {
    setWatchlist((prev) => prev.filter((user) => user.id !== userId));
  };

  /**
   * Check if a user is already in the watchlist
   */
  const isInWatchlist = (userId: number) => {
    return watchlist.some((user) => user.id === userId);
  };

  /**
   * Clear the entire watchlist
   */
  const clearWatchlist = () => {
    setWatchlist([]);
  };

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    clearWatchlist,
  };
}
