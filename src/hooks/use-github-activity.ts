import { useToast } from "@/hooks/use-toast";
import { githubApi } from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

interface UseGitHubActivityOptions {
  username: string;
  enabled?: boolean;
  perPage?: number;
}

/**
 * Hook for fetching recent activity of a GitHub user with optimized performance
 */
export function useGitHubActivity({
  username,
  enabled = true,
  perPage = 30,
}: UseGitHubActivityOptions) {
  const { toast } = useToast();

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useInfiniteQuery({
      queryKey: ["githubEvents", username],
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
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === perPage ? allPages.length + 1 : undefined;
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
    hasMore: !!hasNextPage,
    loadMore,
    isLoadingMore: isFetchingNextPage,
    error,
    refetch,
  };
}
