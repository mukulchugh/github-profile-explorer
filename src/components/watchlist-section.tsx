import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWatchList } from "@/hooks/use-watch-list";
import { IconBookmark, IconEye, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { Spinner } from "./ui/spinner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { UserProfileCard } from "./user-profile-card";

interface WatchlistSectionProps {
  onSelectUser?: (username: string) => void;
}

export function WatchlistSection({ onSelectUser }: WatchlistSectionProps) {
  const { watchedUsers, isLoading, removeFromWatchList, clearWatchList, addToWatchList } =
    useWatchList();
  const { toast } = useToast();

  const [, setSelectedUser] = useState<number | null>(null);

  const handleRemove = async (userId: number) => {
    setSelectedUser(userId);
    await removeFromWatchList(userId);
    toast({
      title: "User removed from watchlist",
    });
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all watched users?")) {
      clearWatchList();
      toast({
        title: "All watched users have been removed",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner />
      </div>
    );
  }

  if (watchedUsers.length === 0) {
    return (
      <EmptyState
        icon={IconBookmark}
        title="Your watch list is empty"
        description="Add GitHub users to your watchlist to monitor them"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <IconEye className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold flex items-center">
            Watched Users
            <Badge variant="outline" className="ml-2">
              {watchedUsers.length}
            </Badge>
          </h2>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="flex items-center gap-2"
              >
                <IconTrash className="h-4 w-4" />
                Clear All
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Remove all users from watchlist</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {watchedUsers.map((user) => (
          <UserProfileCard
            key={user.login}
            user={user}
            variant="compact"
            onRemove={() => handleRemove(user.id)}
            onSelect={() => onSelectUser?.(user.login)}
            onAddToWatchlist={() => addToWatchList(user)}
            isInWatchlist={true}
          />
        ))}
      </div>
    </div>
  );
}
