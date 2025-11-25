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
} from "@/components/ui/chart";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";

const chartConfig = {
  notes: {
    label: "Notes",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface CategoryDistributionChartProps {
  data: Array<{
    category: string;
    value: number;
    fullMark: number;
  }>;
}

export function CategoryDistributionChart({
  data,
}: CategoryDistributionChartProps) {
  return (
    <Card className="border">
      <CardHeader className="pb-3">
        <CardTitle>Category Distribution</CardTitle>
        <CardDescription>Breakdown of notes by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <RadarChart data={data}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />
            <PolarAngleAxis dataKey="category" />
            <PolarGrid />
            <Radar
              dataKey="value"
              fill="var(--color-notes)"
              fillOpacity={0.6}
              dot={{
                r: 4,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

