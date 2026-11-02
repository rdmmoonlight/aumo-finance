"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, EyeOff, Loader2, Plus } from "lucide-react";
import { PeriodsTable } from "./periods-table";

export function PeriodsListCard(props: any) {
    const { periods, isLoading, selectedPeriod, isClearing, onClearSelection, onOpenCreate, ...tableProps } = props;
    return (
        <Card className="bg-[#151519] border-white/[0.07]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                    <CardTitle className="text-lg font-bold text-white flex items-center gap-2"><Calendar className="text-white" size={20} /> Financial Periods</CardTitle>
                    <CardDescription className="text-xs text-zinc-400 mt-1">Manage accounting cycles and period statuses</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    {selectedPeriod && (
                        <Button variant="outline" size="sm" onClick={onClearSelection} disabled={isClearing} className="gap-1.5 bg-transparent border-white/10 text-xs text-zinc-300 hover:bg-white/10 hover:text-white">
                            {isClearing ? <Loader2 size={14} className="animate-spin" /> : <EyeOff size={14} />} Clear Selection
                        </Button>
                    )}
                    <Button size="sm" onClick={onOpenCreate} className="gap-1.5 bg-white text-black text-xs font-semibold hover:bg-zinc-200"><Plus size={14} /> Open Period</Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="border-t border-white/[0.07]">
                    <PeriodsTable periods={periods} isLoading={isLoading} {...tableProps} />
                </div>
            </CardContent>
        </Card>
    );
}