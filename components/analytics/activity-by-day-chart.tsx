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
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const chartConfig = {
  notes: {
    label: "Notes",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface ActivityByDayChartProps {
  data: Array<{
    day: string;
    notes: number;
  }>;
}

export function ActivityByDayChart({ data }: ActivityByDayChartProps) {
  return (
    <Card className="border">
      <CardHeader className="pb-3">
        <CardTitle>Activity by Day</CardTitle>
        <CardDescription>
          Note-taking patterns throughout the week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
            />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{
                fill: "hsl(var(--muted-foreground))",
                fontSize: 12,
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              allowDecimals={false}
              tick={{
                fill: "hsl(var(--muted-foreground))",
                fontSize: 12,
              }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              dataKey="notes"
              type="monotone"
              stroke="var(--color-notes)"
              strokeWidth={2}
              dot={{ fill: "var(--color-notes)", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

