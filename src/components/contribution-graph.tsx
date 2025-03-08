import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ContributionsData } from "@/hooks/use-github-contributions";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
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
  data: ContributionsData;
}

export function ContributionGraph({ data }: ContributionGraphProps) {
  // Function to get color based on contribution count level
  const getColor = (level: 0 | 1 | 2 | 3 | 4) => {
    if (level === 0) return "bg-muted hover:bg-muted/80";
    if (level === 1) return "bg-emerald-200 hover:bg-emerald-300";
    if (level === 2) return "bg-emerald-300 hover:bg-emerald-400";
    if (level === 3) return "bg-emerald-400 hover:bg-emerald-500";
    return "bg-emerald-500 hover:bg-emerald-600";
  };

  // Generate months labels
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Extract all days from the weeks for display
  const allDays = data.weeks.flatMap((week) => week.days);

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-xs text-muted-foreground">
        {months.map((month) => (
          <div key={month}>{month}</div>
        ))}
      </div>

      <TooltipProvider>
        <div className="grid grid-rows-7 grid-flow-col gap-1">
          {allDays.map((day, i) => (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <div
                  className={`w-3 h-3 rounded-sm ${getColor(day.level)}`}
                  aria-label={`${day.count} contributions on ${day.date}`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {day.count} contributions on {new Date(day.date).toLocaleDateString()}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      <div className="flex items-center justify-end gap-2 text-xs">
        <span className="text-muted-foreground">Less</span>
        <div className="w-3 h-3 rounded-sm bg-muted" />
        <div className="w-3 h-3 rounded-sm bg-emerald-200" />
        <div className="w-3 h-3 rounded-sm bg-emerald-300" />
        <div className="w-3 h-3 rounded-sm bg-emerald-400" />
        <div className="w-3 h-3 rounded-sm bg-emerald-500" />
        <span className="text-muted-foreground">More</span>
      </div>

      <div className="text-sm text-muted-foreground text-center">
        {data.totalContributions.toLocaleString()} contributions in the last year
      </div>
    </div>
  );
}
