import { Card } from "@/components/ui/card";
import { GitHubOrg } from "@/lib/api";
import { IconBuildingCommunity, IconExclamationCircle } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface OrganizationsListProps {
  organizations: GitHubOrg[];
  isLoading: boolean;
  emptyMessage: string;
  onRetry?: () => void;
}

export function OrganizationsList({
  organizations,
  isLoading,
  emptyMessage,
  onRetry,
}: OrganizationsListProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Add effect to retry if organizations are empty and not loading
  useEffect(() => {
    if (!isLoading && organizations?.length === 0 && retryCount < 2) {
      // Force clear session storage for this user's orgs
      const timer = setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        // This will re-render and hopefully trigger a re-fetch
        onRetry?.();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [organizations, isLoading, retryCount, onRetry]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle empty organizations with retry option
  if (!organizations || organizations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <IconBuildingCommunity className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
        <p className="text-muted-foreground mb-4">{emptyMessage}</p>

        {/* Add retry button */}
        <button
          onClick={() => {
            setRetryCount((prev) => prev + 1);
            setHasError(false);
            onRetry?.();
          }}
          className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md flex items-center gap-2 transition-colors"
        >
          <IconExclamationCircle size={16} />
          Refresh Organizations
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {organizations.map((org) => (
        <Card key={org.id} className="overflow-hidden">
          <div className="flex items-center p-4">
            <img
              src={org.avatar_url}
              alt={`${org.login}'s logo`}
              className="h-12 w-12 rounded-md mr-4"
            />
            <div>
              <a
                href={`https://github.com/${org.login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:text-primary"
              >
                {org.login}
              </a>
              {org.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{org.description}</p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
