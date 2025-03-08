import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ContributionDay,
  ContributionPeriod,
  useGitHubContributions,
} from "@/hooks/use-github-contributions";
import {
  IconActivityHeartbeat,
  IconCalendarMonth,
  IconCalendarPlus,
  IconCalendarWeek,
  IconChevronDown,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";

interface ContributionBarGraphProps {
  data: { date: string; count: number }[];
}

// Monthly activity bar chart using chart UI primitives
export function ContributionBarGraph({ data }: ContributionBarGraphProps) {
  const config = {
    contributions: { color: "#3b82f6" },
  };

  return (
    <ChartContainer config={config} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey="date" />
          <YAxis />
          <ChartTooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <ChartTooltipContent
                    content={
                      <div>
                        <div className="text-sm font-medium">{label}</div>
                        <div className="text-xs text-muted-foreground">
                          {payload[0].value} contributions
                        </div>
                      </div>
                    }
                  />
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" fill="var(--color-contributions)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

// Calendar-style contribution graph inspired by GitHub
interface ContributionGraphProps {
  username: string;
  className?: string;
}

// Color levels for the contribution cells
const contributionLevelColors = [
  "rgb(22, 57, 34)", // Level 0 (No contributions)
  "rgb(0, 109, 50)", // Level 1
  "rgb(38, 166, 65)", // Level 2
  "rgb(57, 211, 83)", // Level 3
  "rgb(87, 255, 100)", // Level 4
];

// Tooltip for contribution cells
const CellTooltip = ({ date, count }: { date: string; count: number }) => (
  <div className="bg-muted/90 text-foreground backdrop-blur-sm p-2 text-xs rounded shadow-lg border">
    <div className="font-semibold">{format(new Date(date), "MMM d, yyyy")}</div>
    <div>
      {count} contribution{count !== 1 ? "s" : ""}
    </div>
  </div>
);

// Days of the week labels for the y-axis
const WeekdayLabels = () => {
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <div className="flex flex-col items-end justify-between h-full pt-2 pb-1 text-xs text-muted-foreground">
      {weekdays.map((day, index) => (
        <div key={day} className={index === 0 ? "translate-y-1" : ""}>
          {day}
        </div>
      ))}
    </div>
  );
};

// Month labels for the x-axis
const MonthLabels = ({ data }: { data: ContributionDay[] }) => {
  // Extract unique months from data
  const months = useMemo(() => {
    if (!data.length) return [];

    const monthLabels: { name: string; index: number }[] = [];
    let currentMonth = -1;

    data.forEach((day) => {
      const date = new Date(day.date);
      const month = date.getMonth();

      if (month !== currentMonth) {
        monthLabels.push({
          name: format(date, "MMM"),
          index: monthLabels.length,
        });
        currentMonth = month;
      }
    });

    return monthLabels;
  }, [data]);

  return (
    <div className="grid grid-cols-12 pt-1 text-xs text-muted-foreground">
      {months.map((month) => (
        <div key={`${month.name}-${month.index}`} className="text-center">
          {month.name}
        </div>
      ))}
    </div>
  );
};

// Calendar-style contribution grid
const ContributionGrid = ({ data }: { data: ContributionDay[] }) => {
  // Calculate grid dimensions
  const columns = Math.ceil(data.length / 7);
  const gridStyle = {
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
  };

  // Group data by week
  const weeks = useMemo(() => {
    const weeks: ContributionDay[][] = [];
    let currentWeek: ContributionDay[] = [];

    // Initialize the grid with the correct start weekday
    const firstDate = new Date(data[0]?.date);
    const firstDayOfWeek = firstDate.getDay();

    // Add empty cells for days before the first date
    for (let i = 0; i < firstDayOfWeek; i++) {
      currentWeek.push({
        date: "",
        count: 0,
        level: 0,
      });
    }

    // Add actual contribution data
    data.forEach((day) => {
      const date = new Date(day.date);
      const dayOfWeek = date.getDay();

      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }

      currentWeek.push(day);

      if (currentWeek.length === 7) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    // Add the last partial week if it exists
    if (currentWeek.length > 0) {
      weeks.push([...currentWeek]);
    }

    return weeks;
  }, [data]);

  // Render the grid with weekly rotation
  return (
    <div className="flex w-full pt-2">
      <WeekdayLabels />

      <div className="grid gap-[2px] flex-1 ml-2" style={gridStyle}>
        {weeks.map((week, weekIndex) => (
          <div key={`week-${weekIndex}`} className="grid grid-rows-7 gap-[2px]">
            {week.map((day, dayIndex) => {
              if (!day.date) {
                return <div key={`empty-${dayIndex}`} className="w-3 h-3" />;
              }

              return (
                <div
                  key={day.date || `day-${dayIndex}`}
                  className="w-3 h-3 rounded-sm transition-colors hover:ring-1 hover:ring-foreground relative group"
                  style={{ backgroundColor: contributionLevelColors[day.level] }}
                  title={`${format(new Date(day.date), "MMM d, yyyy")}: ${day.count} contributions`}
                >
                  <div className="absolute hidden group-hover:block z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-1 whitespace-nowrap">
                    <CellTooltip date={day.date} count={day.count} />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// Monthly activity chart
const MonthlyActivityChart = ({ data }: { data: { month: string; count: number }[] }) => {
  // Format month names more nicely for display
  const chartData = data.map((item) => ({
    ...item,
    month: format(new Date(`${item.month}-01`), "MMM yy"),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(22, 27, 34, 0.95)",
            borderColor: "#333",
            color: "#fff",
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#2563eb"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorCount)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Weekly activity chart
const WeeklyActivityChart = ({ data }: { data: { day: string; count: number }[] }) => {
  // Make sure data is properly formatted for the chart
  const formattedData = data.map((item) => ({
    day: item.day, // Make sure this is a string
    count: item.count,
  }));

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={30} />
          <Tooltip
            content={(props) => {
              if (props.active && props.payload && props.payload.length) {
                return (
                  <div className="p-2 rounded-md bg-popover border border-border shadow-md">
                    <div className="text-xs font-medium">{props.label}</div>
                    <div className="text-xs mt-1">
                      {props.payload[0].value} contribution{props.payload[0].value !== 1 ? "s" : ""}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" fill="#40c463" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Recent activity chart (last 30 days)
const RecentActivityChart = ({ data }: { data: ContributionDay[] }) => {
  const chartData = data.map((day) => ({
    date: format(new Date(day.date), "MMM dd"),
    count: day.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(22, 27, 34, 0.95)",
            borderColor: "#333",
            color: "#fff",
          }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#2563eb"
          dot={{ fill: "#2563eb" }}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export function ContributionGraph({ username, className }: ContributionGraphProps) {
  const [selectedView, setSelectedView] = useState<ContributionPeriod>("year");
  const {
    filteredContributions,
    period,
    changePeriod,
    totalContributions,
    months,
    weekdays,
    last30Days,
    isLoading,
  } = useGitHubContributions(username, true);

  const viewOptions = [
    { id: "year", label: "Year", icon: <IconCalendarPlus className="w-4 h-4 mr-2" /> },
    { id: "month", label: "Month", icon: <IconCalendarMonth className="w-4 h-4 mr-2" /> },
    { id: "week", label: "Week", icon: <IconCalendarWeek className="w-4 h-4 mr-2" /> },
    {
      id: "30days",
      label: "Last 30 Days",
      icon: <IconActivityHeartbeat className="w-4 h-4 mr-2" />,
    },
  ];

  // Helper to get proper title based on selected view
  const getViewTitle = () => {
    switch (selectedView) {
      case "year":
        return "Yearly Contributions";
      case "month":
        return "Monthly Contributions";
      case "week":
        return "Weekly Contributions";
      case "30days":
        return "Last 30 Days";
      default:
        return "Contributions";
    }
  };

  const [processedData, setProcessedData] = useState<{
    [key: string]: { date: Date; count: number; color: string };
  }>({});
  const [hoverDay, setHoverDay] = useState<string | null>(null);
  const [yearTotal, setYearTotal] = useState<number>(0);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // Process data into a format suitable for the grid display
  useEffect(() => {
    if (!filteredContributions || isLoading) return;

    const formatted: { [key: string]: { date: Date; count: number; color: string } } = {};
    let total = 0;

    filteredContributions.forEach((day) => {
      const date = new Date(day.date);
      const dateKey = date.toISOString().split("T")[0];
      total += day.count;

      // Determine color based on contribution count
      let color = contributionLevelColors[0]; // Default: no contributions
      for (let i = contributionLevelColors.length - 1; i >= 0; i--) {
        if (day.count >= contributionLevelColors[i]) {
          color = contributionLevelColors[i];
          break;
        }
      }

      formatted[dateKey] = {
        date,
        count: day.count,
        color,
      };
    });

    setProcessedData(formatted);
    setYearTotal(total);
  }, [filteredContributions, isLoading]);

  // Generate array of last 365 days
  const days = Array.from({ length: 365 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 364 + i);
    return date;
  });

  // Get unique months for labels
  const uniqueMonths = Array.from(
    new Set(
      days.map((day) => {
        return day.toLocaleString("default", { month: "short" });
      })
    )
  );

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <IconActivityHeartbeat className="mr-2 h-5 w-5 text-primary" />
          {getViewTitle()}
          {!isLoading && totalContributions > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {totalContributions} total
            </span>
          )}
        </CardTitle>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto h-8 gap-1">
              {viewOptions.find((o) => o.id === selectedView)?.label || "View"}
              <IconChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-48 p-0">
            <div className="flex flex-col">
              {viewOptions.map((option) => (
                <Button
                  key={option.id}
                  variant={selectedView === option.id ? "secondary" : "ghost"}
                  className="justify-start h-9 px-2"
                  onClick={() => {
                    setSelectedView(option.id as ContributionPeriod);
                    changePeriod(option.id as ContributionPeriod);
                  }}
                >
                  {option.icon}
                  {option.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-52">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedView === "year" &&
              filteredContributions &&
              filteredContributions.length > 0 && (
                <div className="pt-2">
                  <div className="relative">
                    {/* Y-axis labels (days of week) */}
                    <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-between py-2">
                      {weekdays.map((day, i) => (
                        <div key={i} className="text-xs text-muted-foreground">
                          {typeof day === "object" ? day.day : day}
                        </div>
                      ))}
                    </div>

                    {/* Contribution grid */}
                    <div className="pl-6 overflow-x-auto">
                      <div
                        className="grid grid-rows-7 grid-flow-col gap-1"
                        style={{ gridAutoColumns: "1fr" }}
                      >
                        {days.map((day) => {
                          const dateKey = day.toISOString().split("T")[0];
                          const isToday = new Date().toISOString().split("T")[0] === dateKey;
                          const dayData = processedData[dateKey] || {
                            count: 0,
                            color: contributionLevelColors[0],
                          };

                          return (
                            <TooltipProvider key={dateKey}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`w-3 h-3 rounded-sm transition-colors ${isToday ? "ring-1 ring-black dark:ring-white" : ""}`}
                                    style={{ backgroundColor: dayData.color }}
                                    onMouseEnter={() => setHoverDay(dateKey)}
                                    onMouseLeave={() => setHoverDay(null)}
                                  />
                                </TooltipTrigger>
                                <TooltipContent side="top" align="center">
                                  <div className="text-xs font-medium">
                                    {day.toLocaleDateString(undefined, {
                                      weekday: "long",
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </div>
                                  <div className="text-xs">
                                    {dayData.count} contribution{dayData.count !== 1 ? "s" : ""}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </div>

                      {/* X-axis labels (months) */}
                      <div className="flex justify-between mt-1">
                        {uniqueMonths.map((month) => (
                          <div key={month} className="text-xs text-muted-foreground">
                            {month}
                          </div>
                        ))}
                      </div>

                      {/* Legend */}
                      <div className="flex items-center justify-end mt-4 text-xs text-muted-foreground">
                        <span>Less</span>
                        {contributionLevelColors.map((level, i) => (
                          <div
                            key={i}
                            className="w-3 h-3 mx-1 rounded-sm"
                            style={{ backgroundColor: level }}
                          />
                        ))}
                        <span>More</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {selectedView === "month" && <MonthlyActivityChart data={months.slice(-3)} />}

            {selectedView === "week" && <WeeklyActivityChart data={weekdays} />}

            {selectedView === "30days" && <RecentActivityChart data={last30Days} />}

            {(!filteredContributions || filteredContributions.length === 0) && !isLoading && (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <p>No contribution data available for this period</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
