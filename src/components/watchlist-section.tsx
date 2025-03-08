import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useWatchList } from "@/hooks/use-watch-list";
import { GitHubUser } from "@/lib/api";
import { IconBookmark, IconRefresh } from "@tabler/icons-react";
import { useState } from "react";
import { UserProfileCard } from "./user-profile-card";

interface WatchlistSectionProps {
  onSelectUser?: (username: string) => void;
}

export function WatchlistSection({ onSelectUser }: WatchlistSectionProps) {
  const {
    watchedUsers,
    isLoading,
    removeFromWatchList,
    clearWatchList,
    refreshWatchList,
    updateWatchedUser,
  } = useWatchList();
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

  // Create a function to update a user in the watchlist
  const handleUserUpdate = (updatedUser: GitHubUser) => {
    updateWatchedUser(updatedUser);
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
          <UserProfileCard
            key={user.login}
            username={user.login}
            name={user.name}
            avatarUrl={user.avatar_url}
            bio={user.bio}
            orgsCount={user.organizations?.length}
            followersCount={user.followers}
            reposCount={user.public_repos}
            followingCount={user.following}
            isSelected={selectedUser === user.id}
            variant="full"
            showBio={true}
            showRefresh={true}
            fetchLatestData={true}
            onSelect={() => onSelectUser?.(user.login)}
            onOpenGitHub={() => window.open(user.html_url, "_blank")}
            onRemove={() => handleRemove(user.id)}
            onUserUpdate={handleUserUpdate}
          />
        ))}
      </div>
    </div>
  );
}
