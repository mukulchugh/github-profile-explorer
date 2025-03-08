import { Card } from "@/components/ui/card";
import { GitHubOrg } from "@/lib/api";
import { IconBuildingCommunity, IconExclamationCircle, IconRefresh } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface OrganizationsListProps {
  organizations: GitHubOrg[];
  isLoading: boolean;
  isError?: boolean;
  emptyMessage: string;
  onRetry?: () => void;
}

export function OrganizationsList({
  organizations,
  isLoading,
  isError = false,
  emptyMessage,
  onRetry,
}: OrganizationsListProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [localError, setLocalError] = useState(isError);

  useEffect(() => {
    console.log("OrganizationsList render:", {
      organizationsCount: organizations?.length || 0,
      isLoading,
      isError,
      retryCount,
    });
  }, [organizations, isLoading, isError, retryCount]);

  useEffect(() => {
    setLocalError(isError);
  }, [isError]);

  useEffect(() => {
    if (
      !isLoading &&
      !isError &&
      Array.isArray(organizations) &&
      organizations.length === 0 &&
      retryCount < 2
    ) {
      console.log("Auto-retrying organization fetch, attempt:", retryCount + 1);
      const timer = setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        onRetry?.();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [organizations, isLoading, isError, retryCount, onRetry]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (localError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <IconExclamationCircle className="h-12 w-12 text-destructive mb-4 opacity-70" />
        <p className="text-muted-foreground mb-4">Failed to load organizations</p>
        <button
          onClick={() => {
            setRetryCount((prev) => prev + 1);
            setLocalError(false);
            onRetry?.();
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2 transition-colors"
        >
          <IconRefresh size={16} />
          Try Again
        </button>
      </div>
    );
  }

  if (!organizations || organizations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <IconBuildingCommunity className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
        <p className="text-muted-foreground mb-4">{emptyMessage}</p>
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
