"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { store } from "@/lib/store";
import { useEffect, useMemo, useState } from "react";
import { reportsApi, SummaryResponse } from "../api/reportsApi";
import {
  ReportsGrid,
  ReportsHeader,
  ReportsSearch,
  ReportsSummary,
} from "./components";
import { REPORTS } from "./data";

export default function ReportsPage() {
  const [globalFilter, setGlobalFilter] = useState("");
  const [summaryData, setSummaryData] = useState<SummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchSummary() {
      try {
        setSummaryLoading(true);
        const result = await store.dispatch(
          reportsApi.endpoints.getSummary.initiate(),
        );
        if (isMounted && "data" in result && result.data)
          setSummaryData(result.data);
        else if (isMounted) setIsError(true);
      } catch {
        if (isMounted) setIsError(true);
      } finally {
        if (isMounted) setSummaryLoading(false);
      }
    }
    fetchSummary();
    return () => {
      isMounted = false;
    };
  }, []);

  const summary = (summaryData as any)?.data ?? summaryData;

  // ganti getFilteredRowModel dari tanstack jadi filter biasa
  const filteredReports = useMemo(() => {
    if (!globalFilter) return REPORTS;
    const s = globalFilter.toLowerCase();
    return REPORTS.filter(({ title, desc, href }) =>
      `${title} ${desc} ${href}`.toLowerCase().includes(s),
    );
  }, [globalFilter]);

  return (
    <div className="grid w-full place-items-center py-6">
      <Card className="w-full max-w-5xl rounded-2xl border border-white/10 bg-[#0F172A] p-6 text-white shadow-2xl">
        <CardContent className="p-6 md:p-8">
          <ReportsHeader total={REPORTS.length} />
          <ReportsSummary
            summary={summary}
            isLoading={summaryLoading}
            isError={isError}
          />
          <ReportsSearch value={globalFilter} onChange={setGlobalFilter} />
          <Separator className="my-6 bg-white/10" />
          <ReportsGrid filteredReports={filteredReports} />
        </CardContent>
      </Card>
    </div>
  );
}
