import { QueryClient } from "@tanstack/react-query";
import { DEFAULT_GC_TIME, DEFAULT_RETRY_COUNT, DEFAULT_STALE_TIME } from "./constants";

/**
 * Create a new QueryClient with configuration aligned with our constants
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME,
      gcTime: DEFAULT_GC_TIME,
      retry: DEFAULT_RETRY_COUNT,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: DEFAULT_RETRY_COUNT,
    },
  },
});

/**
 * GitHub-specific query key parts
 */
export const QUERY_KEYS = {
  USERS: "githubUsers",
  USER: "githubUser",
  REPOSITORIES: "githubRepositories",
  ORGANIZATIONS: "githubOrganizations",
  FOLLOWERS: "githubFollowers",
  FOLLOWING: "githubFollowing",
  EVENTS: "githubEvents",
  ACTIVITY: "githubActivity",
};

/**
 * Ensures consistency across all query hooks
 */
export type QueryKeys =
  // Search results for users
  | [typeof QUERY_KEYS.USERS, string, number?]
  // Individual user details
  | [typeof QUERY_KEYS.USER, string | undefined]
  // User events/activity
  | [typeof QUERY_KEYS.EVENTS, string]
  | [typeof QUERY_KEYS.ACTIVITY, string]
  // User followers/following
  | [typeof QUERY_KEYS.FOLLOWERS, string]
  | [typeof QUERY_KEYS.FOLLOWING, string]
  // User repositories
  | [typeof QUERY_KEYS.REPOSITORIES, string, string?]
  // User organizations
  | [typeof QUERY_KEYS.ORGANIZATIONS, string];
