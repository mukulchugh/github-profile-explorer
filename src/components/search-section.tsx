import { EmptyState } from "@/components/empty-state";
import { LoadMoreButton } from "@/components/load-more-button";
import { SearchBar } from "@/components/search-bar";
import { UserProfileCard } from "@/components/user-profile-card";
import { useGitHubSearch } from "@/hooks/use-github-search";
import { useSearchHistory } from "@/hooks/use-search-history";
import { useToast } from "@/hooks/use-toast";
import { useWatchList } from "@/hooks/use-watch-list";
import { GitHubUser, UserSearchResult } from "@/lib/api";
import { IconSearch } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { Spinner } from "./ui/spinner";

interface SearchSectionProps {
  searchResults?: UserSearchResult;
  isLoading?: boolean;
  onSelectUser?: (username: string) => void;
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
  const [searchQuery, setSearchQuery] = useState(initialQuery || "");

  useEffect(() => {
    if (initialQuery && initialQuery !== searchQuery) {
      setSearchQuery(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const { searchHistory, enhancedSearchHistory, addToHistory } = useSearchHistory();

  const { searchUsers } = useGitHubSearch({
    query: searchQuery,
    enabled: Boolean(searchQuery?.trim()),
  });

  const { isWatched, addToWatchList, removeFromWatchList } = useWatchList();
  const { toast } = useToast();

  const loading = isLoading || searchUsers.isLoading || searchUsers.isSearching;
  const error = searchUsers.error;

  const displayItems = searchResults?.items || searchUsers.items;
  const totalCount = searchResults?.total_count || searchUsers.totalCount;

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value || "");
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (query.trim()) {
        addToHistory(query);
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
        toast({
          title: "Error",
          description: "Failed to update watch list. Please try again.",
        });
      }
    },
    [isWatched, addToWatchList, removeFromWatchList, toast]
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Spinner />
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-lg font-semibold text-destructive mb-2">Error</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      );
    }

    if (!searchQuery.trim()) {
      return (
        <EmptyState
          icon={IconSearch}
          title="Search for GitHub users"
          description="Enter a username to search for GitHub users"
          className="bg-zinc-50 h-full"
        />
      );
    }

    if (displayItems.length === 0) {
      return (
        <EmptyState
          icon={IconSearch}
          title="No results found"
          description="Try searching with a different query"
          className="bg-zinc-50 h-full"
        />
      );
    }

    if (displayItems.length > 0) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Search Results ({totalCount})</h2>
          </div>
          <div className="grid gap-2">
            {displayItems.map((user) => (
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

          {!searchResults && (
            <LoadMoreButton
              onClick={() => searchUsers.fetchNextPage()}
              isLoading={searchUsers.isFetchingNextPage}
              hasMore={!!searchUsers.hasNextPage}
              className="mt-4"
            />
          )}
        </div>
      );
    }

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
      <SearchBar
        value={searchQuery}
        onChange={handleSearchChange}
        onSearch={handleSearch}
        onHistorySelect={handleHistorySelect}
        history={searchHistory}
        enhancedHistory={enhancedSearchHistory}
        isLoading={loading}
        className="w-full"
        addToHistory={addToHistory}
      />

      {/* Add responsive classes to handle different screen sizes */}
      <div className="flex-1 overflow-y-auto">{renderContent()}</div>
    </div>
  );
}
