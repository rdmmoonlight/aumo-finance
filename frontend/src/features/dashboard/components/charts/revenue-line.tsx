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
  type ChartConfig,
} from "@/components/ui/chart";
import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

type Props = { data: any[]; periodLabel: string };

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  expense: { label: "Expense", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function RevenueLineStep({ data, periodLabel }: Props) {
  const chartData = useMemo(() => {
    return (data || []).map((d: any) => ({
      month: d.month || d.period || d.label || "",
      revenue: Number(d.revenue ?? d.totalRevenue ?? 0),
      expense: Number(d.expense ?? d.totalExpenses ?? 0),
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Trend</CardTitle>
        <CardDescription>Revenue vs Expense - {periodLabel}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h- w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v: string) => v.slice(0, 3)}
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="revenue"
              type="step"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="expense"
              type="step"
              stroke="var(--color-expense)"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 4"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
