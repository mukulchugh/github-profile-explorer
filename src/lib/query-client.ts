import { QueryClient } from "@tanstack/react-query";

// Create a new QueryClient with sensible defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default stale time of 5 minutes for data caching
      staleTime: 5 * 60 * 1000,

      // Default cache time of 10 minutes
      gcTime: 10 * 60 * 1000,

      // Only retry once by default
      retry: 1,

      // Avoid refetching on window focus for better performance
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Only retry once by default
      retry: 1,
    },
  },
});

// Utility type for query keys to improve type safety
export type QueryKeys =
  | ["githubUsers", string, number, number]
  | ["githubUser", string | undefined]
  | ["githubEvents", string]
  | ["githubContributions", string]
  | ["githubFollowers", string, string]
  | ["githubRepositories", string]
  | ["githubOrganizations", string];
