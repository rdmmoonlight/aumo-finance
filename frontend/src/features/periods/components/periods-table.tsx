"use client";

import type {
  GetPeriodColumnsProps,
  PeriodItem,
  PeriodListCardProps,
  PeriodListProps,
  PeriodsTableProps,
} from "../types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  LockOpen,
  Plus,
  PlusCircle,
} from "lucide-react";
import React from "react";

// --- helpers ---
const isClosed = (p: PeriodItem) => p.isClosed ?? p.status === "Closed";
const formatDate = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "2-digit" }) : "-";

// --- CORE TABLE COMPACT ---
export function PeriodsTable({
  periods,
  isLoading,
  selectedPeriod,
  selectingId,
  closingId,
  isSelecting,
  isClosing,
  onSelect,
  onClose,
  onSelectPeriod,
  onClosePeriod,
}: PeriodsTableProps) {
  const handleSelect = onSelectPeriod ?? onSelect;
  const handleClose = onClosePeriod ?? onClose;

  if (isLoading) {
    return (
      <div className="h-16 flex items-center justify-center text- text-zinc-500">
        <Loader2 className="animate-spin mr-2" size={14} /> Loading...
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader className="bg-[#0e0e10]">
          <TableRow className="border-b border-white/[0.07] hover:bg-transparent">
            <TableHead className="pl-3 h-8 text- font-semibold uppercase tracking-wider text-zinc-500">Period</TableHead>
            <TableHead className="h-8 text- font-semibold uppercase tracking-wider text-zinc-500">Range</TableHead>
            <TableHead className="h-8 text-center text- font-semibold uppercase tracking-wider text-zinc-500">Status</TableHead>
            <TableHead className="h-8 text-right pr-3 text- font-semibold uppercase tracking-wider text-zinc-500">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {periods.length > 0 ? (
            periods.map((p) => {
              const selected = selectedPeriod?.id === p.id || !!p.isSelected;
              const isSelectingThis = selectingId === p.id;
              const isClosingThis = closingId === p.id;
              const closed = isClosed(p);

              return (
                <TableRow key={p.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] h-">
                  <TableCell className="pl-3 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("text- font-semibold leading-none truncate max-w-", selected ? "text-white" : "text-zinc-200")}>
                        {p.periodName}
                      </span>
                      {selected && (
                        <Badge className="h-3.5 bg-white text-black border-0 px-1 text- font-bold tracking-wider leading-none">VIEW</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5 text- text-zinc-400 leading-none">
                    <div className="flex flex-col gap-0.5">
                      <span>{formatDate(p.startDate)}</span>
                      <span className="text- text-zinc-500">→ {formatDate(p.endDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5 text-center">
                    {closed ? (
                      <Badge variant="outline" className="h-5 gap-1 bg-white/[0.06] text-zinc-400 border-white/10 text- px-1.5">
                        <Lock size={10} /> Closed
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="h-5 gap-1 bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text- px-1.5">
                        <LockOpen size={10} /> Open
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="pr-3 py-1.5">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        size="sm"
                        className={cn(
                          "h-6 px-2 gap-1 text- font-semibold tracking-wide border transition-all",
                          selected
                            ? "bg-white text-black border-white hover:bg-zinc-200"
                            : "bg-[#1e1e22] text-zinc-400 border-white/10 hover:bg-white hover:text-black"
                        )}
                        onClick={() => handleSelect?.(p)}
                        disabled={!!isSelecting || isSelectingThis}
                      >
                        {isSelectingThis ? <Loader2 size={12} className="animate-spin" /> : selected ? <EyeOff size={12} /> : <Eye size={12} />}
                        {selected ? "" : "View"}
                      </Button>
                      {!closed && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 bg-transparent text-zinc-500 hover:text-white hover:bg-white/10"
                          onClick={() => handleClose?.(p)}
                          disabled={!!isClosing || isClosingThis}
                        >
                          {isClosingThis ? <Loader2 size={12} className="animate-spin" /> : <Lock size={12} />}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-20 text-center text- text-zinc-500">No periods found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export const PeriodTable = PeriodsTable;

// --- CARD + SPACE KANAN ---
type ExtendedCardProps = PeriodListCardProps & {
  rightContent?: React.ReactNode;
  children?: React.ReactNode;
};

export function PeriodsListCard({
  periods,
  isLoading,
  selectedPeriod,
  isClearing,
  onClearSelection,
  onOpenCreate,
  onOpenCreateView,
  rightContent,
  children,
  ...tableProps
}: ExtendedCardProps) {
  const handleOpen = onOpenCreate ?? onOpenCreateView;
  const sideContent = rightContent ?? children;

  return (
    <div className="grid grid-cols-12 gap-4 items-start">
      {/* TABLE KECIL KIRI */}
      <div className="col-span-12 lg:col-span-5 xl:col-span-4 2xl:col-span-4">
        <Card className="bg-[#151519] border-white/[0.07] overflow-hidden">
          <CardHeader className="p-3 pb-2 flex flex-row items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <CardTitle className="text- font-semibold text-white flex items-center gap-1.5 leading-none">
                <Calendar className="text-white" size={14} /> Financial Periods
              </CardTitle>
              <CardDescription className="text- text-zinc-500 leading-none">Cycles & status</CardDescription>
            </div>
            <div className="flex items-center gap-1.5">
              {selectedPeriod && (
                <Button variant="outline" size="sm" onClick={onClearSelection} disabled={isClearing} className="h-6 px-2 gap-1 bg-transparent border-white/10 text- text-zinc-400 hover:bg-white/10 hover:text-white">
                  {isClearing ? <Loader2 size={12} className="animate-spin" /> : <EyeOff size={12} />}
                </Button>
              )}
              <Button size="sm" onClick={handleOpen} className="h-6 px-2.5 gap-1 bg-white text-black text- font-semibold hover:bg-zinc-200">
                <Plus size={12} /> New
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-t border-white/[0.06]">
              <PeriodsTable periods={periods} isLoading={isLoading} selectedPeriod={selectedPeriod} {...tableProps} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SPACE KOSONG KANAN - LU ISI NANTI */}
      <div className="col-span-12 lg:col-span-7 xl:col-span-8 2xl:col-span-8">
        {sideContent ? (
          sideContent
        ) : (
          <div className="h- rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] flex flex-col items-center justify-center gap-2 p-6">
            <span className="text- text-zinc-500 tracking-wide uppercase">Empty space</span>
            <span className="text-xs text-zinc-600 text-center max-w-">Taruh detail period / summary / chart disini nanti. Lu tinggal passing prop `rightContent`</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function PeriodList({
  selectedPeriod,
  isClearing,
  onClearSelection,
  onOpenCreateView,
  periods,
  ...rest
}: PeriodListProps & Partial<PeriodsTableProps> & { periods?: PeriodItem[] }) {
  if (!periods) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-white">Periods</h2>
          <div className="flex gap-2">
            {selectedPeriod && <Button variant="outline" size="sm" onClick={onClearSelection} disabled={isClearing} className="h-6 text-">Clear</Button>}
            <Button size="sm" onClick={onOpenCreateView} className="h-6 text-"><PlusCircle size={14} className="mr-1" /> New</Button>
          </div>
        </div>
      </div>
    );
  }
  return <PeriodsListCard periods={periods} selectedPeriod={selectedPeriod} isClearing={isClearing} onClearSelection={onClearSelection} onOpenCreateView={onOpenCreateView} {...rest} />;
}

export const getPeriodColumns = (_props: GetPeriodColumnsProps) => [] as const;
