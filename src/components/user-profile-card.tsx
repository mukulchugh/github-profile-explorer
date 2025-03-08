import { GitHubUser } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  IconBuilding,
  IconChevronRight,
  IconExternalLink,
  IconMail,
  IconMapPin,
  IconPlus,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
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

  if (variant === "compact") {
    return (
      <Card className={cn("relative hover:shadow-md transition-shadow", className)}>
        <CardContent className="p-3">
          <div className="flex space-x-3 items-center">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar_url} alt={user.login} />
              <AvatarFallback>
                <IconUser />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{user.login}</h3>
              {user.created_at && (
                <p className="text-xs text-muted-foreground truncate">
                  Added {formatDate(user.created_at)}
                </p>
              )}
            </div>
            <div className="flex items-center">
              {onSelect && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onSelect(user.login)}
                >
                  <IconChevronRight className="h-4 w-4" />
                </Button>
              )}
              {onRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => onRemove(user.login)}
                >
                  <IconTrash className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "search") {
    return (
      <Card
        className={cn(
          "overflow-hidden hover:shadow-md transition-shadow cursor-pointer",
          className
        )}
        onClick={() => onSelect && onSelect(user.login)}
      >
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage src={user.avatar_url} alt={user.login} />
              <AvatarFallback>
                <IconUser />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                <h3 className="font-semibold truncate">{user.login}</h3>
                {user.name && user.name !== user.login && (
                  <p className="text-sm text-muted-foreground truncate">({user.name})</p>
                )}
              </div>
              {user.bio && <p className="text-sm mt-1 line-clamp-2">{user.bio}</p>}
              <div className="flex flex-wrap mt-2 gap-2">
                {user.location && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <IconMapPin className="h-3 w-3 mr-1" />
                    <span className="truncate">{user.location}</span>
                  </div>
                )}
                {user.company && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <IconBuilding className="h-3 w-3 mr-1" />
                    <span className="truncate">{user.company}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar className="h-16 w-16 flex-shrink-0">
            <AvatarImage src={user.avatar_url} alt={user.login} />
            <AvatarFallback>
              <IconUser />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
              <CardTitle className="text-xl">{user.login}</CardTitle>
              {user.name && user.name !== user.login && (
                <CardDescription className="ml-0 sm:ml-2 text-base">{user.name}</CardDescription>
              )}
            </div>
            {user.bio && <p className="mt-1 text-sm">{user.bio}</p>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* User stats section - make responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-2 bg-muted rounded-md flex flex-col justify-center items-center">
            <span className="text-lg font-bold">{user.followers}</span>
            <span className="text-xs text-muted-foreground">Followers</span>
          </div>
          <div className="text-center p-2 bg-muted rounded-md flex flex-col justify-center items-center">
            <span className="text-lg font-bold">{user.following}</span>
            <span className="text-xs text-muted-foreground">Following</span>
          </div>
          <div className="text-center p-2 bg-muted rounded-md flex flex-col justify-center items-center">
            <span className="text-lg font-bold">{user.public_repos}</span>
            <span className="text-xs text-muted-foreground">Repositories</span>
          </div>
          <div className="text-center p-2 bg-muted rounded-md flex flex-col justify-center items-center">
            <span className="text-lg font-bold">{user.public_gists}</span>
            <span className="text-xs text-muted-foreground">Gists</span>
          </div>
        </div>

        {/* User details section - stack on mobile */}
        <div className="space-y-3">
          {user.location && (
            <div className="flex items-center">
              <IconMapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{user.location}</span>
            </div>
          )}
          {user.company && (
            <div className="flex items-center">
              <IconBuilding className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{user.company}</span>
            </div>
          )}
          {user.email && (
            <div className="flex items-center">
              <IconMail className="h-4 w-4 mr-2 text-muted-foreground" />
              <a href={`mailto:${user.email}`} className="text-primary hover:underline truncate">
                {user.email}
              </a>
            </div>
          )}
          {user.blog && (
            <div className="flex items-center">
              <IconExternalLink className="h-4 w-4 mr-2 text-muted-foreground" />
              <a
                href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline truncate"
              >
                {user.blog}
              </a>
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Member since</span>
            <span className="text-sm">{formatDate(user.created_at)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Last updated</span>
            <span className="text-sm">{formatDate(user.updated_at)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 pt-0">
        <a
          href={user.html_url}
          target="_blank"
          rel="noreferrer"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "py-4",
            "w-full sm:w-auto"
          )}
        >
          <IconExternalLink className="h-4 w-4" />
          View on GitHub
        </a>
        {onAddToWatchlist && (
          <Button
            variant={isInWatchlist ? "destructive" : "default"}
            onClick={() => onAddToWatchlist(user)}
            className="w-full sm:w-auto"
            size={"sm"}
          >
            {isInWatchlist ? (
              <>
                <IconTrash className="h-4 w-4" />
                Remove from Watchlist
              </>
            ) : (
              <>
                <IconPlus className="h-4 w-4" />
                Add to Watchlist
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
