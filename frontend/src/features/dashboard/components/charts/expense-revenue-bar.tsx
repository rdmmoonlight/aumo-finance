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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

type Props = {
  data: any[];
  periodLabel: string;
};

const chartConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  expense: { label: "Expense", color: "var(--chart-2)" },
} satisfies ChartConfig;

export function ExpenseRevenueBarStacked({ data, periodLabel }: Props) {
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
        <CardTitle>Revenue vs Expense</CardTitle>
        <CardDescription>Trend {periodLabel} - stacked</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h- w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(v: string) => v.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v / 1000}k`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              dataKey="revenue"
              stackId="a"
              fill="var(--color-revenue)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="expense"
              stackId="a"
              fill="var(--color-expense)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
