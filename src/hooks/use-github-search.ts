import { githubApi, GitHubUser, UserSearchResult } from "@/lib/api";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useDebounce } from "./use-debounce";
import { useSearchHistory } from "./use-search-history";

interface UseGitHubSearchReturn {
  /**
   * Search for GitHub users
   */
  searchUsers: {
    data: UserSearchResult | undefined;
    isLoading: boolean;
    isSearching: boolean;
    error: Error | null;
  };

  /**
   * Get details for a specific user
   */
  getUserDetails: UseQueryResult<GitHubUser, Error>;

  /**
   * Add search term to history
   */
  addToHistory: (query: string) => void;

  /**
   * Get search history for autocomplete
   */
  searchHistory: string[];

  /**
   * Current search state
   */
  searchState: {
    query: string;
    debouncedQuery: string;
  };
}

interface UseGitHubSearchOptions {
  /**
   * Current search query
   */
  query?: string;

  /**
   * Username to get details for
   */
  username?: string;

  /**
   * Page number for search results
   */
  page?: number;

  /**
   * Results per page
   */
  perPage?: number;

  /**
   * Enable or disable automatic searching
   */
  enabled?: boolean;
}

/**
 * Hook to search GitHub users and get user details
 */
export function useGitHubSearch({
  query = "",
  username,
  page = 1,
  perPage = 10,
  enabled = true,
}: UseGitHubSearchOptions = {}): UseGitHubSearchReturn {
  // Safety check for query
  const safeQuery = typeof query === "string" ? query : "";

  const { searchHistory, addToHistory } = useSearchHistory();
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search query to prevent too many API calls
  const debouncedQuery = useDebounce(safeQuery, 500);

  // Search users query with error handling
  const searchUsersQuery = useQuery({
    queryKey: ["githubUsers", debouncedQuery, page, perPage],
    queryFn: async () => {
      try {
        if (!debouncedQuery.trim()) {
          return { items: [], total_count: 0, incomplete_results: false } as UserSearchResult;
        }
        return await githubApi.searchUsers(debouncedQuery, page, perPage);
      } catch (error) {
        console.error("Error searching users:", error);
        throw error;
      }
    },
    enabled: enabled && Boolean(debouncedQuery?.trim()),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  // Get user details query with error handling
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

  // Set isSearching state when query changes
  useEffect(() => {
    if (safeQuery.trim() !== debouncedQuery.trim()) {
      setIsSearching(true);
    } else {
      setIsSearching(searchUsersQuery.isLoading);
    }
  }, [safeQuery, debouncedQuery, searchUsersQuery.isLoading]);

  // Add query to history when search is successful and has results
  useEffect(() => {
    if (
      debouncedQuery &&
      searchUsersQuery.isSuccess &&
      searchUsersQuery.data?.items &&
      searchUsersQuery.data.items.length > 0
    ) {
      addToHistory(debouncedQuery);
    }
  }, [debouncedQuery, searchUsersQuery.isSuccess, searchUsersQuery.data, addToHistory]);

  return {
    searchUsers: {
      data: searchUsersQuery.data,
      isLoading: searchUsersQuery.isLoading,
      isSearching,
      error: searchUsersQuery.error as Error | null,
    },
    getUserDetails: userDetailsQuery,
    addToHistory,
    searchHistory: searchHistory || [],
    searchState: {
      query: safeQuery,
      debouncedQuery,
    },
  };
}
