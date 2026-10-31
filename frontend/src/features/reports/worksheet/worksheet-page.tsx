"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from '@tanstack/react-router';
import { AlertTriangle, Calendar, EyeOff, Grid, Info, Loader2, TrendingUp } from "lucide-react";
import { useGetWorksheet } from "../worksheet/hooks/useWorksheet";
import { formatNumber } from "./utils";
import { WorksheetTable } from "./worksheet-table";

export default function WorksheetPage() {
    const { data, isLoading, isError, error } = useGetWorksheet();

    if (isLoading) {
        return (
            <div className="py-16 text-center flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="animate-spin" size={16} /> Loading Worksheet...
            </div>
        );
    }

    const errorMessage = isError
        ? (error as any)?.data?.message || "Gagal memuat data worksheet."
        : null;

    const hasPeriodSelected = data?.hasPeriodSelected !== false;

    return (
        <div className="space-y-6">
            {errorMessage && (
                <Alert variant="destructive">
                    <AlertTriangle size={16} />
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            {!hasPeriodSelected ? (
                <Card className="py-16 text-center border-dashed">
                    <CardContent className="space-y-3">
                        <EyeOff size={36} className="mx-auto text-muted-foreground" />
                        <h3 className="font-semibold">No Period Selected</h3>
                        <Button asChild size="sm">
                            <Link to="/periods" className="gap-1.5">
                                <Calendar size={14} /> Go to Periods
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-h3 font-bold flex items-center gap-2">
                                <Grid className="text-sky-500" size={22} /> 10-Column Worksheet
                            </h1>
                            <p className="text-ui text-muted-foreground mt-1">
                                Trial Balance → Adjustments → Adjusted TB → Income Statement → Balance Sheet • IDR
                            </p>
                        </div>
                        <Button asChild variant="outline" size="sm" className="gap-1.5">
                            <Link to="/reports/financial-statements/income-statement">
                                <TrendingUp size={14} /> Income Statement
                            </Link>
                        </Button>
                    </div>

                    <Card className="overflow-hidden">
                        <CardContent className="p-0 overflow-auto">
                            {/* Menampilkan rows, totals, dan netIncome murni dari response API */}
                            <WorksheetTable
                                rows={data?.rows || []}
                                totals={data?.totals}
                                netIncome={data?.totals?.netIncome || 0}
                            />
                        </CardContent>
                    </Card>

                    <Alert className="bg-sky-500/10 border-sky-500/20">
                        <Info size={16} />
                        <AlertDescription>
                            Net Income: <strong>{formatNumber(data?.totals?.netIncome || 0)}</strong> — plugged from Income Statement to Balance Sheet.
                        </AlertDescription>
                    </Alert>
                </>
            )}
        </div>
    );
}
