import { cn } from "@/lib/utils";
import { GitHubRepo } from "@/services/github";
import {
  IconCalendar,
  IconCode,
  IconEye,
  IconEyeOff,
  IconGitFork,
  IconStar,
} from "@tabler/icons-react";
import React from "react";

interface RepoListProps {
  repos: GitHubRepo[];
  isLoading: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
}

const RepoList: React.FC<RepoListProps> = ({
  repos,
  isLoading,
  onLoadMore,
  hasMore,
}) => {
  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="animate-slide-up w-full max-w-3xl mx-auto mt-8">
      <h2 className="text-2xl font-semibold mb-4">Repositories</h2>

      <div className="space-y-4">
        {repos.map((repo) => (
          <div
            key={repo.id}
            className={cn(
              "glass rounded-xl p-5 transition-all duration-300",
              "hover:shadow-md hover:scale-[1.01]"
            )}
          >
            <div className="flex flex-col">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors duration-200"
                    >
                      {repo.name}
                    </a>

                    {repo.private ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary">
                        <IconEyeOff className="w-3 h-3 mr-1" />
                        Private
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary">
                        <IconEye className="w-3 h-3 mr-1" />
                        Public
                      </span>
                    )}
                  </h3>

                  {repo.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {repo.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                {repo.language && (
                  <div className="flex items-center gap-1.5">
                    <IconCode className="h-4 w-4" />
                    <span>{repo.language}</span>
                  </div>
                )}

                {repo.stargazers_count > 0 && (
                  <div className="flex items-center gap-1.5">
                    <IconStar className="h-4 w-4" />
                    <span>{repo.stargazers_count}</span>
                  </div>
                )}

                {repo.forks_count > 0 && (
                  <div className="flex items-center gap-1.5">
                    <IconGitFork className="h-4 w-4" />
                    <span>{repo.forks_count}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <IconCalendar className="h-4 w-4" />
                  <span>Updated {formatDate(repo.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Load more button */}
        {repos.length > 0 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={onLoadMore}
              disabled={isLoading || !hasMore}
              className={cn(
                "inline-flex items-center justify-center rounded-xl px-5 py-2.5",
                "text-sm font-medium transition-all duration-200 ease-out",
                "bg-secondary hover:bg-secondary/80",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                !hasMore || isLoading ? "opacity-70 cursor-not-allowed" : ""
              )}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-primary/30 border-t-primary animate-spin mr-2" />
                  Loading...
                </>
              ) : !hasMore ? (
                "No more repositories"
              ) : (
                "Load more"
              )}
            </button>
          </div>
        )}

        {repos.length === 0 && !isLoading && (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No repositories found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RepoList;
