import { useToast } from "@/hooks/use-toast";
import { githubApi, GitHubUser } from "@/lib/api";
import { CACHE_TIME_MEDIUM, DEFAULT_GC_TIME, DEFAULT_RETRY_COUNT } from "@/lib/constants";
import { QUERY_KEYS } from "@/lib/query-client";
import { PaginatedQueryResult, UserQueryOptions } from "@/lib/query-types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface UseGitHubFollowersOptions extends UserQueryOptions {
  /**
   * Type of relationship to fetch
   */
  type?: "followers" | "following";
}

interface UseGitHubFollowersReturn extends PaginatedQueryResult {
  /**
   * List of users that are followers or being followed
   */
  users: GitHubUser[];
}

/**
 * Hook for fetching followers or following users for a GitHub user
 */
export function useGitHubFollowers({
  username,
  type = "followers",
  enabled = false,
}: UseGitHubFollowersOptions): UseGitHubFollowersReturn {
  const { toast } = useToast();

  const fetchFn =
    type === "followers"
      ? (page: number) => githubApi.getFollowers(username, page)
      : (page: number) => githubApi.getFollowing(username, page);

  // Use the appropriate query key based on the type
  const queryKeyType = type === "followers" ? QUERY_KEYS.FOLLOWERS : QUERY_KEYS.FOLLOWING;
  const queryKey = [queryKeyType, username];

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<GitHubUser[], Error>({
      queryKey,
      queryFn: ({ pageParam }) => fetchFn(pageParam as number),
      enabled: enabled && Boolean(username?.trim()),
      initialPageParam: 1,
      staleTime: CACHE_TIME_MEDIUM,
      gcTime: DEFAULT_GC_TIME,
      retry: DEFAULT_RETRY_COUNT,
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
