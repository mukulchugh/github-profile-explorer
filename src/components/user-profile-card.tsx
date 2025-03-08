import { GitHubUser } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  IconBrandTwitter,
  IconBuilding,
  IconChevronRight,
  IconExternalLink,
  IconMail,
  IconMapPin,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button, buttonVariants } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";

type UserProfileCardVariant = "default" | "compact" | "search";

interface UserProfileCardProps {
  user: GitHubUser;
  className?: string;
  onAddToWatchlist?: (user: GitHubUser) => void;
  isInWatchlist?: boolean;
  onSelect?: (username: string) => void;
  variant?: UserProfileCardVariant;
  onRemove?: (username: string) => void;
}

export function UserProfileCard({
  user,
  className,
  onAddToWatchlist,
  isInWatchlist = false,
  onSelect,
  variant = "default",
  onRemove,
}: UserProfileCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Compact variant for watchlist
  if (variant === "compact") {
    return (
      <Card className={cn("overflow-hidden hover:shadow-md transition-shadow", className)}>
        <div className="flex items-center p-4">
          <Avatar className="h-10 w-10 mr-4">
            <AvatarImage src={user?.avatar_url} alt={user?.login} />
            <AvatarFallback>{user?.login?.substring(0, 2).toUpperCase() || "??"}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base truncate">
                {user?.name || user?.login || "Unknown User"}
              </CardTitle>
              {user?.public_repos > 0 && (
                <Badge variant="secondary" className="ml-2 shrink-0">
                  <IconBuilding className="h-4 w-4" /> {user.public_repos}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center ml-2 space-x-1">
            {onSelect && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelect(user.login)}
                className="shrink-0 ml-2"
              >
                <IconChevronRight className="h-4 w-4" />
              </Button>
            )}

            {user?.html_url && (
              <a
                href={user.html_url}
                className={buttonVariants({ variant: "outline", size: "sm" })}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconExternalLink className="h-4 w-4" />
              </a>
            )}

            {onRemove && (
              <Button variant="destructive" size="sm" onClick={() => onRemove(user.login)}>
                <IconTrash className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Search variant for search results
  if (variant === "search") {
    return (
      <Card
        className={cn(
          "overflow-hidden hover:bg-accent/50 transition-colors cursor-pointer",
          className
        )}
        onClick={() => onSelect?.(user?.login || "")}
      >
        <div className="flex items-center p-3">
          <Avatar className="h-12 w-12 mr-4">
            <AvatarImage src={user?.avatar_url} alt={user?.login} />
            <AvatarFallback>{user?.login?.substring(0, 2).toUpperCase() || "??"}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm flex items-center">
              {user?.name || user?.login || "Unknown User"}
              {user?.name && (
                <CardDescription className="ml-2 text-xs">@{user.login}</CardDescription>
              )}
            </CardTitle>

            <div className="flex items-center mt-1 text-xs text-muted-foreground">
              {user?.location && (
                <div className="flex items-center mr-4">
                  <IconMapPin className="h-3 w-3 mr-1" />
                  <span className="truncate">{user.location}</span>
                </div>
              )}
            </div>
          </div>

          <div className="ml-2 flex items-center space-x-2">
            {onAddToWatchlist && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToWatchlist(user);
                }}
                className="shrink-0"
              >
                {isInWatchlist ? "Unwatch" : "Watch"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="h-16 w-16 rounded-full overflow-hidden">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.login} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <IconUser className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <div>
          <CardTitle className="text-xl">{user?.name || user?.login || "Unknown User"}</CardTitle>
          <CardDescription className="text-sm">
            {user?.html_url ? (
              <a
                href={user.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                @{user.login}
              </a>
            ) : (
              <span>@{user?.login || "unknown"}</span>
            )}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="text-sm">
        {user?.bio && <p className="mb-4 text-muted-foreground">{user.bio}</p>}

        <div className="flex gap-2">
          {user?.company && (
            <div className="flex items-center gap-1">
              <IconBuilding className="h-4 w-4 text-muted-foreground" />
              <span>{user.company}</span>
            </div>
          )}
          {user?.location && (
            <div className="flex items-center gap-1">
              <IconMapPin className="h-4 w-4 text-muted-foreground" />
              <span>{user.location}</span>
            </div>
          )}
          {user?.email && (
            <div className="flex items-center gap-1">
              <IconMail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${user.email}`} className="hover:underline">
                {user.email}
              </a>
            </div>
          )}
          {user?.blog && (
            <div className="flex items-center gap-1">
              <IconExternalLink className="h-4 w-4 text-muted-foreground" />
              <a
                href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {user.blog}
              </a>
            </div>
          )}
          {user?.twitter_username && (
            <div className="flex items-center gap-1">
              <IconBrandTwitter className="h-4 w-4 text-muted-foreground" />
              <a href={`https://twitter.com/${user.twitter_username}`} className="hover:underline">
                {user.twitter_username}
              </a>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center rounded-md border p-3">
            <div className="text-2xl font-bold">{user?.public_repos || 0}</div>
            <div className="text-xs text-muted-foreground">Repositories</div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-md border p-3">
            <div className="text-2xl font-bold">{user?.followers || 0}</div>
            <div className="text-xs text-muted-foreground">Followers</div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-md border p-3">
            <div className="text-2xl font-bold">{user?.public_gists || 0}</div>
            <div className="text-xs text-muted-foreground">Gists</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs text-muted-foreground">
            Member since {formatDate(user?.created_at || "")}
          </div>
        </div>
      </CardContent>

      {onAddToWatchlist && (
        <CardFooter>
          <Button
            onClick={() => onAddToWatchlist(user)}
            variant={isInWatchlist ? "outline" : "default"}
            className="w-full"
          >
            {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
