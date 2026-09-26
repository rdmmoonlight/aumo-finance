import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  IconCalendar,
  IconEyeOff,
  IconPlus,
  IconCalendarOff,
  IconLoader2,
} from "@tabler/icons-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { PeriodItem } from "./types";
import { getPeriodColumns } from "./period-columns";

interface PeriodListProps {
  periods: PeriodItem[];
  selectedPeriod: PeriodItem | null;
  isLoading: boolean;
  isClearing: boolean;
  selectingId: number | null;
  closingId: number | null;
  onClearSelection: () => void;
  onSelectPeriod: (p: PeriodItem) => void;
  onClosePeriod: (p: PeriodItem) => void;
  onOpenCreateView: () => void;
}

export function PeriodList({
  periods,
  selectedPeriod,
  isLoading,
  isClearing,
  selectingId,
  closingId,
  onClearSelection,
  onSelectPeriod,
  onClosePeriod,
  onOpenCreateView,
}: PeriodListProps) {
  const columns = getPeriodColumns({
    selectedPeriod,
    selectingId,
    closingId,
    onSelectPeriod,
    onClosePeriod,
  });

  const table = useReactTable({
    data: periods,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2 text-white">
            <IconCalendar className="text-white" size={22} /> Accounting Periods
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Period yang aktif akan dipakai di semua halaman
          </p>
        </div>
        <div className="flex gap-2">
          {selectedPeriod && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 bg-transparent border-white/15 text-zinc-300 hover:bg-white/10 hover:text-white"
              onClick={onClearSelection}
              disabled={isClearing}
            >
              {isClearing ? (
                <IconLoader2 size={14} className="animate-spin" />
              ) : (
                <IconEyeOff size={14} />
              )}{" "}
              Stop Viewing
            </Button>
          )}
          <Button
            size="sm"
            className="gap-1.5 bg-white text-black hover:bg-zinc-200"
            onClick={onOpenCreateView}
          >
            <IconPlus size={14} /> Open New Period
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden bg-[#151519] border-white/[0.07]">
        <CardHeader className="flex-row items-center justify-between space-y-0 py-3 border-b border-white/[0.06]">
          <CardTitle className="text-sm text-white">Period List</CardTitle>
          <Badge
            variant="secondary"
            className="font-mono text-xs bg-white/10 text-zinc-300 border-white/10"
          >
            {periods.length} total
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-white/[0.06] hover:bg-transparent"
                >
                  {headerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta as
                      | { headerClassName?: string }
                      | undefined;
                    return (
                      <TableHead
                        key={header.id}
                        className={meta?.headerClassName}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow className="border-white/[0.06]">
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-8 text-zinc-500"
                  >
                    <IconLoader2
                      className="animate-spin inline mr-2"
                      size={16}
                    />{" "}
                    Loading...
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => {
                  const p = row.original;
                  const isSelected = selectedPeriod?.id === p.id;
                  return (
                    <TableRow
                      key={row.id}
                      className={cn(
                        "border-white/[0.06] transition-colors",
                        isSelected
                          ? "bg-white/[0.06] hover:bg-white/[0.08] border-l-4 border-l-white"
                          : "hover:bg-white/[0.03]",
                        p.isClosed && !isSelected && "opacity-50"
                      )}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const meta = cell.column.columnDef.meta as
                          | { cellClassName?: string }
                          | undefined;
                        return (
                          <TableCell
                            key={cell.id}
                            className={meta?.cellClassName}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow className="border-white/[0.06]">
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-12 text-zinc-500"
                  >
                    <IconCalendarOff className="mx-auto mb-2" size={28} />
                    <p className="font-medium text-zinc-300">
                      No periods yet
                    </p>
                    <p className="text-xs">
                      Click Open New Period to start
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
