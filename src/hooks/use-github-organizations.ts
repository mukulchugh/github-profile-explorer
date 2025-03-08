import { useToast } from "@/hooks/use-toast";
import { githubApi, GitHubOrg } from "@/lib/api";
import { CACHE_TIME_SHORT, DEFAULT_GC_TIME, DEFAULT_RETRY_COUNT } from "@/lib/constants";
import { QUERY_KEYS } from "@/lib/query-client";
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

interface UseGitHubOrganizationsReturn {
  organizations: GitHubOrg[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook for fetching a GitHub user's organizations with improved error handling
 */
export function useGitHubOrganizations({
  username,
  enabled = false,
}: UseGitHubOrganizationsOptions): UseGitHubOrganizationsReturn {
  const { toast } = useToast();

  const {
    data: organizations,
    isLoading,
    error,
    refetch,
    isError,
  } = useQuery<GitHubOrg[], Error>({
    queryKey: [QUERY_KEYS.ORGANIZATIONS, username],
    queryFn: async () => {
      if (!username?.trim()) {
        console.warn("Attempted to fetch organizations with empty username");
        return [];
      }
      try {
        const orgs = await githubApi.getUserOrgs(username);
        return orgs;
      } catch (err) {
        console.error(`Error fetching organizations for ${username}:`, err);
        throw err;
      }
    },
    enabled: enabled && Boolean(username?.trim()),
    staleTime: CACHE_TIME_SHORT,
    gcTime: DEFAULT_GC_TIME,
    retry: DEFAULT_RETRY_COUNT,
  });

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
    error: error || null,
    refetch,
  };
}
