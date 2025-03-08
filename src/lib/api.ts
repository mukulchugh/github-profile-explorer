/**
 * API utility functions
 */

export async function fetchData(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
}

/**
 * GitHub API client
 */

const BASE_URL = "https://api.github.com";

// Error class for GitHub API errors
export class GitHubApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
  }
}

// Helper to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new GitHubApiError(
      errorData.message || `API error with status code: ${response.status}`,
      response.status
    );
  }
  return response.json() as Promise<T>;
}

// Types for GitHub API responses
export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface UserSearchResult {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubUser[];
}

// Add GitHubEvent type for activity feed
export interface GitHubEvent {
  id: string;
  type: string;
  actor: {
    id: number;
    login: string;
    display_login: string;
    avatar_url: string;
  };
  repo: {
    id: number;
    name: string;
    url: string;
  };
  payload: {
    action?: string;
    ref?: string;
    ref_type?: string;
    commits?: Array<{
      sha: string;
      message: string;
      author: {
        name: string;
        email: string;
      };
    }>;
    issue?: {
      number: number;
      title: string;
    };
    pull_request?: {
      number: number;
      title: string;
    };
  };
  created_at: string;
  public: boolean;
}

export interface GitHubOrg {
  login: string;
  id: number;
  avatar_url: string;
  description: string | null;
  url: string;
  html_url: string;
  repos_url: string;
  public_members_url: string;
  public_repos: number;
}

// GitHub API functions
export const githubApi = {
  /**
   * Search for users by username
   */
  searchUsers: async (
    query: string,
    page: number = 1,
    per_page: number = 10
  ): Promise<UserSearchResult> => {
    try {
      const response = await fetch(
        `${BASE_URL}/search/users?q=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      return handleResponse<UserSearchResult>(response);
    } catch (error) {
      if (error instanceof GitHubApiError) {
        throw error;
      }
      throw new GitHubApiError("Failed to search users", 500);
    }
  },

  /**
   * Get user details by username
   */
  getUserDetails: async (username: string): Promise<GitHubUser> => {
    try {
      const response = await fetch(`${BASE_URL}/users/${encodeURIComponent(username)}`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      });
      return handleResponse<GitHubUser>(response);
    } catch (error) {
      if (error instanceof GitHubApiError) {
        throw error;
      }
      throw new GitHubApiError(`Failed to get user details for ${username}`, 500);
    }
  },

  /**
   * Get user repositories
   */
  getUserRepos: async (
    username: string,
    page: number = 1,
    per_page: number = 10,
    sort: "created" | "updated" | "pushed" | "full_name" = "updated",
    direction: "asc" | "desc" = "desc"
  ): Promise<GitHubRepository[]> => {
    try {
      const response = await fetch(
        `${BASE_URL}/users/${encodeURIComponent(username)}/repos?page=${page}&per_page=${per_page}&sort=${sort}&direction=${direction}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      return handleResponse<GitHubRepository[]>(response);
    } catch (error) {
      if (error instanceof GitHubApiError) {
        throw error;
      }
      throw new GitHubApiError(`Failed to get repositories for ${username}`, 500);
    }
  },

  /**
   * Get user followers
   */
  getFollowers: async (
    username: string,
    page: number = 1,
    per_page: number = 30
  ): Promise<GitHubUser[]> => {
    try {
      const response = await fetch(
        `${BASE_URL}/users/${encodeURIComponent(username)}/followers?page=${page}&per_page=${per_page}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      return handleResponse<GitHubUser[]>(response);
    } catch (error) {
      if (error instanceof GitHubApiError) {
        throw error;
      }
      throw new GitHubApiError(`Failed to get followers for ${username}`, 500);
    }
  },

  /**
   * Get users the user is following
   */
  getFollowing: async (
    username: string,
    page: number = 1,
    per_page: number = 30
  ): Promise<GitHubUser[]> => {
    try {
      const response = await fetch(
        `${BASE_URL}/users/${encodeURIComponent(username)}/following?page=${page}&per_page=${per_page}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      return handleResponse<GitHubUser[]>(response);
    } catch (error) {
      if (error instanceof GitHubApiError) {
        throw error;
      }
      throw new GitHubApiError(`Failed to get following for ${username}`, 500);
    }
  },

  /**
   * Get user events (activity)
   */
  getUserEvents: async (
    username: string,
    page: number = 1,
    per_page: number = 30
  ): Promise<GitHubEvent[]> => {
    try {
      const response = await fetch(
        `${BASE_URL}/users/${encodeURIComponent(username)}/events?page=${page}&per_page=${per_page}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      return handleResponse<GitHubEvent[]>(response);
    } catch (error) {
      if (error instanceof GitHubApiError) {
        throw error;
      }
      throw new GitHubApiError(`Failed to get events for ${username}`, 500);
    }
  },

  /**
   * Get user organizations
   */
  getUserOrgs: async (username: string): Promise<GitHubOrg[]> => {
    try {
      const response = await fetch(`${BASE_URL}/users/${encodeURIComponent(username)}/orgs`, {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      });
      return handleResponse<GitHubOrg[]>(response);
    } catch (error) {
      if (error instanceof GitHubApiError) {
        throw error;
      }
      throw new GitHubApiError(`Failed to get organizations for ${username}`, 500);
    }
  },
};
