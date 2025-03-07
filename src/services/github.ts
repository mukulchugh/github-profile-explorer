
/**
 * GitHub API Service
 * Handles all interactions with the GitHub API
 */

// Define types for GitHub API responses
export interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    url: string;
    html_url: string;
  };
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  license: {
    key: string;
    name: string;
    url: string;
  } | null;
  topics: string[];
  visibility: string;
  default_branch: string;
}

// Base API URL
const BASE_URL = 'https://api.github.com';

/**
 * Search for GitHub users by username
 * @param username The username to search for
 */
export const searchUsers = async (username: string): Promise<GitHubUser[]> => {
  try {
    const response = await fetch(`${BASE_URL}/search/users?q=${username}&per_page=5`);
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error('Error searching GitHub users:', error);
    throw error;
  }
};

/**
 * Get detailed information for a GitHub user
 * @param username The username to get details for
 */
export const getUserDetails = async (username: string): Promise<GitHubUser> => {
  try {
    const response = await fetch(`${BASE_URL}/users/${username}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('User not found');
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};

/**
 * Get repositories for a GitHub user
 * @param username The username to get repositories for
 * @param page The page number (pagination)
 * @param perPage Number of repositories per page
 */
export const getUserRepos = async (
  username: string, 
  page = 1, 
  perPage = 10
): Promise<GitHubRepo[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/users/${username}/repos?page=${page}&per_page=${perPage}&sort=updated`
    );
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user repositories:', error);
    throw error;
  }
};
