import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSearchHistory } from "@/hooks/use-search-history";
import { useViewControl } from "@/hooks/use-view-control";
import { IconClockHour3, IconTrash } from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { UserProfileCard } from "./user-profile-card";

interface HistorySectionProps {
  /**
   * Callback when a user is selected from history
   */
  onSelectUser?: (username: string) => void;
}

export function HistorySection({ onSelectUser }: HistorySectionProps) {
  const { enhancedSearchHistory, clearHistory, removeFromHistory } = useSearchHistory();
  const { setActiveView } = useViewControl();
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(10);

  const handleSearchAgain = useCallback(
    (query: string) => {
      if (onSelectUser) {
        console.log("Searching again for:", query);
        onSelectUser(query);
        setActiveView?.("search");
        setSelectedProfile(query);
      }
    },
    [onSelectUser, setActiveView]
  );

  const handleLoadMore = () => {
    setDisplayCount((prevCount) => prevCount + 10);
  };

  // No history state
  if (!enhancedSearchHistory || enhancedSearchHistory.length === 0) {
    return (
      <EmptyState
        icon={IconClockHour3}
        title="No search history"
        description="Your recent searches will appear here"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconClockHour3 className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Recent Searches ({enhancedSearchHistory.length})</h2>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearHistory()}
                className="flex items-center gap-2"
              >
                <IconTrash className="h-4 w-4" />
                Clear All
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Remove all search history</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex flex-col gap-4">
        {enhancedSearchHistory.slice(0, displayCount).map(({ query, timestamp, userData }) => (
          <UserProfileCard
            key={query}
            user={
              userData || {
                login: query,

                avatar_url: userData?.avatar_url,
                html_url: `https://github.com/${query}`,
                timestamp: timestamp,
                name: userData?.name,
                bio: userData?.bio,
                followers: userData?.followers,
                following: userData?.following,
                public_repos: userData?.public_repos,
                organization_count: userData?.organization_count,
                location: userData?.location,
                company: userData?.company,
                blog: userData?.blog,
                twitter_username: userData?.twitter_username,
                github_id: userData?.github_id,
                github_url: userData?.github_url,
                type: userData?.type,
                site_admin: userData?.site_admin,
                hireable: userData?.hireable,
                bio: userData?.bio,
                twitter_username: userData?.twitter_username,
                public_gists: userData?.public_gists,
              }
            }
            variant="compact"
            onSelect={() => handleSearchAgain(query)}
            onRemove={() => removeFromHistory(query)}
          />
        ))}

        {displayCount < enhancedSearchHistory.length && (
          <Button onClick={handleLoadMore} className="self-center">
            Load More
          </Button>
        )}
      </div>
    </div>
  );
}
