import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchHistory } from "@/hooks/use-search-history";
import { useViewControl } from "@/hooks/use-view-control";
import { IconClockHour3, IconSearch, IconTrash } from "@tabler/icons-react";
import { useCallback } from "react";

interface HistorySectionProps {
  /**
   * Callback when a user is selected from history
   */
  onSelectUser?: (username: string) => void;
}

export function HistorySection({ onSelectUser }: HistorySectionProps) {
  const { searchHistory, clearHistory, removeFromHistory } = useSearchHistory();
  const { setActiveView } = useViewControl();

  // Handle selecting a history item to search
  const handleSearchAgain = useCallback(
    (query: string) => {
      if (onSelectUser) {
        onSelectUser(query);
        setActiveView?.("search");
      }
    },
    [onSelectUser, setActiveView]
  );

  // No history state
  if (searchHistory.length === 0) {
    return (
      <EmptyState
        icon={IconClockHour3}
        title="No search history"
        description="Your recent searches will appear here"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Searches</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={clearHistory}
          className="flex items-center gap-1"
        >
          <IconTrash className="h-3.5 w-3.5" />
          Clear All
        </Button>
      </div>

      <div className="grid gap-3">
        {searchHistory.map((query) => (
          <Card
            key={query}
            className="overflow-hidden hover:bg-accent/5 transition-colors cursor-pointer"
            onClick={() => handleSearchAgain(query)}
          >
            <CardHeader className="py-2 px-4">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center overflow-hidden">
                  <IconSearch className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{query}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromHistory(query);
                  }}
                >
                  <IconTrash className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardFooter className="py-2 px-4 bg-muted/20">
              <div className="flex justify-end w-full">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSearchAgain(query);
                  }}
                >
                  Search Again
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
