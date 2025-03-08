import { useToast } from "@/hooks/use-toast";
import { githubApi, GitHubUser } from "@/lib/api";
import { DEFAULT_GC_TIME, DEFAULT_RETRY_COUNT, DEFAULT_STALE_TIME } from "@/lib/constants";
import { QUERY_KEYS } from "@/lib/query-client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Hook to fetch GitHub user details with appropriate caching
 * @param username GitHub username to fetch details for
 * @param enabled Whether the query should be enabled
 * @returns The user details and loading state
 */
export function useGitHubUserDetails(username: string, enabled: boolean = true) {
  const { toast } = useToast();

  const {
    data: user,
    isLoading,
    error,
    isError,
    refetch,
  } = useQuery<GitHubUser, Error>({
    queryKey: [QUERY_KEYS.USER, username],
    queryFn: async () => {
      if (!username?.trim()) {
        console.warn("Attempted to fetch user details with empty username");
        throw new Error("Username is required");
      }

      try {
        const user = await githubApi.getUserDetails(username);
        return user;
      } catch (err) {
        console.error(`Error fetching user details for ${username}:`, err);
        throw err;
      }
    },
    enabled: enabled && Boolean(username?.trim()),
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
    retry: DEFAULT_RETRY_COUNT,
  });

  // Handle error with useEffect
  useEffect(() => {
    if (error && enabled) {
      console.error("Error fetching GitHub user details:", error);
      toast({
        title: "Error Loading User Details",
        description: "Failed to load user details. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, enabled, toast]);

  return {
    user,
    isLoading,
    isError,
    error,
    refetch,
  };
}
