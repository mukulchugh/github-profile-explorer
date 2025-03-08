import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader } from "./ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";

// Sample data structure for repository stats over time
interface RepoStat {
  month: string;
  stars: number;
  forks: number;
  commits: number;
}

interface RepoStatsChartProps {
  data: RepoStat[];
  title: string;
}

export function RepoStatsChart({ data, title }: RepoStatsChartProps) {
  const config = {
    stars: { color: "#f59e0b" },
    forks: { color: "#3b82f6" },
    commits: { color: "#10b981" },
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ChartContainer config={config} className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 30,
                }}
              >
                <defs>
                  <linearGradient id="colorStars" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-stars)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-stars)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorForks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-forks)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-forks)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  angle={-45}
                  textAnchor="end"
                  height={50}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <ChartTooltipContent indicator="dashed" label={label} payload={payload} />
                    );
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Area
                  type="monotone"
                  dataKey="stars"
                  stroke="var(--color-stars)"
                  fillOpacity={1}
                  fill="url(#colorStars)"
                  name="Stars"
                />
                <Area
                  type="monotone"
                  dataKey="forks"
                  stroke="var(--color-forks)"
                  fillOpacity={1}
                  fill="url(#colorForks)"
                  name="Forks"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
