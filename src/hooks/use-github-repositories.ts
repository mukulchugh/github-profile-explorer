import { githubApi, GitHubRepository } from "@/lib/api";
import { DEFAULT_GC_TIME, DEFAULT_RETRY_COUNT, DEFAULT_STALE_TIME } from "@/lib/constants";
import { QUERY_KEYS } from "@/lib/query-client";
import { PaginatedQueryResult, UserQueryOptions } from "@/lib/query-types";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface UseGitHubRepositoriesOptions extends UserQueryOptions {
  /**
   * Number of repositories to fetch per page
   */
  pageSize?: number;

  /**
   * Sorting parameter for repositories
   */
  sort?: "created" | "updated" | "pushed" | "full_name";

  /**
   * Sort direction
   */
  direction?: "asc" | "desc";
}

interface UseGitHubRepositoriesReturn extends PaginatedQueryResult {
  /**
   * List of GitHub repositories
   */
  repositories: GitHubRepository[];

  /**
   * Filter repositories by some criteria
   */
  filterRepositories: (filterFn: (repo: GitHubRepository) => boolean) => GitHubRepository[];
}

/**
 * Hook for fetching a GitHub user's repositories
 */
export function useGitHubRepositories({
  username,
  pageSize = 10,
  sort = "updated",
  direction = "desc",
  enabled = false,
}: UseGitHubRepositoriesOptions): UseGitHubRepositoriesReturn {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<GitHubRepository[], Error>({
      queryKey: [QUERY_KEYS.REPOSITORIES, username, sort],
      queryFn: async ({ pageParam = 1 }) => {
        if (!username?.trim()) {
          console.warn("Attempted to fetch repositories with empty username");
          return [];
        }

        try {
          return await githubApi.getUserRepos(
            username,
            pageParam as number,
            pageSize,
            sort,
            direction
          );
        } catch (error) {
          console.error(`Error fetching repositories for ${username}:`, error);
          throw error;
        }
      },
      initialPageParam: 1,
      enabled: enabled && Boolean(username?.trim()),
      staleTime: DEFAULT_STALE_TIME,
      gcTime: DEFAULT_GC_TIME,
      retry: DEFAULT_RETRY_COUNT,
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === pageSize ? allPages.length + 1 : undefined;
      },
    });

  // Flatten all pages into a single array of repositories
  const repositories = useMemo(() => {
    return data?.pages.flat() || [];
  }, [data?.pages]);

  // Function to filter repositories by custom criteria
  const filterRepositories = useMemo(() => {
    return (filterFn: (repo: GitHubRepository) => boolean) => {
      return repositories.filter(filterFn);
    };
  }, [repositories]);

  // Function to load more repositories
  const loadMore = () => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  };

  return {
    repositories,
    filterRepositories,
    isLoading,
    error: error ? (error as Error).message || "Unknown error occurred" : null,
    hasMore: !!hasNextPage,
    loadMore,
    isLoadingMore: isFetchingNextPage,
  };
}
