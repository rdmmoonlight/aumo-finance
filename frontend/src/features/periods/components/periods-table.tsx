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

// --- helpers ---
const isClosed = (p: PeriodItem) => p.isClosed ?? p.status === "Closed";
const formatDate = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleDateString() : "-";

// --- CORE TABLE: INI YANG GAK BOLEH DIPISAH ---
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
      <div className="h-24 flex items-center justify-center text-xs text-zinc-500">
        <Loader2 className="animate-spin mr-2" size={16} /> Loading periods...
      </div>
    );
  }

  return (
    <Table>
      <TableHeader className="bg-[#0e0e10]">
        <TableRow className="border-b border-white/[0.07] hover:bg-transparent">
          <TableHead className="pl-6 h-10 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Period Name
          </TableHead>
          <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Start
          </TableHead>
          <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            End
          </TableHead>
          <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Status
          </TableHead>
          <TableHead className="h-10 text-center pr-6 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Action
          </TableHead>
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
              <TableRow
                key={p.id}
                className="border-b border-white/[0.05] hover:bg-white/[0.02]"
              >
                <TableCell className="pl-6 py-3">
                  <span
                    className={cn(
                      "text-sm font-bold",
                      selected ? "text-white" : "text-zinc-200",
                    )}
                  >
                    {p.periodName}
                  </span>
                </TableCell>
                <TableCell className="py-3 text-xs text-zinc-400">
                  {formatDate(p.startDate)}
                </TableCell>
                <TableCell className="py-3 text-xs text-zinc-400">
                  {formatDate(p.endDate)}
                </TableCell>
                <TableCell className="py-3 text-center">
                  {closed ? (
                    <Badge className="h-6 gap-1 bg-white/10 text-zinc-400 border-white/10">
                      <Lock size={10} /> Closed
                    </Badge>
                  ) : (
                    <Badge className="h-6 gap-1 bg-emerald-500/15 text-emerald-400 border-emerald-500/20">
                      <LockOpen size={10} /> Active
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="pr-6 py-3">
                  <div className="flex justify-center items-center gap-1.5">
                    <Button
                      type="button"
                      size="sm"
                      className={cn(
                        "h-7 w-24 gap-1.5 font-bold tracking-wide border transition-all text-xs justify-center",
                        selected
                          ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-zinc-200"
                          : "bg-[#1e1e22] text-zinc-400 border-white/10 hover:bg-white hover:text-black hover:border-white",
                      )}
                      onClick={() => handleSelect?.(p)}
                      disabled={!!isSelecting || isSelectingThis}
                    >
                      {isSelectingThis ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : selected ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                      {selected ? "Viewing" : "View"}
                    </Button>
                    {!closed ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 px-0 bg-transparent border border-transparent text-zinc-500 hover:text-white hover:bg-white/10 hover:border-white/10 shrink-0"
                        onClick={() => handleClose?.(p)}
                        disabled={!!isClosing || isClosingThis}
                      >
                        {isClosingThis ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Lock size={14} />
                        )}
                      </Button>
                    ) : (
                      /* Placeholder agar layout tetap seimbang jika period sudah tertutup */
                      <div className="w-7 h-7" />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell
              colSpan={5}
              className="h-24 text-center text-xs text-zinc-500"
            >
              No financial periods found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export const PeriodTable = PeriodsTable;

export function PeriodsListCard({
  periods,
  isLoading,
  selectedPeriod,
  isClearing,
  onClearSelection,
  onOpenCreate,
  onOpenCreateView,
  ...tableProps
}: PeriodListCardProps) {
  const handleOpen = onOpenCreate ?? onOpenCreateView;

  return (
    <Card className="bg-[#151519] border-white/[0.07]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="text-white" size={20} /> Financial Periods
          </CardTitle>
          <CardDescription className="text-xs text-zinc-400 mt-1">
            Manage accounting cycles and period statuses
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {selectedPeriod && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearSelection}
              disabled={isClearing}
              className="gap-1.5 bg-transparent border-white/10 text-xs text-zinc-300 hover:bg-white/10 hover:text-white"
            >
              {isClearing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <EyeOff size={14} />
              )}{" "}
              Clear Selection
            </Button>
          )}
          <Button
            size="sm"
            onClick={handleOpen}
            className="gap-1.5 bg-white text-black text-xs font-semibold hover:bg-zinc-200"
          >
            <Plus size={14} /> Open Period
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-t border-white/[0.07]">
          <PeriodsTable
            periods={periods}
            isLoading={isLoading}
            selectedPeriod={selectedPeriod}
            {...tableProps}
          />
        </div>
      </CardContent>
    </Card>
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
  return (
    <PeriodsListCard
      periods={periods}
      selectedPeriod={selectedPeriod}
      isClearing={isClearing}
      onClearSelection={onClearSelection}
      onOpenCreateView={onOpenCreateView}
      {...rest}
    />
  );
}

export const getPeriodColumns = (_props: GetPeriodColumnsProps) => [] as const;
