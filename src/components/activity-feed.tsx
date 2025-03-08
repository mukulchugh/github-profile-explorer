import { Button } from "@/components/ui/button";
import { GitHubEvent } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  IconCode,
  IconGitBranch,
  IconHistory,
  IconMessageCircle,
  IconStar,
} from "@tabler/icons-react";
import { format } from "date-fns";

interface ActivityFeedProps {
  events: GitHubEvent[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  emptyMessage: string;
}

export function ActivityFeed({
  events,
  isLoading,
  hasMore,
  onLoadMore,
  emptyMessage,
}: ActivityFeedProps) {
  // Helper to get icon for event type
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "PushEvent":
        return <IconCode className="h-4 w-4" />;
      case "PullRequestEvent":
        return <IconGitBranch className="h-4 w-4" />;
      case "IssuesEvent":
      case "IssueCommentEvent":
        return <IconMessageCircle className="h-4 w-4" />;
      case "WatchEvent":
      case "StarEvent":
        return <IconStar className="h-4 w-4" />;
      default:
        return <IconHistory className="h-4 w-4" />;
    }
  };

  // Helper to get description for event
  const getEventDescription = (event: GitHubEvent) => {
    const repoName = event.repo.name;

    switch (event.type) {
      case "PushEvent":
        const commitCount = event.payload.commits?.length || 0;
        return `Pushed ${commitCount} commit${commitCount === 1 ? "" : "s"} to ${repoName}`;

      case "PullRequestEvent":
        const action = event.payload.action;
        const prNumber = event.payload.pull_request?.number;
        return `${action} pull request #${prNumber} in ${repoName}`;

      case "IssuesEvent":
        const issueAction = event.payload.action;
        const issueNumber = event.payload.issue?.number;
        return `${issueAction} issue #${issueNumber} in ${repoName}`;

      case "IssueCommentEvent":
        const commentIssue = event.payload.issue?.number;
        return `Commented on issue #${commentIssue} in ${repoName}`;

      case "WatchEvent":
        return `Starred ${repoName}`;

      case "CreateEvent":
        const refType = event.payload.ref_type;
        const ref = event.payload.ref;
        return `Created ${refType} ${ref ? `"${ref}" in ` : ""}${repoName}`;

      case "DeleteEvent":
        const deletedRefType = event.payload.ref_type;
        const deletedRef = event.payload.ref;
        return `Deleted ${deletedRefType} ${deletedRef} from ${repoName}`;

      case "ForkEvent":
        return `Forked ${repoName}`;

      default:
        return `Activity in ${repoName}`;
    }
  };

  if (isLoading && events.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <IconHistory className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className={cn(
              "flex border-l-2 border-primary/30 pl-4 py-2",
              "hover:border-primary transition-colors duration-200"
            )}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="bg-secondary rounded-full p-1">{getEventIcon(event.type)}</div>
                <a
                  href={`https://github.com/${event.repo.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:text-primary"
                >
                  {getEventDescription(event)}
                </a>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(event.created_at), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={onLoadMore}
            variant="outline"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span>Loading...</span>
              </>
            ) : (
              <span>Load More Activities</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
