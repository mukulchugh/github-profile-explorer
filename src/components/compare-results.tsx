import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useGitHubCompare } from "@/hooks/use-github-compare";
import { useViewControl } from "@/hooks/use-view-control";
import { GitHubUser } from "@/lib/api";
import {
  IconBuilding,
  IconCode,
  IconExclamationCircle,
  IconGitCompare,
  IconGitFork,
  IconStar,
  IconUsers,
} from "@tabler/icons-react";
import { format } from "date-fns";
import * as React from "react";
import { Spinner } from "./ui/spinner";

export function CompareResults(): React.ReactElement {
  const { compareUsernames } = useViewControl();
  const { users, isLoading, hasErrors } = useGitHubCompare({
    usernames: compareUsernames || [],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  if (!compareUsernames?.length || users.length < 2) {
    return (
      <EmptyState
        icon={IconGitCompare}
        title="No Profiles to Compare"
        description="Please select at least two GitHub profiles to compare"
        className="bg-white h-full dark:bg-zinc-900"
      />
    );
  }

  if (hasErrors && users.length === 0) {
    return (
      <EmptyState
        icon={IconExclamationCircle}
        title="Error Loading Profiles"
        description="There was an error loading some or all of the profiles. Please try again."
      />
    );
  }

  const maxRepos = Math.max(...users.map((u) => u.public_repos));
  const maxFollowers = Math.max(...users.map((u) => u.followers));
  const maxGists = Math.max(...users.map((u) => u.public_gists));

  return (
    <div className="space-y-6">
      {/* User Profiles */}
      <Card>
        <CardHeader className="pb-3">
          <h2 className="text-xl font-bold">User Profiles</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col items-center text-center p-4 rounded-lg border bg-card/50"
              >
                <div className="mb-3">
                  <img
                    src={user.avatar_url}
                    alt={`${user.login}'s avatar`}
                    className="w-20 h-20 rounded-full border-2 border-primary/10"
                  />
                </div>
                <h3 className="font-semibold text-lg">{user.name || user.login}</h3>
                <a
                  href={`https://github.com/${user.login}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  @{user.login}
                </a>
                {user.bio && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Comparison */}
      <Card>
        <CardHeader className="pb-3">
          <h2 className="text-xl font-bold">GitHub Statistics</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Repositories */}
          <StatComparisonSection
            title="Public Repositories"
            icon={IconCode}
            users={users}
            statKey="public_repos"
            maxValue={maxRepos}
          />

          {/* Followers */}
          <StatComparisonSection
            title="Followers"
            icon={IconUsers}
            users={users}
            statKey="followers"
            maxValue={maxFollowers}
          />

          {/* Public Gists */}
          <StatComparisonSection
            title="Public Gists"
            icon={IconStar}
            users={users}
            statKey="public_gists"
            maxValue={maxGists}
          />
        </CardContent>
      </Card>

      {/* Account Details */}
      <Card>
        <CardHeader className="pb-3">
          <h2 className="text-xl font-bold">Account Details</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {users.map((user) => (
              <AccountDetailCard key={user.id} user={user} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatComparisonSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  users: GitHubUser[];
  statKey: keyof Pick<GitHubUser, "public_repos" | "followers" | "following" | "public_gists">;
  maxValue: number;
}

function StatComparisonSection({
  title,
  icon: Icon,
  users,
  statKey,
  maxValue,
}: StatComparisonSectionProps): React.ReactElement {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className="space-y-3">
        {users.map((user) => {
          const value = user[statKey];
          const percentage = maxValue ? (value / maxValue) * 100 : 0;

          return (
            <div key={`${statKey}-${user.id}`} className="relative">
              <div className="flex items-center gap-3">
                <div className="w-20 text-sm truncate">{user.login}</div>
                <div className="flex-1 h-8 bg-muted rounded-md overflow-hidden">
                  <div
                    className="h-full bg-primary/20 rounded-md flex items-center justify-end px-2"
                    style={{ width: `${Math.max(percentage, 5)}%` }}
                  >
                    {percentage > 15 && <span className="text-xs font-medium">{value}</span>}
                  </div>
                </div>
                {percentage <= 15 && (
                  <span className="text-sm font-medium w-10 text-right">{value}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface AccountDetailCardProps {
  user: GitHubUser;
}

function AccountDetailCard({ user }: AccountDetailCardProps): React.ReactElement {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex gap-3 items-center mb-3">
        <img
          src={user.avatar_url}
          alt={`${user.login}'s avatar`}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <h4 className="font-medium">{user.login}</h4>
          <p className="text-xs text-muted-foreground">
            Created: {format(new Date(user.created_at), "MMM d, yyyy")}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <IconUsers className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Following:</span>
          <span className="font-medium">{user.following}</span>
        </div>

        {user.company && (
          <div className="flex items-center gap-2">
            <IconBuilding className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Company:</span>
            <span className="font-medium truncate">{user.company}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <IconGitFork className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Total:</span>
          <span className="font-medium">{user.public_repos + user.public_gists} repositories</span>
        </div>
      </div>
    </div>
  );
}
