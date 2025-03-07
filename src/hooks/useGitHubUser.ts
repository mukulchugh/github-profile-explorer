import { useToast } from "@/hooks/use-toast";
import {
  getUserDetails,
  getUserRepos,
  GitHubRepo,
  GitHubUser,
} from "@/services/github";
import { useState } from "react";

interface GitHubUserState {
  user: GitHubUser | null;
  repos: GitHubRepo[];
  isLoading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  searchPerformed: boolean;
}

export function useGitHubUser() {
  const [state, setState] = useState<GitHubUserState>({
    user: null,
    repos: [],
    isLoading: false,
    error: null,
    page: 1,
    hasMore: true,
    searchPerformed: false,
  });

  const { toast } = useToast();

  const searchUser = async (username: string) => {
    if (!username) return;

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      searchPerformed: true,
    }));

    try {
      // Get user details
      const userDetails = await getUserDetails(username);

      // Get user repositories (first page)
      const repositories = await getUserRepos(username, 1);

      // Check if there might be more repositories
      const hasMore = repositories.length === 10;

      setState((prev) => ({
        ...prev,
        user: userDetails,
        repos: repositories,
        page: 1,
        hasMore,
        isLoading: false,
      }));

      if (repositories.length === 0) {
        toast({
          title: "No repositories found",
          description: `${username} doesn't have any public repositories.`,
        });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      let errorMessage = "An error occurred while fetching data.";

      if (err instanceof Error) {
        errorMessage = err.message;
        if (err.message === "User not found") {
          errorMessage = `User "${username}" was not found. Please check the username and try again.`;
        }
      }

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        user: null,
        repos: [],
        isLoading: false,
      }));
    }
  };

  const loadMoreRepos = async () => {
    const { user, isLoading, hasMore, page, repos } = state;
    if (!user || isLoading || !hasMore) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const nextPage = page + 1;
      const newRepos = await getUserRepos(user.login, nextPage);
      const moreAvailable = newRepos.length === 10;

      setState((prev) => ({
        ...prev,
        repos: [...prev.repos, ...newRepos],
        page: nextPage,
        hasMore: moreAvailable,
        isLoading: false,
      }));
    } catch (err) {
      console.error("Error loading more repositories:", err);
      setState((prev) => ({ ...prev, isLoading: false }));

      toast({
        title: "Error",
        description: "Failed to load more repositories. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetSearch = () => {
    setState((prev) => ({ ...prev, error: null, searchPerformed: false }));
  };

  return {
    ...state,
    searchUser,
    loadMoreRepos,
    resetSearch,
  };
}
