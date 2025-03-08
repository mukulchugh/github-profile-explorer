import { EmptyState } from "@/components/empty-state";
import { RepoCard } from "@/components/repo-card";
import { Spinner } from "@/components/spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useGitHubRepositories } from "@/hooks/use-github-repositories";
import { IconBrandGithub, IconFilter, IconGitFork, IconStar, IconUser } from "@tabler/icons-react";
import { useState } from "react";

interface RepositoriesSectionProps {
  username: string;
}

export function RepositoriesSection({ username }: RepositoriesSectionProps) {
  const { repositories, isLoading, error } = useGitHubRepositories(username);
  const [displayCount, setDisplayCount] = useState(6);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Filter repositories based on active filters
  const filteredRepositories = repositories?.filter((repo) => {
    // If no filters active, show all
    if (activeFilters.length === 0) return true;

    if (activeFilters.includes("starred") && repo.stargazers_count > 0) return true;
    if (activeFilters.includes("forked") && repo.fork) return true;
    if (activeFilters.includes("personal") && !repo.fork) return true;

    return false;
  });

  // Load more repositories
  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 6);
  };

  // No repositories state
  if (!isLoading && (!repositories || repositories.length === 0)) {
    return (
      <EmptyState
        icon={IconBrandGithub}
        title="No repositories found"
        description={`${username} doesn't have any public repositories yet.`}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <IconBrandGithub className="h-5 w-5" />
          Repositories
          {!isLoading && repositories && (
            <span className="text-sm font-normal text-muted-foreground">
              ({repositories.length})
            </span>
          )}
        </h2>

        {/* Repository Filters */}
        <div className="flex items-center gap-2">
          <IconFilter className="h-4 w-4 text-muted-foreground" />
          <ToggleGroup
            type="multiple"
            value={activeFilters}
            onValueChange={(value) => setActiveFilters(value)}
          >
            <ToggleGroupItem value="starred" aria-label="Toggle starred repositories">
              <IconStar className="h-4 w-4 mr-1" />
              Starred
            </ToggleGroupItem>
            <ToggleGroupItem value="forked" aria-label="Toggle forked repositories">
              <IconGitFork className="h-4 w-4 mr-1" />
              Forked
            </ToggleGroupItem>
            <ToggleGroupItem value="personal" aria-label="Toggle personal repositories">
              <IconUser className="h-4 w-4 mr-1" />
              Personal
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="text-center py-10 text-red-500">
            <p>Error loading repositories.</p>
            <p className="text-sm mt-2">{error.message}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRepositories
            ?.slice(0, displayCount)
            .map((repo) => <RepoCard key={repo.id} repository={repo} />)}
        </div>
      )}

      {repositories && displayCount < repositories.length && (
        <div className="mt-6 flex justify-center">
          <Button onClick={handleLoadMore} variant="outline">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
