import { ActivityFeed } from "@/components/activity-feed";
import { ContributionGraph } from "@/components/contribution-graph";
import { EmptyState } from "@/components/empty-state";
import { LanguageChart } from "@/components/language-chart";
import { OrganizationsList } from "@/components/organizations-list";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfileCard } from "@/components/user-profile-card";
import { useGitHubActivity } from "@/hooks/use-github-activity";
import { useGitHubContributions } from "@/hooks/use-github-contributions";
import { useGitHubOrganizations } from "@/hooks/use-github-organizations";
import { useWatchList } from "@/hooks/use-watch-list";
import { GitHubUser } from "@/lib/api";
import {
  IconBook,
  IconBuilding,
  IconCode,
  IconHistory,
  IconLoader,
  IconSearch,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { useState } from "react";
import { RepositoryList } from "./repository-list";

interface ProfileDetailsProps {
  username?: string;
  userDetails?: GitHubUser;
  isLoading?: boolean;
  onSelectUser?: (username: string) => void;
}

export function ProfileDetails({
  username,
  userDetails,
  isLoading = false,
  onSelectUser,
}: ProfileDetailsProps) {
  const { addToWatchList, removeFromWatchList, isWatched } = useWatchList();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch GitHub contributions data
  const { contributions, isLoading: isLoadingContributions } = useGitHubContributions(
    username || "",
    !!username && activeTab === "overview"
  );

  // Fetch GitHub activity data
  const {
    events,
    isLoading: isLoadingActivity,
    hasMore,
    loadMore,
  } = useGitHubActivity({
    username: username || "",
    enabled: !!username && activeTab === "activity",
  });

  // Fetch GitHub organizations data
  const {
    organizations,
    isLoading: isLoadingOrgs,
    refetch: refetchOrgs,
    isError: isOrgsError,
  } = useGitHubOrganizations(username || "", !!username && activeTab === "organizations");

  const handleWatchlistToggle = async (user: GitHubUser) => {
    if (isWatched(user.id)) {
      await removeFromWatchList(user.id);
    } else {
      await addToWatchList(user);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  if (!username) {
    return (
      <EmptyState
        icon={IconSearch}
        title="No profile selected"
        description="Search for a GitHub user or select one from your history"
      />
    );
  }

  if (!userDetails) {
    return (
      <EmptyState
        icon={IconUser}
        title={`No profile found for "${username}"`}
        description="Try searching for another username"
      />
    );
  }

  // Sample language data
  const languageData = [
    { name: "JavaScript", value: 40 },
    { name: "TypeScript", value: 30 },
    { name: "Python", value: 15 },
    { name: "HTML", value: 10 },
    { name: "CSS", value: 5 },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* User Profile Card */}
      <UserProfileCard
        user={userDetails}
        onAddToWatchlist={handleWatchlistToggle}
        isInWatchlist={isWatched(userDetails.id)}
        variant="default"
        organizationsCount={organizations.length}
      />

      {/* Profile Tabs */}
      <Tabs
        defaultValue="overview"
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <IconCode className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="repositories" className="flex items-center gap-2">
            <IconBook className="h-4 w-4" />
            <span className="hidden sm:inline">Repositories</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <IconHistory className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <IconBuilding className="h-4 w-4" />
            <span className="hidden sm:inline">Orgs</span>
          </TabsTrigger>
          <TabsTrigger value="followers" className="flex items-center gap-2">
            <IconUsers className="h-4 w-4" />
            <span className="hidden sm:inline">Followers</span>
          </TabsTrigger>
          <TabsTrigger value="following" className="flex items-center gap-2">
            <IconUsers className="h-4 w-4" />
            <span className="hidden sm:inline">Following</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab content for Overview */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          {/* GitHub-style Contribution Graph */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <IconHistory className="h-5 w-5" />
                Contribution Activity
              </h2>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {isLoadingContributions ? (
                <div className="h-40 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary">
                    <IconLoader className="h-5 w-5" />
                  </div>
                </div>
              ) : (
                <ContributionGraph username={username} />
              )}
            </CardContent>
          </Card>

          {/* Language Distribution */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <IconCode className="h-5 w-5" />
                Most Used Languages
              </h2>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="h-64">
                <LanguageChart data={languageData} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab content for Repositories */}
        <TabsContent value="repositories" className="mt-6">
          <RepositoryList username={userDetails.login} />
        </TabsContent>

        {/* Tab content for Activity */}
        <TabsContent value="activity" className="mt-6">
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <IconHistory className="h-5 w-5" />
                Recent Activity
              </h2>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <ActivityFeed
                events={events}
                isLoading={isLoadingActivity}
                hasMore={hasMore}
                onLoadMore={loadMore}
                emptyMessage={`${userDetails.login} hasn't had any public activity recently.`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab content for Organizations */}
        <TabsContent value="organizations" className="mt-6">
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <IconBuilding className="h-5 w-5" />
                Organizations
              </h2>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <OrganizationsList
                organizations={organizations}
                isLoading={isLoadingOrgs}
                isError={isOrgsError}
                emptyMessage={`${userDetails.login} doesn't belong to any public organizations.`}
                onRetry={refetchOrgs}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
