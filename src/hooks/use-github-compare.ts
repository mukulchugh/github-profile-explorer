import { useToast } from "@/hooks/use-toast";
import { githubApi, GitHubUser } from "@/lib/api";
import { CACHE_TIME_MEDIUM, DEFAULT_GC_TIME, DEFAULT_RETRY_COUNT } from "@/lib/constants";
import { QUERY_KEYS } from "@/lib/query-client";
import { useQueries } from "@tanstack/react-query";
import { useEffect } from "react";

interface UseGitHubCompareOptions {
  /**
   * List of usernames to compare
   */
  usernames: string[];

  /**
   * Whether the query is enabled
   */
  enabled?: boolean;
}

interface UseGitHubCompareReturn {
  /**
   * List of fetched users
   */
  users: GitHubUser[];

  /**
   * Whether any user data is currently loading
   */
  isLoading: boolean;

  /**
   * Whether any errors occurred during fetching
   */
  hasErrors: boolean;
}

/**
 * Hook for comparing multiple GitHub users
 */
export function useGitHubCompare({
  usernames,
  enabled = true,
}: UseGitHubCompareOptions): UseGitHubCompareReturn {
  const { toast } = useToast();

  const validUsernames = usernames.filter((name) => name?.trim());

  const results = useQueries({
    queries: validUsernames.map((username) => ({
      queryKey: [QUERY_KEYS.USER, username],
      queryFn: () => githubApi.getUserDetails(username),
      staleTime: CACHE_TIME_MEDIUM,
      gcTime: DEFAULT_GC_TIME,
      enabled: Boolean(username?.trim()) && enabled,
      retry: DEFAULT_RETRY_COUNT,
    })),
  });

  useEffect(() => {
    results.forEach((result, index) => {
      if (result.error) {
        let errorMessage = `Failed to fetch user ${validUsernames[index]}.`;
        let variant = "destructive";

        if (result.error instanceof Error) {
          if (result.error.message.includes("Not Found")) {
            errorMessage = `User "${validUsernames[index]}" was not found.`;
          } else if (result.error.message.includes("rate limit")) {
            errorMessage = result.error.message;
            variant = "default";
          }
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: variant as "default" | "destructive",
        });
      }
    });
  }, [results, validUsernames, toast]);

  const isLoading = results.some((result) => result.isLoading);

  const users: GitHubUser[] = results
    .filter((result) => result.data)
    .map((result) => result.data as GitHubUser);

  return {
    users,
    isLoading,
    hasErrors: results.some((result) => result.error),
  };
}
