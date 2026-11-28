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
import { Pie, PieChart } from "recharts";

type Props = { data: any[]; periodLabel: string };

export function ExpenseDonut({ data, periodLabel }: Props) {
  const { chartData, chartConfig } = useMemo(() => {
    const sliced = (data || [])
      .filter((d: any) => Number(d.total ?? d.amount ?? d.balance ?? 0) > 0)
      .slice(0, 5);
    const cfg: ChartConfig = { amount: { label: "Amount" } };
    const cData = sliced.map((item: any, i: number) => {
      const key = `cat_${i}`;
      const label =
        item.accountName || item.name || item.code || `Account ${i + 1}`;
      cfg[key] = { label, color: `var(--chart-${i + 1})` };
      return {
        category: key,
        amount: Number(item.total ?? item.amount ?? item.balance ?? 0),
        fill: `var(--color-${key})`,
        _label: label,
      };
    });
    return { chartData: cData, chartConfig: cfg };
  }, [data]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle>Expense Breakdown</CardTitle>
        <CardDescription>{periodLabel} by account</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="category"
              innerRadius={70}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
