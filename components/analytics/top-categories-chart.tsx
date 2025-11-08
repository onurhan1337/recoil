"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
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
  }>;
}

export function TopCategoriesChart({ data }: TopCategoriesChartProps) {
  const chartConfig: ChartConfig = data.reduce((acc, cat, index) => {
    acc[cat.category] = {
      label: cat.category,
      color: `var(--chart-${Math.min(index + 1, 5)})`,
    };
    return acc;
  }, {} as ChartConfig);

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
        <CardDescription>
          Most used categories in recent notes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
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
              {data.map((cat) => (
                <Cell
                  key={cat.category}
                  fill={`var(--color-${cat.category})`}
                />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

