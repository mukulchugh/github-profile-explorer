import { EmptyState } from "@/components/empty-state";
import { SearchBar } from "@/components/search-bar";
import { UserProfileCard } from "@/components/user-profile-card";
import { useGitHubSearch } from "@/hooks/use-github-search";
import { useWatchList } from "@/hooks/use-watch-list";
import { GitHubUser, UserSearchResult } from "@/lib/api";
import { IconSearch } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

interface SearchSectionProps {
  /**
   * Optional pre-fetched search results to display
   */
  searchResults?: UserSearchResult;

  /**
   * Whether the component is in loading state
   */
  isLoading?: boolean;

  /**
   * Callback when a user is selected
   */
  onSelectUser?: (username: string) => void;

  /**
   * Initial search query
   */
  initialQuery?: string;
}

/**
 * A component that displays search results for GitHub users
 * and allows viewing and managing those users
 */
export function SearchSection({
  searchResults,
  isLoading = false,
  onSelectUser,
  initialQuery = "",
}: SearchSectionProps) {
  // Local state for the search query
  const [searchQuery, setSearchQuery] = useState(initialQuery || "");

  // Sync with external initialQuery changes
  useEffect(() => {
    if (initialQuery && initialQuery !== searchQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  // Use GitHub search with the current query
  const { searchUsers, addToHistory, searchHistory } = useGitHubSearch({
    query: searchQuery,
    enabled: Boolean(searchQuery?.trim()),
  });

  // Watch list functionality
  const { isWatched, addToWatchList, removeFromWatchList } = useWatchList();

  // Derive combined state
  const results = searchResults || searchUsers.data;
  const loading = isLoading || searchUsers.isLoading || searchUsers.isSearching;
  const error = searchUsers.error;

  // Event handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value || "");
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      if (!query?.trim()) return;
      setSearchQuery(query);
      addToHistory(query);
    },
    [addToHistory]
  );

  const handleHistorySelect = useCallback(
    (query: string) => {
      if (!query) return;
      setSearchQuery(query);
      if (onSelectUser) {
        onSelectUser(query);
      }
    },
    [onSelectUser]
  );

  const handleWatchlistToggle = useCallback(
    async (user: GitHubUser) => {
      if (!user) return;

      try {
        if (isWatched(user.id)) {
          await removeFromWatchList(user.id);
        } else {
          await addToWatchList(user);
        }
      } catch (error) {
        console.error("Error toggling watchlist:", error);
      }
    },
    [isWatched, addToWatchList, removeFromWatchList]
  );

  // Render the main content of the search section based on current state
  const renderContent = () => {
    // Handle loading state
    if (loading) {
      return (
        <div className="flex justify-center items-center h-full py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      );
    }

    // Handle error state
    if (error && searchQuery) {
      return (
        <EmptyState
          icon={IconSearch}
          title="Error fetching results"
          description={`Error: ${error.message || "Unknown error"}`}
        />
      );
    }

    // Handle empty initial state
    if (!searchQuery.trim()) {
      return (
        <EmptyState
          icon={IconSearch}
          title="Search for GitHub users"
          description="Enter a username in the search box above to find users"
        />
      );
    }

    // Handle no results state
    if (results?.items?.length === 0) {
      return (
        <EmptyState
          icon={IconSearch}
          title="No results found"
          description="Try searching with a different query"
        />
      );
    }

    // Handle results state
    if (results?.items?.length > 0) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Search Results ({results.total_count || results.items.length})
            </h2>
          </div>

          <div className="grid gap-2">
            {results.items.map((user) => (
              <UserProfileCard
                key={user.id}
                user={user}
                onAddToWatchlist={handleWatchlistToggle}
                onSelect={onSelectUser}
                isInWatchlist={isWatched(user.id)}
                variant="search"
              />
            ))}
          </div>
        </div>
      );
    }

    // Fallback empty state
    return (
      <EmptyState
        icon={IconSearch}
        title="Start a search"
        description="Search for GitHub users to see results"
      />
    );
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChange={handleSearchChange}
        onSearch={handleSearch}
        onHistorySelect={handleHistorySelect}
        history={searchHistory}
        isLoading={loading}
        className="w-full"
      />

      {/* Search Results or Status */}
      {renderContent()}
    </div>
  );
}
