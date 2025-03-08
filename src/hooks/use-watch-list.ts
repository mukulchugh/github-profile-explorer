import { GitHubUser } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import { useToast } from "./use-toast";

// Define storage keys
const WATCHLIST_KEY = "github-user-watchlist";

// Define the shape of our watch list storage
interface WatchListStorage {
  users: GitHubUser[];
  updatedAt: string;
}

/**
 * Hook for managing a watch list of GitHub users with persistence
 */
export function useWatchList() {
  const [watchedUsers, setWatchedUsers] = useState<GitHubUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Initialize: Load data from storage on component mount
  useEffect(() => {
    loadWatchList();
  }, []);

  // Load watch list from storage
  const loadWatchList = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedData = localStorage.getItem(WATCHLIST_KEY);

      if (storedData) {
        const parsedData: WatchListStorage = JSON.parse(storedData);
        setWatchedUsers(parsedData.users || []);
      }
    } catch (error) {
      console.error("Error loading watch list:", error);
      toast({
        title: "Error",
        description: "Failed to load your watched users.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Save watch list to storage
  const saveWatchList = useCallback(
    async (users: GitHubUser[]) => {
      try {
        const dataToStore: WatchListStorage = {
          users,
          updatedAt: new Date().toISOString(),
        };

        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(dataToStore));
      } catch (error) {
        console.error("Error saving watch list:", error);
        toast({
          title: "Error",
          description: "Failed to save your watched users.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  // Add user to watch list
  const addToWatchList = useCallback(
    async (user: GitHubUser) => {
      // Check if user is already in the watch list
      const isAlreadyWatched = watchedUsers.some((u) => u.id === user.id);

      if (isAlreadyWatched) {
        toast({
          title: "Already watching",
          description: `You're already watching ${user.login}.`,
        });
        return;
      }

      const newWatchList = [...watchedUsers, user];
      setWatchedUsers(newWatchList);
      await saveWatchList(newWatchList);

      toast({
        title: "Added to watch list",
        description: `${user.login} has been added to your watch list.`,
      });
    },
    [watchedUsers, saveWatchList, toast]
  );

  // Remove user from watch list
  const removeFromWatchList = useCallback(
    async (userId: number) => {
      const userToRemove = watchedUsers.find((u) => u.id === userId);
      if (!userToRemove) return;

      const newWatchList = watchedUsers.filter((user) => user.id !== userId);
      setWatchedUsers(newWatchList);
      await saveWatchList(newWatchList);

      toast({
        title: "Removed from watch list",
        description: `${userToRemove.login} has been removed from your watch list.`,
      });
    },
    [watchedUsers, saveWatchList, toast]
  );

  // Check if a user is in the watch list
  const isWatched = useCallback(
    (userId: number) => {
      return watchedUsers.some((user) => user.id === userId);
    },
    [watchedUsers]
  );

  // Clear the entire watch list
  const clearWatchList = useCallback(async () => {
    setWatchedUsers([]);
    await saveWatchList([]);

    toast({
      title: "Watch list cleared",
      description: "All users have been removed from your watch list.",
    });
  }, [saveWatchList, toast]);

  return {
    watchedUsers,
    isLoading,
    addToWatchList,
    removeFromWatchList,
    isWatched,
    clearWatchList,
    refreshWatchList: loadWatchList,
  };
}
