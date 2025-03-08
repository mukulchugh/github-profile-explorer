import { ActivityFeed } from "@/components/activity-feed";
import { EmptyState } from "@/components/empty-state";
import { FollowersTab } from "@/components/followers-tab";
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
  IconSearch,
  IconStar,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import { useState } from "react";
import { ContributionBarGraph, ContributionGraph } from "../contribution-graph";
import { LanguageChart } from "../language-chart";
import { RepoStatsChart } from "../repo-stats-chart";
import { RepositoryList } from "../repository-list";

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
  } = useGitHubActivity(username || "", !!username && activeTab === "activity");

  // Fetch GitHub organizations data
  const {
    organizations,
    isLoading: isLoadingOrgs,
    refetch: refetchOrgs,
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

  // Sample repository stats data
  const repoStatsData = [
    { month: "Jan", stars: 10, forks: 5, commits: 23 },
    { month: "Feb", stars: 15, forks: 7, commits: 45 },
    { month: "Mar", stars: 20, forks: 9, commits: 32 },
    { month: "Apr", stars: 30, forks: 12, commits: 53 },
    { month: "May", stars: 40, forks: 15, commits: 39 },
    { month: "Jun", stars: 50, forks: 20, commits: 29 },
  ];

  // Sample language data
  const languageData = [
    { name: "JavaScript", value: 40 },
    { name: "TypeScript", value: 30 },
    { name: "Python", value: 15 },
    { name: "HTML", value: 10 },
    { name: "CSS", value: 5 },
  ];

  // Monthly activity data for the bar chart
  const monthlyActivityData = [
    { date: "2023-01", count: 30 },
    { date: "2023-02", count: 25 },
    { date: "2023-03", count: 40 },
    { date: "2023-04", count: 45 },
    { date: "2023-05", count: 35 },
    { date: "2023-06", count: 55 },
    { date: "2023-07", count: 60 },
    { date: "2023-08", count: 48 },
    { date: "2023-09", count: 52 },
    { date: "2023-10", count: 58 },
    { date: "2023-11", count: 42 },
    { date: "2023-12", count: 38 },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* User Profile Card */}
      <UserProfileCard
        user={userDetails}
        onAddToWatchlist={handleWatchlistToggle}
        isInWatchlist={isWatched(userDetails.id)}
        variant="default"
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
          <TabsTrigger value="starred" className="flex items-center gap-2">
            <IconStar className="h-4 w-4" />
            <span className="hidden sm:inline">Starred</span>
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : contributions ? (
                <ContributionGraph data={contributions} />
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No contribution data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Repository Stats Chart */}
          <RepoStatsChart data={repoStatsData} title="Repository Growth" />

          {/* Monthly Activity */}
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <IconHistory className="h-5 w-5" />
                Monthly Activity
              </h2>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <ContributionBarGraph data={monthlyActivityData} />
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
                emptyMessage={`${userDetails.login} doesn't belong to any public organizations.`}
                onRetry={refetchOrgs}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab content for Starred */}
        <TabsContent value="starred" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Starred Repositories</h2>
            <p className="text-muted-foreground">
              Repositories that {userDetails.login} has starred will appear here.
            </p>
          </Card>
        </TabsContent>

        {/* Tab content for Followers */}
        <TabsContent value="followers" className="mt-6">
          <FollowersTab username={userDetails.login} type="followers" onSelectUser={onSelectUser} />
        </TabsContent>

        {/* Tab content for Following */}
        <TabsContent value="following" className="mt-6">
          <FollowersTab username={userDetails.login} type="following" onSelectUser={onSelectUser} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
