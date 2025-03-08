import { githubApi, GitHubUser, UserSearchResult } from "@/lib/api";
import { DEFAULT_GC_TIME, DEFAULT_RETRY_COUNT, DEFAULT_STALE_TIME } from "@/lib/constants";
import { QUERY_KEYS } from "@/lib/query-client";
import { useInfiniteQuery, useQuery, UseQueryResult } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "./use-debounce";

interface UseGitHubSearchReturn {
  searchUsers: {
    data: UserSearchResult | undefined;
    items: GitHubUser[];
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
    queryKey: [QUERY_KEYS.USERS, debouncedQuery, perPage],
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
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
    retry: DEFAULT_RETRY_COUNT,
  });

  const userDetailsQuery = useQuery({
    queryKey: [QUERY_KEYS.USER, username],
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
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
    retry: DEFAULT_RETRY_COUNT,
  });

  useEffect(() => {
    if (safeQuery.trim() !== debouncedQuery.trim()) {
      setIsSearching(true);
    } else {
      setIsSearching(searchUsersInfiniteQuery.isLoading);
    }
  }, [safeQuery, debouncedQuery, searchUsersInfiniteQuery.isLoading]);

  const items = useMemo(() => {
    return searchUsersInfiniteQuery.data?.pages.flatMap((page) => page.items) || [];
  }, [searchUsersInfiniteQuery.data?.pages]);

  const totalCount = searchUsersInfiniteQuery.data?.pages[0]?.total_count || 0;

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
