import { useToast } from "@/hooks/use-toast";
import { githubApi, GitHubUser } from "@/lib/api";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Hook for fetching followers or following users for a GitHub user
 */
export function useGitHubFollowers(
  username: string,
  type: "followers" | "following" = "followers",
  enabled: boolean = false
) {
  const { toast } = useToast();

  const fetchFn =
    type === "followers"
      ? (page: number) => githubApi.getFollowers(username, page)
      : (page: number) => githubApi.getFollowing(username, page);

  const queryKey = [`github${type.charAt(0).toUpperCase() + type.slice(1)}`, username];

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<GitHubUser[], Error>({
      queryKey,
      queryFn: ({ pageParam }) => fetchFn(pageParam),
      enabled: enabled && Boolean(username?.trim()),
      initialPageParam: 1,
      staleTime: 1000 * 60 * 10, // 10 minutes
      gcTime: 1000 * 60 * 20, // 20 minutes
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === 30 ? allPages.length + 1 : undefined;
      },
    });

  // Handle error with useEffect
  useEffect(() => {
    if (error && enabled) {
      let errorMessage = `Failed to load ${type}. Please try again.`;
      let variant = "destructive";

      if (error instanceof Error && error.message.includes("rate limit")) {
        errorMessage = error.message;
        variant = "warning";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: variant as "default" | "destructive",
      });
    }
  }, [error, enabled, type, toast]);

  // Flattened users data
  const users = data?.pages.flat() || [];

  const loadMore = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  return {
    users,
    isLoading,
    error: error ? (error as Error).message || "Unknown error occurred" : null,
    hasMore: !!hasNextPage,
    loadMore,
    isLoadingMore: isFetchingNextPage,
  };
}
