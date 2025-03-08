import { useToast } from "@/hooks/use-toast";
import { githubApi, GitHubEvent } from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Hook for fetching recent activity of a GitHub user
 */
export function useGitHubActivity(username: string, enabled: boolean = false) {
  const { toast } = useToast();

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<GitHubEvent[], Error>({
      queryKey: ["githubEvents", username],
      queryFn: ({ pageParam }) => githubApi.getUserEvents(username, pageParam),
      enabled: enabled && Boolean(username?.trim()),
      initialPageParam: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes (more frequent updates for activity)
      gcTime: 1000 * 60 * 10, // 10 minutes
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 30 ? allPages.length + 1 : undefined;
      },
    });

  // Handle error with useEffect
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

  // Flatten pages of events
  const events = data?.pages.flat() || [];

  // Function to load more events
  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return {
    events,
    isLoading,
    hasMore: !!hasNextPage,
    loadMore,
    isLoadingMore: isFetchingNextPage,
    error,
  };
}
