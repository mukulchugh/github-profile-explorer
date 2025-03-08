import { useToast } from "@/hooks/use-toast";
import { githubApi, GitHubUser } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Hook to fetch GitHub user details with appropriate caching
 * @param username GitHub username to fetch details for
 * @param enabled Whether the query should be enabled
 * @returns The user details and loading state
 */
export function useGitHubUserDetails(username: string, enabled: boolean = false) {
  const { toast } = useToast();

  const {
    data: userDetails,
    isLoading,
    error,
    refetch,
    isError,
  } = useQuery<GitHubUser, Error>({
    queryKey: ["githubUserDetails", username],
    queryFn: async () => {
      console.log(`Fetching user details for ${username}...`);

      if (!username?.trim()) {
        console.warn("Attempted to fetch user details with empty username");
        throw new Error("Username is required");
      }

      try {
        const user = await githubApi.getUserDetails(username);
        console.log(`Fetched details for ${username}:`, user);
        return user;
      } catch (err) {
        console.error(`Error fetching user details for ${username}:`, err);
        throw err;
      }
    },
    enabled: enabled && Boolean(username?.trim()),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
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
    userDetails,
    isLoading,
    isError,
    error,
    refetch,
  };
}
