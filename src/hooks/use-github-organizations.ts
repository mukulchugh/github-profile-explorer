import { useToast } from "@/hooks/use-toast";
import { githubApi, GitHubOrg } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Hook for fetching a GitHub user's organizations
 */
export function useGitHubOrganizations(username: string, enabled: boolean = false) {
  const { toast } = useToast();

  const {
    data: organizations,
    isLoading,
    error,
    refetch,
  } = useQuery<GitHubOrg[], Error>({
    queryKey: ["githubOrgs", username],
    queryFn: () => githubApi.getUserOrgs(username),
    enabled: enabled && Boolean(username?.trim()),
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 60 minutes
    retry: 1,
  });

  // Handle error with useEffect
  useEffect(() => {
    if (error && enabled) {
      console.error("Error fetching GitHub organizations:", error);
      toast({
        title: "Error",
        description: "Failed to load organizations. Please try again later.",
        variant: "default",
      });
    }
  }, [error, enabled, toast]);

  return {
    organizations: organizations || [],
    isLoading,
    error,
    refetch,
  };
}
