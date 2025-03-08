import { useGitHubFollowers } from "@/hooks/use-github-followers";
import { GitHubUser } from "@/lib/api";
import { IconLoader2, IconUserCircle } from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import { EmptyState } from "./empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface FollowersTabProps {
  username: string;
  type: "followers" | "following";
  onSelectUser?: (username: string) => void;
}

export function FollowersTab({ username, type, onSelectUser }: FollowersTabProps) {
  const { users, isLoading, error, hasMore, loadMore, isLoadingMore } = useGitHubFollowers(
    username,
    type,
    true
  );

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Set up infinite scroll
  useEffect(() => {
    if (isLoading || !hasMore) return;

    if (observerRef.current) observerRef.current.disconnect();

    const callback = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
        loadMore();
      }
    };

    observerRef.current = new IntersectionObserver(callback);

    if (loaderRef.current) {
      observerRef.current.observe(loaderRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isLoading, hasMore, loadMore, isLoadingMore]);

  if (isLoading && users.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
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
          <UserCard key={user.id} user={user} onSelect={onSelectUser} />
        ))}
      </div>

      <div ref={loaderRef} className="py-4 text-center">
        {isLoadingMore && (
          <div className="flex items-center justify-center space-x-2">
            <IconLoader2 className="h-4 w-4 animate-spin" />
            <span>Loading more...</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface UserCardProps {
  user: GitHubUser;
  onSelect?: (username: string) => void;
}

function UserCard({ user, onSelect }: UserCardProps) {
  return (
    <Card
      className="flex items-center p-3 hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={() => onSelect?.(user.login)}
    >
      <Avatar className="h-10 w-10 mr-3">
        <AvatarImage src={user.avatar_url} alt={user.login} />
        <AvatarFallback>{user.login.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div>
        <h4 className="font-medium">{user.login}</h4>
        <a
          href={user.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          View on GitHub
        </a>
      </div>
      {onSelect && (
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(user.login);
          }}
        >
          View Profile
        </Button>
      )}
    </Card>
  );
}
