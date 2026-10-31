"use client";

import type {
  GetPeriodColumnsProps,
  PeriodItem,
  PeriodListProps,
} from "#/features/periods/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Loader2, Lock, LockOpen, PlusCircle } from "lucide-react";

export function PeriodList({
  selectedPeriod,
  isClearing,
  onClearSelection,
  onOpenCreateView,
}: PeriodListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-white">Periods</h2>
        <div className="flex gap-2">
          {selectedPeriod && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              disabled={isClearing}
            >
              Clear Selection
            </Button>
          )}
          <Button size="sm" onClick={onOpenCreateView}>
            <PlusCircle size={16} className="mr-1.5" /> New Period
          </Button>
        </div>
      </div>
    </div>
  );
}

// Pengganti getPeriodColumns -> langsung render table
export function PeriodTable({
  periods,
  selectedPeriod,
  selectingId,
  closingId,
  onSelectPeriod,
  onClosePeriod,
}: GetPeriodColumnsProps & { periods: PeriodItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-white/[0.07] hover:bg-transparent">
          <TableHead className="pl-6 font-semibold uppercase tracking-wider text-zinc-500">Period Name</TableHead>
          <TableHead className="font-semibold uppercase tracking-wider text-zinc-500">Start</TableHead>
          <TableHead className="font-semibold uppercase tracking-wider text-zinc-500">End</TableHead>
          <TableHead className="text-center font-semibold uppercase tracking-wider text-zinc-500">Status</TableHead>
          <TableHead className="text-center pr-6 font-semibold uppercase tracking-wider text-zinc-500">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {periods.map((p) => {
          const isSelected = selectedPeriod?.id === p.id;
          const isSelectingThis = selectingId === p.id;
          const isClosingThis = closingId === p.id;

          return (
            <TableRow key={p.id} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
              <TableCell className="pl-6">
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm font-bold", isSelected ? "text-white" : "text-zinc-200")}>
                    {p.periodName}
                  </span>
                  {isSelected && (
                    <Badge className="h-5 bg-white text-black border-0 px-1.5 font-bold tracking-wider text-">VIEWING</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-xs text-zinc-400">
                  {p.startDate ? new Date(p.startDate).toLocaleDateString() : "-"}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-xs text-zinc-400">
                  {p.endDate ? new Date(p.endDate).toLocaleDateString() : "-"}
                </span>
              </TableCell>
              <TableCell className="text-center">
                {p.isClosed ? (
                  <Badge className="h-6 gap-1 bg-white/10 text-zinc-400 border-white/10 text-">
                    <Lock size={10} /> Closed
                  </Badge>
                ) : (
                  <Badge className="h-6 gap-1 bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-">
                    <LockOpen size={10} /> Active
                  </Badge>
                )}
              </TableCell>
              <TableCell className="pr-6">
                <div className="flex justify-center gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    className={cn(
                      "h-7 gap-1.5 font-bold tracking-wide border transition-all text-",
                      isSelected
                        ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-zinc-200"
                        : "bg-[#1e1e22] text-zinc-400 border-white/10 hover:bg-white hover:text-black hover:border-white"
                    )}
                    onClick={() => onSelectPeriod(p)}
                    disabled={isSelectingThis}
                  >
                    {isSelectingThis ? <Loader2 size={14} className="animate-spin" /> : isSelected ? <EyeOff size={14} /> : <Eye size={14} />}
                    {isSelected ? "Viewing" : "View"}
                  </Button>
                  {!p.isClosed && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 px-0 bg-transparent border border-transparent text-zinc-500 hover:text-white hover:bg-white/10 hover:border-white/10"
                      onClick={() => onClosePeriod(p)}
                      disabled={isClosingThis}
                    >
                      {isClosingThis ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// biar file lama yang masih import getPeriodColumns gak error, tapi udah gak pakai ColumnDef
export const getPeriodColumns = (_props: GetPeriodColumnsProps) => {
  return [] as const;
};