import { useToast } from "@/hooks/use-toast";
import { githubApi, GitHubUser } from "@/lib/api";
import { useQueries } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Hook for comparing multiple GitHub users
 */
export function useGitHubCompare(usernames: string[]) {
  const { toast } = useToast();

  const validUsernames = usernames.filter((name) => name?.trim());

  const results = useQueries({
    queries: validUsernames.map((username) => ({
      queryKey: ["githubUser", username],
      queryFn: () => githubApi.getUserDetails(username),
      staleTime: 1000 * 60 * 15, // 15 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      enabled: Boolean(username?.trim()),
    })),
  });

  useEffect(() => {
    results.forEach((result, index) => {
      if (result.error) {
        let errorMessage = `Failed to fetch user ${validUsernames[index]}.`;
        let variant = "destructive";

        if (result.error instanceof Error) {
          if (result.error.message.includes("Not Found")) {
            errorMessage = `User "${validUsernames[index]}" was not found.`;
          } else if (result.error.message.includes("rate limit")) {
            errorMessage = result.error.message;
            variant = "default";
          }
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: variant as "default" | "destructive",
        });
      }
    });
  }, [results, validUsernames, toast]);

  const isLoading = results.some((result) => result.isLoading);

  const users: GitHubUser[] = results
    .filter((result) => result.data)
    .map((result) => result.data as GitHubUser);

  return {
    users,
    isLoading,
    hasErrors: results.some((result) => result.error),
  };
}
