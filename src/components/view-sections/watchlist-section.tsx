import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useWatchList } from "@/hooks/use-watch-list";
import {
  IconBookmark,
  IconExternalLink,
  IconEye,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";

interface WatchlistSectionProps {
  onSelectUser?: (username: string) => void;
}

export function WatchlistSection({ onSelectUser }: WatchlistSectionProps) {
  const { watchedUsers, isLoading, removeFromWatchList, clearWatchList, refreshWatchList } =
    useWatchList();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const handleRemove = async (userId: number) => {
    setSelectedUser(userId);
    await removeFromWatchList(userId);
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all watched users?")) {
      clearWatchList();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (watchedUsers.length === 0) {
    return (
      <EmptyState
        icon={IconBookmark}
        title="Your watch list is empty"
        description="Add GitHub users to your watchlist to monitor them"
        action={
          <Button variant="outline" size="sm" onClick={() => refreshWatchList()}>
            <IconRefresh className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Watched Users ({watchedUsers.length})</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearAll}
          className="text-destructive hover:text-destructive"
        >
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {watchedUsers.map((user) => (
          <Card
            key={user.id}
            className={`overflow-hidden transition-all duration-300 ${
              selectedUser === user.id ? "scale-95 opacity-50" : ""
            }`}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar_url}
                    alt={`${user.login}'s avatar`}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">{user.name || user.login}</h3>
                    <p className="text-sm text-muted-foreground">@{user.login}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSelectUser?.(user.login)}
                    title="View profile details"
                  >
                    <IconEye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(user.html_url, "_blank")}
                    title="Open GitHub profile"
                  >
                    <IconExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(user.id)}
                    title="Remove from watchlist"
                  >
                    <IconTrash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {user.bio && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{user.bio}</p>
              )}

              <div className="flex justify-between mt-3 text-sm">
                <span>
                  <span className="text-muted-foreground">Followers:</span> {user.followers}
                </span>
                <span>
                  <span className="text-muted-foreground">Repos:</span> {user.public_repos}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
