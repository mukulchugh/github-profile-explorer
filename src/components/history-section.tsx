import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSearchHistory } from "@/hooks/use-search-history";
import { useViewControl } from "@/hooks/use-view-control";
import { IconClockHour3, IconTrash } from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { LoadMoreButton } from "./load-more-button";
import { Badge } from "./ui/badge";
import { UserProfileCard } from "./user-profile-card";

interface HistorySectionProps {
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
          <h2 className="text-xl font-bold flex items-center">
            Recent Searches
            <Badge variant="outline" className="ml-2">
              {enhancedSearchHistory.length}
            </Badge>
          </h2>
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
        {enhancedSearchHistory
          .slice(0, displayCount)
          .map(({ query, timestamp, avatar_url, html_url }) => (
            <UserProfileCard
              key={query}
              user={{
                login: query,
                id: 0,
                avatar_url: avatar_url || `https://avatars.githubusercontent.com/${query}`,
                html_url: html_url || `https://github.com/${query}`,
                name: query,
                company: null,
                blog: null,
                location: null,
                email: null,
                bio: null,
                public_repos: 0,
                public_gists: 0,
                followers: 0,
                following: 0,
                created_at: new Date(timestamp).toISOString(),
                updated_at: new Date(timestamp).toISOString(),
              }}
              variant="compact"
              onSelect={() => handleSearchAgain(query)}
              onRemove={() => removeFromHistory(query)}
            />
          ))}

        {displayCount < enhancedSearchHistory.length && (
          <LoadMoreButton
            onClick={handleLoadMore}
            isLoading={false}
            hasMore={true}
            className="w-full"
          />
        )}
      </div>
    </div>
  );
}
