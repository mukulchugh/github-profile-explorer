import { GitHubUser } from "@/lib/api";
import { useCallback } from "react";
import { useLocalStorage } from "./use-local-storage";
import { useToast } from "./use-toast";

const WATCHLIST_KEY = "user-watchlist";

/**
 * Hook for managing a watch list of GitHub users with persistence
 * Uses the generic useLocalStorage hook for better error handling and storage management
 */
export function useWatchList() {
  const { toast } = useToast();
  const [watchedUsers, setWatchedUsers, clearWatchedUsers, _, isLoading] = useLocalStorage<
    GitHubUser[]
  >(WATCHLIST_KEY, []);

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

      setWatchedUsers((current) => [...current, user]);

      toast({
        title: "Added to watch list",
        description: `${user.login} has been added to your watch list.`,
      });
    },
    [watchedUsers, setWatchedUsers, toast]
  );

  // Remove user from watch list
  const removeFromWatchList = useCallback(
    async (userId: number) => {
      const userToRemove = watchedUsers.find((u) => u.id === userId);
      if (!userToRemove) return;

      setWatchedUsers((current) => current.filter((user) => user.id !== userId));

      toast({
        title: "Removed from watch list",
        description: `${userToRemove.login} has been removed from your watch list.`,
      });
    },
    [watchedUsers, setWatchedUsers, toast]
  );

  const isWatched = useCallback(
    (userId: number) => {
      return watchedUsers.some((user) => user.id === userId);
    },
    [watchedUsers]
  );

  const clearWatchList = useCallback(() => {
    clearWatchedUsers();

    toast({
      title: "Watch list cleared",
      description: "All users have been removed from your watch list.",
    });
  }, [clearWatchedUsers, toast]);

  return {
    watchedUsers,
    isLoading,
    addToWatchList,
    removeFromWatchList,
    isWatched,
    clearWatchList,
  };
}
