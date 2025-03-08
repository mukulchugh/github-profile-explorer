import { useToast } from "@/hooks/use-toast";
import { githubApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "./use-local-storage";

// Define contribution data structure
export interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // 0 = no contributions, 4 = max level
}

export interface WeekdayContribution {
  day: string;
  count: number;
}

export interface MonthlyContribution {
  month: string;
  count: number;
}

export type ContributionPeriod = "year" | "month" | "week" | "30days";

export interface ContributionsData {
  totalContributions: number;
  days: ContributionDay[];
  months: MonthlyContribution[];
  weekdays: WeekdayContribution[];
  last30Days: ContributionDay[];
}

interface RawContributionDay {
  date: string;
  count: number;
}

// Fetch GitHub contributions using the GitHub API
async function fetchGitHubContributions(username: string): Promise<RawContributionDay[]> {
  try {
    const contributionsData = await githubApi.getUserContributions(username);

    // Convert from the API format to our RawContributionDay format
    return contributionsData.map((contribution) => ({
      date: contribution.date,
      count: contribution.count,
    }));
  } catch (error) {
    console.error(`Error fetching contributions for ${username}:`, error);
    throw error;
  }
}

const CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Hook for fetching and managing GitHub contributions data
 */
export function useGitHubContributions(username: string, enabled = false) {
  const { toast } = useToast();
  const [period, setPeriod] = useState<ContributionPeriod>("year");
  const [cacheTTL] = useLocalStorage<number>("contributions-cache-ttl", CACHE_TTL);

  // Fetch contribution data from GitHub
  const {
    data: contributions,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["githubContributions", username],
    queryFn: async () => {
      console.log(`Fetching contributions for ${username}...`);

      if (!username) {
        return null;
      }

      try {
        // Get the raw contribution data
        const rawData = await fetchGitHubContributions(username);

        // Process the raw data into our structured format
        const processedData = processContributionData(rawData);

        return processedData;
      } catch (err) {
        console.error(`Error fetching contributions for ${username}:`, err);
        throw err;
      }
    },
    enabled: enabled && Boolean(username),
    staleTime: cacheTTL,
    gcTime: cacheTTL * 2,
  });

  // Handle error with useEffect
  useEffect(() => {
    if (error && enabled) {
      console.error("Error fetching GitHub contributions:", error);
      toast({
        title: "Error",
        description: "Failed to load GitHub contributions. Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, enabled, toast]);

  // Calculate filtered contributions based on selected period
  const filteredContributions = useMemo(() => {
    if (!contributions) return null;

    switch (period) {
      case "year":
        return contributions.days;
      case "month": {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return contributions.days.filter((day) => new Date(day.date) >= startOfMonth);
      }
      case "week": {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        return contributions.days.filter((day) => new Date(day.date) >= startOfWeek);
      }
      case "30days":
        return contributions.last30Days;
      default:
        return contributions.days;
    }
  }, [contributions, period]);

  // Function to change the currently viewed period
  const changePeriod = useCallback((newPeriod: ContributionPeriod) => {
    setPeriod(newPeriod);
  }, []);

  return {
    contributions,
    filteredContributions,
    period,
    changePeriod,
    isLoading,
    error,
    refetch,
    totalContributions: contributions?.totalContributions || 0,
    months: contributions?.months || [],
    weekdays: contributions?.weekdays || [],
    last30Days: contributions?.last30Days || [],
  };
}

/**
 * Process raw GitHub contribution data into our structured format
 */
function processContributionData(rawData: RawContributionDay[]): ContributionsData {
  if (!rawData || !Array.isArray(rawData)) {
    return {
      totalContributions: 0,
      days: [],
      months: [],
      weekdays: [],
      last30Days: [],
    };
  }

  // Ensure data is sorted by date
  const sortedData = [...rawData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate total contributions
  const totalContributions = sortedData.reduce((sum, day) => sum + day.count, 0);

  // Process days
  const days: ContributionDay[] = sortedData.map((day) => ({
    date: day.date,
    count: day.count,
    level: getContributionLevel(day.count),
  }));

  // Calculate monthly contributions
  const monthlyMap = new Map<string, number>();
  for (const day of sortedData) {
    const date = new Date(day.date);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
    const currentCount = monthlyMap.get(monthKey) || 0;
    monthlyMap.set(monthKey, currentCount + day.count);
  }

  const months: MonthlyContribution[] = Array.from(monthlyMap.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Calculate weekday contributions
  const weekdayMap = new Map<number, number>();
  for (const day of sortedData) {
    const date = new Date(day.date);
    const weekday = date.getDay();
    const currentCount = weekdayMap.get(weekday) || 0;
    weekdayMap.set(weekday, currentCount + day.count);
  }

  const weekdayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const weekdays: WeekdayContribution[] = Array.from(weekdayMap.entries())
    .map(([day, count]) => ({ day: weekdayNames[day], count }))
    .sort((a, b) => weekdayNames.indexOf(a.day) - weekdayNames.indexOf(b.day));

  // Calculate last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const last30Days = days.filter(
    (day) => new Date(day.date) >= thirtyDaysAgo && new Date(day.date) <= now
  );

  return {
    totalContributions,
    days,
    months,
    weekdays,
    last30Days,
  };
}

/**
 * Calculate contribution level (0-4) based on count
 * This is used for color-coding cells in the heatmap
 */
function getContributionLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}
