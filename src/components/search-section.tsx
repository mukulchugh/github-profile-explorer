import { EmptyState } from "@/components/empty-state";
import { SearchBar } from "@/components/search-bar";
import { UserProfileCard } from "@/components/user-profile-card";
import { useGitHubSearch } from "@/hooks/use-github-search";
import { useSearchHistory } from "@/hooks/use-search-history";
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
  initialQuery = "octocat",
}: SearchSectionProps) {
  // Local state for the search query
  const [searchQuery, setSearchQuery] = useState(initialQuery || "");

  // Sync with external initialQuery changes
  useEffect(() => {
    if (initialQuery && initialQuery !== searchQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  // Use the direct search history hook
  const { searchHistory, enhancedSearchHistory, addToHistory } = useSearchHistory();

  // Use GitHub search with the current query
  const { searchUsers } = useGitHubSearch({
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
      setSearchQuery(query);
      console.log("SearchSection: Searching for", query);
      if (query.trim()) {
        addToHistory(query);
        console.log("SearchSection: Added to history:", query);
      }
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
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      );
    }

    // Handle error state
    if (error) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-lg font-semibold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      );
    }

    // Handle no query state
    if (!searchQuery.trim()) {
      return (
        <EmptyState
          icon={IconSearch}
          title="Search for GitHub users"
          description="Enter a username to search for GitHub users"
        />
      );
    }

    // Handle no results state
    if (results && results.items && results.items.length === 0) {
      return (
        <EmptyState
          icon={IconSearch}
          title="No results found"
          description="Try searching with a different query"
        />
      );
    }

    // Handle results state
    if (results && results.items && results.items.length > 0) {
      const count = results.total_count !== undefined ? results.total_count : results.items.length;

      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Search Results ({count})</h2>
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
                organizationsCount={0}
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
        enhancedHistory={enhancedSearchHistory}
        isLoading={loading}
        className="w-full"
      />

      {/* Search Results or Status */}
      {renderContent()}
    </div>
  );
}
