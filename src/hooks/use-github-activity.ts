import { useToast } from "@/hooks/use-toast";
import { githubApi, GitHubEvent } from "@/lib/api";
import { CACHE_TIME_SHORT, DEFAULT_GC_TIME, DEFAULT_RETRY_COUNT } from "@/lib/constants";
import { QUERY_KEYS } from "@/lib/query-client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

interface UseGitHubActivityOptions {
  /**
   * Username to fetch activity for
   */
  username: string;

  /**
   * Whether the query is enabled
   */
  enabled?: boolean;
}

interface UseGitHubActivityReturn {
  /**
   * List of GitHub events for the user
   */
  events: GitHubEvent[];

  /**
   * Whether data is currently loading
   */
  isLoading: boolean;

  /**
   * Error message if any
   */
  error: string | null;

  /**
   * Whether there are more events to load
   */
  hasMore: boolean;

  /**
   * Function to load more events
   */
  loadMore: () => void;

  /**
   * Whether more data is currently being loaded
   */
  isLoadingMore: boolean;
}

/**
 * Hook for fetching recent activity of a GitHub user with optimized performance
 */
export function useGitHubActivity({
  username,
  enabled = false,
}: UseGitHubActivityOptions): UseGitHubActivityReturn {
  const { toast } = useToast();

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: [QUERY_KEYS.ACTIVITY, username],
      queryFn: async ({ pageParam }) => {
        if (!username?.trim()) {
          return [];
        }

        try {
          return await githubApi.getUserEvents(username, pageParam);
        } catch (error) {
          console.error(`Error fetching events for ${username}:`, error);
          throw error;
        }
      },
      enabled: enabled && Boolean(username?.trim()),
      initialPageParam: 1,
      staleTime: CACHE_TIME_SHORT,
      gcTime: DEFAULT_GC_TIME,
      retry: DEFAULT_RETRY_COUNT,
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 30 ? allPages.length + 1 : undefined;
      },
    });

  useEffect(() => {
    if (error && enabled) {
      console.error("Error fetching GitHub events:", error);
      toast({
        title: "Error",
        description: "Failed to load GitHub activity. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, enabled, toast]);

  const events = data?.pages.flat() || [];

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    events,
    isLoading,
    error: error ? (error as Error).message || "Unknown error occurred" : null,
    hasMore: !!hasNextPage,
    loadMore,
    isLoadingMore: isFetchingNextPage,
  };
}
