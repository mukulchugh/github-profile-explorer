import { githubApi, GitHubRepository } from "@/lib/api";
import { cn, formatDate } from "@/lib/utils";
import { IconCode, IconExternalLink, IconGitFork, IconStar } from "@tabler/icons-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useState } from "react";
import { EmptyState } from "./empty-state";
import { LoadMoreButton } from "./load-more-button";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface RepositoryListProps {
  username?: string;
  className?: string;
}

export function RepositoryList({ username, className }: RepositoryListProps) {
  const [pageSize] = useState(10);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } =
    useInfiniteQuery({
      queryKey: ["userRepos", username],
      queryFn: ({ pageParam = 1 }) =>
        username ? githubApi.getUserRepos(username, pageParam, pageSize) : Promise.resolve([]),
      initialPageParam: 1,
      enabled: !!username,
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.length === pageSize ? allPages.length + 1 : undefined;
      },
    });

  // Flatten the paginated results
  const repositories = data?.pages.flat() || [];

  if (isLoading && repositories.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (error && repositories.length === 0) {
    return (
      <EmptyState
        icon={IconCode}
        title="Unable to fetch repositories"
        description={`Error: ${(error as Error).message}`}
      />
    );
  }

  if (repositories.length === 0) {
    return (
      <EmptyState
        icon={IconCode}
        title="No repositories found"
        description={`${username} doesn't have any public repositories yet.`}
      />
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      <h2 className="text-xl font-bold">Repositories ({repositories.length})</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {repositories.map((repo) => (
          <RepositoryCard key={repo.id} repo={repo} />
        ))}
      </div>

      <LoadMoreButton
        onClick={() => fetchNextPage()}
        isLoading={isFetchingNextPage}
        hasMore={!!hasNextPage}
      />
    </div>
  );
}

interface RepositoryCardProps {
  repo: GitHubRepository;
}

function RepositoryCard({ repo }: RepositoryCardProps) {
  // Mock topics (since the GitHub API type doesn't include topics, we'd need to extend it)
  // In a real app, you'd fetch these from the API or extend the type
  const mockTopics = ["react", "typescript", "ui"];

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

        {/* Mock topics display - you'd need to fetch these from the GitHub API */}
        <div className="flex flex-wrap gap-2">
          {mockTopics.slice(0, 3).map((topic) => (
            <Badge key={topic} variant="secondary" className="text-xs">
              {topic}
            </Badge>
          ))}
        </div>

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
