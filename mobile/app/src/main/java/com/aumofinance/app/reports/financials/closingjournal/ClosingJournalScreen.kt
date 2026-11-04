package com.aumofinance.app.reports.financials.closingjournal

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.aumofinance.app.core.CurrencyFormatter
import com.aumofinance.app.reports.financials.ClosingJournalReport
import com.aumofinance.app.reports.financials.FinancialReportScaffold
import com.aumofinance.app.reports.financials.ReportInfoNote
import com.aumofinance.app.reports.financials.ReportDivider
import com.aumofinance.app.reports.financials.ReportRow
import com.aumofinance.app.reports.financials.ReportSectionTitle
import com.aumofinance.app.ui.theme.AumoColors
import com.aumofinance.app.ui.theme.AumoDimens

/**
 * Read-only: entri Closing bersifat system-generated (dihitung on-the-fly
 * dari Trial Balance oleh backend, TIDAK PERNAH tersimpan sebagai entri
 * jurnal sungguhan) — tidak ada tombol tambah/edit/hapus di halaman ini.
 */
@Composable
fun ClosingJournalScreen(report: ClosingJournalReport?) {
    val data = report?.closingJournal

    val notClosed = report?.hasPeriodSelected == true && report.isPeriodClosed == false

    FinancialReportScaffold(periodName = report?.selectedPeriodName) {
        if (notClosed) {
            ReportInfoNote(
                "Periode ini belum ditutup (closed), sehingga Jurnal Penutup belum dibuat. " +
                    "Jurnal ini baru tersedia setelah periode ditutup melalui halaman Periods.",
            )
            return@FinancialReportScaffold
        }

        Text(
            text =
                "Laba Bersih (ditutup ke ${data?.retainedEarningsAccountName ?: "Retained Earnings"}): " +
                    CurrencyFormatter.format(data?.netIncome ?: 0.0),
            color = AumoColors.TextPrimary,
            fontWeight = FontWeight.Bold,
            fontSize = MaterialTheme.typography.bodyLarge.fontSize,
            modifier = Modifier.padding(top = AumoDimens.SpacingSmall),
        )

        data?.groups?.forEach { group ->
            ReportSectionTitle(group.description)
            group.lines.forEach { line ->
                val amount = if (line.debit > 0) line.debit else -line.credit
                ReportRow("${line.referenceNumber} - ${line.accountName}", amount, indent = true)
            }
            ReportRow("Total", group.totalDebit, bold = true)
            ReportDivider()
        }
    }
}
