import { useToast } from "@/hooks/use-toast";
import { githubApi, GitHubOrg } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface UseGitHubOrganizationsOptions {
  /**
   * Username to fetch organizations for
   */
  username: string;

  /**
   * Whether the query is enabled
   */
  enabled?: boolean;
}

/**
 * Hook for fetching a GitHub user's organizations with improved error handling
 */
export function useGitHubOrganizations(username: string, enabled: boolean = false) {
  const { toast } = useToast();

  const {
    data: organizations,
    isLoading,
    error,
    refetch,
    isError,
  } = useQuery<GitHubOrg[], Error>({
    queryKey: ["githubOrganizations", username],
    queryFn: async () => {
      console.log(`Fetching organizations for ${username}...`);

      if (!username?.trim()) {
        console.warn("Attempted to fetch organizations with empty username");
        return [];
      }

      try {
        const orgs = await githubApi.getUserOrgs(username);
        console.log(`Fetched ${orgs.length} organizations for ${username}:`, orgs);
        return orgs;
      } catch (err) {
        console.error(`Error fetching organizations for ${username}:`, err);
        throw err;
      }
    },
    enabled: enabled && Boolean(username?.trim()),
    staleTime: 1000 * 60 * 5, // 5 minutes - reduced from 30 to get fresher data
    gcTime: 1000 * 60 * 30, // 30 minutes
    retry: 2, // Increased retry attempts
  });

  // Handle error with useEffect
  useEffect(() => {
    if (error && enabled) {
      console.error("Error fetching GitHub organizations:", error);
      toast({
        title: "Error Loading Organizations",
        description: "Failed to load organizations. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, enabled, toast]);

  return {
    organizations: organizations || [],
    isLoading,
    isError,
    error,
    refetch,
  };
}
