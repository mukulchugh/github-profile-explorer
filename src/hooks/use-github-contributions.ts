import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // Intensity levels (0: no contributions, 4: highest)
}

interface ContributionWeek {
  days: ContributionDay[];
}

export interface ContributionsData {
  weeks: ContributionWeek[];
  totalContributions: number;
}

/**
 * Generates mock contribution data when the API fails
 */
function generateMockContributions(username: string): ContributionsData {
  const weeks: ContributionWeek[] = [];
  const now = new Date();
  let totalContributions = 0;

  // Generate 52 weeks (1 year) of mock data
  for (let w = 0; w < 52; w++) {
    const days: ContributionDay[] = [];

    for (let d = 0; d < 7; d++) {
      // Create a pseudo-random pattern based on username and date
      const seed = (username.charCodeAt(0) || 65) + w * 7 + d;
      const count = Math.floor(Math.pow(Math.sin(seed) * 0.5 + 0.5, 2) * 10);
      let level: 0 | 1 | 2 | 3 | 4;

      if (count === 0) level = 0;
      else if (count < 3) level = 1;
      else if (count < 5) level = 2;
      else if (count < 8) level = 3;
      else level = 4;

      // Date for this contribution
      const date = new Date(now);
      date.setDate(date.getDate() - (52 - w) * 7 - (7 - d));

      days.push({
        date: date.toISOString().split("T")[0],
        count,
        level,
      });

      totalContributions += count;
    }

    weeks.push({ days });
  }

  return {
    weeks,
    totalContributions,
  };
}

/**
 * Fetches a GitHub user's contribution data with fallback for CORS issues
 */
async function fetchContributions(username: string): Promise<ContributionsData> {
  try {
    // Check for cached data first
    const cachedData = localStorage.getItem(`contributions_${username}`);
    const cacheTime = localStorage.getItem(`contributions_${username}_time`);

    // Use cache if it's less than 24 hours old
    if (cachedData && cacheTime) {
      const cacheAge = Date.now() - Number(cacheTime);
      if (cacheAge < 24 * 60 * 60 * 1000) {
        // 24 hours
        return JSON.parse(cachedData);
      }
    }

    // Attempt to fetch from the API with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`https://github-contributions-api.vercel.app/api/v1/${username}`, {
      signal: controller.signal,
      mode: "cors",
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch contribution data: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache the successful response
    localStorage.setItem(`contributions_${username}`, JSON.stringify(data));
    localStorage.setItem(`contributions_${username}_time`, String(Date.now()));

    return data;
  } catch (error) {
    console.warn("Falling back to mock contribution data:", error);

    // Check if we have old cached data before using mock data
    const cachedData = localStorage.getItem(`contributions_${username}`);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // Generate mock data as last resort
    const mockData = generateMockContributions(username);

    // Store the mock data in cache to avoid regenerating it repeatedly
    localStorage.setItem(`contributions_${username}`, JSON.stringify(mockData));
    localStorage.setItem(
      `contributions_${username}_time`,
      String(Date.now() - 23 * 60 * 60 * 1000)
    ); // Set to expire in ~1 hour

    return mockData;
  }
}

/**
 * Hook for fetching GitHub user's contribution data with fallback mechanisms
 */
export function useGitHubContributions(username: string, enabled: boolean = false) {
  const { toast } = useToast();

  const {
    data: contributions,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["githubContributions", username],
    queryFn: () => fetchContributions(username),
    enabled: enabled && Boolean(username?.trim()),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 1, // Only retry once
  });

  // Handle error with useEffect
  useEffect(() => {
    if (error && enabled) {
      console.error("Error fetching contribution data:", error);
      toast({
        title: "Using Estimated Data",
        description: "Showing estimated contribution activity due to API limitations.",
        variant: "default",
        duration: 5000,
      });
    }
  }, [error, enabled, toast]);

  return {
    contributions,
    isLoading,
    error,
  };
}
