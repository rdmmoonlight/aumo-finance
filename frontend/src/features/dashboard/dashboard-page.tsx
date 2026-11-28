"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppRouter, useSearchParams } from "@/lib/router-compat";
import { store } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CreditCard,
  EyeOff,
  FileText,
  Plus,
  ShieldCheck,
  Table as TableIcon,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { dashboardApi } from "./api/dashboardApi";
import { AiSummaryCard } from "./components/cards/ai-summary-card";
import { ExpenseDonut } from "./components/charts/expense-donut";
import { ExpenseRevenueBarStacked } from "./components/charts/expense-revenue-bar";
import { RevenueLineStep } from "./components/charts/revenue-line";
import { ExpenseTable, formatNumber, TrendTable } from "./components/tables";

export default function DashboardPage() {
  const router = useAppRouter();
  const searchParams = useSearchParams();

  const [periodType, setPeriodType] = useState<"monthly" | "annual">(() =>
    searchParams.get("period")?.toLowerCase() === "annual"
      ? "annual"
      : "monthly",
  );
  const [dismissError, setDismissError] = useState(false);
  const [resData, setResData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchDashboardData = useCallback(
    async (period: "monthly" | "annual", initial = false) => {
      if (initial) setIsLoading(true);
      else setIsFetching(true);
      setError(null);
      try {
        const result = await store.dispatch(
          dashboardApi.endpoints.getDashboard.initiate({ period }),
        );
        if ("data" in result && result.data) setResData(result.data);
        else if ("error" in result) setError(result.error);
      } catch {
        setError({ message: "Terjadi kesalahan jaringan." });
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchDashboardData(periodType, true);
  }, [periodType, fetchDashboardData]);

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

  const periodTotals = useMemo(() => {
    if (!resData) return { cash: 0, bank: 0, assets: 0, liabilities: 0 };
    const suffix = periodType === "monthly" ? "Monthly" : "Annual";
    const get = (base: string) => {
      const direct = resData[`${base}${suffix}`];
      if (direct !== undefined && direct !== null) return Number(direct) || 0;
      if (resData[periodType]?.[base] !== undefined)
        return Number(resData[periodType][base]) || 0;
      return Number(resData[base]) || 0;
    };
    return {
      cash: get("totalCashOnHand"),
      bank: get("totalBankBalance"),
      assets: get("totalAssets"),
      liabilities: get("totalLiabilities"),
    };
  }, [resData, periodType]);

  const errorMessage = useMemo(() => {
    if (!error || dismissError) return null;
    if ("data" in error)
      return (
        (error.data as any)?.message ||
        "Gagal memuat data dashboard dari server."
      );
    return error.message || "Terjadi kesalahan jaringan.";
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
          <EyeOff size={40} className="mx-auto text-muted-foreground" />
          <h3 className="font-semibold">No Period Selected</h3>
          <p className="text-muted-foreground">
            Go to Periods to select active accounting period.
          </p>
          <Button asChild>
            <Link to="/periods">
              <Calendar size={16} /> Go to Periods
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const {
    cash: totalCashOnHand,
    bank: totalBankBalance,
    assets: totalAssets,
    liabilities: totalLiabilities,
  } = periodTotals;
  const totalRevenue = Number(resData?.totalRevenue) || 0;
  const totalExpenses = Number(resData?.totalExpenses) || 0;
  const netIncome = Number(resData?.netIncome) || 0;
  const periodLabel = periodType === "monthly" ? "Monthly" : "Annual";
  const periodLabelReal =
    periodType === "monthly" ? "Monthly Real" : "Annual Real";

  return (
    <div className="space-y-6 p-4 md:p-6">
      {errorMessage && (
        <Alert
          variant="destructive"
          className="flex justify-between items-center"
        >
          <AlertDescription className="flex gap-2 items-center">
            <AlertTriangle size={16} />
            {errorMessage}
          </AlertDescription>
          <button onClick={() => setDismissError(true)}>
            <X size={14} />
          </button>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Financial Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
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
                "h-7 text-xs px-4",
                periodType === "monthly"
                  ? "bg-white text-black shadow-sm dark:bg-white dark:text-black"
                  : "bg-transparent text-muted-foreground",
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
                "h-7 text-xs px-4",
                periodType === "annual"
                  ? "bg-white text-black shadow-sm dark:bg-white dark:text-black"
                  : "bg-transparent text-muted-foreground",
              )}
            >
              Annual
            </Button>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
          >
            <Link to="/journal-entry">
              <Plus size={14} /> New Entry
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-xs"
          >
            <Link to="/reports">
              <FileText size={14} /> Reports
            </Link>
          </Button>
        </div>
      </div>

      <AiSummaryCard
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        netIncome={netIncome}
        totalLiquid={totalAssets}
        totalLiabilities={totalLiabilities}
        periodLabel={periodLabel}
        periodName={resData.selectedPeriodName}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription className="text-xs">
              Financial Health Index
            </CardDescription>
            <Activity size={18} className="text-primary" />
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-primary grid place-items-center font-bold text-xl">
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
            <CardDescription className="text-xs">
              Total Cash & Bank ({periodLabelReal})
            </CardDescription>
            <Wallet size={18} className="text-amber-500" />
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
          <CardHeader className="flex-row items-center justify-between pb-1">
            <CardDescription className="text-xs">
              Revenue ({periodLabel})
            </CardDescription>
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-500 grid place-items-center">
              <TrendingUp size={16} />
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
          <CardHeader className="flex-row items-center justify-between pb-1">
            <CardDescription className="text-xs">
              Expenses ({periodLabel})
            </CardDescription>
            <div className="w-7 h-7 rounded-full bg-red-500/10 text-red-500 grid place-items-center">
              <TrendingDown size={16} />
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
          <CardHeader className="flex-row items-center justify-between pb-1">
            <CardDescription className="text-primary-foreground/70 text-xs">
              Net Income ({periodLabel})
            </CardDescription>
            <ShieldCheck size={18} />
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
          <CardHeader className="flex-row items-center justify-between pb-1">
            <CardDescription className="text-xs">
              Liabilities ({periodLabel})
            </CardDescription>
            <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-500 grid place-items-center">
              <CreditCard size={16} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold font-mono">
              {formatNumber(totalLiabilities)}
            </div>
            <p className="text-xs text-muted-foreground">
              Hutang {periodLabel}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ExpenseRevenueBarStacked
            data={resData?.chartTrend || []}
            periodLabel={periodLabel}
          />
        </div>
        <ExpenseDonut
          data={resData?.expenseAccountsList || []}
          periodLabel={periodLabel}
        />
      </div>
      <RevenueLineStep
        data={resData?.chartTrend || []}
        periodLabel={periodLabel}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="py-3 px-4 flex-row items-center justify-between border-b space-y-0">
            <div>
              <CardDescription className="text-sm flex items-center gap-2 font-semibold text-foreground">
                <TableIcon size={16} className="text-primary" /> Expense Account
                Breakdown
              </CardDescription>
              <CardDescription className="text-xs mt-0.5">
                Itemized operating costs ({periodLabel})
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ExpenseTable data={resData?.expenseAccountsList || []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3 px-4 flex-row items-center justify-between border-b space-y-0">
            <div>
              <CardDescription className="text-sm flex items-center gap-2 font-semibold text-foreground">
                <TableIcon size={16} className="text-primary" /> Trend Financial
                Log
              </CardDescription>
              <CardDescription className="text-xs mt-0.5">
                Tabular overview of revenue & expenses
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <TrendTable data={resData?.chartTrend || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
