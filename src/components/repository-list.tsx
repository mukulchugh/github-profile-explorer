import { githubApi, GitHubRepository } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import {
  IconCode,
  IconExternalLink,
  IconFilter,
  IconGitFork,
  IconStar,
  IconUser,
} from "@tabler/icons-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { EmptyState } from "./empty-state";
import { LoadMoreButton } from "./load-more-button";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

interface RepositoryListProps {
  username?: string;
  className?: string;
}

export function RepositoryList({ username, className }: RepositoryListProps) {
  const [pageSize] = useState(10);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Debug logging
  useEffect(() => {
    console.log("RepositoryList rendered for username:", username);
  }, [username]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteQuery({
      queryKey: ["githubRepositories", username],
      queryFn: async ({ pageParam = 1 }) => {
        console.log(`Fetching repositories for ${username}, page ${pageParam}`);
        if (!username?.trim()) {
          console.warn("Attempted to fetch repositories with empty username");
          return [];
        }

        try {
          const repos = await githubApi.getUserRepos(username, pageParam, pageSize);
          console.log(`Fetched ${repos.length} repositories for ${username}`);
          return repos;
        } catch (error) {
          console.error(`Error fetching repositories for ${username}:`, error);
          throw error;
        }
      },
      initialPageParam: 1,
      enabled: !!username?.trim(),
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === pageSize ? allPages.length + 1 : undefined;
      },
    });

  // Apply filters to repositories
  const filteredRepositories = data?.pages.flat().filter((repo) => {
    // If no filters active, show all
    if (activeFilters.length === 0) return true;

    if (activeFilters.includes("starred") && repo.stargazers_count > 0) return true;
    if (activeFilters.includes("forked") && repo.fork) return true;
    if (activeFilters.includes("personal") && !repo.fork) return true;

    return false;
  });

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="py-10 text-center">
          <p className="text-red-500 mb-2">Error loading repositories</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const repositories = data?.pages.flat() || [];

  if (repositories.length === 0) {
    return (
      <EmptyState
        title="No repositories found"
        description={`${username} doesn't have any public repositories yet.`}
        className={className}
      />
    );
  }

  // Count repositories by type for filter badges
  const repoStats = repositories.reduce(
    (stats, repo) => {
      if (repo.stargazers_count > 0) stats.starred++;
      if (repo.fork) stats.forked++;
      else stats.personal++;
      return stats;
    },
    { starred: 0, forked: 0, personal: 0 }
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filter controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Repositories{" "}
          <span className="text-sm font-normal text-muted-foreground">({repositories.length})</span>
        </h2>

        <div className="flex items-center gap-2  border border-gray-200 rounded-md px-4 py-1">
          <IconFilter className="h-4 w-4 text-muted-foreground" />
          <ToggleGroup
            type="multiple"
            value={activeFilters}
            onValueChange={(value) => setActiveFilters(value)}
            className="flex flex-wrap gap-1"
          >
            <ToggleGroupItem
              value="starred"
              aria-label="Toggle starred repositories"
              className="flex gap-1 text-xs"
            >
              <IconStar className="h-3.5 w-3.5" />
              Starred
              <Badge variant="outline" className="ml-1 text-xs px-1">
                {repoStats.starred}
              </Badge>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="forked"
              aria-label="Toggle forked repositories"
              className="flex gap-1 text-xs"
            >
              <IconGitFork className="h-3.5 w-3.5" />
              Forked
              <Badge variant="outline" className="ml-1 text-xs px-1">
                {repoStats.forked}
              </Badge>
            </ToggleGroupItem>

            <ToggleGroupItem
              value="personal"
              aria-label="Toggle personal repositories"
              className="flex gap-1 text-xs"
            >
              <IconUser className="h-3.5 w-3.5" />
              Personal
              <Badge variant="outline" className="ml-1 text-xs px-1">
                {repoStats.personal}
              </Badge>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Repository list */}
      <div className="space-y-4">
        {filteredRepositories && filteredRepositories.length > 0 ? (
          filteredRepositories.map((repo) => <RepositoryCard key={repo.id} repo={repo} />)
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-muted-foreground">No repositories match the selected filters</p>
              <Button variant="outline" className="mt-4" onClick={() => setActiveFilters([])}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {hasNextPage && filteredRepositories && filteredRepositories.length > 0 && (
        <LoadMoreButton
          onClick={() => fetchNextPage()}
          isLoading={isFetchingNextPage}
          hasMore={hasNextPage}
          className="w-full"
        />
      )}
    </div>
  );
}

interface RepositoryCardProps {
  repo: GitHubRepository;
}

function RepositoryCard({ repo }: RepositoryCardProps) {
  // Get topics from real repo data instead of mock data
  const topics = repo.topics || [];

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold truncate mr-2">{repo.name}</CardTitle>
          <Button variant="ghost" size="icon" asChild>
            <a href={repo.html_url} target="_blank" rel="noreferrer" aria-label="Open repository">
              <IconExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-3">
        {repo.description && (
          <p className="text-muted-foreground text-sm line-clamp-2">{repo.description}</p>
        )}

        {/* Use real topics from the repository */}
        {topics.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {topics.slice(0, 3).map((topic: string) => (
              <Badge key={topic} variant="secondary" className="text-xs">
                {topic}
              </Badge>
            ))}
            {topics.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{topics.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {repo.language && (
            <div className="flex items-center gap-1">
              <IconCode className="h-4 w-4" />
              {repo.language}
            </div>
          )}
          <div className="flex items-center gap-1">
            <IconStar className="h-4 w-4" />
            {repo.stargazers_count}
          </div>
          <div className="flex items-center gap-1">
            <IconGitFork className="h-4 w-4" />
            {repo.forks_count}
          </div>
          <div className="text-xs">Updated {formatDate(repo.updated_at)}</div>
        </div>
      </CardContent>
    </Card>
  );
}
