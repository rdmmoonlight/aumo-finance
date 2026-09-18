import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardClient from "./dashboard";
import { getDashboardData } from "./actions";

interface PageProps {
  searchParams: Promise<{ period?: string }>;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const periodParam = resolvedSearchParams.period?.toLowerCase();
  const periodType: "monthly" | "annual" = periodParam === "annual" ? "annual" : "monthly";

  const { data, error } = await getDashboardData(periodType);

  return (
    <Suspense
      fallback={
        <div className="p-6 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <DashboardClient
        initialData={data}
        initialError={error}
        currentPeriod={periodType}
      />
    </Suspense>
  );
}
