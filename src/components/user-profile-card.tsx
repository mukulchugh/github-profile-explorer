import { GitHubUser } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  IconBuilding,
  IconCalendar,
  IconChevronRight,
  IconEye,
  IconEyeOff,
  IconLink,
  IconMail,
  IconMapPin,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";

type UserProfileCardVariant = "default" | "compact" | "search";

interface UserProfileCardProps {
  user: GitHubUser;
  className?: string;
  onAddToWatchlist?: (user: GitHubUser) => void;
  isInWatchlist?: boolean;
  onSelect?: (username: string) => void;
  variant?: UserProfileCardVariant;
}

export function UserProfileCard({
  user,
  className,
  onAddToWatchlist,
  isInWatchlist = false,
  onSelect,
  variant = "default",
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
            <AvatarImage src={user.avatar_url} alt={user.login} />
            <AvatarFallback>{user.login.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base truncate">{user.name || user.login}</CardTitle>
              {user.public_repos > 0 && (
                <Badge variant="outline" className="ml-2 shrink-0">
                  {user.public_repos} repos
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs truncate">@{user.login}</CardDescription>
          </div>

          <div className="flex items-center ml-2 space-x-1">
            {onAddToWatchlist && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToWatchlist(user);
                }}
                className="shrink-0"
              >
                {isInWatchlist ? (
                  <IconEyeOff className="h-4 w-4" />
                ) : (
                  <IconEye className="h-4 w-4" />
                )}
              </Button>
            )}
            {onSelect && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSelect(user.login)}
                className="shrink-0"
              >
                <IconChevronRight className="h-4 w-4" />
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
        onClick={() => onSelect?.(user.login)}
      >
        <div className="flex items-center p-3">
          <Avatar className="h-12 w-12 mr-4">
            <AvatarImage src={user.avatar_url} alt={user.login} />
            <AvatarFallback>{user.login.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm flex items-center">
              {user.name || user.login}
              {user.name && (
                <CardDescription className="ml-2 text-xs">@{user.login}</CardDescription>
              )}
            </CardTitle>

            <div className="flex items-center mt-1 text-xs text-muted-foreground">
              {user.location && (
                <div className="flex items-center mr-4">
                  <IconMapPin className="h-3 w-3 mr-1" />
                  <span className="truncate">{user.location}</span>
                </div>
              )}
              <div className="flex space-x-3">
                <span>{user.followers} followers</span>
                <span>{user.public_repos} repos</span>
              </div>
            </div>
          </div>

          <div className="ml-2 flex items-center space-x-2">
            {onAddToWatchlist && (
              <Button
                variant="ghost"
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

  // Default variant (full profile)
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="h-16 w-16 rounded-full overflow-hidden">
          <img src={user.avatar_url} alt={user.login} className="h-full w-full object-cover" />
        </div>
        <div>
          <CardTitle className="text-xl">{user.name || user.login}</CardTitle>
          <CardDescription className="text-sm">
            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              @{user.login}
            </a>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="text-sm">
        {user.bio && <p className="mb-4 text-muted-foreground">{user.bio}</p>}

        <div className="grid gap-2">
          {user.company && (
            <div className="flex items-center gap-2">
              <IconBuilding className="h-4 w-4 text-muted-foreground" />
              <span>{user.company}</span>
            </div>
          )}

          {user.location && (
            <div className="flex items-center gap-2">
              <IconMapPin className="h-4 w-4 text-muted-foreground" />
              <span>{user.location}</span>
            </div>
          )}

          {user.email && (
            <div className="flex items-center gap-2">
              <IconMail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${user.email}`} className="hover:underline">
                {user.email}
              </a>
            </div>
          )}

          {user.blog && (
            <div className="flex items-center gap-2">
              <IconLink className="h-4 w-4 text-muted-foreground" />
              <a
                href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline truncate max-w-[200px]"
              >
                {user.blog}
              </a>
            </div>
          )}

          <div className="flex items-center gap-2">
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
            <span>Joined {formatDate(user.created_at)}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="font-semibold">{user.public_repos}</div>
            <div className="text-xs text-muted-foreground">Repositories</div>
          </div>
          <div>
            <div className="font-semibold">{user.followers}</div>
            <div className="text-xs text-muted-foreground">Followers</div>
          </div>
          <div>
            <div className="font-semibold">{user.following}</div>
            <div className="text-xs text-muted-foreground">Following</div>
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
