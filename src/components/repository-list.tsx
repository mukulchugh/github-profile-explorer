import { useGitHubRepositories } from "@/hooks/use-github-repositories";
import { useMobile } from "@/hooks/use-mobile";
import { GitHubRepository } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import {
  IconCode,
  IconExternalLink,
  IconFilter,
  IconGitFork,
  IconStar,
  IconUser,
} from "@tabler/icons-react";
import { useState } from "react";
import { EmptyState } from "./empty-state";
import { LoadMoreButton } from "./load-more-button";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Spinner } from "./ui/spinner";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

interface RepositoryListProps {
  username?: string;
  className?: string;
}

export function RepositoryList({ username, className }: RepositoryListProps) {
  const [pageSize] = useState(10);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useMobile();

  const { repositories, isLoading, error, hasMore, loadMore, isLoadingMore, filterRepositories } =
    useGitHubRepositories({
      username: username || "",
      pageSize,
      enabled: !!username?.trim(),
    });

  // Apply filters to repositories
  const filteredRepositories =
    activeFilters.length > 0
      ? filterRepositories((repo) => {
          if (activeFilters.includes("starred") && repo.stargazers_count > 0) return true;
          if (activeFilters.includes("forked") && repo.fork) return true;
          return false;
        })
      : repositories;

  const toggleFilter = (value: string) => {
    setActiveFilters((prev) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  if (isLoading && filteredRepositories.length === 0) {
    return (
      <div className="p-8 text-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-semibold text-destructive mb-2">Error</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!username) {
    return (
      <EmptyState
        icon={IconUser}
        title="No user selected"
        description="Select a user to view their repositories."
      />
    );
  }

  if (repositories.length === 0) {
    return (
      <EmptyState
        icon={IconUser}
        title="No repositories found"
        description={`${username} doesn't have any public repositories yet.`}
      />
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Repositories ({repositories.length})</h2>
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => setShowFilters(!showFilters)}
        >
          <IconFilter className="h-4 w-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {showFilters && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2">Filter by:</h3>
            <ToggleGroup type="multiple" variant="outline" className="justify-start">
              <ToggleGroupItem
                value="starred"
                aria-label="Filter by starred"
                className="gap-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                data-state={activeFilters.includes("starred") ? "on" : "off"}
                onClick={() => toggleFilter("starred")}
              >
                <IconStar className="h-4 w-4" />
                <span className="hidden md:inline">Starred</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="forked"
                aria-label="Filter by forked"
                className="gap-1 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                data-state={activeFilters.includes("forked") ? "on" : "off"}
                onClick={() => toggleFilter("forked")}
              >
                <IconGitFork className="h-4 w-4" />
                <span className="hidden md:inline">Forked</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {filteredRepositories && filteredRepositories.length > 0 ? (
          filteredRepositories.map((repo) => (
            <RepositoryCard key={repo.id} repo={repo} isMobile={isMobile} />
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No repositories match the selected filters.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {hasMore && (
        <div className="py-4 text-center">
          <LoadMoreButton onClick={loadMore} isLoading={isLoadingMore} hasMore={hasMore} />
        </div>
      )}
    </div>
  );
}

interface RepositoryCardProps {
  repo: GitHubRepository;
  isMobile: boolean;
}

function RepositoryCard({ repo, isMobile }: RepositoryCardProps) {
  const topics = repo.topics || [];

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1 mr-2">
            <CardTitle className="text-md">
              <div className="flex items-center space-x-1">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline truncate"
                >
                  {repo.name}
                </a>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground ml-1"
                >
                  <IconExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardTitle>
            {repo.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">{repo.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {repo.fork && (
              <div className="flex items-center text-xs">
                <IconGitFork className="h-3 w-3 mr-1 text-muted-foreground" />
                <span className="text-muted-foreground">Fork</span>
              </div>
            )}
            {!isMobile && repo.stargazers_count > 0 && (
              <div className="flex items-center text-xs">
                <IconStar className="h-3 w-3 mr-1 text-amber-500" />
                <span>{repo.stargazers_count}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap mt-2 items-center justify-between">
          <div className="flex flex-wrap gap-1 max-w-[80%]">
            {repo.language && (
              <Badge variant="outline" className="flex items-center gap-1">
                <IconCode className="h-3 w-3" />
                {repo.language}
              </Badge>
            )}
            {isMobile && repo.stargazers_count > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <IconStar className="h-3 w-3 text-amber-500" />
                {repo.stargazers_count}
              </Badge>
            )}
            {topics.slice(0, isMobile ? 1 : 3).map((topic) => (
              <Badge key={topic} variant="secondary" className="text-xs">
                {topic}
              </Badge>
            ))}
            {topics.length > (isMobile ? 1 : 3) && (
              <Badge variant="secondary" className="text-xs">
                +{topics.length - (isMobile ? 1 : 3)} more
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">{formatDate(repo.updated_at)}</div>
        </div>
      </CardContent>
    </Card>
  );
}
