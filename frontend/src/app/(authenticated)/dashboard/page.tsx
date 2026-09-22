"use client";

import { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
// @ts-ignore
import { Doughnut, Bar, Line } from "react-chartjs-2";
import {
  IconEyeOff,
  IconCalendar,
  IconAlertTriangle,
  IconPlus,
  IconReport,
  IconActivity,
  IconWallet,
  IconTrendingUp,
  IconTrendingDown,
  IconShieldCheck,
  IconCreditCard,
  IconChartPie,
  IconX,
} from "@tabler/icons-react";

import { useGetApiV1DashboardQuery } from "@/lib/generatedApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const formatNumber = (amount: number) => {
  const isNeg = amount < 0;
  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
  return isNeg ? `(${formatted})` : formatted;
};

export interface AccountBalanceItem {
  accountId: number;
  referenceNumber: string;
  accountName: string;
  balance: number;
}
export interface TrendItem {
  label: string;
  revenue: number;
  expense: number;
  net: number;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [periodType, setPeriodType] = useState<"monthly" | "annual">(() => {
    if (typeof window === "undefined") return "monthly";
    const p = searchParams.get("period");
    return p?.toLowerCase() === "annual" ? "annual" : "monthly";
  });

  const [dismissError, setDismissError] = useState(false);

  // Integrasi RTK Query
  const {
    data: rawData,
    isLoading,
    isFetching,
    error,
  } = useGetApiV1DashboardQuery({
    period: periodType,
  });

  const resData = rawData as any;

  const handlePeriodSwitch = (type: "monthly" | "annual") => {
    if (periodType === type || isFetching) return;
    setDismissError(false);
    setPeriodType(type);
    router.push(`/dashboard?period=${type}`);
  };

  const healthScore = useMemo(() => {
    if (!resData || resData.hasPeriodSelected === false) return 0;
    const totalRev = Number(resData.totalRevenue) || 0;
    const totalExp = Number(resData.totalExpenses) || 0;
    const net = Number(resData.netIncome) || 0;

    if (totalRev === 0 && totalExp === 0) return 100;
    const margin = totalRev > 0 ? (net / totalRev) * 100 : 0;
    if (margin >= 20) return 90;
    if (margin >= 10) return 75;
    if (margin >= 0) return 60;
    return 40;
  }, [resData]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: { boxWidth: 10, usePointStyle: true, padding: 16 },
        },
      },
      scales: {
        y: { beginAtZero: true, grid: { color: "hsl(var(--border))" } },
        x: { grid: { display: false } },
      },
    }),
    [],
  );

  const doughnutOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: { boxWidth: 10, usePointStyle: true },
        },
      },
    }),
    [],
  );

  const doughnutCashData = useMemo(
    () => ({
      labels: ["Cash on Hand", "Bank Balance"],
      datasets: [
        {
          data: resData
            ? [
                Number(resData.totalCashOnHand) || 0,
                Number(resData.totalBankBalance) || 0,
              ]
            : [0, 0],
          backgroundColor: ["#6366f1", "#06b6d4"],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    }),
    [resData],
  );

  const expenseChartData = useMemo(
    () => ({
      labels: resData?.expenseAccountsList?.length
        ? resData.expenseAccountsList.map((i: AccountBalanceItem) => i.accountName)
        : ["No Expenses"],
      datasets: [
        {
          data: resData?.expenseAccountsList?.length
            ? resData.expenseAccountsList.map((i: AccountBalanceItem) => i.balance)
            : [1],
          backgroundColor: [
            "#ef4444",
            "#f59e0b",
            "#f97316",
            "#8b5cf6",
            "#6b7280",
            "#10b981",
            "#ec4899",
          ],
          borderWidth: 0,
        },
      ],
    }),
    [resData],
  );

  const barTrendData = useMemo(
    () => ({
      labels: resData?.chartTrend?.map((t: TrendItem) => t.label) || [],
      datasets: [
        {
          label: "Revenue",
          data: resData?.chartTrend?.map((t: TrendItem) => t.revenue) || [],
          backgroundColor: "#10b981",
          borderRadius: 4,
        },
        {
          label: "Expenses",
          data: resData?.chartTrend?.map((t: TrendItem) => t.expense) || [],
          backgroundColor: "#ef4444",
          borderRadius: 4,
        },
      ],
    }),
    [resData],
  );

  const lineNetData = useMemo(
    () => ({
      labels: resData?.chartTrend?.map((t: TrendItem) => t.label) || [],
      datasets: [
        {
          label: "Net Income",
          data: resData?.chartTrend?.map((t: TrendItem) => t.net) || [],
          borderColor: "#6366f1",
          backgroundColor: "rgba(99,102,241,0.2)",
          fill: true,
          tension: 0.4,
          pointRadius: 2,
          borderWidth: 2,
        },
      ],
    }),
    [resData],
  );

  const errorMessage = useMemo(() => {
    if (!error || dismissError) return null;
    if ("data" in error) {
      const errData = error.data as any;
      return errData?.message || "Gagal memuat data dashboard dari server.";
    }
    return "Terjadi kesalahan jaringan.";
  }, [error, dismissError]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!resData || resData.hasPeriodSelected === false) {
    return (
      <Card className="py-16 text-center border-dashed m-6">
        <CardContent className="space-y-3">
          <IconEyeOff size={40} className="mx-auto text-muted-foreground" />
          <h3 className="font-semibold">No Period Selected</h3>
          <p className="text-sm text-muted-foreground">
            Go to Periods to select active accounting period.
          </p>
          <Button asChild>
            <Link href="/periods">
              <IconCalendar size={16} /> Go to Periods
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const totalAssets = Number(resData.totalAssets) || 0;
  const totalCashOnHand = Number(resData.totalCashOnHand) || 0;
  const totalBankBalance = Number(resData.totalBankBalance) || 0;
  const totalRevenue = Number(resData.totalRevenue) || 0;
  const totalExpenses = Number(resData.totalExpenses) || 0;
  const netIncome = Number(resData.netIncome) || 0;
  const totalLiabilities = Number(resData.totalLiabilities) || 0;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {errorMessage && (
        <Alert variant="destructive" className="flex justify-between items-center">
          <AlertDescription className="flex gap-2 items-center">
            <IconAlertTriangle size={16} />
            {errorMessage}
          </AlertDescription>
          <button onClick={() => setDismissError(true)}>
            <IconX size={14} />
          </button>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Financial Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Active Period:{" "}
            <span className="font-semibold text-foreground">
              {resData.selectedPeriodName || "Current Period"}
            </span>{" "}
            • In IDR{" "}
            {isFetching && (
              <span className="animate-pulse ml-2">• Refreshing...</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border p-1 bg-muted">
            <Button
              size="sm"
              variant="ghost"
              disabled={isFetching}
              onClick={() => handlePeriodSwitch("monthly")}
              className={cn(
                "h-7 text-xs px-4 transition-all border-0 shadow-none",
                periodType === "monthly"
                  ? "bg-white text-black hover:bg-white hover:text-black shadow-sm dark:bg-white dark:text-black dark:hover:bg-white dark:hover:text-black"
                  : "bg-transparent text-muted-foreground hover:bg-transparent hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-100",
              )}
            >
              Monthly
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={isFetching}
              onClick={() => handlePeriodSwitch("annual")}
              className={cn(
                "h-7 text-xs px-4 transition-all border-0 shadow-none",
                periodType === "annual"
                  ? "bg-white text-black hover:bg-white hover:text-black shadow-sm dark:bg-white dark:text-black dark:hover:bg-white dark:hover:text-black"
                  : "bg-transparent text-muted-foreground hover:bg-transparent hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-100",
              )}
            >
              Annual
            </Button>
          </div>
          <Button asChild size="sm" className="h-8 gap-1">
            <Link href="/journal-entry">
              <IconPlus size={14} /> New Entry
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-8 gap-1">
            <Link href="/reports/income-statement">
              <IconReport size={14} /> Report
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Financial Health Index</CardDescription>
            <IconActivity size={18} className="text-primary" />
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-primary grid place-items-center font-bold text-lg">
              {healthScore}
            </div>
            <div>
              <p
                className={cn(
                  "text-sm font-semibold",
                  healthScore >= 80
                    ? "text-emerald-500"
                    : healthScore >= 60
                      ? "text-sky-500"
                      : "text-amber-500",
                )}
              >
                {healthScore >= 80
                  ? "Excellent"
                  : healthScore >= 60
                    ? "Stable"
                    : "Attention"}
              </p>
              <p className="text-xs text-muted-foreground">
                Based on net profit margin
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Total Cash & Bank (Kumulatif)</CardDescription>
            <IconWallet size={18} className="text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {formatNumber(totalAssets)}
            </div>
            <div className="text-xs text-muted-foreground flex gap-4 mt-1">
              <span>
                Cash:{" "}
                <b className="text-foreground">
                  {formatNumber(totalCashOnHand)}
                </b>
              </span>
              <span>
                Bank:{" "}
                <b className="text-foreground">
                  {formatNumber(totalBankBalance)}
                </b>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-1">
            <CardDescription>Revenue</CardDescription>
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-500 grid place-items-center">
              <IconTrendingUp size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono">
              {formatNumber(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">Period Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-1">
            <CardDescription>Expenses</CardDescription>
            <div className="w-7 h-7 rounded-full bg-red-500/10 text-red-500 grid place-items-center">
              <IconTrendingDown size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono">
              {formatNumber(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">Period Expenses</p>
          </CardContent>
        </Card>
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-1">
            <CardDescription className="text-primary-foreground/70">
              Net Income
            </CardDescription>
            <IconShieldCheck size={18} />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono">
              {formatNumber(netIncome)}
            </div>
            <p className="text-xs text-primary-foreground/70">
              {netIncome >= 0 ? "Profit" : "Loss"} for Period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-1">
            <CardDescription>Liabilities</CardDescription>
            <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-500 grid place-items-center">
              <IconCreditCard size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono">
              {formatNumber(totalLiabilities)}
            </div>
            <p className="text-xs text-muted-foreground">Kumulatif Hutang</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm">
                Revenue vs Expense Trend
              </CardTitle>
              <CardDescription>
                {periodType === "annual" ? "Jan - Dec" : "Daily in period"}
              </CardDescription>
            </div>
            <IconChartPie size={18} className="text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-64">
            <Bar data={barTrendData} options={chartOptions as any} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm">Net Income Trend</CardTitle>
              <CardDescription>Profitability over time</CardDescription>
            </div>
            <IconTrendingUp size={18} className="text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-64">
            <Line data={lineNetData} options={chartOptions as any} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm">Asset Composition</CardTitle>
              <CardDescription>Cash vs Bank (Kumulatif)</CardDescription>
            </div>
            <IconChartPie size={18} className="text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-64 flex justify-center">
            <Doughnut
              data={doughnutCashData}
              options={doughnutOptions as any}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm">Expense Composition</CardTitle>
              <CardDescription>Operating Breakdown</CardDescription>
            </div>
            <IconChartPie size={18} className="text-muted-foreground" />
          </CardHeader>
          <CardContent className="h-64 flex justify-center">
            <Doughnut
              data={expenseChartData}
              options={doughnutOptions as any}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}