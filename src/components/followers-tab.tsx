import { useGitHubFollowers } from "@/hooks/use-github-followers";
import { IconUserCircle } from "@tabler/icons-react";
import { EmptyState } from "./empty-state";
import { LoadMoreButton } from "./load-more-button";
import { Spinner } from "./ui/spinner";
import { UserProfileCard } from "./user-profile-card";

interface FollowersTabProps {
  username: string;
  type: "followers" | "following";
  onSelectUser?: (username: string) => void;
}

export function FollowersTab({ username, type, onSelectUser }: FollowersTabProps) {
  const { users, isLoading, error, hasMore, loadMore, isLoadingMore } = useGitHubFollowers({
    username,
    type,
    enabled: true,
  });

  if (isLoading && users.length === 0) {
    return (
      <div className="p-8 text-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={IconUserCircle}
        title={`Error Loading ${type === "followers" ? "Followers" : "Following"}`}
        description={`Could not load ${type} for ${username}. Please try again later.`}
      />
    );
  }

  if (users.length === 0) {
    return (
      <EmptyState
        icon={IconUserCircle}
        title={`No ${type === "followers" ? "Followers" : "Following"} Found`}
        description={`${username} doesn't have any ${type === "followers" ? "followers" : "users they follow"} yet.`}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {users.map((user) => (
          <UserProfileCard
            key={user.id}
            user={user}
            variant="compact"
            onSelect={() => onSelectUser?.(user.login)}
          />
        ))}
      </div>

      {hasMore && (
        <div className="py-4 text-center">
          <LoadMoreButton onClick={loadMore} isLoading={isLoadingMore} hasMore={hasMore} />
        </div>
      )}
    </div>
  );
}
