"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGetApiV1ChartOfAccountsQuery } from "#/lib/store/(authenticated)/chart-of-accounts/chartOfAccountsApi";
import {
  usePostApiV1ToolsImportJournalEntriesMutation,
  AccountMappingDetailDto,
} from "@/lib/store/(authenticated)/tools/toolsApi";
import {
  Upload,
  Eye,
  Download,
  Check,
  AlertTriangle,
  FileSpreadsheet,
  Calendar,
} from "lucide-react";

interface JournalLineImport {
  rowIndex: number;
  refNumber: number;
  accountName: string;
  description: string;
  debit: number | null;
  credit: number | null;
}

interface JournalTransactionImport {
  transactionNumber?: string;
  date: string;
  journalType: string;
  lines: JournalLineImport[];
}

interface JournalImportResult {
  isSuccess: boolean;
  totalTransactionsRead: number;
  totalLinesRead: number;
  transactions: JournalTransactionImport[];
}

interface AccountMappingDetail {
  excelRef: number;
  excelAccountName: string;
  mappedRef: number;
  mappedAccountName: string;
  status: string;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const formatIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

// --- TANSTACK TABLE HELPERS & SUB-COMPONENTS ---
const mappingColumnHelper = createColumnHelper<AccountMappingDetail>();
const previewLineColumnHelper = createColumnHelper<JournalLineImport>();

function MappingStatusTable({
  mappings,
  dbAccounts,
  isLoadingCoa,
  onMappingChange,
}: {
  mappings: AccountMappingDetail[];
  dbAccounts: any[];
  isLoadingCoa: boolean;
  onMappingChange: (
    excelRef: number,
    excelName: string,
    targetRef: number,
  ) => void;
}) {
  const columns = useMemo(
    () => [
      mappingColumnHelper.accessor("excelAccountName", {
        header: "Excel Input",
        cell: ({ row }) => (
          <div className="text-caption">
            <Badge
              variant="outline"
              className="font-mono text-label-small mr-1"
            >
              {row.original.excelRef}
            </Badge>
            {row.original.excelAccountName}
          </div>
        ),
      }),
      mappingColumnHelper.accessor("mappedRef", {
        header: "Target COA",
        cell: ({ row }) => (
          <Select
            value={String(row.original.mappedRef || 0)}
            onValueChange={(v) =>
              onMappingChange(
                row.original.excelRef,
                row.original.excelAccountName,
                Number(v),
              )
            }
            disabled={isLoadingCoa}
          >
            <SelectTrigger className="h-7 text-caption">
              <SelectValue placeholder="Pilih COA" />
            </SelectTrigger>
            <SelectContent>
              {dbAccounts.map((o: any) => {
                const refNum = o.referenceNumber || o.code;
                const accName = o.accountName || o.name;
                return (
                  <SelectItem
                    key={o.id || refNum}
                    value={String(refNum)}
                    className="text-caption"
                  >
                    [{refNum}] {accName}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        ),
      }),
    ],
    [dbAccounts, isLoadingCoa, onMappingChange],
  );

  const table = useReactTable({
    data: mappings,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="text-caption">
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            className={row.original.mappedRef ? "bg-amber-500/10" : ""}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function PreviewTransactionLinesTable({
  lines,
  accountMappings,
}: {
  lines: JournalLineImport[];
  accountMappings: AccountMappingDetail[];
}) {
  const columns = useMemo(
    () => [
      previewLineColumnHelper.accessor("rowIndex", {
        header: "#",
        cell: (info) => <span className="text-caption">{info.getValue()}</span>,
      }),
      previewLineColumnHelper.accessor("refNumber", {
        header: "Ref",
        cell: (info) => (
          <Badge variant="secondary" className="font-mono text-label-small">
            {info.getValue()}
          </Badge>
        ),
      }),
      previewLineColumnHelper.accessor("accountName", {
        header: "Account",
        cell: ({ row }) => {
          const line = row.original;
          const mapping = accountMappings.find(
            (m) =>
              m.excelRef === line.refNumber &&
              m.excelAccountName === line.accountName,
          );
          return (
            <div className="text-caption">
              <div className="font-medium">{line.accountName}</div>
              <div className="text-caption text-muted-foreground truncate">
                {line.description}
              </div>
              {mapping?.mappedRef ? (
                <Badge className="mt-1 bg-amber-500/15 text-amber-600 border-amber-500/20 text-label-small">
                  → [{mapping.mappedRef}] {mapping.mappedAccountName}
                </Badge>
              ) : (
                <Badge variant="destructive" className="mt-1 text-label-small">
                  Unmapped
                </Badge>
              )}
            </div>
          );
        },
      }),
      previewLineColumnHelper.accessor("debit", {
        header: () => <div className="text-right">Debit</div>,
        cell: (info) => (
          <div className="text-right font-mono text-caption">
            {info.getValue() !== null ? formatIDR(info.getValue()!) : "-"}
          </div>
        ),
      }),
      previewLineColumnHelper.accessor("credit", {
        header: () => <div className="text-right">Credit</div>,
        cell: (info) => (
          <div className="text-right font-mono text-caption">
            {info.getValue() !== null ? formatIDR(info.getValue()!) : "-"}
          </div>
        ),
      }),
    ],
    [accountMappings],
  );

  const table = useReactTable({
    data: lines,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalDebit = useMemo(
    () => lines.reduce((a, b) => a + (b.debit || 0), 0),
    [lines],
  );
  const totalCredit = useMemo(
    () => lines.reduce((a, b) => a + (b.credit || 0), 0),
    [lines],
  );

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="text-caption">
            {headerGroup.headers.map((header) => {
              const isRight = header.id === "debit" || header.id === "credit";
              const isRowIdx = header.id === "rowIndex";
              const isRef = header.id === "refNumber";

              return (
                <TableHead
                  key={header.id}
                  className={`
                    ${isRight ? "text-right" : ""}
                    ${isRowIdx ? "w-10" : ""}
                    ${isRef ? "w-20" : ""}
                  `}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => {
          const line = row.original;
          const mapping = accountMappings.find(
            (m) =>
              m.excelRef === line.refNumber &&
              m.excelAccountName === line.accountName,
          );
          const isUnmapped = !mapping?.mappedRef;

          return (
            <TableRow
              key={row.id}
              className={isUnmapped ? "bg-destructive/10" : ""}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell
            colSpan={3}
            className="text-right font-medium text-caption"
          >
            Total
          </TableCell>
          <TableCell className="text-right font-mono text-caption font-bold">
            {formatIDR(totalDebit)}
          </TableCell>
          <TableCell className="text-right font-mono text-caption font-bold">
            {formatIDR(totalCredit)}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

export default function ToolsPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [targetMonth, setTargetMonth] = useState(new Date().getMonth() + 1);
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<JournalImportResult | null>(
    null,
  );
  const [accountMappings, setAccountMappings] = useState<
    AccountMappingDetail[]
  >([]);

  // 1. Fetch COA menggunakan RTK Query
  const { data: coaData, isLoading: isLoadingCoa } =
    useGetApiV1ChartOfAccountsQuery({});

  // Parse list COA dari respon RTK Query
  const dbAccounts = Array.isArray(coaData)
    ? coaData
    : (coaData as any)?.accounts || (coaData as any)?.data || [];

  // 2. Mutation Hook untuk Import Journal
  const [importJournalEntries, { isLoading: isImporting }] =
    usePostApiV1ToolsImportJournalEntriesMutation();

  const isBusy = isParsing || isImporting;

  const handlePreview = async () => {
    if (!selectedFile) {
      setErrorMessage("Select Excel first");
      return;
    }
    setIsParsing(true);
    setErrorMessage(null);
    try {
      if (!(window as any).XLSX) {
        await new Promise((res, rej) => {
          const s = document.createElement("script");
          s.src =
            "https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js";
          s.onload = res as any;
          s.onerror = rej as any;
          document.head.appendChild(s);
        });
      }
      const XLSX = (window as any).XLSX;
      const buf = await selectedFile.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const parsed: JournalTransactionImport[] = [];
      const temp: Record<string, AccountMappingDetail> = {};
      let totalLines = 0;

      ["GJ", "AJ"].forEach((sheetName) => {
        const ws = wb.Sheets[sheetName];
        if (!ws) return;
        const rows: any[] = XLSX.utils.sheet_to_json(ws, {
          raw: true,
          defval: "",
        });
        let curDate = "";
        const grouped: Record<string, JournalLineImport[]> = {};
        rows.forEach((row, i) => {
          const rawDate = row["Date"] ?? "";
          let day = 1;
          if (/^\d{1,2}$/.test(String(rawDate).trim()))
            day = parseInt(String(rawDate), 10);
          else if (/^\d{4}-\d{2}-\d{2}$/.test(String(rawDate)))
            day = parseInt(String(rawDate).split("-")[2], 10);
          if (rawDate)
            curDate = `${targetYear}-${String(targetMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          if (!curDate) return;
          const accountName = String(row["Account Name"] ?? "").trim();
          const description = String(row["Description"] ?? "").trim();
          const refVal = Number(row["Ref"] ?? 0);
          if (!accountName && !description && !refVal) return;
          const mapKey = `${refVal}|||${accountName}`;
          if (!temp[mapKey])
            temp[mapKey] = {
              excelRef: refVal,
              excelAccountName: accountName,
              mappedRef: 0,
              mappedAccountName: "",
              status: "UNMAPPED",
            };
          const line: JournalLineImport = {
            rowIndex: i + 2,
            refNumber: refVal,
            accountName,
            description,
            debit:
              row["Debit"] !== "" && !isNaN(Number(row["Debit"]))
                ? Number(row["Debit"])
                : null,
            credit:
              row["Credit"] !== "" && !isNaN(Number(row["Credit"]))
                ? Number(row["Credit"])
                : null,
          };
          if (!grouped[curDate]) grouped[curDate] = [];
          grouped[curDate].push(line);
          totalLines++;
        });
        Object.keys(grouped).forEach((d) =>
          parsed.push({
            date: d,
            journalType: sheetName === "GJ" ? "General" : "Adjusting",
            lines: grouped[d],
          }),
        );
      });

      setAccountMappings(Object.values(temp));
      setParseResult({
        isSuccess: true,
        totalTransactionsRead: parsed.length,
        totalLinesRead: totalLines,
        transactions: parsed,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to parse Excel file.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleMappingChange = (
    excelRef: number,
    excelName: string,
    targetRef: number,
  ) => {
    const opt = dbAccounts.find(
      (o: any) => Number(o.referenceNumber || o.code) === Number(targetRef),
    );
    setAccountMappings((prev) =>
      prev.map((m) =>
        m.excelRef === excelRef && m.excelAccountName === excelName
          ? {
              ...m,
              mappedRef: targetRef,
              mappedAccountName: opt?.accountName || opt?.name || "",
              status: targetRef ? "REALLOCATED" : "UNMAPPED",
            }
          : m,
      ),
    );
  };

  const handleConfirmImport = async () => {
    if (!parseResult) return;
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const customMappingsDto: AccountMappingDetailDto[] = accountMappings.map(
        (m) => ({
          excelRef: m.excelRef,
          excelAccountName: m.excelAccountName,
          mappedRef: m.mappedRef,
          mappedAccountName: m.mappedAccountName,
          status: m.status,
        }),
      );

      await importJournalEntries({
        journalImportRequestDto: {
          targetMonth,
          targetYear,
          customMappings: customMappingsDto,
          transactions: parseResult.transactions.map((tx) => ({
            entryDate: tx.date,
            journalType: tx.journalType,
            lines: tx.lines.map((l) => ({
              accountReferenceNumber: l.refNumber,
              accountName: l.accountName,
              description: l.description,
              debit: l.debit,
              credit: l.credit,
            })),
          })),
        },
      }).unwrap();

      setSuccessMessage(
        `Imported ${parseResult.totalTransactionsRead} entries for ${targetMonth}/${targetYear}`,
      );
      setParseResult(null);
      setSelectedFile(null);
      setAccountMappings([]);
    } catch (err: any) {
      setErrorMessage(
        err.data?.message || err.message || "Gagal melakukan import jurnal.",
      );
    }
  };

  const unmappedCount = accountMappings.filter((m) => m.mappedRef === 0).length;

  return (
    <div className="space-y-6">
      {successMessage && (
        <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-ui">
          <Check size={16} />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      {errorMessage && (
        <Alert variant="destructive" className="text-ui">
          <AlertTriangle size={16} />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-ui">
                <FileSpreadsheet size={16} className="text-primary" /> Import
                Journal Entries
              </CardTitle>
              <CardDescription className="text-caption">
                Upload Excel GJ/AJ sheets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
                <Label className="flex items-center gap-1 text-ui">
                  <Calendar size={12} /> Target Period
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={String(targetMonth)}
                    onValueChange={(v) => setTargetMonth(Number(v))}
                  >
                    <SelectTrigger className="text-caption">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m, i) => (
                        <SelectItem
                          key={i + 1}
                          value={String(i + 1)}
                          className="text-caption"
                        >
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={String(targetYear)}
                    onValueChange={(v) => setTargetYear(Number(v))}
                  >
                    <SelectTrigger className="text-caption">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2024, 2025, 2026, 2027, 2028].map((y) => (
                        <SelectItem
                          key={y}
                          value={String(y)}
                          className="text-caption"
                        >
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-ui">Excel File (.xlsx)</Label>
                <Input
                  type="file"
                  accept=".xlsx"
                  className="text-caption"
                  onChange={(e) => {
                    setSelectedFile(e.target.files?.[0] || null);
                    setParseResult(null);
                    setAccountMappings([]);
                  }}
                />
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-caption gap-1"
                  onClick={() => {
                    window.open(
                      "/api/v1/tools/download-journal-template",
                      "_blank",
                    );
                  }}
                >
                  <Download size={12} /> Download Template
                </Button>
              </div>
              <div className="grid gap-2">
                <Button
                  disabled={!selectedFile || isBusy}
                  onClick={handlePreview}
                  className="gap-2 text-caption"
                >
                  <Eye size={14} />{" "}
                  {isBusy ? "Processing..." : "Preview Entries"}
                </Button>
                {parseResult && (
                  <Button
                    disabled={isBusy || unmappedCount > 0}
                    onClick={handleConfirmImport}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-caption"
                  >
                    <Check size={14} /> Submit & Import (
                    {parseResult.totalTransactionsRead})
                  </Button>
                )}
                {unmappedCount > 0 && (
                  <p className="text-caption text-destructive text-center font-medium">
                    {unmappedCount} akun belum dipetakan
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {accountMappings.length > 0 && (
            <Card>
              <CardHeader className="py-3 flex-row items-center justify-between space-y-0">
                <CardTitle className="text-caption">Mapping Status</CardTitle>
                <Badge variant="secondary" className="text-label-small">
                  {accountMappings.length} akun
                </Badge>
              </CardHeader>
              <CardContent className="p-0 max-h-60 overflow-auto">
                <MappingStatusTable
                  mappings={accountMappings}
                  dbAccounts={dbAccounts}
                  isLoadingCoa={isLoadingCoa}
                  onMappingChange={handleMappingChange}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-8 space-y-4">
          {parseResult ? (
            <div className="space-y-4 max-h-[calc(100vh-120px)] overflow-auto pr-1">
              <div className="flex items-center justify-between">
                <h3 className="text-ui font-semibold flex items-center gap-2">
                  <Upload size={14} /> Preview Transactions
                </h3>
                <Badge className="text-label-small">
                  {parseResult.transactions.length} loaded
                </Badge>
              </div>
              {parseResult.transactions.map((tx, txIdx) => (
                <Card key={txIdx} className="overflow-hidden">
                  <CardHeader className="py-2 px-3 flex-row items-center justify-between space-y-0 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Badge className="text-label-small">
                        {tx.journalType}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="font-mono text-label-small"
                      >
                        {tx.date}
                      </Badge>
                    </div>
                    <span className="text-caption text-muted-foreground">
                      {tx.lines.length} lines
                    </span>
                  </CardHeader>
                  <CardContent className="p-0">
                    <PreviewTransactionLinesTable
                      lines={tx.lines}
                      accountMappings={accountMappings}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="h-64 grid place-items-center border-dashed">
              <CardContent className="text-center text-muted-foreground">
                <Upload size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-ui font-medium">No Preview Yet</p>
                <p className="text-caption">
                  Select Excel on left and click Preview
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
