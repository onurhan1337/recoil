"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";

interface TopCategoriesChartProps {
  data: Array<{
    category: string;
    notes: number;
    score?: number;
  }>;
}

export function TopCategoriesChart({ data }: TopCategoriesChartProps) {
  const chartConfig = data.reduce((acc, cat, index) => {
    const chartColorIndex = Math.min(index + 1, 5);
    acc[cat.category] = {
      label: cat.category,
      color: `var(--color-chart-${chartColorIndex})`,
    };
    return acc;
  }, {} as Record<string, { label?: string; color?: string }>);

  if (data.length === 0) {
    return (
      <Card className="border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Top Categories</CardTitle>
          <CardDescription>
            Most used categories in recent notes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No category data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Top Categories</CardTitle>
        <CardDescription>Most used categories in recent notes</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Pie
              data={data.map((cat) => ({
                name: cat.category,
                value: cat.notes,
              }))}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {data.map((cat, index) => {
                const chartColorIndex = Math.min(index + 1, 5);
                return (
                  <Cell
                    key={cat.category}
                    fill={`var(--color-chart-${chartColorIndex})`}
                  />
                );
              })}
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
