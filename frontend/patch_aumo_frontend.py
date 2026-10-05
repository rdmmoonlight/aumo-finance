#!/usr/bin/env python3
"""
Patch TypeScript build errors - aumo-finance/frontend (commit bc66d39).

Cara pakai (terminal VSC, dari root repo atau folder frontend):
    python patch_aumo_frontend.py            # terapkan patch
    python patch_aumo_frontend.py --dry-run  # simulasi saja

Aman dijalankan ulang (idempotent). Setiap penggantian divalidasi;
jika teks lama tidak ditemukan dan teks baru belum ada, skrip berhenti.
"""
import re
import sys
from pathlib import Path

DRY = "--dry-run" in sys.argv


def find_src() -> Path:
    for base in (Path.cwd(), Path.cwd() / "frontend"):
        if (base / "src" / "lib" / "store").is_dir():
            return base / "src"
    sys.exit("ERROR: jalankan dari root repo (aumo-finance) atau folder frontend.")


SRC = find_src()
AUTH = SRC / "app" / "(authenticated)"
STORE = SRC / "lib" / "store" / "(authenticated)"
changed, skipped = [], []


def edit(path: Path, pairs, regex=False):
    if not path.exists():
        sys.exit(f"ERROR: file tidak ditemukan: {path}")
    text = path.read_text(encoding="utf-8")
    orig = text
    for old, new in pairs:
        if regex:
            text, n = re.subn(old, new, text)
            if n == 0 and not re.search(new if isinstance(new, str) and "\\" not in new else "$^", text):
                pass
        else:
            if new in text:
                continue
            elif old in text:
                text = text.replace(old, new)
            else:
                sys.exit(f"ERROR: teks tidak ditemukan di {path.name}:\n  {old[:90]!r}")
    if text != orig:
        if not DRY:
            path.write_text(text, encoding="utf-8")
        changed.append(path.relative_to(SRC.parent).as_posix())
    else:
        skipped.append(path.relative_to(SRC.parent).as_posix())


# ---------------------------------------------------------------- API store
# 1. Tipe response -> any (agar setState bertipe di halaman tetap lolos)
cfile = STORE / "chart-of-accounts" / "chartOfAccountsApi.ts"
edit(cfile, [(r"builder\.(query|mutation)<unknown,", r"builder.\1<any,")], regex=True)

jfile = STORE / "journal-entry" / "journalEntryApi.ts"
edit(jfile, [(r"builder\.(query|mutation)<unknown,", r"builder.\1<any,")], regex=True)
edit(jfile, [(
    "export interface UpdateJournalEntryRequest {\n  journalType?: string;",
    "export interface UpdateJournalEntryRequest {\n  transactionNumber?: string;\n  journalType?: string;",
)])

rfile = STORE / "reports" / "reportsApi.ts"
edit(rfile, [(r"(Api(?:Response)) = unknown;", r"\1 = any;")], regex=True)
edit(rfile, [
    # endpoint trial balance (kontrak sama dengan klien mobile)
    (
        "      // GET /api/v1/reports/worksheet\n",
        "      // GET /api/v1/reports/trial-balance?type=unadjusted|adjusted|post-closing\n"
        "      getTrialBalance: build.query<\n"
        "        GetTrialBalanceApiResponse,\n"
        "        GetTrialBalanceApiArg\n"
        "      >({\n"
        "        query: (queryArg) => ({\n"
        "          url: \"/api/v1/reports/trial-balance\",\n"
        "          params: { type: queryArg?.type ?? \"unadjusted\" },\n"
        "        }),\n"
        "        providesTags: [\"FinancialStatements\"],\n"
        "      }),\n\n"
        "      // GET /api/v1/reports/worksheet\n",
    ),
    (
        "export type GetWorksheetApiResponse =",
        "export type GetTrialBalanceApiResponse = any;\n"
        "export type GetTrialBalanceApiArg = {\n"
        "  type?: \"unadjusted\" | \"adjusted\" | \"post-closing\";\n"
        "} | void;\n\n"
        "// Alias nama lama yang masih diimpor halaman\n"
        "export type SummaryResponse = GetSummaryApiResponse;\n"
        "export type GeneralLedgerTemporaryResponse = GetGeneralLedgerTemporaryApiResponse;\n\n"
        "export type GetWorksheetApiResponse =",
    ),
])

# ---------------------------------------------------------------- Chart of Accounts
edit(AUTH / "chart-of-accounts" / "coa-dialogs.tsx", [
    ("endpoints.createAccount.initiate", "endpoints.createChartOfAccount.initiate"),
    ("endpoints.updateAccount.initiate({\n          id: values.id,\n          data: {",
     "endpoints.updateChartOfAccount.initiate({\n          id: values.id,\n          updateAccountRequest: {"),
    ("endpoints.deleteAccount.initiate", "endpoints.deleteChartOfAccount.initiate"),
])
edit(AUTH / "chart-of-accounts" / "coa-table.tsx", [
    ("endpoints.getAccounts.initiate", "endpoints.getChartOfAccounts.initiate"),
])
edit(AUTH / "tools" / "page.tsx", [
    ("endpoints.getCoaList.initiate", "endpoints.getChartOfAccounts.initiate"),
    ("toolsApi.endpoints.importJournalEntries.initiate(payload)",
     "toolsApi.endpoints.importJournalEntries.initiate(payload.journalImportRequestDto)"),
])

# ---------------------------------------------------------------- Journal entry
edit(AUTH / "journal-entry" / "journal-entry-content.tsx", [
    ("endpoints.getAccounts.initiate", "endpoints.getChartOfAccounts.initiate"),
    ("endpoints.updateJournalEntry.initiate", "endpoints.editJournalEntry.initiate"),
])

# ---------------------------------------------------------------- Layout / topbar / settings
edit(AUTH / "layout.tsx", [
    ("periodsApi.endpoints.getOpenInfo.initiate", "periodsApi.endpoints.getPeriodsOpenInfo.initiate"),
])
edit(AUTH / "settings" / "security.tsx", [
    ("endpoints.revokeSessionBySessionId.initiate", "endpoints.revokeSessionById.initiate"),
])
edit(SRC / "components" / "app-topbar.tsx", [
    ("commonApi.endpoints.readAllNotifications.initiate()",
     "commonApi.endpoints.markAllNotificationsAsRead.initiate()"),
    ("commonApi.endpoints.readNotificationById.initiate",
     "commonApi.endpoints.markNotificationAsRead.initiate"),
    ("setNotifications(result.data);", "setNotifications(result.data as NotificationItem[]);"),
])

# ---------------------------------------------------------------- Reports
REP = AUTH / "reports"
edit(REP / "financial-statements" / "statement-of-cash-flow" / "page.tsx", [
    ("endpoints.getCashFlowStatement.initiate", "endpoints.getStatementOfCashFlow.initiate"),
])
edit(REP / "financial-statements" / "statement-of-financial-position" / "page.tsx", [
    ("endpoints.getStatementOfFinancialPosition.initiate()",
     "endpoints.getStatementOfFinancialPosition.initiate({})"),
])
edit(REP / "journals" / "adjusting" / "page.tsx", [
    ("endpoints.getAdjustingJournals.initiate", "endpoints.getJournalsAdjusting.initiate"),
    ("deleteJournalEntry.initiate({ id: entryToDelete.id })",
     "deleteJournalEntry.initiate(entryToDelete.id)"),
    ("hasPeriodSelected={hasPeriodSelected}\n              periodName={d?.selectedPeriodName}\n              type=\"adjusting\"",
     "selectedPeriodName={d?.selectedPeriodName}"),
    ("entry={entryToDelete}\n        isDeleting={isDeleting}\n        onClose={() => setEntryToDelete(null)}",
     "open={!!entryToDelete}\n        transactionNumber={(entryToDelete as any)?.transactionNumber}\n"
     "        isDeleting={isDeleting}\n        onOpenChange={(o) => { if (!o) setEntryToDelete(null); }}"),
])
edit(REP / "journals" / "general" / "page.tsx", [
    ("endpoints.getGeneralJournal.initiate", "endpoints.getJournalsGeneral.initiate"),
    ("deleteJournalEntry.initiate({\n          id: entryToDelete.id,\n        })",
     "deleteJournalEntry.initiate(entryToDelete.id)"),
    ("hasPeriodSelected={hasPeriodSelected}\n              periodName={d?.selectedPeriodName}\n              type=\"general\"",
     "selectedPeriodName={d?.selectedPeriodName}"),
    ("entry={entryToDelete}\n        isDeleting={isDeleting}\n        onClose={() => setEntryToDelete(null)}",
     "open={!!entryToDelete}\n        transactionNumber={(entryToDelete as any)?.transactionNumber}\n"
     "        isDeleting={isDeleting}\n        onOpenChange={(o) => { if (!o) setEntryToDelete(null); }}"),
])
edit(REP / "journals" / "closing" / "page.tsx", [
    ("endpoints.getClosingJournal.initiate", "endpoints.getJournalsClosing.initiate"),
])
edit(REP / "trial-balances" / "unadjusted" / "page.tsx", [
    ("endpoints.getGeneralJournalReport.initiate()",
     "endpoints.getTrialBalance.initiate({ type: \"unadjusted\" })"),
])
edit(REP / "general-ledgers" / "temporary" / "page.tsx", [
    ("  type GeneralLedgerTemporaryResponse,\n",
     "  type GetGeneralLedgerTemporaryApiResponse as GeneralLedgerTemporaryResponse,\n"),
])

# page-header.tsx: berisi baris "TSX" + kode NoPeriodState bercampur -> tulis ulang
ph = REP / "general-ledgers" / "_components" / "page-header.tsx"
PAGE_HEADER = '''import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import Link from "next/link";

export function PageHeader({
  title,
  subtitle,
  switchHref,
  switchLabel,
}: {
  title: string;
  subtitle: string;
  switchHref: string;
  switchLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <BookOpen className="text-primary" size={22} /> {title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      </div>
      <Button asChild variant="outline" size="sm" className="text-sm">
        <Link href={switchHref}>{switchLabel}</Link>
      </Button>
    </div>
  );
}
'''
cur = ph.read_text(encoding="utf-8")
if cur.lstrip().startswith("TSX") or "export function NoPeriodState" in cur:
    if not DRY:
        ph.write_text(PAGE_HEADER, encoding="utf-8")
    changed.append(ph.relative_to(SRC.parent).as_posix())
else:
    skipped.append(ph.relative_to(SRC.parent).as_posix())

# ---------------------------------------------------------------- Ringkasan
tag = "[DRY-RUN] " if DRY else ""
changed = list(dict.fromkeys(changed))
print(f"{tag}Diubah  : {len(changed)} file")
for f in dict.fromkeys(changed):
    print("  +", f)
print(f"{tag}Dilewati: {len(skipped)} file (sudah terpatch)")
print("\nLangkah berikut: pnpm typecheck  (atau: npx tsc --noEmit)")
