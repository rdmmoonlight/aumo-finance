"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { PeriodItem } from "../api/periodsApi";

export function PeriodsTable({ periods, isLoading, selectingId, closingId, isSelecting, isClosing, onSelect, onClose }: {
    periods: PeriodItem[]; isLoading: boolean; selectingId: number | null; closingId: number | null;
    isSelecting: boolean; isClosing: boolean;
    onSelect: (p: PeriodItem) => void; onClose: (p: PeriodItem) => void;
}) {
    if (isLoading) {
        return <div className="h-24 flex items-center justify-center text-xs text-zinc-500"><Loader2 className="animate-spin inline mr-2" size={16} />Loading periods...</div>;
    }
    return (
        <Table>
            <TableHeader className="bg-[#0e0e10]">
                <TableRow className="border-b border-white/[0.07] hover:bg-transparent">
                    <TableHead className="h-10 text-xs text-zinc-400">Period</TableHead>
                    <TableHead className="h-10 text-xs text-zinc-400">Status</TableHead>
                    <TableHead className="h-10 text-xs text-zinc-400">Selected</TableHead>
                    <TableHead className="h-10 text-xs text-zinc-400 text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {periods.length > 0 ? periods.map((p) => {
                    const isClosed = p.isClosed ?? p.status === "Closed";
                    return (
                        <TableRow key={p.id} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                            <TableCell className="py-3 text-xs font-medium text-white">{p.periodName}</TableCell>
                            <TableCell className="py-3 text-xs"><Badge variant="outline" className={isClosed ? "border-red-500/30 text-red-300" : "border-emerald-500/30 text-emerald-300"}>{isClosed ? "Closed" : "Open"}</Badge></TableCell>
                            <TableCell className="py-3 text-xs">{p.isSelected ? <Badge className="bg-white text-black">Active</Badge> : <span className="text-zinc-500">-</span>}</TableCell>
                            <TableCell className="py-3 text-xs">
                                <div className="flex justify-end gap-1.5">
                                    <Button size="sm" variant="outline" disabled={isSelecting || p.isSelected} onClick={() => onSelect(p)} className="h-7 bg-transparent border-white/10 text-zinc-300 hover:bg-white/10">{selectingId === p.id ? <Loader2 size={12} className="animate-spin" /> : "Select"}</Button>
                                    <Button size="sm" variant="outline" disabled={isClosing || isClosed} onClick={() => onClose(p)} className="h-7 bg-transparent border-white/10 text-zinc-300 hover:bg-red-500/10 hover:text-red-300">{closingId === p.id ? <Loader2 size={12} className="animate-spin" /> : "Close"}</Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                }) : (
                    <TableRow><TableCell colSpan={4} className="h-24 text-center text-xs text-zinc-500">No financial periods found.</TableCell></TableRow>
                )}
            </TableBody>
        </Table>
    );
}