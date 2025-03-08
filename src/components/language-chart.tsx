import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer } from "./ui/chart";

interface LanguageData {
  name: string;
  value: number;
}

interface LanguageChartProps {
  data: LanguageData[];
}

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#64748b",
  "#84cc16",
  "#a855f7",
];

export function LanguageChart({ data }: LanguageChartProps) {
  // Calculate total to get percentages
  const total = data.reduce((acc, lang) => acc + lang.value, 0);

  // Format data for display with percentages
  const formattedData = data.map((lang) => ({
    ...lang,
    percentage: Math.round((lang.value / total) * 100),
  }));

  const config = {
    colors: formattedData.reduce(
      (acc, item, index) => {
        acc[item.name] = { color: COLORS[index % COLORS.length] };
        return acc;
      },
      {} as Record<string, { color: string }>
    ),
  };

  return (
    <div className="w-full h-full">
      <ChartContainer config={config} className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={({ name, percentage }) => `${name}: ${percentage}%`}
              labelLine={false}
            >
              {formattedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) =>
                active && payload && payload.length ? (
                  <div className="rounded-lg border bg-background p-2 shadow-md">
                    <div className="font-medium">{payload[0].name}</div>
                    <div className="text-xs text-muted-foreground">
                      {payload[0].payload.percentage}% • {payload[0].value} projects
                    </div>
                  </div>
                ) : null
              }
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              formatter={(value) => <span className="text-xs">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}
