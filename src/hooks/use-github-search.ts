import { githubApi, GitHubUser, UserSearchResult } from "@/lib/api";
import { useInfiniteQuery, useQuery, UseQueryResult } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "./use-debounce";

interface UseGitHubSearchReturn {
  searchUsers: {
    data: UserSearchResult | undefined;
    items: GitHubUser[]; // Flattened items from all pages
    totalCount: number;
    isLoading: boolean;
    isSearching: boolean;
    error: Error | null;
    fetchNextPage: () => void;
    hasNextPage: boolean | undefined;
    isFetchingNextPage: boolean;
  };

  getUserDetails: UseQueryResult<GitHubUser, Error>;

  searchState: {
    query: string;
    debouncedQuery: string;
  };
}

interface UseGitHubSearchOptions {
  query?: string;
  username?: string;
  perPage?: number;
  enabled?: boolean;
}

export function useGitHubSearch({
  query = "",
  username,
  perPage = 10,
  enabled = true,
}: UseGitHubSearchOptions = {}): UseGitHubSearchReturn {
  const safeQuery = typeof query === "string" ? query : "";
  const [isSearching, setIsSearching] = useState(false);

  const debouncedQuery = useDebounce(safeQuery, 500);

  const searchUsersInfiniteQuery = useInfiniteQuery({
    queryKey: ["githubUsers", debouncedQuery, perPage],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        if (!debouncedQuery.trim()) {
          return { items: [], total_count: 0, incomplete_results: false } as UserSearchResult;
        }
        return await githubApi.searchUsers(debouncedQuery, pageParam, perPage);
      } catch (error) {
        console.error("Error searching users:", error);
        throw error;
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.ceil(lastPage.total_count / perPage);
      const nextPage = allPages.length + 1;
      return nextPage <= totalPages ? nextPage : undefined;
    },
    enabled: enabled && Boolean(debouncedQuery?.trim()),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  const userDetailsQuery = useQuery({
    queryKey: ["githubUser", username],
    queryFn: async () => {
      try {
        if (!username) throw new Error("Username is required");
        return await githubApi.getUserDetails(username);
      } catch (error) {
        console.error(`Error fetching user details for ${username}:`, error);
        throw error;
      }
    },
    enabled: enabled && Boolean(username),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  useEffect(() => {
    if (safeQuery.trim() !== debouncedQuery.trim()) {
      setIsSearching(true);
    } else {
      setIsSearching(searchUsersInfiniteQuery.isLoading);
    }
  }, [safeQuery, debouncedQuery, searchUsersInfiniteQuery.isLoading]);

  // Use useMemo to avoid unnecessary recalculations
  const items = useMemo(() => {
    return searchUsersInfiniteQuery.data?.pages.flatMap((page) => page.items) || [];
  }, [searchUsersInfiniteQuery.data?.pages]);

  // Get the total count from the first page (all pages have the same total_count)
  const totalCount = searchUsersInfiniteQuery.data?.pages[0]?.total_count || 0;

  // For backward compatibility, provide the first page data as the data property
  const firstPageData = searchUsersInfiniteQuery.data?.pages[0];

  return {
    searchUsers: {
      data: firstPageData,
      items,
      totalCount,
      isLoading: searchUsersInfiniteQuery.isLoading,
      isSearching,
      error: searchUsersInfiniteQuery.error as Error | null,
      fetchNextPage: searchUsersInfiniteQuery.fetchNextPage,
      hasNextPage: searchUsersInfiniteQuery.hasNextPage,
      isFetchingNextPage: searchUsersInfiniteQuery.isFetchingNextPage,
    },
    getUserDetails: userDetailsQuery,
    searchState: {
      query: safeQuery,
      debouncedQuery,
    },
  };
}
