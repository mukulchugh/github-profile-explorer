import { QueryClient } from "@tanstack/react-query";

// Create a new QueryClient with sensible defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export type QueryKeys =
  | ["githubUsers", string, number, number]
  | ["githubUser", string | undefined]
  | ["githubEvents", string]
  | ["githubFollowers", string, string]
  | ["githubRepositories", string]
  | ["githubOrganizations", string]
  | ["githubActivity", string];
